import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiTrendingUp, 
  FiAward, 
  FiUser, 
  FiMenu, 
  FiX,
  FiDollarSign,
  FiClock,
  FiCheck,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';
import Navbar from '../components/NavBar';
import Sidebar from '../components/SideBar';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/Spinner';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profitBalance, setProfitBalance] = useState(0);
  const [earningsData, setEarningsData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimMessage, setClaimMessage] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get VIP level name
  const getVipLevelName = (level) => {
    const names = {
      0: 'Basic Investor',
      1: 'Bronze Investor',
      2: 'Silver Investor', 
      3: 'Gold Investor',
      4: 'Premium Investor'
    };
    return names[level] || 'Premium Investor';
  };

  // Get VIP ROI
  const getVipRoi = (level) => {
    const roiRates = {
      0: 0,
      1: 0.5,
      2: 0.6,
      3: 0.9,
      4: 1.2
    };
    return roiRates[level] || 0;
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
          return;
        }
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setUserData(data.user);
      
    } catch (error) {
      console.error('Profile fetch error:', error);
      setClaimMessage({ text: 'Failed to load profile data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch earnings info
  const fetchEarningsInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch( `${import.meta.env.VITE_API_BASE_URL}/api/earnings/daily`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch earnings info');
      }
      
      const data = await response.json();
      setEarningsData(data);
      
      // Start countdown if needed
      if (!data.canClaim && data.nextAvailable) {
        const nextAvailable = new Date(data.nextAvailable);
        const now = new Date();
        const timeDiff = nextAvailable.getTime() - now.getTime();
        
        if (timeDiff > 0) {
          startCountdown(timeDiff);
        }
      }
      
    } catch (error) {
      console.error('Earnings info fetch error:', error);
      setClaimMessage({ text: 'Failed to load earnings information', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      } else {
        setTransactions([]);
      }
      
    } catch (error) {
      console.error('Transactions fetch error:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch withdrawal info
  const fetchWithdrawalInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/withdrawal/info`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch withdrawal info');
      }
      
      const data = await response.json();
      setProfitBalance(data.profitBalance);
      
    } catch (error) {
      console.error('Withdrawal info fetch error:', error);
      setClaimMessage({ text: 'Failed to load withdrawal info', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer
  const startCountdown = (initialTimeMs) => {
    let remainingTime = initialTimeMs;
    
    const timer = setInterval(() => {
      remainingTime -= 1000;
      
      if (remainingTime <= 0) {
        clearInterval(timer);
        fetchEarningsInfo();
        return;
      }
      
      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    
    return () => clearInterval(timer);
  };

  // Claim daily profit
  const claimDailyProfit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/earnings/daily`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to claim profit');
      }
      
      await Promise.all([
        fetchUserProfile(),
        fetchEarningsInfo(),
        fetchTransactions(),
        fetchWithdrawalInfo()
      ]);
      
      setClaimMessage({ text: 'Profit claimed successfully!', type: 'success' });
      
    } catch (error) {
      console.error('Claim error:', error);
      setClaimMessage({ text: error.message || 'Failed to claim profit', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Initialize dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const initDashboard = async () => {
      try {
        setIsInitialLoading(true);
        await Promise.all([
          fetchUserProfile(),
          fetchEarningsInfo(),
          fetchTransactions(),
          fetchWithdrawalInfo()
        ]);
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        setClaimMessage({ text: 'Failed to initialize dashboard', type: 'error' });
      } finally {
        setIsInitialLoading(false);
      }
    };

    initDashboard();
  }, [navigate]);

  // Loading overlay component
 


  // if (isInitialLoading) {
  //   return <LoadingSpinner />;
  // }

  console.log(userData);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-16 relative">
      {loading && <LoadingSpinner />}

      {/* Navigation */}
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-32 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold">Investment Dashboard</h1>
          {userData && (
            <div className="flex items-center gap-4 bg-teal-400/10 px-4 py-2 rounded-full border border-teal-400/20">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center text-white font-bold">
                VIP{userData.vipLevel.level || 0}
              </div>
              <div>{getVipLevelName(userData.vipLevel.level || 0)}</div>
            </div>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm">Current Balance</p>
                <p className="text-teal-400 text-3xl font-bold">
                  {userData ? formatCurrency(userData.balance) : '$0.00'}
                </p>
              </div>
              <span className="bg-teal-400/20 text-teal-400 px-3 py-1 rounded-full text-xs font-medium">
                Active
              </span>
            </div>
            <div className="pt-4 mt-4 border-t border-teal-400/20">
              <p className="text-gray-400 text-sm">Profit Balance</p>
              <p className="text-green-400 text-2xl font-semibold">
                {formatCurrency(profitBalance)}
              </p>
            </div>
          </div>

          {/* ROI Card */}
          <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Daily ROI</h3>
            <div className="text-center my-6">
              <div className="text-teal-400 text-4xl font-bold">
                {userData ? `${getVipRoi(userData.vipLevel.level || 0)}%` : '0%'}
              </div>
              <p className="text-gray-400 mt-2">Current Daily Rate</p>
            </div>
          </div>

          {/* Claim Card */}
          <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6 flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Daily Profit</h3>
            
            <div className="flex-grow flex flex-col justify-center py-4 text-center">
              {earningsData?.canClaim ? (
                <>
                  <p className="text-gray-400 mb-2">Available to claim:</p>
                  <p className="text-green-400 text-2xl font-bold">
                    {earningsData ? formatCurrency(earningsData.potentialDailyProfit) : '$0.00'}
                  </p>
                </>
              ) : timeLeft ? (
                <>
                  <p className="text-gray-400 mb-2">Next claim in:</p>
                  <p className="text-teal-400 text-2xl font-bold">{timeLeft}</p>
                </>
              ) : null}
            </div>
            
            <button
              onClick={claimDailyProfit}
              disabled={!earningsData?.canClaim || loading}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                earningsData?.canClaim 
                  ? 'bg-gradient-to-br from-teal-400 to-teal-500 text-white hover:shadow-lg hover:-translate-y-0.5'
                  : 'bg-white/10 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Processing...' : 'Claim Daily Profit'}
            </button>
            
            {claimMessage && (
              <div className={`mt-2 text-sm text-center ${
                claimMessage.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
                {claimMessage.text}
              </div>
            )}
          </div>
        </div>

        {/* Earnings History */}
        <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6">Earnings History</h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No earnings history found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-teal-400/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-teal-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-teal-400 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-teal-400 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-teal-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-400/10">
                  {transactions.map((txn, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">{formatDate(txn.date)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-green-400 font-medium">
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">Daily ROI</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">Completed</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Dashboard;