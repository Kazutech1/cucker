import { useState, useEffect } from 'react';
import { 
  FiFilter, 
  FiX, 
  FiCheck, 
  FiClock, 
  FiPlus, 
  FiEdit, 
  FiTrash2,
  FiRefreshCw,
  FiUsers,
  FiBarChart2,
  FiUser,
  FiDollarSign,
  FiCheckCircle,
  FiUpload
} from 'react-icons/fi';
import Sidebar from './Sidebar';

const ATasks = () => {
  // State for different sections
  const [activeTab, setActiveTab] = useState('appReviews');
  const [appReviews, setAppReviews] = useState([]);
  const [usersWithTasks, setUsersWithTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // State for modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [userLimitModalOpen, setUserLimitModalOpen] = useState(false);
  
  // State for forms
  const [newAppReview, setNewAppReview] = useState({
    appName: '',
    appImage: null, // Changed from string to File object
    appReview: '',
    appProfit: '',
    totalTasks: '100',
    isActive: true
  });
  
  const [editAppReview, setEditAppReview] = useState({
    id: '',
    appName: '',
    appImage: null, // Can be either File object or string URL
    appReview: '',
    appProfit: '',
    totalTasks: '',
    isActive: true
  });
  
  const [resetOptions, setResetOptions] = useState({
    resetType: 'pending',
    userId: ''
  });
  
  const [userLimit, setUserLimit] = useState({
    userId: '',
    dailyTaskLimit: '5'
  });
  
  // Preview images
  const [createPreview, setCreatePreview] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  
  // Filter states
  const [appReviewFilter, setAppReviewFilter] = useState({
    isActive: ''
  });
  
  const [analyticsFilter, setAnalyticsFilter] = useState({
    period: '7days'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        switch (activeTab) {
          case 'appReviews':
            await fetchAppReviews();
            break;
          case 'userManagement':
            await fetchUsersWithTasks();
            break;
          case 'analytics':
            await fetchAnalytics();
            break;
          default:
            break;
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab, appReviewFilter, analyticsFilter]);

  const fetchAppReviews = async () => {
    const queryParams = new URLSearchParams();
    if (appReviewFilter.isActive !== '') queryParams.append('isActive', appReviewFilter.isActive);
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/reviews?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch app reviews');
    
    const data = await response.json();
    setAppReviews(data.data);
  };

  const fetchUsersWithTasks = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/pending`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch users with pending tasks');
    
    const data = await response.json();
    console.log(data);
    
    setUsersWithTasks(data.data.users);
  };

  const fetchAnalytics = async () => {
    const queryParams = new URLSearchParams();
    if (analyticsFilter.period) queryParams.append('period', analyticsFilter.period);
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/analytics?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch task analytics');
    
    const data = await response.json();
    setAnalytics(data.data);
  };

  const handleCreateImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAppReview({
        ...newAppReview,
        appImage: file
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setCreatePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditAppReview({
        ...editAppReview,
        appImage: file
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const createAppReview = async () => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('appName', newAppReview.appName);
      if (newAppReview.appImage) {
        formData.append('appImage', newAppReview.appImage);
      }
      formData.append('appReview', newAppReview.appReview);
      formData.append('appProfit', newAppReview.appProfit);
      formData.append('totalTasks', newAppReview.totalTasks);
      formData.append('isActive', newAppReview.isActive);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to create app review');
      
      const data = await response.json();
      setAppReviews([data.data, ...appReviews]);
      setCreateModalOpen(false);
      setNewAppReview({
        appName: '',
        appImage: null,
        appReview: '',
        appProfit: '',
        totalTasks: '100',
        isActive: true
      });
      setCreatePreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAppReview = async () => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('appName', editAppReview.appName);
      if (editAppReview.appImage instanceof File) {
        formData.append('appImage', editAppReview.appImage);
      } else if (editAppReview.appImage === null) {
        formData.append('removeImage', 'true');
      }
      formData.append('appReview', editAppReview.appReview);
      formData.append('appProfit', editAppReview.appProfit);
      formData.append('totalTasks', editAppReview.totalTasks);
      formData.append('isActive', editAppReview.isActive);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/reviews/${editAppReview.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to update app review');
      
      const data = await response.json();
      setAppReviews(appReviews.map(review => 
        review.id === editAppReview.id ? data.data : review
      ));
      setEditModalOpen(false);
      setEditPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAppReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this app review? All associated tasks will also be deleted.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete app review');
      
      setAppReviews(appReviews.filter(review => review.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAllTasks = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/reset-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resetType: resetOptions.resetType })
      });
      
      if (!response.ok) throw new Error('Failed to reset tasks');
      
      const data = await response.json();
      alert(data.message);
      setResetModalOpen(false);
      if (activeTab === 'userManagement') {
        await fetchUsersWithTasks();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetUserTasks = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/reset-user/${resetOptions.userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resetType: resetOptions.resetType })
      });
      
      if (!response.ok) throw new Error('Failed to reset user tasks');
      
      const data = await response.json();
      alert(data.message);
      setResetModalOpen(false);
      await fetchUsersWithTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserTaskLimit = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/limit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userLimit.userId,
          dailyTaskLimit: userLimit.dailyTaskLimit
        })
      });
      
      if (!response.ok) throw new Error('Failed to update user task limit');
      
      const data = await response.json();
      alert(data.message);
      setUserLimitModalOpen(false);
      await fetchUsersWithTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (appReview) => {
    setEditAppReview({
      id: appReview.id,
      appName: appReview.appName,
      appImage: appReview.appImage, // This will be the URL string initially
      appReview: appReview.appReview,
      appProfit: appReview.appProfit.toString(),
      totalTasks: appReview.totalTasks.toString(),
      isActive: appReview.isActive
    });
    setEditPreview(appReview.appImage); // Set preview to existing image URL
    setEditModalOpen(true);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
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

  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const getTaskCompletion = (appReview) => {
    if (appReview.totalTasks === 0) return 'Unlimited';
    return `${appReview._count?.tasks || 0}/${appReview.totalTasks}`;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar active="tasks" isMobileOpen={isMobileSidebarOpen} toggleMobileSidebar={toggleMobileSidebar} />
      
      <main className="flex-1 p-2 md:p-6 md:ml-64">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Task Management</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('appReviews')}
              className={`${activeTab === 'appReviews' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              App Reviews
            </button>
            <button
              onClick={() => setActiveTab('userManagement')}
              className={`${activeTab === 'userManagement' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`${activeTab === 'analytics' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* App Reviews Tab */}
        {activeTab === 'appReviews' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">App Review Tasks</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select
                    value={appReviewFilter.isActive}
                    onChange={(e) => setAppReviewFilter({...appReviewFilter, isActive: e.target.value})}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiFilter className="text-gray-400" />
                  </div>
                </div>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                  New App Review
                </button>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appReviews.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No app reviews found</td>
                      </tr>
                    ) : (
                      appReviews.map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50">
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
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 line-clamp-2">{app.appReview}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${parseFloat(app.appProfit).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getTaskCompletion(app)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(app.isActive)}`}>
                              {app.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(app.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => openEditModal(app)}
                              className="text-teal-600 hover:text-teal-900 mr-4"
                              title="Edit"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => deleteAppReview(app.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
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
        )}

        {/* User Management Tab */}
        {activeTab === 'userManagement' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">Users with Pending Tasks</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setResetModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <FiRefreshCw className="-ml-1 mr-2 h-5 w-5" />
                    Reset Tasks
                  </button>
                  <button
                    onClick={() => setUserLimitModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    <FiUser className="-ml-1 mr-2 h-5 w-5" />
                    Set Task Limit
                  </button>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Tasks</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Limit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Reset</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {usersWithTasks.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No users with pending tasks found</td>
                        </tr>
                      ) : (
                        usersWithTasks.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.username || user.email}</div>
                                  <div className="text-sm text-gray-500">{user.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.pendingTasks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.dailyTasksLimit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.lastTaskReset ? formatDate(user.lastTaskReset) : 'Never'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  setResetOptions({
                                    resetType: 'all',
                                    userId: user.id
                                  });
                                  setResetModalOpen(true);
                                }}
                                className="text-orange-600 hover:text-orange-900 mr-4"
                                title="Reset user tasks"
                              >
                                <FiRefreshCw />
                              </button>
                              <button
                                onClick={() => {
                                  setUserLimit({
                                    userId: user.id,
                                    dailyTaskLimit: user.dailyTasksLimit.toString()
                                  });
                                  setUserLimitModalOpen(true);
                                }}
                                className="text-teal-600 hover:text-teal-900"
                                title="Set task limit"
                              >
                                <FiEdit />
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
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">Task Analytics</h2>
                <div className="relative">
                  <select
                    value={analyticsFilter.period}
                    onChange={(e) => setAnalyticsFilter({...analyticsFilter, period: e.target.value})}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="24hours">Last 24 Hours</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiFilter className="text-gray-400" />
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center p-5">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                </div>
              ) : analytics ? (
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                          <FiCheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Completed Tasks</h3>
                          <p className="text-2xl font-bold text-gray-900">{analytics.completedTasks}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                          <FiClock className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Pending Tasks</h3>
                          <p className="text-2xl font-bold text-gray-900">{analytics.pendingTasks}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                          <FiDollarSign className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Total Earnings</h3>
                          <p className="text-2xl font-bold text-gray-900">${parseFloat(analytics.totalEarnings).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Apps</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit per Task</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Tasks</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analytics.topApps.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No data available</td>
                            </tr>
                          ) : (
                            analytics.topApps.map((app) => (
                              <tr key={app.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{app.appName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ${parseFloat(app.appProfit).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {app.completedTasks}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  ${parseFloat(app.appProfit * app.completedTasks).toFixed(2)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">No analytics data available</div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Create App Review Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">Create New App Review</h3>
                <button
                  onClick={() => setCreateModalOpen(false)}
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
                    value={newAppReview.appName}
                    onChange={(e) => setNewAppReview({...newAppReview, appName: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="appImage" className="block text-sm font-medium text-gray-700">App Image</label>
                  <div className="mt-1 flex items-center">
                    <label className="cursor-pointer">
                      <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        <FiUpload className="-ml-1 mr-2 h-5 w-5" />
                        Upload Image
                      </div>
                      <input
                        type="file"
                        id="appImage"
                        name="appImage"
                        accept="image/*"
                        onChange={handleCreateImageChange}
                        className="sr-only"
                      />
                    </label>
                    {createPreview && (
                      <div className="ml-4 flex-shrink-0">
                        <img className="h-10 w-10 rounded-md object-cover" src={createPreview} alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="appReview" className="block text-sm font-medium text-gray-700">Review Instructions</label>
                  <textarea
                    id="appReview"
                    name="appReview"
                    rows={3}
                    value={newAppReview.appReview}
                    onChange={(e) => setNewAppReview({...newAppReview, appReview: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="appProfit" className="block text-sm font-medium text-gray-700">Profit per Task ($)</label>
                  <input
                    type="number"
                    id="appProfit"
                    name="appProfit"
                    min="0.01"
                    step="0.01"
                    value={newAppReview.appProfit}
                    onChange={(e) => setNewAppReview({...newAppReview, appProfit: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="totalTasks" className="block text-sm font-medium text-gray-700">Total Tasks (0 for unlimited)</label>
                  <input
                    type="number"
                    id="totalTasks"
                    name="totalTasks"
                    min="0"
                    value={newAppReview.totalTasks}
                    onChange={(e) => setNewAppReview({...newAppReview, totalTasks: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={newAppReview.isActive}
                    onChange={(e) => setNewAppReview({...newAppReview, isActive: e.target.checked})}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  onClick={createAppReview}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit App Review Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">Edit App Review</h3>
                <button
                  onClick={() => setEditModalOpen(false)}
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
                    value={editAppReview.appName}
                    onChange={(e) => setEditAppReview({...editAppReview, appName: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="editAppImage" className="block text-sm font-medium text-gray-700">App Image</label>
                  <div className="mt-1 flex items-center">
                    <label className="cursor-pointer">
                      <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        <FiUpload className="-ml-1 mr-2 h-5 w-5" />
                        Change Image
                      </div>
                      <input
                        type="file"
                        id="editAppImage"
                        name="appImage"
                        accept="image/*"
                        onChange={handleEditImageChange}
                        className="sr-only"
                      />
                    </label>
                    {editPreview && (
                      <div className="ml-4 flex-shrink-0">
                        <img className="h-10 w-10 rounded-md object-cover" src={editPreview} alt="Preview" />
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setEditAppReview({...editAppReview, appImage: null});
                        setEditPreview(null);
                      }}
                      className="ml-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="editAppReview" className="block text-sm font-medium text-gray-700">Review Instructions</label>
                  <textarea
                    id="editAppReview"
                    name="appReview"
                    rows={3}
                    value={editAppReview.appReview}
                    onChange={(e) => setEditAppReview({...editAppReview, appReview: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="editAppProfit" className="block text-sm font-medium text-gray-700">Profit per Task ($)</label>
                  <input
                    type="number"
                    id="editAppProfit"
                    name="appProfit"
                    min="0.01"
                    step="0.01"
                    value={editAppReview.appProfit}
                    onChange={(e) => setEditAppReview({...editAppReview, appProfit: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="editTotalTasks" className="block text-sm font-medium text-gray-700">Total Tasks (0 for unlimited)</label>
                  <input
                    type="number"
                    id="editTotalTasks"
                    name="totalTasks"
                    min="0"
                    value={editAppReview.totalTasks}
                    onChange={(e) => setEditAppReview({...editAppReview, totalTasks: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    name="isActive"
                    checked={editAppReview.isActive}
                    onChange={(e) => setEditAppReview({...editAppReview, isActive: e.target.checked})}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="editIsActive" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  onClick={updateAppReview}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Update
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
                  {resetOptions.userId ? 'Reset User Tasks' : 'Reset All Tasks'}
                </h3>
                <button
                  onClick={() => setResetModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="resetType" className="block text-sm font-medium text-gray-700">Reset Type</label>
                  <select
                    id="resetType"
                    name="resetType"
                    value={resetOptions.resetType}
                    onChange={(e) => setResetOptions({...resetOptions, resetType: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    <option value="pending">Pending Tasks Only</option>
                    <option value="all">All Tasks (Pending & Completed)</option>
                  </select>
                </div>
                
                {resetOptions.userId && (
                  <div>
                    <p className="text-sm text-gray-500">
                      This will reset tasks for a specific user. To reset all users' tasks, use the "Reset All" button.
                    </p>
                  </div>
                )}
                
                {!resetOptions.userId && (
                  <div>
                    <p className="text-sm text-red-500 font-medium">
                      Warning: This will reset tasks for ALL users in the system. This action cannot be undone.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  onClick={resetOptions.userId ? resetUserTasks : resetAllTasks}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Confirm Reset
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
                <h3 className="text-lg font-medium text-gray-900">Set User Daily Task Limit</h3>
                <button
                  onClick={() => setUserLimitModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700">User ID</label>
                  <input
                    type="text"
                    id="userId"
                    name="userId"
                    value={userLimit.userId}
                    onChange={(e) => setUserLimit({...userLimit, userId: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="dailyTaskLimit" className="block text-sm font-medium text-gray-700">Daily Task Limit</label>
                  <input
                    type="number"
                    id="dailyTaskLimit"
                    name="dailyTaskLimit"
                    min="1"
                    value={userLimit.dailyTaskLimit}
                    onChange={(e) => setUserLimit({...userLimit, dailyTaskLimit: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setUserLimitModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  onClick={updateUserTaskLimit}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Update Limit
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