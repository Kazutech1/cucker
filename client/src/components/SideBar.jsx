import React from 'react';
import { FiX, FiHome, FiInfo, FiDollarSign, FiAward, FiFileText } from 'react-icons/fi';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <FiHome />, label: 'Home', path: '/home' },
    { icon: <FiInfo />, label: 'About Us', path: '/about' },
    { icon: <FiDollarSign />, label: 'Deposit', path: '/deposit' },
    // { icon: <FiAward />, label: 'Certificate', path: '/cert' },
    { icon: <FiFileText />, label: 'T&C', path: '/terms' },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-900/95 backdrop-blur-lg border-r border-teal-400/15 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg flex items-center justify-center mr-2">
            <svg fill="white" viewBox="0 0 24 24" width="16" height="16">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">
            <span className="text-white">Siemens</span>
            <span className="text-teal-400">X</span>
          </h2>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 text-gray-400 hover:text-teal-400 transition-colors"
          aria-label="Close sidebar"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="p-2">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors mb-1 ${
                isActive ? 'text-teal-400 bg-teal-400/10' : 'text-gray-400 hover:text-teal-400 hover:bg-gray-800'
              }`
            }
            onClick={() => {
              navigate(item.path);
              toggleSidebar(); // Close sidebar on navigation
            }}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;