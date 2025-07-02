import React, { useState, useEffect } from 'react';
import { 
  FiHome, 
  FiTrendingUp, 
  FiAward, 
  FiUser, 
  FiMenu, 
  FiX,
  FiBookmark,
  FiMail,
  FiUser as FiPersonal,
  FiHelpCircle,
  FiBell,
  FiLogOut
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/NavBar';
import Sidebar from '../components/SideBar';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/Spinner';

const ProfilePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    referralCode: '',
    vipLevel: { name: '', profitPerOrder: 0 },
    balance: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [eligibleLevel, setEligibleLevel] = useState(0);

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message === 'Profile retrieved successfully') {
          setUserData(data.user);
          
          // Check for VIP upgrade eligibility
          if (data.toast) {
            setUpgradeMessage(data.toast.message);
            setEligibleLevel(data.eligibleLevel || 0);
            setShowUpgradePopup(true);
          }
        } else {
          throw new Error(data.message || 'Failed to fetch profile');
        }
      } else {
        throw new Error('Profile request failed');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      alert('Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const menuItems = [
    { icon: <FiBookmark />, label: "Withdraw Funds", path: "/withdraw" },
    { icon: <FiMail />, label: "Transaction History", path: "/transactions" },
    { icon: <FiPersonal />, label: "Personal Information", path: "/personal" },
    { icon: <FiHelpCircle />, label: "Customer Service", path: "/support" },
    { icon: <FiBell />, label: "Notifications", path: "/notifications" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-16 pt-15">
      {isLoading && <LoadingSpinner />}
      
      {/* VIP Upgrade Popup */}
      {showUpgradePopup && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-teal-400/30 rounded-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-teal-400">VIP Upgrade Available!</h3>
              <button 
                onClick={() => setShowUpgradePopup(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-4">{upgradeMessage}</p>
              
              <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg mb-3">
                <span className="text-gray-300">Current Level</span>
                <span className="font-bold text-yellow-400">{userData.vipLevel.name}</span>
              </div>
              
            
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradePopup(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowUpgradePopup(false);
                  navigate('/support');
                }}
                className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg transition"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="min-h-screen bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6">
        {/* Profile Header */}
        <div className="profile-header flex items-center gap-5 mb-8">
          <img 
            src="https://randomuser.me/api/portraits/men/32.jpg" 
            alt="Profile" 
            className="w-20 h-20 rounded-full border-2 border-teal-400 object-cover"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-teal-400">{userData.username}</h2>
           
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-teal-400/10 text-teal-400 px-3 py-1 rounded-full text-sm">
                Invite Code: {userData.referralCode}
              </span>
              <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-gray-300 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                <svg className="mr-1" fill="currentColor" viewBox="0 0 24 24" width="14" height="14">
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z"/>
                </svg>
                {userData.vipLevel.name}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-5 mb-6">
          <div className="flex justify-between mb-5">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">
                ${parseFloat(userData.balance).toFixed(2)}
              </div>
              <div className="text-gray-400 text-xs uppercase">Total Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {(userData.vipLevel.profitPerOrder * 100).toFixed(2)}%
              </div>
              <div className="text-gray-400 text-xs uppercase">Profit Per Order</div>
            </div>
          </div>
        </div>

        {/* Menu Card */}
        <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-1 mb-6">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center p-4 hover:bg-teal-400/10 transition-all rounded-lg"
            >
              <span className="text-teal-400 mr-4 text-lg">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              <svg className="text-gray-400" fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full p-4 bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-xl flex items-center justify-center hover:bg-red-500/30 transition-all"
        >
          <FiLogOut className="mr-2" />
          Log Out
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default ProfilePage;
