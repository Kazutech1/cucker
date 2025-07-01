import React from 'react';
import { FiMenu } from 'react-icons/fi';

const Navbar = ({ toggleSidebar }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-teal-400/15">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg flex items-center justify-center mr-2">
            <svg fill="white" viewBox="0 0 24 24" width="16" height="16">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold">
            <span className="text-white">Siemens</span>
            <span className="text-teal-400">X</span>
          </h2>
        </div>

        {/* Hamburger Menu */}
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-teal-400/10 transition-colors"
        >
          <FiMenu className="w-6 h-6 text-teal-400" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;