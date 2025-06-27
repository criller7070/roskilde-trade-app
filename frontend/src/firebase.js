import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAq_FHFKZ0NMTB3Z51RkSeWn9aif7RPdLk",
    authDomain: "roskilde-trade.firebaseapp.com",
    projectId: "roskilde-trade",
    storageBucket: "roskilde-trade.firebasestorage.app",
    messagingSenderId: "599145097942",
    appId: "1:599145097942:web:b62b1a858afa8c22eaf777",
    measurementId: "G-NS34C8F4EE"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();
  const storage = getStorage(app);
  
  const signInWithGoogle = async () => {
    try {
      console.log("Starting Google sign-in process...");
      const result = await signInWithPopup(auth, provider);
      console.log("Sign-in successful:", result);
      const user = result.user;
  
      // Check if the user exists in Firestore (for GDPR consent tracking)
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      // Use Firebase Auth's additionalUserInfo to detect truly new users
      const isNewUser = result.additionalUserInfo?.isNewUser || false;
      
      let userDoc = userSnap.exists() ? userSnap.data() : null;
      
      // Handle existing users without GDPR fields
      if (!isNewUser) {
        if (!userSnap.exists()) {
          // No Firestore doc at all - create one
          console.log("Creating Firestore document for existing Firebase Auth user...");
          const newUserData = {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date(),
            gdprConsent: true, // Assume existing users had consented previously
            consentedAt: new Date()
          };
          await setDoc(userRef, newUserData);
          userDoc = newUserData;
        } else if (userDoc && userDoc.gdprConsent === undefined) {
          // Has Firestore doc but missing GDPR consent field - update it
          console.log("Adding GDPR consent to existing user document...");
          const updatedFields = {
            gdprConsent: true, // Assume existing users had consented previously
            consentedAt: new Date()
          };
          await setDoc(userRef, updatedFields, { merge: true });
          userDoc = { ...userDoc, ...updatedFields };
        }
      }
  
      // Return user info and whether they're new
      return {
        user,
        isNewUser,
        userDoc
      };
    } catch (error) {
      console.error("Detailed Google sign-in error:", {
        code: error.code,
        message: error.message,
        email: error.email,
        credential: error.credential,
        fullError: error
      });
      
      // Handle specific authentication errors
      if (error.code === 'auth/network-request-failed') {
        console.warn('Network error during authentication - this may cause subsequent Firestore listener issues');
      } else if (error.code === 'auth/popup-blocked') {
        console.warn('Popup blocked - this is common on mobile devices');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.warn('Popup cancelled or closed');
      }
      
      // Let the calling component handle the error with the popup system
      throw error;
    }
  };

  // Create user document with GDPR consent
  const createGoogleUser = async (user, hasConsent = false) => {
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(),
        consentedAt: hasConsent ? new Date() : null,
        gdprConsent: hasConsent
      });
      console.log("New Google user document created");
    } catch (error) {
      console.error("Error creating Google user:", error);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
export { auth, db, storage, signInWithGoogle, createGoogleUser, logout };
