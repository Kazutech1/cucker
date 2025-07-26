import React, { useState, useEffect } from 'react';
import { FaCoins, FaTrophy, FaHeadset, FaHistory } from 'react-icons/fa';
import { 
  FiRefreshCw, FiAlertCircle, FiCheck, 
  FiX, FiClock, FiDollarSign, FiZap 
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import Navbar from '../components/NavBar';
import Sidebar from '../components/SideBar';
import BottomNav from '../components/BottomNav';
import useTaskManagement from '../../hooks/useStart';
import DepositTaskPopup, { NormalTaskPopup } from '../components/Toast';
import TaskHistoryModal from '../components/TakHistoryModal';
import SupportModal from './CustomerService';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profitBalance, setProfitBalance] = useState(0);
  const [currentTask, setCurrentTask] = useState(null);
  const [showDepositPopup, setShowDepositPopup] = useState(false);
  const [showNormalPopup, setShowNormalPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [profitEarned, setProfitEarned] = useState(0);
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    availableTasks: 0,
    completedTasks: 0
  });
  const [showNoTasksModal, setShowNoTasksModal] = useState(false);
  const [showUpgradeVipModal, setShowUpgradeVipModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isCompletingTask, setIsCompletingTask] = useState(false);
  const navigate = useNavigate();
  const [showSupportModal, setShowSupportModal] = useState(false);


  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Task management hook
  const { 
    loading: tasksLoading, 
    error: tasksError, 
    getUserTasks, 
    completeTask, 
    declineTask 
  } = useTaskManagement();

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

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUserProfile(),
        fetchProfitBalance(),
        fetchTasks()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ text: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
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

  const fetchTasks = async () => {
    try {
      const fetchedTasks = await getUserTasks();
      const activeTasks = fetchedTasks.filter(task => task.status === 'assigned');
      
      setTasks(activeTasks);
      setTaskStats({
        totalTasks: fetchedTasks.length,
        availableTasks: activeTasks.length,
        completedTasks: fetchedTasks.length - activeTasks.length
      });
    } catch (error) {
      setMessage({ 
        text: error.message, 
        type: 'error',
        isUpgradeRequired: error.message.includes('upgrade your VIP level')
      });
    }
  };

  const getNextTask = () => {
    if (userData?.vipLevel?.level === 0) {
      setShowUpgradeVipModal(true);
      return;
    }

    if (tasks.length === 0) {
      setShowNoTasksModal(true);
      return;
    }
    
    // Get the next available task
    const task = tasks[0];
    setCurrentTask(task);
    
    // Show appropriate popup based on task type
    if (task.depositAmount > 0) {
      setShowDepositPopup(true);
    } else {
      setShowNormalPopup(true);
    }
  };

  const handleCompleteTask = async () => {
    try {
      setIsCompletingTask(true);
      await completeTask(currentTask.id, "Completed via one-click");
      setProfitEarned(currentTask.profitAmount);
      setTaskCompleted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      setMessage({ text: 'Task completed successfully!', type: 'success' });
      setShowDepositPopup(false);
      setShowNormalPopup(false);
      
      // Refresh all data
      await fetchAllData();
      
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsCompletingTask(false);
    }
  };

  const handleSkipTask = async () => {
    try {
      setLoading(true);
      await declineTask(currentTask.id);
      setMessage({ text: 'Task declined', type: 'info' });
      setShowDepositPopup(false);
      setShowNormalPopup(false);
      
      // Refresh all data
      await fetchAllData();
      
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const goToVipUpgrade = () => {
    setShowUpgradeVipModal(false);
    navigate('/vip');
  };

  

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (userData && userData.vipLevel?.level === 0) {
      setShowUpgradeVipModal(true);
    }
  }, [userData]);

  // No Tasks Available Modal
  const NoTasksModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border-2 border-red-400/30 shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-500/20 p-4 rounded-full border-2 border-red-400/30">
            <FiAlertCircle size={48} className="text-red-400" />
          </div>
        </div>
        
        <h3 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
          NO TASKS AVAILABLE
        </h3>
        
        <p className="text-gray-300 text-lg mb-6">
          There are currently no tasks available for your account.
        </p>
        
        <p className="text-gray-400 mb-6">
          Please contact our support team for assistance or check back later.
        </p>
        
        <div className="flex flex-col gap-3">
                <button
        onClick={() => setShowSupportModal(true)}
        className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg transition"
      >
        Contact Support
      </button>
        
          
          <button
            onClick={() => {
              setShowNoTasksModal(false);
              fetchAllData(); // Refresh data when closing modal
            }}
            className="px-6 py-3 border-2 border-gray-600 rounded-xl hover:bg-gray-700 transition-all font-bold"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );

  // Upgrade VIP Modal
  const UpgradeVipModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border-2 border-yellow-400/30 shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-500/20 p-4 rounded-full border-2 border-yellow-400/30">
            <FiAlertCircle size={48} className="text-yellow-400" />
          </div>
        </div>
        
        <h3 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          UPGRADE REQUIRED
        </h3>
        
        <p className="text-gray-300 text-lg mb-6">
          You need to upgrade your VIP level to access tasks.
        </p>
        
        <p className="text-gray-400 mb-6">
          Basic investors (VIP 0) cannot complete tasks. Please upgrade to at least VIP 1 to start earning.
        </p>
        
        <div className="flex flex-col gap-3">
          <Link to='/level'>
            <button
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-extrabold flex items-center justify-center gap-2 hover:from-yellow-600 hover:to-orange-700 transition-all"
            >
              <FaCoins /> UPGRADE VIP LEVEL
            </button>
          </Link>
          
          <button
            onClick={() => setShowUpgradeVipModal(false)}
            className="px-6 py-3 border-2 border-gray-600 rounded-xl hover:bg-gray-700 transition-all font-bold"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 pb-16 relative overflow-hidden">
      {showConfetti && (
        <Confetti 
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
        />
      )}
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mb-4"></div>
            <p className="text-xl font-bold text-teal-400 animate-pulse">LOADING...</p>
          </div>
        </div>
      )}

      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-32 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          {userData && (
            <div className="flex items-center gap-4 bg-teal-400/10 px-4 py-2 rounded-full border border-teal-400/20">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center text-white font-bold">
                VIP{userData.vipLevel?.level || 0}
              </div>
              <div className='text-white'>{getVipLevelName(userData.vipLevel?.level || 0)}</div>
            </div>
          )}
          
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            <FaHistory className="text-teal-400" />
            <span className="text-white">Task History</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
              <div className="flex justify-between text-teal-400 text-2xl font-semibold">
                <p className="text-gray-400 text-sm">Profit Balance</p>
                <p className="text-gray-400 text-sm">Profit Percentage</p>
              </div>

              <div className="flex justify-between text-teal-400 text-2xl font-semibold">
                <p className="text-green-400 text-2xl">
                  {formatCurrency(profitBalance)}
                </p>
                {userData ? `${getVipRoi(userData.vipLevel?.level || 0)}%` : '0%'}
              </div>
            </div>
          </div>

          {/* Tasks Stats Card */}
          <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Tasks Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Tasks:</span>
                <span className="font-bold text-white">{taskStats.totalTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Available:</span>
                <span className="font-bold text-teal-400">{taskStats.availableTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Completed:</span>
                <span className="font-bold text-purple-400">{taskStats.completedTasks}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Actions Card */}
          {/* <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={fetchAllData}
                className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                Refresh Data
              </button>
              <button
                onClick={getNextTask}
                disabled={tasksLoading || tasks.length === 0}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  tasks.length === 0 
                    ? 'bg-gray-700 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <FiZap />
                Get Task
              </button>
            </div>
          </div>*/}
        </div> 

        {message && (
          <div className={`mb-8 p-4 rounded-xl text-center text-white font-bold ${
            message.type === 'error' 
              ? 'bg-red-900/50 border-2 border-red-700/50' 
              : message.type === 'success'
                ? 'bg-green-900/50 border-2 border-green-700/50'
                : 'bg-blue-900/50 border-2 border-blue-700/50'
          }`}>
            {message.text}
            {message.type === 'success' && profitEarned > 0 && (
              <div className="mt-2 text-yellow-300">
                Earned: {formatCurrency(profitEarned)}
              </div>
            )}
          </div>
        )}

        {/* Main Task Action Button */}
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative mb-6">
            <button
              onClick={getNextTask}
              disabled={tasksLoading || tasks.length === 0}
              className={`relative px-12 py-6 rounded-2xl font-extrabold text-2xl flex items-center gap-4 transition-all duration-300 ${
                tasks.length === 0 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 animate-pulse'
              }`}
            >
              <FiZap className="animate-bounce" />
              GET TASK
              <FiZap className="animate-bounce" />
            </button>
            
            {/* Task counter badge */}
            {tasks.length > 0 && (
              <div className="absolute -top-3 -right-3 bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                {taskStats.availableTasks} available
              </div>
            )}
          </div>
          
          <p className="mt-2 text-gray-400 text-center max-w-md">
            {tasks.length > 0 
              ? `You have ${taskStats.availableTasks} tasks ready to complete` 
              : 'No tasks available at the moment'}
          </p>
        </div>
      </div>

        <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />

      

      {/* Modals */}
      {showDepositPopup && currentTask && (
        <DepositTaskPopup 
          task={currentTask}
          onClose={handleSkipTask}
          onComplete={handleCompleteTask}
          loading={isCompletingTask}
        />
      )}

      {showNormalPopup && currentTask && (
        <NormalTaskPopup 
          task={currentTask}
          onClose={handleSkipTask}
          onComplete={handleCompleteTask}
          loading={isCompletingTask}
        />
      )}

      {showHistoryModal && (
        <TaskHistoryModal onClose={() => setShowHistoryModal(false)} />
      )}

      {showNoTasksModal && (
        <NoTasksModal />
      )}

      {showUpgradeVipModal && (
        <UpgradeVipModal />
      )}

      

      

      <BottomNav />
    </div>
  );
};

export default Dashboard;