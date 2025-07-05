import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiUser, 
  FiSearch, 
  FiFilter, 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiX, 
  FiCheck,
  FiDollarSign,
  FiClock,
  FiAward,
  FiBarChart2,
  FiArrowLeft
} from 'react-icons/fi';
import Sidebar from './Sidebar';
import { formatCurrency } from '../../../utils/formatters';

const UserTasks = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAssignments, setUserAssignments] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [taskStats, setTaskStats] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    vipLevel: '',
    hasTasks: ''
  });
  const [modalOpen, setModalOpen] = useState({
    assignTask: false,
    confirmDelete: false,
    editLimit: false
  });
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedTaskToAssign, setSelectedTaskToAssign] = useState('');
  const [newDailyLimit, setNewDailyLimit] = useState(0);

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user details including assignments
  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      // Get user info
      const userResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!userResponse.ok) throw new Error('Failed to fetch user details');
      const userData = await userResponse.json();
      setSelectedUser(userData);
      
      // Get user assignments
      const assignmentsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/assignments?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!assignmentsResponse.ok) throw new Error('Failed to fetch user assignments');
      const assignmentsData = await assignmentsResponse.json();
      setUserAssignments(assignmentsData.assignments);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all tasks for assignment dropdown
  const fetchAllTasks = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const data = await response.json();
      setAllTasks(data.tasks);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch task statistics
  const fetchTaskStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch task stats');
      
      const data = await response.json();
      setTaskStats(data.stats);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      
      const data = await response.json();
      setDashboardStats(data.stats);
    } catch (err) {
      setError(err.message);
    }
  };

  // Assign task to user
  const assignTaskToUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/assign`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          taskId: selectedTaskToAssign
        })
      });
      
      if (!response.ok) throw new Error('Failed to assign task');
      
      // Refresh user assignments
      await fetchUserDetails(selectedUser.id);
      setModalOpen({ ...modalOpen, assignTask: false });
      setSelectedTaskToAssign('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Remove task assignment
  const removeTaskAssignment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/assign/${selectedAssignment}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to remove task assignment');
      
      // Refresh user assignments
      await fetchUserDetails(selectedUser.id);
      setModalOpen({ ...modalOpen, confirmDelete: false });
      setSelectedAssignment(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update user's daily task limit
  const updateUserTaskLimit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/${selectedUser.id}/task-limit`,
        {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dailyTasksLimit: Number(newDailyLimit)
          })
        }
      );
      
      if (!response.ok) throw new Error('Failed to update task limit');
      
      const data = await response.json();
      
      // Update the local state to reflect the change
      setSelectedUser(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          dailyTasksLimit: data.profile.dailyTasksLimit
        }
      }));
      
      setModalOpen({ ...modalOpen, editLimit: false });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesVip = 
      filters.vipLevel === '' || 
      (user.profile && user.profile.vipLevel === parseInt(filters.vipLevel));
    
    const matchesTaskFilter = () => {
      if (filters.hasTasks === '') return true;
      if (filters.hasTasks === 'with') return user._count.deposit > 0;
      if (filters.hasTasks === 'without') return user._count.deposit === 0;
      return true;
    };
    
    return matchesSearch && matchesVip && matchesTaskFilter();
  });

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
    fetchTaskStats();
    fetchDashboardStats();
    fetchAllTasks();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar active="user-tasks" />
      
      <main className="flex-1 p-4 md:p-6 md:ml-64">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {selectedUser ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* User Detail Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <button 
                onClick={() => setSelectedUser(null)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <FiArrowLeft className="mr-2" /> Back to Users
              </button>
              <h2 className="text-xl font-semibold">
                {selectedUser.username}'s Task Management
              </h2>
            </div>

            {/* User Info Section */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">User Information</h3>
                <div className="space-y-2">
                  <p><span className="text-gray-500">Email:</span> {selectedUser.email}</p>
                  <p><span className="text-gray-500">VIP Level:</span> {selectedUser.profile?.vipLevel || 0}</p>
                  <p><span className="text-gray-500">Balance:</span> {formatCurrency(selectedUser.balance)}</p>
                  <p><span className="text-gray-500">Profit Balance:</span> {formatCurrency(selectedUser.profitBalance)}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Task Statistics</h3>
                <div className="space-y-2">
                  <p><span className="text-gray-500">Total Tasks:</span> {selectedUser._count?.deposit || 0}</p>
                  <p><span className="text-gray-500">Completed Tasks:</span> {selectedUser._count?.withdrawal || 0}</p>
                  <p><span className="text-gray-500">Daily Limit:</span> {selectedUser.profile?.dailyTasksLimit || 0}</p>
                  <p><span className="text-gray-500">Today's Completed:</span> {selectedUser.profile?.dailyTasksCompleted || 0}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setModalOpen({ ...modalOpen, assignTask: true })}
                    className="w-full py-2 bg-blue-600 text-white rounded flex items-center justify-center gap-2 hover:bg-blue-700"
                  >
                    <FiPlus /> Assign New Task
                  </button>
                  <button
                    onClick={() => {
                      setNewDailyLimit(selectedUser.profile?.dailyTasksLimit || 0);
                      setModalOpen({ ...modalOpen, editLimit: true });
                    }}
                    className="w-full py-2 bg-yellow-500 text-white rounded flex items-center justify-center gap-2 hover:bg-yellow-600"
                  >
                    <FiEdit /> Edit Daily Limit
                  </button>
                </div>
              </div>
            </div>

            {/* Task Assignments Section */}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Current Task Assignments</h3>
              
              {userAssignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No task assignments found for this user
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userAssignments.map(assignment => (
                        <tr key={assignment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {assignment.task.appImage && (
                                <img 
                                  src={assignment.task.appImage} 
                                  alt={assignment.task.appName} 
                                  className="h-10 w-10 rounded-full object-cover mr-3"
                                />
                              )}
                              <div>
                                <div className="font-medium">{assignment.task.appName}</div>
                                <div className="text-sm text-gray-500">{assignment.task.appReview.substring(0, 50)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                            {formatCurrency(assignment.task.appProfit)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              assignment.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {assignment.isCompleted ? 'Completed' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(assignment.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {!assignment.isCompleted && (
                              <button
                                onClick={() => {
                                  setSelectedAssignment(assignment.id);
                                  setModalOpen({ ...modalOpen, confirmDelete: true });
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Dashboard Overview Section */}
            {dashboardStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FiUsers /> Users Overview
                  </h3>
                  <div className="space-y-3">
                    <p>Total Users: {dashboardStats.users.total}</p>
                    <p>Active Users: {dashboardStats.users.active}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FiAward /> Tasks Overview
                  </h3>
                  <div className="space-y-3">
                    <p>Total Tasks: {dashboardStats.tasks.total}</p>
                    <p>Total Earnings: {formatCurrency(dashboardStats.tasks.totalEarnings)}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FiBarChart2 /> Task Stats
                  </h3>
                  {taskStats && (
                    <div className="space-y-3">
                      <p>Completion Rate: {taskStats.completionRate}%</p>
                      <p>Active Tasks: {taskStats.activeTasks}/{taskStats.totalTasks}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users List Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">User Management</h2>
                
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <select
                      name="vipLevel"
                      value={filters.vipLevel}
                      onChange={handleFilterChange}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All VIP Levels</option>
                      <option value="0">VIP 0</option>
                      <option value="1">VIP 1</option>
                      <option value="2">VIP 2</option>
                      <option value="3">VIP 3</option>
                      <option value="4">VIP 4</option>
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <select
                      name="hasTasks"
                      value={filters.hasTasks}
                      onChange={handleFilterChange}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Users</option>
                      <option value="with">With Tasks</option>
                      <option value="without">Without Tasks</option>
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiFilter className="text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center p-5">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIP</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                            No users found matching your criteria
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {user.profilePicture ? (
                                  <img 
                                    src={user.profilePicture} 
                                    alt={user.username} 
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <FiUser size={20} />
                                  </div>
                                )}
                                <div className="ml-4">
                                  <div className="font-medium">{user.username}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                VIP {user.profile?.vipLevel || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatCurrency(user.balance)}</div>
                              <div className="text-sm text-gray-500">{formatCurrency(user.profitBalance)} profit</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                <span className="font-medium">{user._count?.deposit || 0}</span> assigned
                              </div>
                              <div className="text-sm text-gray-500">
                                <span className="font-medium">{user._count?.withdrawal || 0}</span> completed
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => fetchUserDetails(user.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Tasks
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {/* Assign Task Modal */}
        {modalOpen.assignTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">
                    Assign Task to {selectedUser?.username}
                  </h3>
                  <button
                    onClick={() => setModalOpen({ ...modalOpen, assignTask: false })}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="taskSelect" className="block text-sm font-medium text-gray-700">
                      Select Task
                    </label>
                    <select
                      id="taskSelect"
                      value={selectedTaskToAssign}
                      onChange={(e) => setSelectedTaskToAssign(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select a task</option>
                      {allTasks.map(task => (
                        <option key={task.id} value={task.id}>
                          {task.appName} ({formatCurrency(task.appProfit)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setModalOpen({ ...modalOpen, assignTask: false })}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={assignTaskToUser}
                    disabled={!selectedTaskToAssign || loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Assigning...' : 'Assign Task'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {modalOpen.confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">
                    Confirm Removal
                  </h3>
                  <button
                    onClick={() => setModalOpen({ ...modalOpen, confirmDelete: false })}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-700">
                    Are you sure you want to remove this task assignment? This action cannot be undone.
                  </p>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setModalOpen({ ...modalOpen, confirmDelete: false })}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={removeTaskAssignment}
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {loading ? 'Removing...' : 'Remove Assignment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Daily Limit Modal */}
        {modalOpen.editLimit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">
                    Edit Daily Task Limit for {selectedUser?.username}
                  </h3>
                  <button
                    onClick={() => setModalOpen({ ...modalOpen, editLimit: false })}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="dailyLimit" className="block text-sm font-medium text-gray-700">
                      New Daily Task Limit
                    </label>
                    <input
                      type="number"
                      id="dailyLimit"
                      min="0"
                      value={newDailyLimit}
                      onChange={(e) => setNewDailyLimit(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Current limit: {selectedUser?.profile?.dailyTasksLimit || 0}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setModalOpen({ ...modalOpen, editLimit: false })}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateUserTaskLimit}
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Limit'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserTasks;