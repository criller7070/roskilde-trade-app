import { useState, useEffect } from "react";
import { auth, db, signInWithGoogle, logout } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser(userSnap.data());
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <nav className="bg-orange-500 text-white py-4 px-6 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Roskilde Trade</h1>

        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/items" className="hover:underline">Trade</Link>
          <Link to="/chats" className="hover:underline">Messages</Link>
        </div>

        {user ? (
          <div className="flex items-center space-x-4">
            <img src={user.profilePic} alt="User" className="w-8 h-8 rounded-full" />
            <span>{user.name}</span>
            <button
              onClick={logout}
              className="bg-white text-orange-500 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="bg-white text-orange-500 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100"
          >
            Login with Google
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
