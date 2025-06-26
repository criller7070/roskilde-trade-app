import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

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
  const analytics = getAnalytics(app);
  
  const signInWithGoogle = async () => {
    try {
      console.log("Starting Google sign-in process...");
      const result = await signInWithPopup(auth, provider);
      console.log("Sign-in successful:", result);
      const user = result.user;
  
      // Check if the user already exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        console.log("Creating new user document...");
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date(),
        });
        console.log("New user document created");
      }
    } catch (error) {
      console.error("Detailed Google sign-in error:", {
        code: error.code,
        message: error.message,
        email: error.email,
        credential: error.credential,
        fullError: error
      });
      // Let the calling component handle the error with the popup system
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
  
export { auth, db, storage, signInWithGoogle, logout };
