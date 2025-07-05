import { useState, useEffect } from 'react';
import { 
  FiFilter, 
  FiX, 
  FiCheck, 
  FiClock, 
  FiUser, 
  FiCheckCircle,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSettings,
  FiRefreshCw,
  FiBarChart2,
  FiDollarSign
} from 'react-icons/fi';
import Sidebar from './Sidebar';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const ATaskz = () => {
  // State for tasks and UI
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [userLimitModalOpen, setUserLimitModalOpen] = useState(false);
  
  // Form data states
  const [newTask, setNewTask] = useState({
    appName: '',
    reviewText: '',
    profit: '',
    appImage: null,
    previewImage: ''
  });
  
  const [editTask, setEditTask] = useState({
    id: '',
    appName: '',
    reviewText: '',
    profit: '',
    isActive: true,
    previewImage: '',
    appImage: null
  });
  
  const [taskSettings, setTaskSettings] = useState({
    maxTasksPerDay: 5,
    taskResetHours: 24
  });
  
  const [resetOptions, setResetOptions] = useState({
    type: 'pending', // 'pending' or 'all'
    userId: '' // optional for specific user
  });
  
  const [userLimitData, setUserLimitData] = useState({
    userId: '',
    dailyTasksLimit: 5
  });
  
  const [stats, setStats] = useState({
    period: '7days',
    completedTasks: 0,
    pendingTasks: 0,
    totalEarnings: 0,
    topApps: []
  });
  
  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch tasks on component mount and when filters change
  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks?${queryParams.toString()}`, {
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

  const fetchTaskSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch task settings');
      
      const data = await response.json();
      setTaskSettings(data.settings);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchTaskStats = async (period = '7days') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tasks/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch task statistics');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle new task form changes
  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload for new task
  const handleNewImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setNewTask(prev => ({
      ...prev,
      appImage: file,
      previewImage: URL.createObjectURL(file)
    }));
  };

  // Handle edit task form changes
  const handleEditTaskChange = (e) => {
    const { name, value } = e.target;
    setEditTask(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload for edit task
  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setEditTask(prev => ({
      ...prev,
      appImage: file,
      previewImage: URL.createObjectURL(file)
    }));
  };

  // Handle settings form changes
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setTaskSettings(prev => ({ ...prev, [name]: value }));
  };

  // Handle reset options changes
  const handleResetOptionsChange = (e) => {
    const { name, value } = e.target;
    setResetOptions(prev => ({ ...prev, [name]: value }));
  };

  // Handle user limit form changes
  const handleUserLimitChange = (e) => {
    const { name, value } = e.target;
    setUserLimitData(prev => ({ ...prev, [name]: value }));
  };

  // Open create task modal
  const openCreateModal = () => {
    setNewTask({
      appName: '',
      reviewText: '',
      profit: '',
      appImage: null,
      previewImage: ''
    });
    setCreateModalOpen(true);
  };

  // Open edit task modal
  const openEditModal = (task) => {
    setEditTask({
      id: task.id,
      appName: task.appName,
      reviewText: task.reviewText,
      profit: task.profit,
      isActive: task.isActive,
      previewImage: task.appImage,
      appImage: null
    });
    setEditModalOpen(true);
  };

  // Open settings modal
  const openSettingsModal = async () => {
    await fetchTaskSettings();
    setSettingsModalOpen(true);
  };

  // Open reset modal
  const openResetModal = () => {
    setResetOptions({
      type: 'pending',
      userId: ''
    });
    setResetModalOpen(true);
  };

  // Open stats modal
  const openStatsModal = async () => {
    await fetchTaskStats();
    setStatsModalOpen(true);
  };

  // Open user limit modal
  const openUserLimitModal = () => {
    setUserLimitData({
      userId: '',
      dailyTasksLimit: 5
    });
    setUserLimitModalOpen(true);
  };

  // Close all modals
  const closeModal = () => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setSettingsModalOpen(false);
    setResetModalOpen(false);
    setStatsModalOpen(false);
    setUserLimitModalOpen(false);
    setError('');
    setSuccess('');
  };

  // Submit new task
  const submitNewTask = async () => {
    try {
      if (!newTask.appName || !newTask.reviewText || !newTask.profit || !newTask.appImage) {
        throw new Error('All fields are required');
      }

      const formData = new FormData();
      formData.append('appName', newTask.appName);
      formData.append('reviewText', newTask.reviewText);
      formData.append('profit', newTask.profit);
      formData.append('appImage', newTask.appImage);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks`, {
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
      setSuccess('Task created successfully');
      fetchTasks();
      setTimeout(closeModal, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  // Submit task update
  const submitTaskUpdate = async () => {
    try {
      if (!editTask.appName || !editTask.reviewText || !editTask.profit) {
        throw new Error('All fields except image are required');
      }

      const formData = new FormData();
      formData.append('appName', editTask.appName);
      formData.append('reviewText', editTask.reviewText);
      formData.append('profit', editTask.profit);
      formData.append('isActive', editTask.isActive);
      if (editTask.appImage) {
        formData.append('appImage', editTask.appImage);
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/${editTask.id}`, {
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
      setSuccess('Task updated successfully');
      fetchTasks();
      setTimeout(closeModal, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/${taskId}`, {
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
      setSuccess('Task deleted successfully');
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  // Update task settings
  const updateTaskSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskSettings)
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error('Failed to update task settings');
      }
      
      const data = await response.json();
      setSuccess('Task settings updated successfully');
      setTimeout(closeModal, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  // Reset tasks
  const resetTasks = async () => {
    try {
      let url = `${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/reset-all-tasks`;
      let body = { resetType: resetOptions.type };
      
      if (resetOptions.userId) {
        url = `${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/users/${resetOptions.userId}/reset-tasks`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error('Failed to reset tasks');
      }
      
      const data = await response.json();
      setSuccess(data.message || 'Tasks reset successfully');
      setTimeout(closeModal, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  // Set user task limit
  const setUserTaskLimit = async () => {
    try {
      if (!userLimitData.userId) {
        throw new Error('User ID is required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/users/${userLimitData.userId}/task-limit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dailyTasksLimit: userLimitData.dailyTasksLimit })
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error('Failed to set user task limit');
      }
      
      const data = await response.json();
      setSuccess('User task limit updated successfully');
      setTimeout(closeModal, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  // Get status badge class
  const getStatusBadge = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar active="tasks" isMobileOpen={isMobileSidebarOpen} toggleMobileSidebar={toggleMobileSidebar} />
      
      <main className="flex-1 p-4 md:p-6 md:ml-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Task Management</h1>
          <div className="flex space-x-2">
            <button 
              onClick={openStatsModal}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FiBarChart2 className="mr-2" /> Stats
            </button>
            <button 
              onClick={openSettingsModal}
              className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <FiSettings className="mr-2" /> Settings
            </button>
            <button 
              onClick={openResetModal}
              className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <FiRefreshCw className="mr-2" /> Reset
            </button>
            <button 
              onClick={openCreateModal}
              className="flex items-center px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              <FiPlus className="mr-2" /> New Task
            </button>
          </div>
        </div>
        
        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Task Filters */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search tasks..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="text-gray-400" />
                </div>
              </div>
              
              <div className="relative">
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCheckCircle className="text-gray-400" />
                </div>
              </div>
            </div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No tasks found</td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
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
                          <div className="text-sm text-gray-900 line-clamp-2">{task.reviewText}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(task.profit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(task.isActive)}`}>
                            {task.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(task.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openEditModal(task)}
                            className="text-teal-600 hover:text-teal-900 mr-4"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 />
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
      </main>

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
              
              <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="appName" className="block text-sm font-medium text-gray-700">
                    App Name
                  </label>
                  <input
                    type="text"
                    name="appName"
                    id="appName"
                    value={newTask.appName}
                    onChange={handleNewTaskChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700">
                    Review Text
                  </label>
                  <textarea
                    name="reviewText"
                    id="reviewText"
                    rows={3}
                    value={newTask.reviewText}
                    onChange={handleNewTaskChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="profit" className="block text-sm font-medium text-gray-700">
                    Profit Amount ($)
                  </label>
                  <input
                    type="number"
                    name="profit"
                    id="profit"
                    step="0.01"
                    min="0"
                    value={newTask.profit}
                    onChange={handleNewTaskChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="appImage" className="block text-sm font-medium text-gray-700">
                    App Image
                  </label>
                  <div className="mt-1 flex items-center">
                    {newTask.previewImage ? (
                      <img src={newTask.previewImage} alt="Preview" className="h-16 w-16 rounded-md object-cover mr-4" />
                    ) : (
                      <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 mr-4">
                        No image
                      </div>
                    )}
                    <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                      <span>Upload Image</span>
                      <input
                        id="appImage"
                        name="appImage"
                        type="file"
                        accept="image/*"
                        onChange={handleNewImageUpload}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Square image recommended (512x512px). Max 5MB.
                  </p>
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
                  onClick={submitNewTask}
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
              
              <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="editAppName" className="block text-sm font-medium text-gray-700">
                    App Name
                  </label>
                  <input
                    type="text"
                    name="appName"
                    id="editAppName"
                    value={editTask.appName}
                    onChange={handleEditTaskChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="editReviewText" className="block text-sm font-medium text-gray-700">
                    Review Text
                  </label>
                  <textarea
                    name="reviewText"
                    id="editReviewText"
                    rows={3}
                    value={editTask.reviewText}
                    onChange={handleEditTaskChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="editProfit" className="block text-sm font-medium text-gray-700">
                    Profit Amount ($)
                  </label>
                  <input
                    type="number"
                    name="profit"
                    id="editProfit"
                    step="0.01"
                    min="0"
                    value={editTask.profit}
                    onChange={handleEditTaskChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="editIsActive" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="isActive"
                    id="editIsActive"
                    value={editTask.isActive}
                    onChange={handleEditTaskChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="editAppImage" className="block text-sm font-medium text-gray-700">
                    App Image
                  </label>
                  <div className="mt-1 flex items-center">
                    {editTask.previewImage ? (
                      <img src={editTask.previewImage} alt="Preview" className="h-16 w-16 rounded-md object-cover mr-4" />
                    ) : (
                      <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 mr-4">
                        No image
                      </div>
                    )}
                    <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                      <span>Change Image</span>
                      <input
                        id="editAppImage"
                        name="appImage"
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Current image will be replaced. Square image recommended (512x512px). Max 5MB.
                  </p>
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
                  onClick={submitTaskUpdate}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Update Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Settings Modal */}
      {settingsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">Task Settings</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="maxTasksPerDay" className="block text-sm font-medium text-gray-700">
                    Default Max Tasks Per Day
                  </label>
                  <input
                    type="number"
                    name="maxTasksPerDay"
                    id="maxTasksPerDay"
                    min="1"
                    max="50"
                    value={taskSettings.maxTasksPerDay}
                    onChange={handleSettingsChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="taskResetHours" className="block text-sm font-medium text-gray-700">
                    Task Reset Hours
                  </label>
                  <input
                    type="number"
                    name="taskResetHours"
                    id="taskResetHours"
                    min="1"
                    max="168"
                    value={taskSettings.taskResetHours}
                    onChange={handleSettingsChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    How often (in hours) user tasks should reset (1-168, where 24 = daily reset)
                  </p>
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
                  onClick={updateTaskSettings}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Save Settings
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
                <h3 className="text-lg font-medium text-gray-900">Reset Tasks</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="resetType" className="block text-sm font-medium text-gray-700">
                    Reset Type
                  </label>
                  <select
                    name="type"
                    id="resetType"
                    value={resetOptions.type}
                    onChange={handleResetOptionsChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    <option value="pending">Reset Pending Tasks Only</option>
                    <option value="all">Reset All Tasks (Pending + Completed)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="resetUserId" className="block text-sm font-medium text-gray-700">
                    User ID (optional)
                  </label>
                  <input
                    type="text"
                    name="userId"
                    id="resetUserId"
                    value={resetOptions.userId}
                    onChange={handleResetOptionsChange}
                    placeholder="Leave blank for all users"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiClock className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        This action will {resetOptions.type === 'all' ? 'clear all tasks' : 'reset pending tasks'} 
                        {resetOptions.userId ? ' for the specified user' : ' for all users'}. 
                        This cannot be undone.
                      </p>
                    </div>
                  </div>
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
                  onClick={resetTasks}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Statistics Modal */}
      {statsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">Task Statistics</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="mt-4">
                <div className="mb-4">
                  <label htmlFor="statsPeriod" className="block text-sm font-medium text-gray-700">
                    Time Period
                  </label>
                  <select
                    name="period"
                    id="statsPeriod"
                    value={stats.period}
                    onChange={(e) => fetchTaskStats(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    <option value="24hours">Last 24 Hours</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                        <FiCheckCircle size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Completed Tasks</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.completedTasks}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                        <FiClock size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.pendingTasks}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <FiDollarSign size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                        <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalEarnings)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Top Performing Apps</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Tasks</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.topApps.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No data available</td>
                          </tr>
                        ) : (
                          stats.topApps.map((app) => (
                            <tr key={app.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <img className="h-10 w-10 rounded-md" src={app.appImage} alt={app.appName} />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{app.appName}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(app.appProfit)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {app.completedTasks}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Set User Task Limit Modal */}
      {userLimitModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">Set User Task Limit</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="limitUserId" className="block text-sm font-medium text-gray-700">
                    User ID
                  </label>
                  <input
                    type="text"
                    name="userId"
                    id="limitUserId"
                    value={userLimitData.userId}
                    onChange={handleUserLimitChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="dailyTasksLimit" className="block text-sm font-medium text-gray-700">
                    Daily Task Limit
                  </label>
                  <input
                    type="number"
                    name="dailyTasksLimit"
                    id="dailyTasksLimit"
                    min="1"
                    max="50"
                    value={userLimitData.dailyTasksLimit}
                    onChange={handleUserLimitChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    required
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
                  onClick={setUserTaskLimit}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Set Limit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ATaskz;