import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔐 SECURE: Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

const signInWithGoogle = async () => {
  try {
    if (import.meta.env.DEV) {
      console.log("Starting Google sign-in process...");
    }
    const result = await signInWithPopup(auth, provider);
    
    if (import.meta.env.DEV) {
      console.log("Sign-in successful");
    }
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
        if (import.meta.env.DEV) {
          console.log("Creating Firestore document for existing Firebase Auth user...");
        }
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
        if (import.meta.env.DEV) {
          console.log("Adding GDPR consent to existing user document...");
        }
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
    // SECURITY: Only log error code in production, not sensitive details
    if (import.meta.env.DEV) {
      console.error("Google sign-in error:", error.code);
    }
    
    // Handle specific authentication errors
    if (error.code === 'auth/network-request-failed') {
      if (import.meta.env.DEV) {
        console.warn('Network error during authentication');
      }
          } else if (error.code === 'auth/popup-blocked') {
        if (import.meta.env.DEV) {
          console.warn('Popup blocked - common on mobile devices');
        }
      } else if (error.code === 'auth/cancelled-popup-request') {
        if (import.meta.env.DEV) {
          console.warn('Popup cancelled or closed');
        }
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
    if (import.meta.env.DEV) {
      console.log("New Google user document created");
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Error creating Google user:", error.code);
    }
    throw error;
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Logout error:", error.code);
    }
  }
};

export { auth, db, storage, signInWithGoogle, createGoogleUser, logout };
