import React, { useState, useEffect } from 'react';
import { 
  Bell,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  AlertCircle,
  Info,
  Mail,
  Clock
} from 'lucide-react';
import useNotifications from '../../../hooks/useAdminNotifications';

const Notifications = () => {
  const {
    loading,
    error,
    sendNotification,
    getNotifications,
    deleteNotification
  } = useNotifications();

  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info'
  });

  // Fetch all notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      if (Array.isArray(data?.data)) {
        setNotifications(data.data);
      } else {
        setToast({
          show: true,
          message: 'Invalid notifications data received',
          type: 'error'
        });
      }
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to load notifications',
        type: 'error'
      });
    }
  };

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setToast({
        show: true,
        message: 'Notification deleted successfully',
        type: 'success'
      });
      fetchNotifications();
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to delete notification',
        type: 'error'
      });
    }
  };

  const handleCreateNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      setToast({
        show: true,
        message: 'Title and message are required',
        type: 'error'
      });
      return;
    }

    try {
      await sendNotification(
        newNotification.title,
        newNotification.message,
        newNotification.type
      );
      setToast({
        show: true,
        message: 'Notification created successfully',
        type: 'success'
      });
      setShowCreateModal(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'info'
      });
      fetchNotifications();
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to create notification',
        type: 'error'
      });
    }
  };

  const formatDate = (dateString) => {
    try {
      return dateString ? new Date(dateString).toLocaleString() : 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      info: <Info className="text-blue-500" size={18} />,
      warning: <AlertCircle className="text-yellow-500" size={18} />,
      error: <XCircle className="text-red-500" size={18} />,
      success: <CheckCircle className="text-green-500" size={18} />
    };
    return icons[type] || icons.info;
  };

  const getTypeBadge = (type) => {
    const typeClasses = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      success: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeClasses[type] || 'bg-gray-100 text-gray-800'}`}>
        {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'}
      </span>
    );
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center">
            <Bell className="mr-2" size={24} />
            Notification Management
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Create Notification
          </button>
        </div>

        {/* Notifications Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-800">All Notifications</h3>
          </div>
          
          {loading && !notifications.length ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No notifications found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTypeIcon(notification.type)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {notification.title || 'No title'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {notification.message || 'No message'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(notification.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="mr-1" size={14} />
                          {formatDate(notification.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewNotification(notification)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Eye className="inline mr-1" size={16} />
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="inline mr-1" size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Notification Detail Modal */}
        {showModal && selectedNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-down">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold flex items-center">
                    {getTypeIcon(selectedNotification.type)}
                    <span className="ml-2">{selectedNotification.title}</span>
                  </h3>
                     <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={isCreating} // Disable close while creating
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Details</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{getTypeBadge(selectedNotification.type)}</span>
                      </div>
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">{formatDate(selectedNotification.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Message</h4>
                    <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                      {selectedNotification.message}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      handleDelete(selectedNotification.id);
                      setShowModal(false);
                    }}
                    className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="mr-2" size={16} />
                    Delete Notification
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Notification Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-down">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold">
                    Create New Notification
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                      placeholder="Notification title"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      value={newNotification.message}
                      onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                      rows={4}
                      placeholder="Notification message"
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      id="type"
                      value={newNotification.type}
                      onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                      <option value="success">Success</option>
                    </select>
                  </div>
                </div>

               
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={isCreating} // Disable cancel while creating
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateNotification}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 flex items-center justify-center min-w-32"
                    disabled={isCreating} // Disable button while creating
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Notification'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {/* {toast.show && (
          <Toast
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({...toast, show: false})} 
          />
        )} */}
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Notifications;