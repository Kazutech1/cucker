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
    dailyCompleted: 0,
    dailyLimit: 5,
    remaining: 5
  });
  const [availableTasks, setAvailableTasks] = useState([]);
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  
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
      setMessage({ text: 'Failed to load balance info', type: 'error' });
    }
  };

  const fetchUserTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      console.log(data);
      
      
      // Update available tasks
      setAvailableTasks(data.tasks || []);
      
      // Update task stats from profile
      if (userData) {
        setTaskStats({
          dailyCompleted: userData.dailyTasksCompleted || 0,
          dailyLimit: userData.dailyTasksLimit || 5,
          remaining: (userData.dailyTasksLimit || 5) - (userData.dailyTasksCompleted || 0)
        });
      }

      return data;
    } catch (error) {
      console.error('Task fetch error:', error);
      setMessage({ text: error.message || 'Failed to load tasks', type: 'error' });
      return { tasks: [] };
    }
  };

  const getNewTask = async () => {
    try {
      setLoading(true);
      
      // Check if user can get more tasks
      if (taskStats.remaining <= 0) {
        setMessage({ text: "You've reached your daily task limit", type: 'error' });
        return;
      }

      // Get user's tasks
      const { tasks } = await fetchUserTasks();
      
      if (tasks.length === 0) {
        setMessage({ 
          text: "No available tasks at the moment", 
          type: 'info' 
        });
        return;
      }

      // Select a random task from available tasks
      const randomIndex = Math.floor(Math.random() * tasks.length);
      setCurrentTask(tasks[randomIndex]);
      setShowTaskPopup(true);

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
      console.log(currentTask);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/tasks/complete`, 
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            taskId: currentTask.id
          })
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete task');
      }

      // Add to completed tasks list for this session
      setCompletedTaskIds(prev => [...prev, currentTask.id]);
      
      setMessage({ 
        text: `Task completed! +${formatCurrency(currentTask.appProfit)}`, 
        type: 'success' 
      });
      setShowTaskPopup(false);
      setCurrentTask(null);

      // Refresh data
      await Promise.all([
        fetchUserProfile(),
        fetchProfitBalance(),
        fetchUserTasks()
      ]);

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
          fetchProfitBalance(),
          fetchUserTasks()
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

  // Update task stats when user data changes
  useEffect(() => {
    if (userData) {
      setTaskStats({
        dailyCompleted: userData.dailyTasksCompleted || 0,
        dailyLimit: userData.dailyTasksLimit || 5,
        remaining: (userData.dailyTasksLimit || 5) - (userData.dailyTasksCompleted || 0)
      });
    }
  }, [userData]);

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
                VIP{userData.vipLevel?.level || 0}
              </div>
              <div>{getVipLevelName(userData.vipLevel?.level || 0)}</div>
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
                {userData ? `${getVipRoi(userData.vipLevel?.level || 0)}%` : '0%'}
              </div>
              <p className="text-gray-400 mt-2">Current Daily Rate</p>
            </div>
          </div>

          {/* Task Stats Card */}
          <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Today's Tasks</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Completed:</span>
                <span className="text-green-400">{taskStats.dailyCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Limit:</span>
                <span>{taskStats.dailyLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Remaining:</span>
                <span className={taskStats.remaining > 0 ? 'text-teal-400' : 'text-red-400'}>
                  {taskStats.remaining}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Task Button Section */}
        <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6 text-center mb-8">
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

          {taskStats.remaining <= 0 ? (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <p className="text-green-400">All tasks completed for today!</p>
              <p className="text-sm text-gray-400 mt-1">Come back tomorrow for more tasks</p>
            </div>
          ) : (
            <button
              onClick={getNewTask}
              disabled={loading || taskStats.remaining <= 0 || availableTasks.length === 0}
              className="w-full max-w-xs py-3 bg-gradient-to-br from-teal-400 to-teal-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all mx-auto disabled:opacity-50"
            >
              <FiRefreshCw /> Get Task
            </button>
          )}
        </div>

        {/* Available Tasks */}
        {availableTasks.length > 0 && (
          <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Available Tasks</h2>
            <div className="space-y-4">
              {availableTasks.map(task => (
                <div key={task.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-start gap-4">
                    {task.appImage && (
                      <img 
                        src={task.appImage} 
                        alt={task.appName} 
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{task.appName}</h3>
                      <p className="text-sm text-gray-400 mt-1">{task.appReview}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-green-400 font-medium">
                          {formatCurrency(task.appProfit)}
                        </span>
                        {!completedTaskIds.includes(task.id) && (
                          <button
                            onClick={() => {
                              setCurrentTask(task);
                              setShowTaskPopup(true);
                            }}
                            className="text-xs bg-teal-600 hover:bg-teal-700 px-3 py-1 rounded"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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