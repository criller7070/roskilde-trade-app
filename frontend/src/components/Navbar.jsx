import { useState } from "react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-orange-500 text-white py-4 px-6 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-2xl font-bold">Roskilde Trade</h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Trade</a>
        </div>

        {/* Login Button */}
        <button className="bg-white text-orange-500 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100">
          Login
        </button>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col mt-4 space-y-2 text-center">
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Trade</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
