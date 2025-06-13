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
    appId: "1:599145097942:web:b62b1a858afa8c22eaf777"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();
  const storage = getStorage(app);
  
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      // Check if the user already exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          profilePic: user.photoURL,
          createdAt: new Date(),
        });
      }
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
  
export { auth, db, storage, signInWithGoogle, logout };
