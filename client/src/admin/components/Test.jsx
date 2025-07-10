import { useState, useEffect } from 'react';
import { FiPlus, FiFilter, FiEdit, FiTrash2, FiEye, FiX, FiCheck, FiClock, FiDollarSign } from 'react-icons/fi';
import Sidebar from './Sidebar';

const ATasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    taskType: 'all' // 'all', 'normal', 'combo'
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [comboModalOpen, setComboModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState({
    id: '',
    appName: '',
    appReview: '',
    profit: '',
    depositAmount: '',
    appImage: '',
    isCombo: false
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.taskType !== 'all') queryParams.append('isCombo', filters.taskType === 'combo');
      
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setCurrentTask({
      id: '',
      appName: '',
      appReview: '',
      profit: '',
      depositAmount: '',
      appImage: '',
      isCombo: false
    });
    setModalOpen(true);
  };

  const openComboModal = () => {
    setIsEditMode(false);
    setCurrentTask({
      id: '',
      appName: '',
      appReview: '',
      profit: '',
      depositAmount: '',
      appImage: '',
      isCombo: true
    });
    setComboModalOpen(true);
  };

  const openEditModal = (task) => {
    setIsEditMode(true);
    setCurrentTask({
      id: task.id,
      appName: task.appName,
      appReview: task.appReview,
      profit: task.profit.toString(),
      depositAmount: task.depositAmount ? task.depositAmount.toString() : '',
      appImage: task.appImage,
      isCombo: !!task.depositAmount
    });
    if (task.depositAmount) {
      setComboModalOpen(true);
    } else {
      setModalOpen(true);
    }
  };

  const openDeleteModal = (task) => {
    setCurrentTask({
      id: task.id,
      appName: task.appName
    });
    setDeleteModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setComboModalOpen(false);
    setDeleteModalOpen(false);
    setCurrentTask({
      id: '',
      appName: '',
      appReview: '',
      profit: '',
      depositAmount: '',
      appImage: '',
      isCombo: false
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        appName: currentTask.appName,
        appReview: currentTask.appReview,
        profit: parseFloat(currentTask.profit),
        depositAmount: currentTask.isCombo ? parseFloat(currentTask.depositAmount) : null,
        appImage: currentTask.appImage
      };

      const url = isEditMode 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/${currentTask.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks`;

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} task`);
      }
      
      const data = await response.json();
      alert(data.message || `Task ${isEditMode ? 'updated' : 'created'} successfully`);
      closeModal();
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTask = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/${currentTask.id}`, {
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
      alert(data.message || 'Task deleted successfully');
      closeModal();
      fetchTasks();
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

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar active="tasks" isMobileOpen={isMobileSidebarOpen} toggleMobileSidebar={toggleMobileSidebar} />
      
      <main className="flex-1 p-4 md:p-4 md:ml-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Task Management</h1>
          <div className="flex space-x-2">
            <button
              onClick={openCreateModal}
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              <FiPlus className="mr-2" /> Normal Task
            </button>
            <button
              onClick={openComboModal}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <FiDollarSign className="mr-2" /> Combo Task
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Tasks</h2>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
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
              
              <div>
                <select
                  name="taskType"
                  value={filters.taskType}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Task Types</option>
                  <option value="normal">Normal Tasks</option>
                  <option value="combo">Combo Tasks</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deposit</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No tasks found</td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr 
                        key={task.id} 
                        className={task.depositAmount ? "bg-purple-50 hover:bg-purple-100" : "hover:bg-gray-50"}
                      >
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full" src={task.appImage} alt={task.appName} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{task.appName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-normal text-sm text-gray-500 max-w-xs">
                          <div className="line-clamp-2">{task.appReview}</div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(task.profit)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {task.depositAmount ? (
                            <span className="text-purple-700 font-medium">
                              {formatCurrency(task.depositAmount)}
                            </span>
                          ) : (
                            'None'
                          )}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(task.createdAt)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(task)}
                              className={task.depositAmount ? "text-purple-600 hover:text-purple-900" : "text-teal-600 hover:text-teal-900"}
                            >
                              <FiEdit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(task)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 className="h-5 w-5" />
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
      </main>

      {/* Normal Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditMode ? 'Edit Normal Task' : 'Create New Normal Task'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="appName" className="block text-sm font-medium text-gray-700">App Name*</label>
                    <input
                      type="text"
                      id="appName"
                      name="appName"
                      value={currentTask.appName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="profit" className="block text-sm font-medium text-gray-700">Profit ($)*</label>
                    <input
                      type="number"
                      id="profit"
                      name="profit"
                      value={currentTask.profit}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="appReview" className="block text-sm font-medium text-gray-700">App Review*</label>
                  <textarea
                    id="appReview"
                    name="appReview"
                    rows="3"
                    value={currentTask.appReview}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="appImage" className="block text-sm font-medium text-gray-700">App Image URL*</label>
                  <input
                    type="url"
                    id="appImage"
                    name="appImage"
                    value={currentTask.appImage}
                    onChange={handleInputChange}
                    required
                    placeholder="https://example.com/image.jpg"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                  {currentTask.appImage && (
                    <div className="mt-2">
                      <img 
                        src={currentTask.appImage} 
                        alt="App preview" 
                        className="h-32 object-contain rounded border border-gray-200"
                      />
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    {isEditMode ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Combo Task Modal */}
      {comboModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditMode ? 'Edit Combo Task' : 'Create New Combo Task'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="appName" className="block text-sm font-medium text-gray-700">App Name*</label>
                    <input
                      type="text"
                      id="appName"
                      name="appName"
                      value={currentTask.appName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="profit" className="block text-sm font-medium text-gray-700">Profit ($)*</label>
                    <input
                      type="number"
                      id="profit"
                      name="profit"
                      value={currentTask.profit}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700">Deposit Amount ($)*</label>
                  <input
                    type="number"
                    id="depositAmount"
                    name="depositAmount"
                    value={currentTask.depositAmount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="appReview" className="block text-sm font-medium text-gray-700">App Review*</label>
                  <textarea
                    id="appReview"
                    name="appReview"
                    rows="3"
                    value={currentTask.appReview}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="appImage" className="block text-sm font-medium text-gray-700">App Image URL*</label>
                  <input
                    type="url"
                    id="appImage"
                    name="appImage"
                    value={currentTask.appImage}
                    onChange={handleInputChange}
                    required
                    placeholder="https://example.com/image.jpg"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                  {currentTask.appImage && (
                    <div className="mt-2">
                      <img 
                        src={currentTask.appImage} 
                        alt="App preview" 
                        className="h-32 object-contain rounded border border-gray-200"
                      />
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    {isEditMode ? 'Update Combo Task' : 'Create Combo Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">Delete Task</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete the task <span className="font-medium text-gray-900">"{currentTask.appName}"</span>? This action cannot be undone.
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
                  onClick={deleteTask}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ATasks;