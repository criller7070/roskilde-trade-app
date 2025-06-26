import React, { useState } from 'react';
import { Menu, Bell, Share2, Search, Shield, Home, User, LogOut, MessageCircle, Heart, List, Plus, Info, Bug } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { useChat } from '../contexts/ChatContext';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { unreadCount } = useChat();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // If user logs out and is on profile page, redirect to home
  React.useEffect(() => {
    if (!user && window.location.pathname === '/profile') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleShare = async () => {
    const shareData = {
      title: document.title,
      text: "Tjek denne side ud på RosSwap!",
      url: "https://rosswap.dk",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link kopieret til udklipsholder 📋");
      }
    } catch (err) {
      console.error("Share failed:", err);
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
            <img src="/RosSwap-White-Thick.png" alt="RosSwap" className="h-8" />
          </Link>
        </div>

        {/* Right: Icons + Profile Picture */}
        <div className="flex items-center space-x-4">
          <Link to="/chats" className="relative">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[18px]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          <button onClick={handleShare}>
            <Share2 size={20} />
          </button>
          {!user ? (
            <>
              <Link 
                to="/Login" 
                className="text-white font-semibold text-sm px-3 py-1 border border-white rounded hover:bg-white hover:text-orange-500 transition"
              >
                Log ind
              </Link>
              <Link 
                to="/Signup" 
                className="text-white font-semibold text-sm px-3 py-1 border border-white rounded hover:bg-white hover:text-orange-500 transition"
              >
                Opret konto
              </Link>
            </>
          ) : (
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

          <Link to="/" onClick={() => setOpen(false)} className="flex items-center space-x-3">
            <Home size={20} />
            <span>Home</span>
          </Link>
          {!user ? (
            <>
              <Link to="/Login" onClick={() => setOpen(false)} className="flex items-center space-x-3">
                <User size={20} />
                <span>Log ind</span>
              </Link>
              <Link to="/Signup" onClick={() => setOpen(false)} className="flex items-center space-x-3">
                <Plus size={20} />
                <span>Opret konto</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center space-x-3">
                <User size={20} />
                <span>Profil</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-3 text-white"
              >
                <LogOut size={20} />
                <span>LOG UD</span>
              </button>
            </>
          )}
          <Link to="/chats" onClick={() => setOpen(false)} className="flex items-center space-x-3">
            <div className="relative">
              <MessageCircle size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[18px]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span>Beskeder</span>
          </Link>
          
          <div className="w-16 mx-auto border-t border-white/30 my-1"></div>
          <Link to="/liked" onClick={() => setOpen(false)} className="flex items-center space-x-3">
            <Heart size={20} />
            <span>Liked Opslag</span>
          </Link>
          <Link to="/items" onClick={() => setOpen(false)} className="flex items-center space-x-3">
            <List size={20} />
            <span>Nye Opslag</span>
          </Link>
          <Link to="/add-item" onClick={() => setOpen(false)} className="flex items-center space-x-3">
            <Plus size={20} />
            <span>Opret Opslag</span>
          </Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center space-x-3 text-yellow-300">
              <Shield size={20} />
              <span>Admin Panel</span>
            </Link>
          )}
          <div className="w-16 mx-auto border-t border-white/30 my-1"></div>
          
          <Link to="/bug-report" onClick={() => setOpen(false)} className="flex items-center space-x-3">
            <Bug size={20} />
            <span>Rapporter Fejl</span>
          </Link>
          <Link to="/about" onClick={() => setOpen(false)} className="flex items-center space-x-3">
            <Info size={20} />
            <span>Om os</span>
          </Link>
        </div>
      )}
    </>
  );
};

export default Navbar;
