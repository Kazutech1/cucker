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
    balance: 0,
    profitBalance: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [eligibleLevel, setEligibleLevel] = useState(0);
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
    } finally {
      setIsLoading(false);
    }
  };

 
  useEffect(() => {
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
                  onClick={(e) => {
                    e.preventDefault(); // Prevent default button behavior
                    setShowUpgradePopup(false);
                    setShowSupportModal(true);
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
                  href="https://t.me/CS1_SiemensX"
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
                  href="https://t.me/CS3_SiemensX"
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
                  href="https://wa.me/17866033764"
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
                      <p className="text-xs text-gray-400">+1 786 603 3764</p>
                    </div>
                  </div>
                  <span className="text-green-400 text-xs bg-green-900/20 px-2 py-1 rounded">24/7</span>
                </a>
                
                {/* WhatsApp 2 */}
                <a
                  href="https://wa.me/18322381774"
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
                      <p className="text-xs text-gray-400">+1 832 238 1774</p>
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
            src={userData.profilePicture || "data:image/png;base64,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"}
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
                ${parseFloat(userData.profitBalance).toFixed(2)}
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