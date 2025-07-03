/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onCall, onRequest} = require("firebase-functions/https");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const cors = require("cors")({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

// Initialize Firebase Admin SDK
admin.initializeApp();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to 2nd gen functions.
setGlobalOptions({
  maxInstances: 10, // Limit for cost control
});

// GDPR: Complete user deletion function (callable function - compatible with existing permissions)
exports.deleteUserSecure = onCall({ maxInstances: 5 }, async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { targetUserId } = data;
  const currentUserId = context.auth.uid;
  const currentUserEmail = context.auth.token.email;

  if (!targetUserId) {
    throw new functions.https.HttpsError('invalid-argument', 'Target user ID is required');
  }

  try {
    // Authorization check: User can delete themselves OR admin can delete anyone
    let isAuthorized = false;
    
    if (targetUserId === currentUserId) {
      // User deleting themselves
      isAuthorized = true;
      logger.info(`User ${currentUserEmail} deleting their own account`);
    } else {
      // Check if current user is admin
      const adminConfigRef = admin.firestore().collection('admin').doc('config');
      const adminConfigSnap = await adminConfigRef.get();
      
      if (adminConfigSnap.exists()) {
        const adminEmails = adminConfigSnap.data().adminEmails || [];
        isAuthorized = adminEmails.includes(currentUserEmail);
        
        if (isAuthorized) {
          logger.info(`Admin ${currentUserEmail} deleting user ${targetUserId}`);
        }
      }
    }

    if (!isAuthorized) {
      throw new functions.https.HttpsError(
        'permission-denied', 
        'Only admins or the user themselves can delete accounts'
      );
    }

    // Get user data before deletion (for logging)
    const userDoc = await admin.firestore().collection('users').doc(targetUserId).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    const userEmail = userData?.email || 'Unknown';

    logger.info(`Starting deletion process for user: ${userEmail} (${targetUserId})`);

    // 1. Delete user from Firebase Auth
    try {
      await admin.auth().deleteUser(targetUserId);
      logger.info(`✅ Deleted Firebase Auth user: ${targetUserId}`);
    } catch (authError) {
      logger.warn(`Auth user may not exist: ${authError.message}`);
    }

    // 2. Delete user document
    await admin.firestore().collection('users').doc(targetUserId).delete();
    logger.info(`✅ Deleted user document: ${targetUserId}`);

    // 3. Delete all user's items/posts
    const itemsQuery = admin.firestore().collection('items').where('userId', '==', targetUserId);
    const itemsSnapshot = await itemsQuery.get();
    
    const batch1 = admin.firestore().batch();
    let deleteCount = 0;
    
    itemsSnapshot.forEach((doc) => {
      batch1.delete(doc.ref);
      deleteCount++;
    });
    
    if (deleteCount > 0) {
      await batch1.commit();
      logger.info(`✅ Deleted ${deleteCount} user items`);
    }

    // 4. Delete user's bug reports
    const bugReportsQuery = admin.firestore().collection('bugReports').where('userId', '==', targetUserId);
    const bugReportsSnapshot = await bugReportsQuery.get();
    
    const batch2 = admin.firestore().batch();
    let bugReportCount = 0;
    
    bugReportsSnapshot.forEach((doc) => {
      batch2.delete(doc.ref);
      bugReportCount++;
    });
    
    if (bugReportCount > 0) {
      await batch2.commit();
      logger.info(`✅ Deleted ${bugReportCount} bug reports`);
    }

    // 5. Delete user's flags
    const flagsQuery = admin.firestore().collection('flags').where('reporterId', '==', targetUserId);
    const flagsSnapshot = await flagsQuery.get();
    
    const batch3 = admin.firestore().batch();
    let flagCount = 0;
    
    flagsSnapshot.forEach((doc) => {
      batch3.delete(doc.ref);
      flagCount++;
    });
    
    if (flagCount > 0) {
      await batch3.commit();
      logger.info(`✅ Deleted ${flagCount} flag reports`);
    }

    // 6. Handle chats (more complex - need to remove user from participants)
    const chatsQuery = admin.firestore().collection('chats')
      .where('participants', 'array-contains', targetUserId);
    const chatsSnapshot = await chatsQuery.get();
    
    const batch4 = admin.firestore().batch();
    let chatCount = 0;
    
    chatsSnapshot.forEach((doc) => {
      const chatData = doc.data();
      const participants = chatData.participants || [];
      
      if (participants.length <= 2) {
        // If chat only has 2 participants, delete the entire chat
        batch4.delete(doc.ref);
      } else {
        // Remove user from participants (for group chats)
        const updatedParticipants = participants.filter(id => id !== targetUserId);
        batch4.update(doc.ref, { participants: updatedParticipants });
      }
      chatCount++;
    });
    
    if (chatCount > 0) {
      await batch4.commit();
      logger.info(`✅ Updated/deleted ${chatCount} chats`);
    }

    // 7. Delete userChats collection data
    try {
      await admin.firestore().collection('userChats').doc(targetUserId).delete();
      logger.info(`✅ Deleted userChats document`);
    } catch (userChatsError) {
      logger.warn(`UserChats document may not exist: ${userChatsError.message}`);
    }

    // 8. Log the deletion for audit purposes
    await admin.firestore().collection('adminActions').add({
      action: 'deleteUser',
      adminEmail: currentUserEmail,
      adminUID: currentUserId,
      targetUserId: targetUserId,
      targetUserEmail: userEmail,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: {
        itemsDeleted: deleteCount,
        bugReportsDeleted: bugReportCount,
        flagsDeleted: flagCount,
        chatsAffected: chatCount,
        selfDeletion: targetUserId === currentUserId
      }
    });

    logger.info(`🎉 User deletion completed successfully: ${userEmail} (${targetUserId})`);

    return {
      success: true,
      message: 'User and all associated data deleted successfully',
      deletedItems: {
        items: deleteCount,
        bugReports: bugReportCount,
        flags: flagCount,
        chats: chatCount
      }
    };

  } catch (error) {
    logger.error('Error during user deletion:', error);
    throw new functions.https.HttpsError(
      'internal', 
      `Failed to delete user: ${error.message}`
    );
  }
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
