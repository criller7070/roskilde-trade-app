import React, { useState, useEffect } from 'react';
import { Menu, Bell, Share2, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // If user logs out and is on profile page, redirect to home
      if (!currentUser && window.location.pathname === '/profile') {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <div className="w-full bg-orange-500 text-white flex items-center justify-between px-4 py-3 fixed top-0 left-0 z-50">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center space-x-4">
          <button onClick={() => setOpen(!open)} className="p-1">
            <Menu size={24} className="text-white" />
          </button>
          <Link to="/">
            <img src="/logo.png" alt="RosSwap" className="h-8" />
          </Link>
        </div>

        {/* Right: Icons + Profile Picture */}
        <div className="flex items-center space-x-4">
          <Bell size={20} />
          <Share2 size={20} />
          <Search size={20} />
          {user && (
            <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
              <img 
                src={user.photoURL || "/default_pfp.jpg"} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </Link>
          )}
        </div>
      </div>

      {/* Slide-out Menu - only shows when open */}
      {open && (
        <div className="fixed inset-0 bg-orange-500 z-40 flex flex-col justify-center items-center space-y-6 text-white text-lg font-semibold uppercase">
          <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white text-2xl">
            &times;
          </button>

          <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          {!user ? (
            <>
              <Link to="/Login" onClick={() => setOpen(false)}>Log ind</Link>
              <Link to="/Signup" onClick={() => setOpen(false)}>Opret konto</Link>
            </>
          ) : (
            <>
              <Link to="/profile" onClick={() => setOpen(false)}>Profil</Link>
              <button 
                onClick={handleLogout}
                className="text-white"
              >
                LOG UD
              </button>
            </>
          )}
          <Link to="/chats" onClick={() => setOpen(false)}>Beskeder</Link>
          <Link to="/items" onClick={() => setOpen(false)}>Liked</Link>
          <Link to="/add-item" onClick={() => setOpen(false)}>Opret Opslag</Link>
          <Link to="/about" onClick={() => setOpen(false)}>Om os</Link>
        </div>
      )}
    </>
  );
};

export default Navbar;
