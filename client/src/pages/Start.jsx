import React, { useState, useEffect } from 'react';
import { FaHistory, FaCoins, FaTrophy, FaHeadset } from 'react-icons/fa';
import { 
  FiRefreshCw, FiLayers, FiAlertCircle, FiCheck, 
  FiX, FiClock, FiDollarSign, FiZap 
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import Navbar from '../components/NavBar';
import Sidebar from '../components/SideBar';
import BottomNav from '../components/BottomNav';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profitBalance, setProfitBalance] = useState(0);
  const [taskHistory, setTaskHistory] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
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

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Please upgrade your VIP level to receive tasks');
        } else {
          throw new Error('Failed to fetch tasks');
        }
      }
      
      const data = await response.json();
      setTasks(data.tasks);
      setTaskStats({
        totalTasks: data.totalTask || 0,
        availableTasks: data.tasks.length,
        completedTasks: (data.totalTasks || 0) - data.tasks.length
      });
    } catch (error) {
      setMessage({ 
        text: error.message, 
        type: 'error',
        isUpgradeRequired: error.message.includes('upgrade your VIP level')
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch task history');
      
      const data = await response.json();
      setTaskHistory(data.history);
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    }
  };

  const getRandomTask = () => {
    // Check if user is VIP 0
    if (userData?.vipLevel?.level === 0) {
      setShowUpgradeVipModal(true);
      return;
    }

    
    
    
    // Check if no tasks available
    if (tasks.length === 0) {
      setShowNoTasksModal(true);
      console.log(task.length);
      
      
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * tasks.length);
    const task = tasks[randomIndex];
    console.log(task.length);
    
    setCurrentTask(task);
    setShowTaskModal(true);
    setTaskCompleted(false);
  };

  const handleCompleteTask = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (currentTask.depositAmount > 0) {
        setShowTaskModal(false);
        setShowDepositModal(true);
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/${currentTask.userTaskId}/complete`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ depositAmount: null })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to complete task');
      
      setProfitEarned(currentTask.profit);
      setTaskCompleted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      setMessage({ text: 'Task completed successfully!', type: 'success' });
      setShowTaskModal(false);
      setTimeout(() => setShowSuccessModal(true), 300);
      fetchTasks();
      fetchTaskHistory();
      
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDeposit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/${currentTask.userTaskId}/complete`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ depositAmount: parseFloat(depositAmount) })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to submit deposit');
      
      setProfitEarned(currentTask.profit);
      setTaskCompleted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      setMessage({ text: data.message || 'Task submitted for verification', type: 'success' });
      setShowDepositModal(false);
      setTimeout(() => setShowSuccessModal(true), 300);
      fetchTasks();
      
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const goToDeposit = () => {
    setShowDepositModal(false);
    navigate('/deposit');
  };

  const goToVipUpgrade = () => {
    setShowUpgradeVipModal(false);
    navigate('/vip');
  };

  const contactSupport = () => {
    window.open('https://t.me/support', '_blank');
  };

  useEffect(() => {
    fetchUserProfile();
    fetchProfitBalance();
    fetchTasks();
    fetchTaskHistory();
  }, []);

  useEffect(() => {
    if (userData && userData.vipLevel?.level === 0) {
      setShowUpgradeVipModal(true);
    }
  }, [userData]);

  // Task Modal Component
  const TaskModal = ({ task, onClose, onComplete }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border-2 border-teal-400/30 shadow-lg shadow-teal-400/10 animate-pop-in">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            {task.appName}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors transform hover:rotate-90 duration-200"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col items-center gap-4 mb-4">
            {task.appImage && (
              <img 
                src={task.appImage} 
                alt={task.appName} 
                className="w-24 h-24 object-cover rounded-xl border-2 border-teal-400/30 shadow-md animate-float"
              />
            )}
            <div className="text-center">
              <p className="text-gray-300 text-lg mb-4">{task.appReview}</p>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-teal-400/20">
                <p className="text-3xl font-bold text-teal-400 animate-pulse">
                  ${task.profit.toFixed(2)}
                </p>
                <p className="text-sm text-teal-200">REWARD</p>
              </div>
              {task.depositAmount > 0 && (
                <div className="mt-4 bg-yellow-900/20 rounded-lg p-3 border border-yellow-400/30">
                  <p className="text-yellow-400 font-bold flex items-center justify-center gap-2">
                    <FiAlertCircle size={18} />
                    Requires deposit: ${task.depositAmount.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-600 rounded-xl hover:bg-gray-700 transition-all transform hover:scale-105 font-bold"
          >
            Cancel
          </button>
          <button
            onClick={onComplete}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-extrabold flex items-center gap-2 hover:from-teal-600 hover:to-blue-700 disabled:opacity-50 transition-all transform hover:scale-105 shadow-lg shadow-teal-500/20"
          >
            {loading ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <>
                <FiZap className="animate-pulse" /> COMPLETE TASK
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Deposit Modal Component
  const DepositModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border-2 border-yellow-400/30 shadow-lg shadow-yellow-400/10 animate-pop-in">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            DEPOSIT REQUIRED
          </h3>
          <button 
            onClick={() => setShowDepositModal(false)} 
            className="text-gray-400 hover:text-white transition-colors transform hover:rotate-90 duration-200"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="mb-6 text-center">
          <div className="bg-yellow-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border-2 border-yellow-400/30">
            <FiDollarSign size={32} className="text-yellow-400" />
          </div>
          
          <p className="text-gray-300 mb-6 text-lg">
            This task requires a minimum deposit of <span className="text-yellow-400 font-bold">${currentTask?.depositAmount.toFixed(2)}</span>.
          </p>
          
          <div className="mb-6">
            <label className="block text-gray-400 mb-2 text-left font-bold">DEPOSIT AMOUNT</label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder={`Minimum: $${currentTask?.depositAmount.toFixed(2)}`}
              className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-bold text-center"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSubmitDeposit}
            disabled={loading || !depositAmount || parseFloat(depositAmount) < currentTask?.depositAmount}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-extrabold flex items-center justify-center gap-2 hover:from-yellow-600 hover:to-orange-700 disabled:opacity-50 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/20"
          >
            {loading ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <>
                <FiCheck /> SUBMIT DEPOSIT
              </>
            )}
          </button>
          
          <button
            onClick={goToDeposit}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-extrabold flex items-center justify-center gap-2 hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/20"
          >
            <FiDollarSign /> GO TO DEPOSIT PAGE
          </button>
          
          <button
            onClick={() => {
              setShowDepositModal(false);
              setShowTaskModal(true);
            }}
            className="px-6 py-3 border-2 border-gray-600 rounded-xl hover:bg-gray-700 transition-all transform hover:scale-105 font-bold"
          >
            BACK TO TASK
          </button>
        </div>
      </div>
    </div>
  );

  // Success Modal
  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border-2 border-teal-400/30 shadow-lg shadow-teal-400/20 animate-pop-in text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-teal-500/20 p-4 rounded-full border-2 border-teal-400/30 animate-bounce">
            <FaTrophy size={48} className="text-teal-400" />
          </div>
        </div>
        
        <h3 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
          TASK COMPLETED!
        </h3>
        
        <p className="text-gray-300 text-lg mb-6">
          You've earned <span className="text-teal-400 font-bold">${profitEarned.toFixed(2)}</span>
        </p>
        
        {currentTask?.depositAmount > 0 && (
          <p className="text-yellow-400 mb-6 font-medium">
            Your deposit will be returned after verification
          </p>
        )}
        
        <div className="flex justify-center">
          <button
            onClick={() => {
              setShowSuccessModal(false);
              setTaskCompleted(false);
            }}
            className="px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-extrabold hover:from-teal-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-teal-500/20"
          >
            AWESOME!
          </button>
        </div>
      </div>
    </div>
  );

  // Task History Modal
  const HistoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-2xl w-full border-2 border-purple-400/30 shadow-lg shadow-purple-400/10 h-[80vh] overflow-hidden flex flex-col animate-pop-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            TASK HISTORY
          </h3>
          <button 
            onClick={() => setShowHistoryModal(false)} 
            className="text-gray-400 hover:text-white transition-colors transform hover:rotate-90 duration-200"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2">
          {taskHistory.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No task history yet. Complete some tasks to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {taskHistory.map((task, index) => (
                <div 
                  key={index} 
                  className={`p-5 rounded-xl border-2 ${task.status === 'completed' ? 'border-green-500/30 bg-green-900/10' : 'border-red-500/30 bg-red-900/10'} transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center gap-4">
                    {task.appImage && (
                      <img 
                        src={task.appImage} 
                        alt={task.appName} 
                        className="w-16 h-16 object-cover rounded-xl border-2 border-gray-700"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-lg">{task.appName}</h4>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${task.status === 'completed' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                          {task.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-400 mt-1">{task.appReview}</p>
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-lg font-bold">
                          <span className={task.status === 'completed' ? 'text-green-400' : 'text-red-400'}>
                            {task.status === 'completed' ? '+' : '-'}${task.profit.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(task.date).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // No Tasks Available Modal
  const NoTasksModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border-2 border-red-400/30 shadow-lg shadow-red-400/10 animate-pop-in text-center">
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
            onClick={contactSupport}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-extrabold flex items-center justify-center gap-2 hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/20"
          >
            <FaHeadset /> CONTACT SUPPORT
          </button>
          
          <button
            onClick={() => setShowNoTasksModal(false)}
            className="px-6 py-3 border-2 border-gray-600 rounded-xl hover:bg-gray-700 transition-all transform hover:scale-105 font-bold"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );

  // Upgrade VIP Modal
  const UpgradeVipModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border-2 border-yellow-400/30 shadow-lg shadow-yellow-400/10 animate-pop-in text-center">
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
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-extrabold flex items-center justify-center gap-2 hover:from-yellow-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/20"
          >
            <FaCoins /> UPGRADE VIP LEVEL
          </button>
          </Link>
         
          
          <button
            onClick={() => setShowUpgradeVipModal(false)}
            className="px-6 py-3 border-2 border-gray-600 rounded-xl hover:bg-gray-700 transition-all transform hover:scale-105 font-bold"
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
            <p className="text-xl font-bold text-teal-400 animate-pulse">LOADING TASKS...</p>
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
                           <div className="flex justify-between text-teal-400 text-2xl font-semibold ">

              <p className="text-gray-400 text-sm">Profit Balance</p>
                            <p className="text-gray-400 text-sm">Profit Percentage</p>

                        </div>

               <div className="flex justify-between text-teal-400 text-2xl font-semibold ">
              <p className="text-green-400 text-2xl ">
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
                <span className="font-bold text-purple-400">{taskStats.totalTasks - taskStats.availableTasks}</span>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-4 rounded-xl text-center text-white font-bold ${
            message.type === 'error' 
              ? 'bg-red-900/50 border-2 border-red-700/50' 
              : 'bg-green-900/50 border-2 border-green-700/50'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative mb-6">
            <button
              onClick={getRandomTask}
              // disabled={tasks.length === 0 || loading}
              className={`relative px-12 py-6 rounded-2xl font-extrabold text-2xl flex items-center gap-4 transition-all duration-300 transform hover:scale-105 shadow-2xl ${
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
            <div className="absolute -top-3 -right-3 bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded-full animate-pulse">
              {taskStats.availableTasks}/{taskStats.totalTasks}
            </div>
          </div>
          
          <p className="mt-2 text-gray-400 text-center max-w-md">
            You have {taskStats.availableTasks} available tasks out of {taskStats.totalTasks} total tasks
          </p>
          
          <button
            onClick={() => setShowHistoryModal(true)}
            className="mt-8 flex items-center justify-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 px-6 py-3 rounded-xl border border-purple-400/20 transition-colors"
          >
            <FaHistory /> View Task History
          </button>
        </div>
      </div>

      {/* Modals */}
      {showTaskModal && currentTask && (
        <TaskModal 
          task={currentTask}
          onClose={() => setShowTaskModal(false)}
          onComplete={handleCompleteTask}
        />
      )}

      {showDepositModal && currentTask && (
        <DepositModal />
      )}

      {showSuccessModal && (
        <SuccessModal />
      )}

      {showHistoryModal && (
        <HistoryModal />
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