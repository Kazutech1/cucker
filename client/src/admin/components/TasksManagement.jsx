import { useState, useEffect } from 'react';
import { FiUser, FiEye, FiCheck, FiX, FiPlus, FiEdit2, FiClock, FiFilter, FiChevronLeft, FiMenu, FiDollarSign, FiActivity, FiAward, FiCreditCard, FiCalendar } from 'react-icons/fi';
import Sidebar from './Sidebar';

const AUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [comboTasks, setComboTasks] = useState([]);
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isUpdateBalanceModalOpen, setIsUpdateBalanceModalOpen] = useState(false);
  const [isUpdateTaskLimitModalOpen, setIsUpdateTaskLimitModalOpen] = useState(false);
  const [isVerifyTaskModalOpen, setIsVerifyTaskModalOpen] = useState(false);
  const [userTaskHistory, setUserTaskHistory] = useState([]);
  const [taskAssignmentData, setTaskAssignmentData] = useState({
    taskId: '',
    isCombo: false
  });
  const [balanceUpdateData, setBalanceUpdateData] = useState({
    balance: '',
    profitBalance: ''
  });
  const [taskLimitData, setTaskLimitData] = useState({
    taskLimit: ''
  });
  const [verificationData, setVerificationData] = useState({
    userTaskId: '',
    approve: true
  });
  const [filters, setFilters] = useState({
    search: '',
    role: ''
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.role) queryParams.append('role', filters.role);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const data = await response.json();
      setTasks(data.tasks.filter(task => task.depositAmount === null));
      setComboTasks(data.tasks.filter(task => task.depositAmount !== null));
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch user details');
      
      const data = await response.json();
      setSelectedUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openAssignTaskModal = (isCombo = false) => {
    setTaskAssignmentData({
      taskId: '',
      isCombo
    });
    setIsAssignTaskModalOpen(true);
  };

  const openUpdateBalanceModal = () => {
    setBalanceUpdateData({
      balance: selectedUser.balance,
      profitBalance: selectedUser.profitBalance
    });
    setIsUpdateBalanceModalOpen(true);
  };

  const openUpdateTaskLimitModal = () => {
    setTaskLimitData({
      taskLimit: selectedUser.taskLimit
    });
    setIsUpdateTaskLimitModalOpen(true);
  };

  const openVerifyTaskModal = (userTaskId) => {
    setVerificationData({
      userTaskId,
      approve: true
    });
    setIsVerifyTaskModalOpen(true);
  };

  const closeModal = () => {
    setIsAssignTaskModalOpen(false);
    setIsUpdateBalanceModalOpen(false);
    setIsUpdateTaskLimitModalOpen(false);
    setIsVerifyTaskModalOpen(false);
  };

  const handleTaskAssignmentChange = (e) => {
    const { name, value } = e.target;
    setTaskAssignmentData(prev => ({ ...prev, [name]: value }));
  };

  const handleBalanceUpdateChange = (e) => {
    const { name, value } = e.target;
    setBalanceUpdateData(prev => ({ ...prev, [name]: value }));
  };

  const handleTaskLimitChange = (e) => {
    const { name, value } = e.target;
    setTaskLimitData(prev => ({ ...prev, [name]: value }));
  };

  const handleVerificationChange = (e) => {
    const { name, value } = e.target;
    setVerificationData(prev => ({ ...prev, [name]: value === 'true' }));
  };

  const assignTask = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskId: taskAssignmentData.taskId,
          userIds: [selectedUser.id]
        })
      });
      
      if (!response.ok) throw new Error('Failed to assign task');
      
      const data = await response.json();
      alert(`Successfully assigned task to user. ${data.assigned} assignments made.`);
      closeModal();
      fetchUserDetails(selectedUser.id);
    } catch (err) {
      setError(err.message);
    }
  };



  const assignTasks = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/task/${selectedUser.id}/assign-tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    });

    const data = await res.json();
    alert(data.message);
    fetchUserDetails(selectedUser.id);
    // Optionally refresh user task list
  } catch (err) {
    alert('Failed to assign tasks');
  }
};




  const updateBalance = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          balance: parseFloat(balanceUpdateData.balance),
          profitBalance: parseFloat(balanceUpdateData.profitBalance)
        })
      });
      
      if (!response.ok) throw new Error('Failed to update balance');
      
      const data = await response.json();
      alert('Balance updated successfully');
      closeModal();
      fetchUserDetails(selectedUser.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateTaskLimit = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${selectedUser.id}/task-limit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskLimit: parseInt(taskLimitData.taskLimit)
        })
      });
      
      if (!response.ok) throw new Error('Failed to update task limit');
      
      const data = await response.json();
      alert('Task limit updated successfully');
      closeModal();
      fetchUserDetails(selectedUser.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const getUserTaskHistory = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${userId}/task-history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch user task history');

      const data = await response.json();
      setUserTaskHistory(data.tasks);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (selectedUser?.id) {
      getUserTaskHistory(selectedUser.id);
    }
  }, [selectedUser]);

  const verifyTask = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/user-tasks/${verificationData.userTaskId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approve: verificationData.approve
        })
      });
      
      if (!response.ok) throw new Error('Failed to verify task');
      
      const data = await response.json();
      alert(data.message);
      closeModal();
      fetchUserDetails(selectedUser.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isMobileOpen={isMobileSidebarOpen} toggleMobileOpen={toggleMobileSidebar} />
      
      {/* Main Content */}
       <div className="flex-1 p-4 md:p-4 md:ml-64">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button 
                className="md:hidden text-gray-500 hover:text-gray-600 mr-2"
                onClick={toggleMobileSidebar}
              >
                <FiMenu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">User Management</h1>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiX className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!selectedUser ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Filters */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="search"
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filters.search}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <select
                      name="role"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filters.role}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Roles</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors duration-150"
                    onClick={() => setFilters({ search: '', role: '' })}
                  >
                    <FiFilter className="mr-2" />
                    Reset
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-6 text-center text-gray-500">
                          <div className="flex justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading users...
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-6 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-full object-cover" src={user.profilePicture || 'https://cdn.vectorstock.com/i/2000v/67/01/profile-placeholder-image-gray-silhouette-vector-30216701.avif'} alt="" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.fullName || user.username}</div>
                                <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="text-gray-900">{formatCurrency(user.balance)}</div>
                            <div className="text-gray-500">Profit: {formatCurrency(user.profitBalance)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => fetchUserDetails(user.id)}
                              className="text-blue-600 hover:text-blue-800 flex items-center transition-colors duration-150"
                            >
                              <FiEye className="mr-1.5" /> View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back button */}
              <button
                onClick={() => setSelectedUser(null)}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-150"
              >
                <FiChevronLeft className="mr-1" />
                Back to Users
              </button>

              {/* User Details Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                      <div className="relative">
                        <img 
                          className="h-16 w-16 rounded-full mr-4 object-cover border-2 border-white shadow" 
                          src={selectedUser.profilePicture || 'https://cdn.vectorstock.com/i/2000v/67/01/profile-placeholder-image-gray-silhouette-vector-30216701.avif'} 
                          alt={selectedUser.fullName || selectedUser.username} 
                        />
                        <span className="absolute bottom-0 right-4 block h-3 w-3 rounded-full ring-2 ring-white bg-green-500"></span>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {selectedUser.fullName || selectedUser.username}
                        </h2>
                        <p className="text-gray-600">{selectedUser.email}</p>
                        <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedUser.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={openUpdateBalanceModal}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 flex items-center"
                      >
                        <FiDollarSign className="mr-2" />
                        Update Balance
                      </button>
                      <button
                        onClick={openUpdateTaskLimitModal}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-150 flex items-center"
                      >
                        <FiActivity className="mr-2" />
                        Update Task Limit
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-100">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
                          <FiDollarSign className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-600">Total Balance</h3>
                          <p className="mt-1 text-xl font-semibold text-gray-900">
                            {formatCurrency(selectedUser.balance + selectedUser.profitBalance)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-100">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-green-100 text-green-600 mr-4">
                          <FiCreditCard className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-600">Available Balance</h3>
                          <p className="mt-1 text-xl font-semibold text-gray-900">
                            {formatCurrency(selectedUser.balance)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-100">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-purple-100 text-purple-600 mr-4">
                          <FiAward className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-600">Profit Balance</h3>
                          <p className="mt-1 text-xl font-semibold text-gray-900">
                            {formatCurrency(selectedUser.profitBalance)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-xl border border-yellow-100">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600 mr-4">
                          <FiActivity className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-600">Task Limit</h3>
                          <p className="mt-1 text-xl font-semibold text-gray-900">
                            {selectedUser.taskLimit}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-600 mb-3">VIP Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">VIP Level</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedUser.profile?.vipLevel || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Total Invested</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(selectedUser.profile?.totalInvested || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-600 mb-3">Account Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Phone Number</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedUser.phoneNumber || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Withdrawal Address</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedUser.withdrawalAddress || 'Not set'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600 mb-3">Activity Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Joined Date</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Deposits</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser._count?.deposit || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Withdrawals</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser._count?.withdrawal || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Completed Tasks</p>
                        <p className="text-sm font-medium text-gray-900">
                          {userTaskHistory.filter(task => task.status === 'completed').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Management Section */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2 md:mb-0">Task Management</h2>
                    <div className="flex flex-wrap gap-2">
                        <button
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-150 flex items-center"
                          onClick={() => assignTasks()}
                        >
                          <FiPlus className="mr-2" /> Assign All Tasks
                        </button>
                      <button
                        onClick={() => openAssignTaskModal(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 flex items-center"
                      >
                        <FiPlus className="mr-2" /> Assign Normal Task
                      </button>
                      <button
                        onClick={() => openAssignTaskModal(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-150 flex items-center"
                      >
                        <FiPlus className="mr-2" /> Assign Combo Task
                      </button>
                    </div>
                  </div>

                


                  {/* Task History */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Task History</h3>
                    {userTaskHistory && userTaskHistory.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {userTaskHistory.map((task) => (
                              <tr key={task.taskId} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{task.appName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    task.depositAmount ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {task.depositAmount ? 'Combo' : 'Normal'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(task.status)}`}>
                                    {task.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatCurrency(task.profit)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(task.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  {task.depositAmount !== null && task.status !== 'completed' && task.status !== 'rejected' && (
                                    <button
                                      onClick={() => openVerifyTaskModal(task.userTaskId)}
                                      className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                                    >
                                      Verify
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No task history</h3>
                        <p className="mt-1 text-sm text-gray-500">This user hasn't completed any tasks yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Assign Task Modal */}
      {isAssignTaskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Assign {taskAssignmentData.isCombo ? 'Combo' : 'Normal'} Task
              </h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Task
                </label>
                <select
                  name="taskId"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={taskAssignmentData.taskId}
                  onChange={handleTaskAssignmentChange}
                >
                  <option value="">Select a task</option>
                  {(taskAssignmentData.isCombo ? comboTasks : tasks).map(task => (
                    <option key={task.id} value={task.id}>
                      {task.appName} ({formatCurrency(task.profit)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={assignTask}
                  disabled={!taskAssignmentData.taskId}
                  className={`px-4 py-2.5 rounded-lg text-white ${taskAssignmentData.isCombo ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50 transition-colors duration-150`}
                >
                  Assign Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Balance Modal */}
      {isUpdateBalanceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Update User Balance</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Balance
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="balance"
                    className="block w-full pl-7 pr-12 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={balanceUpdateData.balance}
                    onChange={handleBalanceUpdateChange}
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profit Balance
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="profitBalance"
                    className="block w-full pl-7 pr-12 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={balanceUpdateData.profitBalance}
                    onChange={handleBalanceUpdateChange}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={updateBalance}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
                >
                  Update Balance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Task Limit Modal */}
      {isUpdateTaskLimitModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Update User Task Limit</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Task Limit
                </label>
                <input
                  type="number"
                  name="taskLimit"
                  min="1"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={taskLimitData.taskLimit}
                  onChange={handleTaskLimitChange}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={updateTaskLimit}
                  disabled={!taskLimitData.taskLimit || taskLimitData.taskLimit < 1}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-150"
                >
                  Update Limit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify Task Modal */}
      {isVerifyTaskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Verify Combo Task</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Action
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="approve"
                      name="approve"
                      type="radio"
                      value="true"
                      checked={verificationData.approve === true}
                      onChange={handleVerificationChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="approve" className="ml-3 block text-sm text-gray-700">
                      Approve and Complete Task
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="reject"
                      name="approve"
                      type="radio"
                      value="false"
                      checked={verificationData.approve === false}
                      onChange={handleVerificationChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="reject" className="ml-3 block text-sm text-gray-700">
                      Reject and Deduct Profit
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyTask}
                  className={`px-4 py-2.5 rounded-lg text-white ${verificationData.approve ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} transition-colors duration-150`}
                >
                  {verificationData.approve ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AUsers;