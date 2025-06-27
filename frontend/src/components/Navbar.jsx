import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Share2, Search, Shield, Home, User, LogOut, MessageCircle, Heart, List, Plus, Info, Bug, Flame } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { useChat } from '../contexts/ChatContext';
import { usePopupContext } from '../contexts/PopupContext';
import LoadingPlaceholder from './LoadingPlaceholder';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { unreadCount } = useChat();
  const { showSuccess, showError } = usePopupContext();
  const navigate = useNavigate();

  // Toggle hamburger menu with ESC key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (open) {
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling
      document.body.style.overflow = 'unset';
    }

    // Cleanup: ensure scrolling is re-enabled when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

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
      url: "https://roskilde-trade.firebaseapp.com",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showSuccess("Siden er blevet delt!");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showSuccess("Link kopieret til udklipsholder! Del det med dine venner.");
      }
    } catch (err) {
      console.error("Share failed:", err);
      showError("Kunne ikke dele siden. Prøv igen.");
    }
  };

  return (
    <>
      <div className="w-full bg-orange-500 text-white flex items-center justify-between px-4 py-2 fixed top-0 left-0 z-50">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center space-x-4">
          <button onClick={() => setOpen(!open)} className="p-1">
            <Menu size={24} className="text-white" />
          </button>
          <Link to="/">
            <LoadingPlaceholder
              src="/RosSwap-White-Thick.png"
              alt="RosSwap"
              className="h-8"
              placeholderClassName="bg-orange-400"
              fallbackSrc="/logo.png"
            />
          </Link>
        </div>

        {/* Right: Icons + Profile Picture */}
        <div className="flex items-center space-x-4">
          <Link to="/chats" onClick={() => setOpen(false)} className="relative">
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
            <div className="flex items-center space-x-2 h-8">
              <Link 
                to="/Login" 
                onClick={() => setOpen(false)}
                className="text-white font-semibold text-xs px-2 py-1.5 border border-white rounded hover:bg-white hover:text-orange-500 transition sm:text-sm sm:px-3 h-8 flex items-center"
              >
                <span className="hidden sm:inline">Log ind</span>
                <span className="sm:hidden">Log Ind</span>
              </Link>
              <Link 
                to="/Signup" 
                onClick={() => setOpen(false)}
                className="text-white font-semibold text-xs px-2 py-1.5 border border-white rounded hover:bg-white hover:text-orange-500 transition sm:text-sm sm:px-3 h-8 flex items-center"
              >
                <span className="hidden sm:inline">Opret konto</span>
                <span className="sm:hidden">Opret Konto</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-2 h-8">
              <button 
                onClick={handleLogout}
                className="text-white font-semibold text-xs px-2 py-1.5 border border-white rounded hover:bg-white hover:text-orange-500 transition sm:text-sm sm:px-3 h-8 flex items-center"
              >
                <span className="hidden sm:inline">Log ud</span>
                <span className="sm:hidden">Log Ud</span>
              </button>
              <ProfileDropdown setOpen={setOpen} />
            </div>
          )}
        </div>
      </div>

      {/* Slide-out Menu - only shows when open */}
      {open && (
        <div className="fixed inset-0 bg-orange-500 z-60 flex flex-col justify-center items-center space-y-6 text-white text-lg font-semibold uppercase">
          <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white text-2xl">
            &times;
          </button>

          <Link to="/" onClick={() => setOpen(false)} className="flex items-center space-x-3">
            <Home size={20} />
            <span>HJEM</span>
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
                <span>PROFIL</span>
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
          
          <div className="w-24 mx-auto border-t-2 border-white/50 my-3"></div>
          <Link to="/swipe" onClick={() => setOpen(false)} className="flex items-center space-x-3">
            <Flame size={20} />
            <span>Swipe Opslag</span>
          </Link>
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
          <div className="w-24 mx-auto border-t-2 border-white/50 my-3"></div>
          
          <Link to="/bug-report" onClick={() => setOpen(false)} className="flex items-center space-x-3">
            <Bug size={20} />
            <span>Rapporter Fejl</span>
          </Link>
          <Link to="/about" onClick={() => setOpen(false)} className="flex items-center space-x-3">
            <Info size={20} />
            <span>Om os</span>
          </Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center space-x-3 text-yellow-300">
              <Shield size={20} />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>
      )}
    </>
  );
};

const ProfileDropdown = ({ setOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setDropdownOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Detect outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="focus:outline-none"
      >
        <LoadingPlaceholder
          src={user?.photoURL || '/default_pfp.jpg'}
          alt="Profile"
          className="w-8 h-8 rounded-full border border-white"
          placeholderClassName="rounded-full border border-white bg-orange-400"
          fallbackSrc="/default_pfp.jpg"
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-50">
          <button
            onClick={() => {
              navigate('/profile');
              setDropdownOpen(false);
              if (setOpen) setOpen(false); // Close hamburger menu if it's open
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Profil
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Log ud
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
