import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiGrid, 
  FiDollarSign, 
  FiDownload, 
  FiStar, 
  FiBell, 
  FiCreditCard,
  FiChevronLeft,
  FiChevronRight,
  FiUser
} from 'react-icons/fi';
import { FaBars, FaTimes } from 'react-icons/fa';

const Sidebar = ({ isMobileOpen, toggleMobileSidebar }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { path: '/admin/dashboard', icon: <FiGrid size={20} />, label: 'Dashboard' },
    { path: '/admin/withdrawals', icon: <FiDollarSign size={20} />, label: 'Withdrawals' },
    { path: '/admin/deposits', icon: <FiDownload size={20} />, label: 'Deposits' },
    { path: '/admin/vip', icon: <FiStar size={20} />, label: 'VIP Levels' },
    { path: '/admin/notifications', icon: <FiBell size={20} />, label: 'Notifications' },
    { path: '/admin/wallets', icon: <FiCreditCard size={20} />, label: 'Wallets' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleMobileSidebar}
        ></div>
      )}

      <div 
        className={`bg-gray-900 text-white transition-all duration-300 
          ${isOpen ? 'w-64' : 'w-20'} 
          ${isMobile ? (isMobileOpen ? 'fixed inset-y-0 left-0 z-40' : 'hidden') : 'flex'} 
          flex-col h-screen fixed`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {isOpen ? (
            <h2 className="text-xl font-bold text-teal-400">Admin Panel</h2>
          ) : (
            <span className="text-teal-400 text-2xl">A</span>
          )}
          {!isMobile && (
            <button 
              onClick={toggleSidebar}
              className="text-gray-400 hover:text-white p-1 rounded-lg"
            >
              {isOpen ? <FiChevronLeft size={24} /> : <FiChevronRight size={24} />}
            </button>
          )}
          {isMobile && (
            <button 
              onClick={toggleMobileSidebar}
              className="text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <FaTimes size={20} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center p-3 rounded-lg transition-colors ${isActive 
                      ? 'bg-teal-800/30 text-teal-400 border-l-4 border-teal-400' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`
                  }
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {isOpen && <span className="ml-3">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
              <FiUser className="text-white" />
            </div>
            {isOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-400">admin@example.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;