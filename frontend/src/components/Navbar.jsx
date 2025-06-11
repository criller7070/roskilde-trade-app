import React, { useState } from 'react';
import { Menu, Bell, Share2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [open, setOpen] = useState(false);

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

        {/* Right: Placeholder icons */}
        <div className="flex space-x-4">
          <Bell size={20} />
          <Share2 size={20} />
          <Search size={20} />
        </div>
      </div>

      {/* Slide-out Menu - only shows when open */}
      {open && (
        <div className="fixed inset-0 bg-orange-500 z-40 flex flex-col justify-center items-center space-y-6 text-white text-lg font-semibold uppercase">
          <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white text-2xl">
            &times;
          </button>

          <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/chats" onClick={() => setOpen(false)}>Beskeder</Link>
          <Link to="/items" onClick={() => setOpen(false)}>Liked</Link>
          <Link to="/add-item" onClick={() => setOpen(false)}>Sælg eller byt</Link>
          <Link to="/profile" onClick={() => setOpen(false)}>Profil</Link>
          <Link to="/about" onClick={() => setOpen(false)}>Om os</Link>
        </div>
      )}
    </>
  );
};

export default Navbar;
