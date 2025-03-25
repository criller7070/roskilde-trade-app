import { useState, useEffect } from "react";
import { auth, signInWithGoogle, logout } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="bg-orange-500 text-white py-4 px-6 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Roskilde Trade</h1>

        <div className="hidden md:flex space-x-6">
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Trade</a>
        </div>

        {user ? (
          <div className="flex items-center space-x-4">
            <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />
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
