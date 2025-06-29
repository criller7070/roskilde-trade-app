import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        /* ---------- pull extra data from Firestore ---------- */
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        if (snap.exists()) {
          const data = snap.data();

          /* 1. **mutate the real User instance** instead of cloning */
          if (!currentUser.displayName) currentUser.displayName = data.name ?? null;
          if (!currentUser.photoURL)    currentUser.photoURL    = data.photoURL ?? null;
        }
      } catch (error) {
        // Handle Firestore errors gracefully to prevent internal assertion failures
        console.warn('Failed to fetch user data from Firestore:', error.code || error.message);
        // Continue with authentication even if Firestore call fails
      }

      /* 2. hand back the SAME instance (retain methods) */
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}