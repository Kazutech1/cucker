import { useState, useEffect, useRef } from 'react';
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
  FiUser,
  FiLogOut
} from 'react-icons/fi';
import { FaBars, FaTimes } from 'react-icons/fa';

const Sidebar = ({ isMobileOpen, toggleMobileSidebar }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const sidebarRef = useRef(null);

  const minSwipeDistance = 50;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (!mobile) {
        setIsOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isMobileOpen]);

  // Handle swipe to close on mobile
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    
    if (isLeftSwipe && isMobile && isMobileOpen) {
      toggleMobileSidebar();
    }
  };

  const toggleSidebar = () => {
    if (!isMobile) {
      setIsOpen(!isOpen);
    }
  };

  const handleNavClick = () => {
    if (isMobile && isMobileOpen) {
      toggleMobileSidebar();
    }
  };

  const navItems = [
    { path: '/admin/dashboard', icon: <FiGrid size={20} />, label: 'Dashboard' },
    { path: '/admin/withdrawals', icon: <FiDollarSign size={20} />, label: 'Manage Withdrawals' },
    { path: '/admin/deposits', icon: <FiDownload size={20} />, label: 'Manage Deposits' },
    { path: '/admin/vip', icon: <FiStar size={20} />, label: 'VIP Levels' },
    { path: '/admin/notifications', icon: <FiBell size={20} />, label: 'Manage Notifications' },
    { path: '/admin/wallets', icon: <FiCreditCard size={20} />, label: 'Manage Wallets' },
     { path: '/admin/tasks', icon: <FiCreditCard size={20} />, label: 'Manage Tasks' },
  ];

  return (
    <>
      {/* Floating Hamburger Button - Mobile Only */}
      {isMobile && (
        <button
          onClick={toggleMobileSidebar}
          className={`fixed top-6 left-6 z-50 w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 
            hover:from-teal-400 hover:to-teal-500 text-white rounded-2xl shadow-2xl 
            flex items-center justify-center transition-all duration-300 ease-out
            ${isMobileOpen ? 'rotate-90 scale-95' : 'hover:scale-105'} 
            backdrop-blur-sm border border-white/10`}
          aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
        >
          <div className={`transition-all duration-300 ${isMobileOpen ? 'rotate-180' : ''}`}>
            {isMobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </div>
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-all duration-300"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`bg-gray-900/95 backdrop-blur-xl text-white transition-all duration-300 ease-out
          ${!isMobile ? (isOpen ? 'w-64' : 'w-16') : 'w-80'} 
          ${isMobile ? 
            `fixed inset-y-0 left-0 z-40 transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
             shadow-2xl border-r border-gray-700/50` : 
            'flex fixed z-40'} 
          flex-col h-screen`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Sidebar Header */}
        <div className={`${isMobile ? 'p-6 pt-20' : 'p-4'} border-b border-gray-700/50 flex items-center justify-between`}>
          {(isOpen || isMobile) ? (
            <h2 className={`${isMobile ? 'text-2xl' : 'text-xl'} font-bold bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent`}>
              Admin Panel
            </h2>
          ) : (
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
              A
            </span>
          )}
          
          {!isMobile && (
            <button 
              onClick={toggleSidebar}
              className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800/70 transition-all duration-200"
              aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className={`flex-1 overflow-y-auto ${isMobile ? 'p-6' : 'p-3'} scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent`}>
          <ul className="space-y-3">
            {navItems.map((item, index) => (
              <li key={item.path} style={{ animationDelay: isMobile && isMobileOpen ? `${index * 50}ms` : '0ms' }}>
                <NavLink
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) => 
                    `flex items-center ${isMobile ? 'p-4' : 'p-3'} rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-teal-600/30 to-teal-500/20 text-teal-300 shadow-lg border border-teal-500/20' 
                      : 'text-gray-300 hover:bg-gray-800/70 hover:text-white hover:shadow-md'
                    } ${isMobile && isMobileOpen ? 'animate-slide-in-right' : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`flex-shrink-0 transition-all duration-200 ${isActive ? 'text-teal-400' : 'group-hover:scale-110'}`}>
                        {item.icon}
                      </span>
                      {(isOpen || isMobile) && (
                        <span className={`${isMobile ? 'ml-4 text-lg' : 'ml-3'} font-medium`}>
                          {item.label}
                        </span>
                      )}
                      {isActive && (
                        <div className="ml-auto w-1 h-6 bg-teal-400 rounded-full"></div>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className={`${isMobile ? 'p-6' : 'p-4'} border-t border-gray-700/50 space-y-4`}>
          {/* User Profile */}
          <div className="flex items-center p-3 rounded-xl bg-gray-800/50 backdrop-blur-sm">
            <div className={`${isMobile ? 'w-12 h-12' : 'w-10 h-10'} rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg ring-2 ring-teal-400/20`}>
              <FiUser className={`text-white ${isMobile ? 'text-lg' : ''}`} />
            </div>
            {(isOpen || isMobile) && (
              <div className={`${isMobile ? 'ml-4' : 'ml-3'}`}>
                <p className={`${isMobile ? 'text-base' : 'text-sm'} font-semibold text-white`}>
                  Admin User
                </p>
                <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-400`}>
                  admin@example.com
                </p>
              </div>
            )}
          </div>
          
          {/* Logout Button */}
          {(isOpen || isMobile) && (
            <button className={`w-full flex items-center ${isMobile ? 'p-4 text-base' : 'p-3 text-sm'} 
              text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all duration-200 group
              border border-transparent hover:border-red-500/20`}>
              <FiLogOut className={`${isMobile ? 'text-lg' : ''} group-hover:scale-110 transition-transform duration-200`} />
              <span className={`${isMobile ? 'ml-4' : 'ml-3'}`}>Logout</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Sidebar;