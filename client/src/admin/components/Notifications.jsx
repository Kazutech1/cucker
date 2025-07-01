import { useState, useEffect } from 'react';
import { 
  FiFilter, 
  FiRefreshCw, 
  FiX, 
  FiCheck, 
  FiTrash2,
  FiAlertCircle,
  FiCheckCircle,
  FiAlertTriangle,
  FiBell,
  FiInfo,
  FiClock,
  FiEye
} from 'react-icons/fi';
import Sidebar from './Sidebar';

const ANotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    isRead: '',
    limit: ''
  });
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info'
  });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.isRead) queryParams.append('isRead', filters.isRead);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/notifications?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.data || data);
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

  const handleNewNotificationChange = (e) => {
    const { name, value } = e.target;
    setNewNotification(prev => ({ ...prev, [name]: value }));
  };

  const sendNotification = async () => {
    try {
      if (!newNotification.title.trim() || !newNotification.message.trim()) {
        setError('Title and message are required');
        return;
      }

      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNotification)
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error('Failed to send notification');
      }

      const data = await response.json();
      setSuccess(data.message);
      setNewNotification({
        title: '',
        message: '',
        type: 'info'
      });
      fetchNotifications();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (notification) => {
    setSelectedNotification(notification);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedNotification(null);
  };

  const openDeleteModal = (notificationId) => {
    setNotificationToDelete(notificationId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setNotificationToDelete(null);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };


  const deleteNotification = async () => {
    if (!notificationToDelete) return;

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/notifications/${notificationToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error('Failed to delete notification');
      }

      const data = await response.json();
      setSuccess(data.message);
      closeDeleteModal();
      fetchNotifications();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'announcement': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeClass = (isRead) => {
    return isRead ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'info': return <FiInfo className="mr-1" />;
      case 'success': return <FiCheckCircle className="mr-1" />;
      case 'warning': return <FiAlertTriangle className="mr-1" />;
      case 'error': return <FiAlertCircle className="mr-1" />;
      case 'announcement': return <FiBell className="mr-1" />;
      default: return <FiInfo className="mr-1" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar active="notifications" isMobileOpen={isMobileSidebarOpen} toggleMobileSidebar={toggleMobileSidebar}/>
      
      <main className="flex-1 p-4 md:p-1 md:ml-64">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Notifications Management</h1>
        
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

        {/* Create Notification Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Send New Notification</h2>
          </div>
          
          <div className="p-4 md:p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newNotification.title}
                  onChange={handleNewNotificationChange}
                  maxLength={100}
                  placeholder="Enter notification title"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
                <div className="text-xs text-gray-500 text-right mt-1">
                  {newNotification.title.length}/100 characters
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={newNotification.message}
                  onChange={handleNewNotificationChange}
                  maxLength={500}
                  rows={4}
                  placeholder="Enter notification message"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
                <div className="text-xs text-gray-500 text-right mt-1">
                  {newNotification.message.length}/500 characters
                </div>
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  id="type"
                  name="type"
                  value={newNotification.type}
                  onChange={handleNewNotificationChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={sendNotification}
                  disabled={loading}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center"
                >
                  {loading ? 'Sending...' : (
                    <>
                      <FiCheck className="mr-1" /> Send Notification
                    </>
                  )}
                </button>
                <button
                  onClick={() => setNewNotification({
                    title: '',
                    message: '',
                    type: 'info'
                  })}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Clear Form
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-0">All Notifications</h2>
              
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
                <div className="relative">
                  <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">All Types</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="announcement">Announcement</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiFilter className="text-gray-400" />
                  </div>
                </div>
                
                <div className="relative">
                  <select
                    name="isRead"
                    value={filters.isRead}
                    onChange={handleFilterChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">All Status</option>
                    <option value="false">Unread</option>
                    <option value="true">Read</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiBell className="text-gray-400" />
                  </div>
                </div>
                
                <div className="relative">
                  <select
                    name="limit"
                    value={filters.limit}
                    onChange={handleFilterChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">All</option>
                    <option value="10">Last 10</option>
                    <option value="25">Last 25</option>
                    <option value="50">Last 50</option>
                    <option value="100">Last 100</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiClock className="text-gray-400" />
                  </div>
                </div>
                
                <button
                  onClick={fetchNotifications}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center"
                >
                  <FiRefreshCw className="mr-1" /> Refresh
                </button>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notifications.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No notifications found</td>
                    </tr>
                  ) : (
                    notifications.map((notification) => (
                      <tr key={notification.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{notification.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {truncateText(notification.title, 30)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {truncateText(notification.message, 50)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeClass(notification.type)}`}>
                            {getTypeIcon(notification.type)}
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(notification.isRead)}`}>
                            {notification.isRead ? 'Read' : 'Unread'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(notification.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openViewModal(notification)}
                              className="text-teal-600 hover:text-teal-900 flex items-center"
                            >
                              <FiEye className="mr-1" /> View
                            </button>
                            <button
                              onClick={() => openDeleteModal(notification.id)}
                              className="text-red-600 hover:text-red-900 flex items-center"
                            >
                              <FiTrash2 className="mr-1" /> Delete
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

      {/* View Notification Modal */}
      {viewModalOpen && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">Notification Details</h3>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedNotification.title}</p>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedNotification.message}</p>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeClass(selectedNotification.type)}`}>
                    {getTypeIcon(selectedNotification.type)}
                    {selectedNotification.type.charAt(0).toUpperCase() + selectedNotification.type.slice(1)}
                  </span>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedNotification.isRead)}`}>
                    {selectedNotification.isRead ? 'Read' : 'Unread'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created At</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedNotification.createdAt)}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Close
                </button>
              </div>
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
                <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-700">Are you sure you want to delete this notification? This action cannot be undone.</p>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteNotification}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ANotifications;