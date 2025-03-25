import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Replace with your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAq_FHFKZ0NMTB3Z51RkSeWn9aif7RPdLk",
    authDomain: "roskilde-trade.firebaseapp.com",
    projectId: "roskilde-trade",
    storageBucket: "roskilde-trade.firebasestorage.app",
    messagingSenderId: "599145097942",
    appId: "1:599145097942:web:b62b1a858afa8c22eaf777"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Google sign-in error:", error);
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export { auth, signInWithGoogle, logout };
