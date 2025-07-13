import { FiUser, FiEye, FiCheck, FiX, FiPlus, FiEdit2, FiClock, FiFilter, FiChevronLeft, FiMenu, FiDollarSign, FiActivity, FiAward, FiCreditCard, FiCalendar, FiEdit, FiSearch } from 'react-icons/fi';
import Sidebar from './Sidebar';
import { FaCoins } from 'react-icons/fa';
import useUserManagement from '../../../hooks/useUsers';
import AssignCustomTaskModal from './AssignCustomTaskModal';
import { useEffect, useState } from 'react';

const AUsers = () => {
  const {
    // State
    users,
    loading,
    error,
    selectedUser,
    tasks,
    comboTasks,
    isAssignTaskModalOpen,
    isUpdateBalanceModalOpen,
    isUpdateTaskLimitModalOpen,
    isVerifyTaskModalOpen,
    isEditTaskModalOpen,
    isMobileSidebarOpen,
    editableTaskDetails,
    userTaskHistory,
    taskAssignmentData,
    balanceUpdateData,
    taskLimitData,
    verificationData,
    editTaskData,
    filters,

    // Handlers
    handleFilterChange,
    handleTaskAssignmentChange,
    handleBalanceUpdateChange,
    handleTaskLimitChange,
    handleVerificationChange,
    handleEditTaskChange,
    handleEditableTaskChange,

    // Actions
    fetchUserDetails,
    assignTask,
    assignTasks,
    addBonus,
    updateTask,
    updateTasks,
    updateBalance,
    updateTaskLimit,
    verifyTask,

    // Modal controls
    openAssignTaskModal,
    openUpdateBalanceModal,
    openUpdateTaskLimitModal,
    openVerifyTaskModal,
    openEditTaskModal,
    closeModal,
    toggleMobileSidebar,
    setSelectedUser,
    setTaskAssignmentData,
    setEditableTaskDetails,

    // Helpers
    formatCurrency,
    formatDate,
    getStatusBadge
  } = useUserManagement();

  const [taskList, setTaskList] = useState([]);
  const [isCustomTaskModalOpen, setCustomTaskModalOpen] = useState(false);
  const [isFetchingTasks, setIsFetchingTasks] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter tasks based on search term
  const filteredTasks = userTaskHistory.filter(task => 
    task.appName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current tasks
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  // Calculate total pages
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const leftBound = Math.max(1, currentPage - 2);
      const rightBound = Math.min(totalPages, currentPage + 2);

      if (leftBound > 1) {
        pageNumbers.push(1);
        if (leftBound > 2) {
          pageNumbers.push('...');
        }
      }

      for (let i = leftBound; i <= rightBound; i++) {
        pageNumbers.push(i);
      }

      if (rightBound < totalPages) {
        if (rightBound < totalPages - 1) {
          pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  useEffect(() => {
    if (isCustomTaskModalOpen && selectedUser?.id) {
      setIsFetchingTasks(true);
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setTaskList(data.tasks || []);
          setIsFetchingTasks(false);
        })
        .catch(err => {
          console.error(err);
          setIsFetchingTasks(false);
        });
    }
  }, [isCustomTaskModalOpen, selectedUser?.id]);

  const handleDeactivateUserTasks = async (userId) => {
  if (!confirm('Are you sure you want to deactivate this user’s tasks?')) return;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${userId}/deactivate-tasks`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to deactivate tasks');

    alert(`${data.count} tasks removed.`);
    // optionally refresh user task history here
  } catch (err) {
    alert(err.message);
  }
};


  // Enhanced action handlers with refresh
  const handleUpdateBalance = async () => {
    await updateBalance();
    if (selectedUser?.id) {
      await fetchUserDetails(selectedUser.id);
    }
  };

  const handleAssignTask = async () => {
    await assignTask();
    if (selectedUser?.id) {
      await fetchUserDetails(selectedUser.id);
    }
  };

  const handleUpdateTasks = async () => {
    await updateTasks();
    if (selectedUser?.id) {
      await fetchUserDetails(selectedUser.id);
    }
  };

  const handleVerifyTask = async () => {
    await verifyTask();
    if (selectedUser?.id) {
      await fetchUserDetails(selectedUser.id);
    }
  };

  const handleAddBonus = async () => {
    await addBonus();
    if (selectedUser?.id) {
      await fetchUserDetails(selectedUser.id);
    }
  };

  const handleAssignTasks = async () => {
    await assignTasks();
    if (selectedUser?.id) {
      await fetchUserDetails(selectedUser.id);
    }
  };

  const handleUpdateTaskLimit = async () => {
    await updateTaskLimit();
    if (selectedUser?.id) {
      await fetchUserDetails(selectedUser.id);
    }
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
                        onClick={handleAddBonus}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-150 flex items-center"
                      >
                        <FaCoins className="mr-2" /> Add $10 Bonus
                      </button>
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
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                        <p className="text-sm text-gray-500">Referrals</p>
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
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-150 flex items-center"
                        onClick={() => handleDeactivateUserTasks(selectedUser?.id)}
                      >
                        Deactivate Task
                      </button>
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-150 flex items-center"
                        onClick={handleAssignTasks}
                      >
                        <FiPlus className="mr-2" /> Reset User Tasks
                      </button>
                      <button
                        onClick={() => setCustomTaskModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        disabled={!selectedUser?.id || loading}
                      >
                        <FiPlus className="mr-2" /> Assign Tasks
                      </button>
                    </div>
                  </div>

                  {/* Task History with Pagination */}
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Task History</h2>
                        <div className="mt-2 md:mt-0">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search tasks..."
                              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiSearch className="text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {filteredTasks.length > 0 ? (
                        <>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deposit</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {currentTasks.map((task) => (
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
                                      {formatCurrency(task.depositAmount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {formatDate(task.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                      {task.depositAmount !== null && task.status !== 'completed' && task.status !== 'rejected' && (
                                        <button
                                          onClick={() => openVerifyTaskModal(task.userTaskId)}
                                          className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                                        >
                                          Verify
                                        </button>
                                      )}
                                      {task.status !== 'completed' && task.status !== 'rejected' && (
                                        <button
                                          onClick={() => openEditTaskModal(task)}
                                          className="text-indigo-600 hover:text-indigo-900"
                                        >
                                          <FiEdit />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination Controls */}
                          <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-gray-700">
                              Showing <span className="font-medium">{indexOfFirstTask + 1}</span> to{' '}
                              <span className="font-medium">{Math.min(indexOfLastTask, filteredTasks.length)}</span> of{' '}
                              <span className="font-medium">{filteredTasks.length}</span> tasks
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded-md text-sm ${
                                  currentPage === 1
                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                    : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                                }`}
                              >
                                Previous
                              </button>

                              {getPageNumbers().map((number, index) => (
                                number === '...' ? (
                                  <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-700">...</span>
                                ) : (
                                  <button
                                    key={number}
                                    onClick={() => setCurrentPage(number)}
                                    className={`px-3 py-1 rounded-md text-sm ${
                                      currentPage === number
                                        ? 'text-white bg-blue-600 hover:bg-blue-700'
                                        : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                                    }`}
                                  >
                                    {number}
                                  </button>
                                )
                              ))}

                              <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded-md text-sm ${
                                  currentPage === totalPages
                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                    : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                                }`}
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            {searchTerm ? 'No matching tasks found' : 'No task history available'}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Try a different search term' : 'This user has not completed any tasks yet'}
                          </p>
                        </div>
                      )}
                    </div>
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
                {taskAssignmentData.isCombo ? 'Edit/Assign Combo Task' : 'Assign Normal Task'}
              </h2>
              
              {/* Tabbed interface */}
              <div className="flex mb-6 border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => {
                    setTaskAssignmentData(prev => ({
                      ...prev,
                      isCombo: false,
                      taskId: ''
                    }));
                    setEditableTaskDetails({
                      profit: '',
                      depositAmount: ''
                    });
                  }}
                  className={`flex-1 py-2 px-4 text-sm font-medium ${
                    !taskAssignmentData.isCombo 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Normal Tasks
                </button>
                <button
                  onClick={() => {
                    setTaskAssignmentData(prev => ({
                      ...prev,
                      isCombo: true,
                      taskId: ''
                    }));
                    setEditableTaskDetails({
                      profit: '',
                      depositAmount: ''
                    });
                  }}
                  className={`flex-1 py-2 px-4 text-sm font-medium ${
                    taskAssignmentData.isCombo 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Combo Tasks
                </button>
              </div>

              {/* Task selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Task
                </label>
                <select
                  name="taskId"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={taskAssignmentData.taskId}
                  onChange={(e) => {
                    const allTasks = [...tasks, ...comboTasks];
                    const selectedTask = allTasks.find(t => t.id === e.target.value);
                    
                    setTaskAssignmentData(prev => ({
                      ...prev,
                      taskId: e.target.value
                    }));
                    
                    if (selectedTask) {
                      setEditableTaskDetails({
                        profit: selectedTask.profit,
                        depositAmount: selectedTask.depositAmount || ''
                      });
                    }
                  }}
                >
                  <option value="">Select a task</option>
                  {(taskAssignmentData.isCombo 
                    ? [...tasks, ...comboTasks]  // Show all tasks in Combo tab
                    : tasks)                     // Show only normal tasks in Normal tab
                    .map(task => (
                      <option key={task.id} value={task.id}>
                        {task.appName} ({formatCurrency(task.profit)})
                        {task.depositAmount && ` [Combo]`}
                      </option>
                    ))}
                </select>
              </div>

              {/* Editable fields (shown for Combo tab, regardless of task type) */}
              {taskAssignmentData.isCombo && taskAssignmentData.taskId && (
                <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium">Task Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profit ($)
                    </label>
                    <input
                      type="number"
                      name="profit"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      value={editableTaskDetails.profit}
                      onChange={handleEditableTaskChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deposit Amount ($) {!editableTaskDetails.depositAmount && "(will convert to combo)"}
                    </label>
                    <input
                      type="number"
                      name="depositAmount"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      value={editableTaskDetails.depositAmount}
                      onChange={handleEditableTaskChange}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={taskAssignmentData.isCombo ? handleUpdateTasks : handleAssignTask}
                  disabled={!taskAssignmentData.taskId || 
                    (taskAssignmentData.isCombo && !editableTaskDetails.profit)}
                  className={`px-4 py-2.5 rounded-lg text-white ${
                    taskAssignmentData.isCombo 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-50 transition-colors duration-150`}
                >
                  {taskAssignmentData.isCombo ? 'Update Task' : 'Assign Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Task Modal */}
      {isCustomTaskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          {isFetchingTasks ? (
            <div className="bg-white rounded-lg shadow-xl p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3">Loading tasks...</span>
            </div>
          ) : (
            <AssignCustomTaskModal
              isOpen={true}
              onClose={() => setCustomTaskModalOpen(false)}
              userId={selectedUser?.id || "0"}
              tasks={taskList}
              onSuccess={async (newTask) => {
                if (selectedUser?.id) {
                  await fetchUserDetails(selectedUser.id);
                }
                setCustomTaskModalOpen(false);
              }}
            />
          )}
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
                  onClick={handleUpdateBalance}
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
                  onClick={handleUpdateTaskLimit}
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
                  onClick={handleVerifyTask}
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