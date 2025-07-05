import { useState, useEffect } from 'react';
import { FiFilter, FiX, FiCheck, FiClock, FiUser, FiPlus, FiRefreshCw, FiEdit, FiTrash2 } from 'react-icons/fi';
import Sidebar from './Sidebar';

const ATasks = () => {
  // State for tasks data
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for filters
  const [filters, setFilters] = useState({
    isActive: '',
    search: ''
  });
  
  // State for modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [userTaskModalOpen, setUserTaskModalOpen] = useState(false);
  
  // State for form data
  const [newTask, setNewTask] = useState({
    appName: '',
    appReview: '',
    appProfit: '',
    isActive: true,
    appImage: null
  });
  
  const [editTask, setEditTask] = useState({
    id: '',
    appName: '',
    appReview: '',
    appProfit: '',
    isActive: true,
    appImage: null
  });
  
  const [resetTaskData, setResetTaskData] = useState({
    userId: '',
    type: 'all' // 'all' or 'user'
  });
  
  const [userTaskData, setUserTaskData] = useState({
    userId: '',
    taskAmount: 5
  });
  
  const [selectedUserTasks, setSelectedUserTasks] = useState([]);
  const [selectedUserStats, setSelectedUserStats] = useState(null);
  
  // State for mobile sidebar
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch tasks on component mount and filter change
  useEffect(() => {
    fetchTasks();
  }, [filters]);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.isActive) queryParams.append('isActive', filters.isActive);
      if (filters.search) queryParams.append('search', filters.search);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/all?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await response.json();
      setTasks(data.tasks);
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

  // Handle file upload for new task
  const handleFileChange = (e) => {
    setNewTask(prev => ({ ...prev, appImage: e.target.files[0] }));
  };

  // Handle file upload for edit task
  const handleEditFileChange = (e) => {
    setEditTask(prev => ({ ...prev, appImage: e.target.files[0] }));
  };

  // Open create task modal
  const openCreateModal = () => {
    setNewTask({
      appName: '',
      appReview: '',
      appProfit: '',
      isActive: true,
      appImage: null
    });
    setCreateModalOpen(true);
  };

  // Open edit task modal
  const openEditModal = (task) => {
    setEditTask({
      id: task.id,
      appName: task.appName,
      appReview: task.appReview,
      appProfit: task.appProfit,
      isActive: task.isActive,
      appImage: null
    });
    setEditModalOpen(true);
  };

  // Open reset tasks modal
  const openResetModal = (type = 'all', userId = '') => {
    setResetTaskData({
      userId,
      type
    });
    setResetModalOpen(true);
  };

  // Open user task management modal
  const openUserTaskModal = async (userId = '') => {
    if (userId) {
      try {
        // Fetch user's task stats
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch user stats');
        
        const data = await response.json();
        const userStats = data.stats.find(stat => stat.userId === userId);
        
        if (userStats) {
          setUserTaskData({
            userId,
            taskAmount: userStats.dailyTasksLimit
          });
          setSelectedUserStats(userStats);
        }
        
        // Fetch user's tasks
        const tasksResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/history/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        });
        
        if (!tasksResponse.ok) throw new Error('Failed to fetch user tasks');
        
        const tasksData = await tasksResponse.json();
        setSelectedUserTasks(tasksData.tasks);
      } catch (err) {
        setError(err.message);
      }
    } else {
      setUserTaskData({
        userId: '',
        taskAmount: 5
      });
      setSelectedUserStats(null);
      setSelectedUserTasks([]);
    }
    
    setUserTaskModalOpen(true);
  };

  // Close all modals
  const closeModal = () => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setResetModalOpen(false);
    setUserTaskModalOpen(false);
    setError('');
  };

  // Create new task
  const createTask = async () => {
    try {
      if (!newTask.appName || !newTask.appReview || !newTask.appProfit || !newTask.appImage) {
        setError('All fields are required including app image');
        return;
      }

      const formData = new FormData();
      formData.append('appName', newTask.appName);
      formData.append('appReview', newTask.appReview);
      formData.append('appProfit', newTask.appProfit);
      formData.append('isActive', newTask.isActive);
      formData.append('appImage', newTask.appImage);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error('Failed to create task');
      }
      
      const data = await response.json();
      alert(data.message);
      closeModal();
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  // Update task
  const updateTask = async () => {
    try {
      if (!editTask.appName || !editTask.appReview || !editTask.appProfit) {
        setError('All fields except image are required');
        return;
      }

      const formData = new FormData();
      formData.append('appName', editTask.appName);
      formData.append('appReview', editTask.appReview);
      formData.append('appProfit', editTask.appProfit);
      formData.append('isActive', editTask.isActive);
      if (editTask.appImage) {
        formData.append('appImage', editTask.appImage);
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/update/${editTask.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error('Failed to update task');
      }
      
      const data = await response.json();
      alert(data.message);
      closeModal();
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/delete/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error('Failed to delete task');
      }
      
      const data = await response.json();
      alert(data.message);
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  // Reset tasks
  const resetTasks = async () => {
    try {
      let response;
      
      if (resetTaskData.type === 'all') {
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/reset`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/reset/${resetTaskData.userId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error('Failed to reset tasks');
      }
      
      const data = await response.json();
      alert(data.message);
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  // Set user task amount
  const setUserTaskAmount = async () => {
    try {
      if (!userTaskData.userId || userTaskData.taskAmount < 0) {
        setError('Valid user ID and task amount are required');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/settasks/${userTaskData.userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskAmount: userTaskData.taskAmount })
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error('Failed to set user task amount');
      }
      
      const data = await response.json();
      alert(data.message);
      closeModal();
      openUserTaskModal(userTaskData.userId); // Refresh user data
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge class
  const getStatusBadge = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar active="tasks" isMobileOpen={isMobileSidebarOpen} toggleMobileSidebar={toggleMobileSidebar} />
      
      <main className="flex-1 p-4 md:p-6 md:ml-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Task Management</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <FiPlus className="mr-2" />
            Create Task
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by app name"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-gray-400" />
              </div>
            </div>
            
            <div className="relative">
              <select
                name="isActive"
                value={filters.isActive}
                onChange={handleFilterChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCheck className="text-gray-400" />
              </div>
            </div>
            
            <button
              onClick={() => openResetModal('all')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FiRefreshCw className="mr-2" />
              Reset All Tasks
            </button>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No tasks found</td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-md" src={task.appImage} alt={task.appName} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{task.appName}</div>
                              <div className="text-sm text-gray-500">ID: {task.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 line-clamp-2">{task.appReview}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(task.appProfit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(task.isActive)}`}>
                            {task.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Assigned: {task._count?.taskAssignments || 0}</div>
                          <div>Completed: {task._count?.userTasks || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(task.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(task)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit task"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete task"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Create Task Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">Create New Task</h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="appName" className="block text-sm font-medium text-gray-700">App Name</label>
                    <input
                      type="text"
                      id="appName"
                      name="appName"
                      value={newTask.appName}
                      onChange={(e) => setNewTask(prev => ({ ...prev, appName: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="appReview" className="block text-sm font-medium text-gray-700">App Review</label>
                    <textarea
                      id="appReview"
                      name="appReview"
                      value={newTask.appReview}
                      onChange={(e) => setNewTask(prev => ({ ...prev, appReview: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="appProfit" className="block text-sm font-medium text-gray-700">App Profit</label>
                    <input
                      type="number"
                      id="appProfit"
                      name="appProfit"
                      value={newTask.appProfit}
                      onChange={(e) => setNewTask(prev => ({ ...prev, appProfit: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      id="isActive"
                      name="isActive"
                      value={newTask.isActive}
                      onChange={(e) => setNewTask(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="appImage" className="block text-sm font-medium text-gray-700">App Image</label>
                    <input
                      type="file"
                      id="appImage"
                      name="appImage"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createTask}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Create Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {editModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">Edit Task</h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="editAppName" className="block text-sm font-medium text-gray-700">App Name</label>
                    <input
                      type="text"
                      id="editAppName"
                      name="appName"
                      value={editTask.appName}
                      onChange={(e) => setEditTask(prev => ({ ...prev, appName: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="editAppReview" className="block text-sm font-medium text-gray-700">App Review</label>
                    <textarea
                      id="editAppReview"
                      name="appReview"
                      value={editTask.appReview}
                      onChange={(e) => setEditTask(prev => ({ ...prev, appReview: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="editAppProfit" className="block text-sm font-medium text-gray-700">App Profit</label>
                    <input
                      type="number"
                      id="editAppProfit"
                      name="appProfit"
                      value={editTask.appProfit}
                      onChange={(e) => setEditTask(prev => ({ ...prev, appProfit: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="editIsActive" className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      id="editIsActive"
                      name="isActive"
                      value={editTask.isActive}
                      onChange={(e) => setEditTask(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="editAppImage" className="block text-sm font-medium text-gray-700">App Image (Leave empty to keep current)</label>
                    <input
                      type="file"
                      id="editAppImage"
                      name="appImage"
                      onChange={handleEditFileChange}
                      accept="image/*"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateTask}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Update Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reset Tasks Modal */}
        {resetModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">
                    {resetTaskData.type === 'all' ? 'Reset All User Tasks' : 'Reset User Tasks'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                
                <div className="mt-4">
                  {resetTaskData.type === 'user' && (
                    <div className="mb-4">
                      <label htmlFor="resetUserId" className="block text-sm font-medium text-gray-700">User ID</label>
                      <input
                        type="text"
                        id="resetUserId"
                        name="userId"
                        value={resetTaskData.userId}
                        onChange={(e) => setResetTaskData(prev => ({ ...prev, userId: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      />
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600">
                    {resetTaskData.type === 'all' 
                      ? 'This will reset all users\' tasks and clear their daily task counts. Are you sure?'
                      : 'This will reset the specified user\'s tasks and clear their daily task count. Are you sure?'}
                  </p>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={resetTasks}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Task Management Modal */}
        {userTaskModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedUserStats ? `User Task Management - ${selectedUserStats.username}` : 'Set User Task Amount'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                
                <div className="mt-4">
                  {!selectedUserStats ? (
                    <div>
                      <label htmlFor="userId" className="block text-sm font-medium text-gray-700">User ID</label>
                      <input
                        type="text"
                        id="userId"
                        name="userId"
                        value={userTaskData.userId}
                        onChange={(e) => setUserTaskData(prev => ({ ...prev, userId: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">User Information</h4>
                        <div className="space-y-1">
                          <p className="text-sm"><span className="font-medium">Username:</span> {selectedUserStats.username}</p>
                          <p className="text-sm"><span className="font-medium">Email:</span> {selectedUserStats.email}</p>
                          <p className="text-sm"><span className="font-medium">User ID:</span> {selectedUserStats.userId}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Task Statistics</h4>
                        <div className="space-y-1">
                          <p className="text-sm"><span className="font-medium">Daily Completed:</span> {selectedUserStats.dailyTasksCompleted}</p>
                          <p className="text-sm"><span className="font-medium">Daily Limit:</span> {selectedUserStats.dailyTasksLimit}</p>
                          <p className="text-sm"><span className="font-medium">Total Completed:</span> {selectedUserStats.totalTasksCompleted}</p>
                          <p className="text-sm"><span className="font-medium">Last Reset:</span> {formatDate(selectedUserStats.lastTaskReset)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="taskAmount" className="block text-sm font-medium text-gray-700">Daily Task Amount</label>
                    <input
                      type="number"
                      id="taskAmount"
                      name="taskAmount"
                      value={userTaskData.taskAmount}
                      onChange={(e) => setUserTaskData(prev => ({ ...prev, taskAmount: parseInt(e.target.value) || 0 }))}
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  
                  {selectedUserStats && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">User's Task History</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed At</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedUserTasks.length === 0 ? (
                              <tr>
                                <td colSpan="4" className="px-3 py-2 text-center text-sm text-gray-500">No task history found</td>
                              </tr>
                            ) : (
                              selectedUserTasks.map((task) => (
                                <tr key={task.id}>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {task.task.appName}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(task.status === 'completed')}`}>
                                      {task.status}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {formatCurrency(task.profit)}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(task.completedAt)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-between">
                  <div>
                    {selectedUserStats && (
                      <button
                        onClick={() => openResetModal('user', selectedUserStats.userId)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <FiRefreshCw className="mr-2" />
                        Reset User Tasks
                      </button>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={setUserTaskAmount}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ATasks;