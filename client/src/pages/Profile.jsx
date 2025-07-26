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
  FiLogOut,
  FiDollarSign,
  FiCreditCard,
  FiSend,
  FiMessageCircle
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/NavBar';
import Sidebar from '../components/SideBar';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/Spinner';
import { Users } from 'lucide-react';

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
  const [profitBalance, setProfitBalance] = useState(0);
  const [showSupportModal, setShowSupportModal] = useState(false);
  
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

  const fetchProfitBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/withdrawal/info`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      
      const data = await response.json();
      setProfitBalance(data.profitBalance);
      
    } catch (error) {
      console.error('Balance fetch error:', error);
    }
  };

  useEffect(() => {
    fetchProfitBalance();
    fetchProfile();
  }, []);

  const menuItems = [
    { icon: <Users />, label: "My Team", path: "/referrals" },
    { icon: <FiMail />, label: "Transaction History", path: "/transactions" },
    { icon: <FiPersonal />, label: "Personal Information", path: "/personal" },
    { 
      icon: <FiHelpCircle />, 
      label: "Customer Service", 
      onClick: () => setShowSupportModal(true) 
    },
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

      {/* Customer Support Bottom Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className={`relative w-full max-w-md bg-gray-900 rounded-t-2xl border-t border-teal-400/20 shadow-xl transform transition-transform duration-300 ${showSupportModal ? 'translate-y-0' : 'translate-y-full'}`}>
            {/* Drag Handle */}
            <div className="pt-3 flex justify-center">
              <div className="h-1 w-10 bg-gray-600 rounded-full"></div>
            </div>
            
            {/* Modal Header */}
            <div className="px-4 pt-2 pb-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Contact Support</h2>
              <button 
                onClick={() => setShowSupportModal(false)}
                className="p-2 text-gray-400 hover:text-white rounded-full"
              >
                <FiX size={20} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="px-4 pb-6">
              <p className="text-gray-400 mb-4 text-sm">
                Choose a support channel to get immediate help
              </p>
              
              <div className="space-y-3">
                {/* Telegram 1 */}
                <a
                  href="https://t.me/support1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors active:bg-gray-700"
                >
                  <div className="flex items-center">
                    <div className="bg-blue-900/30 p-2 rounded-lg mr-3">
                      <FiSend className="text-blue-400" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-white">Telegram Support 1</p>
                      <p className="text-xs text-gray-400">@support_team1</p>
                    </div>
                  </div>
                  <span className="text-blue-400 text-xs bg-blue-900/20 px-2 py-1 rounded">Instant</span>
                </a>
                
                {/* Telegram 2 */}
                <a
                  href="https://t.me/support2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors active:bg-gray-700"
                >
                  <div className="flex items-center">
                    <div className="bg-blue-900/30 p-2 rounded-lg mr-3">
                      <FiSend className="text-blue-400" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-white">Telegram Support 2</p>
                      <p className="text-xs text-gray-400">@support_team2</p>
                    </div>
                  </div>
                  <span className="text-blue-400 text-xs bg-blue-900/20 px-2 py-1 rounded">Instant</span>
                </a>
                
                {/* WhatsApp 1 */}
                <a
                  href="https://wa.me/12345678901"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors active:bg-gray-700"
                >
                  <div className="flex items-center">
                    <div className="bg-green-900/30 p-2 rounded-lg mr-3">
                      <FiMessageCircle className="text-green-400" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-white">WhatsApp Support 1</p>
                      <p className="text-xs text-gray-400">+1 234 567 8901</p>
                    </div>
                  </div>
                  <span className="text-green-400 text-xs bg-green-900/20 px-2 py-1 rounded">24/7</span>
                </a>
                
                {/* WhatsApp 2 */}
                <a
                  href="https://wa.me/12345678902"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors active:bg-gray-700"
                >
                  <div className="flex items-center">
                    <div className="bg-green-900/30 p-2 rounded-lg mr-3">
                      <FiMessageCircle className="text-green-400" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-white">WhatsApp Support 2</p>
                      <p className="text-xs text-gray-400">+1 234 567 8902</p>
                    </div>
                  </div>
                  <span className="text-green-400 text-xs bg-green-900/20 px-2 py-1 rounded">24/7</span>
                </a>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-4 py-3 border-t border-gray-800 text-center text-gray-400 text-xs">
              <p>Typically replies within minutes</p>
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
            src={userData.profilePicture || "data:image/jpeg;base64,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"}
            alt="Profile" 
            className="w-20 h-20 rounded-full border-2 border-teal-400 object-cover"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-teal-400">{userData.username}</h2>
           
            <div className="flex flex-wrap gap-2 mt-2">
             <div className="flex items-center gap-2 bg-teal-400/10 text-teal-400 px-3 py-1 rounded-full text-sm font-semibold">
  <span>
    Invite Code: <span className="font-bold">{userData.referralCode}</span>
  </span>
  <button
    onClick={() => navigator.clipboard.writeText(userData.referralCode)}
    className="text-xs bg-teal-400/20 hover:bg-teal-400/30 text-teal-600 px-2 py-0.5 rounded transition"
  >
    Copy
  </button>
</div>

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
                {`$${profitBalance.toFixed(2)}`}
              </div>
              <div className="text-gray-400 text-xs uppercase">Profit Balance</div>
            </div>
          </div>
        </div>

        {/* Deposit/Withdrawal Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate('/deposit')}
            className="bg-teal-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all shadow-lg"
          >
            <FiCreditCard className="mr-2" size={18} />
            Deposit
          </button>
          <button
            onClick={() => navigate('/withdraw')}
            className="bg-teal-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all shadow-lg"
          >
            <FiDollarSign className="mr-2" size={18} />
            Withdraw
          </button>
        </div>

        {/* Menu Card */}
        <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-1 mb-6">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick || (() => navigate(item.path))}
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