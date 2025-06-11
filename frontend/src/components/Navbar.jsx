import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button - always visible */}
      <div className="fixed top-4 left-4 z-50">
        <button onClick={() => setOpen(!open)} className="p-2 bg-orange-500 rounded-full">
          <Menu size={24} className="text-white" />
        </button>
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
          <Link to="/add-item" onClick={() => setOpen(false)}>Profil</Link>
          <Link to="/about" onClick={() => setOpen(false)}>Om os</Link> {/* Optional route */}
        </div>
      )}
    </>
  );
};

export default Navbar;
