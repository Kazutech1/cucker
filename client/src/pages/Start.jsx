import React, { useState, useEffect } from 'react';
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
  FiArrowDown,
  FiRefreshCw,
  FiPlus
} from 'react-icons/fi';
import Navbar from '../components/NavBar';
import Sidebar from '../components/SideBar';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/Spinner';
import TaskPopup from '../components/TaskPopup';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profitBalance, setProfitBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentTask, setCurrentTask] = useState(null);
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [message, setMessage] = useState(null);
  const [taskStats, setTaskStats] = useState({
    today: { completed: 0, limit: 5 },
    total: { earnings: 0 }
  });
  
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

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

  const fetchUserProfile = async () => {
    try {
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
      setMessage({ text: 'Failed to load profile data', type: 'error' });
    }
  };

  const fetchWithdrawalInfo = async () => {
    try {
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
      setMessage({ text: 'Failed to load withdrawal info', type: 'error' });
    }
  };

  const fetchTaskStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/earnings/user/tasks/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch task stats');
      }

      const data = await response.json();
      setTaskStats(data.data);
    } catch (error) {
      console.error('Task stats fetch error:', error);
    }
  };

  const fetchUserTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/earnings/user/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      return data.data.tasks || [];
    } catch (error) {
      console.error('Task fetch error:', error);
      setMessage({ text: error.message || 'Failed to load tasks', type: 'error' });
      return [];
    }
  };

  const getNewTask = async () => {
    try {
      setLoading(true);
      
      // Check if user can get more tasks
      if (taskStats.today.completed >= taskStats.today.limit) {
        setMessage({ text: "You've reached your daily task limit", type: 'error' });
        return;
      }

      // Get user's tasks
      const tasks = await fetchUserTasks();
      const pendingTasks = tasks.filter(t => t.status === 'pending');
      
      if (pendingTasks.length > 0) {
        setCurrentTask(pendingTasks[0]);
        setShowTaskPopup(true);
      } else {
        setMessage({ text: "No available tasks at the moment", type: 'info' });
      }

    } catch (error) {
      console.error('Task error:', error);
      setMessage({ text: error.message || 'Failed to get task', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/earnings/user/tasks/${currentTask.id}/complete`, 
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete task');
      }

      // Update local state
      setTaskStats(prev => ({
        today: {
          completed: prev.today.completed + 1,
          limit: prev.today.limit
        },
        total: {
          earnings: prev.total.earnings + currentTask.appReview.appProfit
        }
      }));

      setMessage({ 
        text: `Task completed! +$${currentTask.appReview.appProfit.toFixed(2)}`, 
        type: 'success' 
      });
      setShowTaskPopup(false);
      setCurrentTask(null);

      // Refresh tasks
      await fetchTaskStats();
      await fetchWithdrawalInfo();

    } catch (error) {
      console.error('Completion error:', error);
      setMessage({ text: error.message || 'Failed to complete task', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const initDashboard = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchUserProfile(),
          fetchWithdrawalInfo(),
          fetchTaskStats()
        ]);
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        setMessage({ text: 'Failed to initialize dashboard', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [navigate]);

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
          <h1 className="text-2xl font-bold">Task Center</h1>
          {userData && (
            <div className="flex items-center gap-4 bg-teal-400/10 px-4 py-2 rounded-full border border-teal-400/20">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center text-white font-bold">
                VIP{userData.vipLevel.level || 0}
              </div>
              <div>{getVipLevelName(userData.vipLevel.level || 0)}</div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
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

          {/* Task Stats Card */}
          <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Today's Tasks</h3>
            
            {taskStats ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed:</span>
                  <span className="text-green-400">{taskStats.today.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Limit:</span>
                  <span>{taskStats.today.limit}</span>
                </div>
                <div className="pt-3 border-t border-teal-400/20">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Earnings:</span>
                    <span className="text-green-400">
                      {formatCurrency(taskStats.total.earnings)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">Loading task stats...</div>
            )}
          </div>
        </div>

        {/* Task Button Section */}
        <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold mb-6">Complete Tasks</h2>
          
          {message && (
            <div className={`mb-6 p-3 rounded-lg ${
              message.type === 'error' 
                ? 'bg-red-900/50 border border-red-700' 
                : message.type === 'success'
                  ? 'bg-green-900/50 border border-green-700'
                  : 'bg-blue-900/50 border border-blue-700'
            }`}>
              {message.text}
            </div>
          )}

          <button
            onClick={getNewTask}
            disabled={loading || (taskStats && taskStats.today.completed >= taskStats.today.limit)}
            className="w-full max-w-xs py-3 bg-gradient-to-br from-teal-400 to-teal-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all mx-auto disabled:opacity-50"
          >
            <FiRefreshCw /> Get Task
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Task Popup */}
      {showTaskPopup && currentTask && (
        <TaskPopup 
          task={currentTask} 
          onComplete={completeTask}
          onClose={() => setShowTaskPopup(false)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Dashboard;