import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiRefreshCw } from 'react-icons/fi';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  // Format notification date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday at ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' }) + ' at ' + 
        date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setError(null);
      setRefreshing(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
          return;
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch notifications`);
      }

      const data = await response.json()
      console.log(data)
      
      if (!data.success) {
        throw new Error(data.message || 'Invalid response from server');
      }

      // Handle both possible response formats
      const notificationsData = data.messages || data.data || [];
      setNotifications(notificationsData);

    } catch (error) {
      console.error('Notifications fetch error:', error);
      setError(error.message || 'Failed to load notifications. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initialize data fetching
  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  // Get type styling based on notification type
  const getTypeStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-400/10 text-green-400 border-green-400/30';
      case 'warning':
        return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30';
      case 'error':
        return 'bg-red-400/10 text-red-400 border-red-400/30';
      case 'announcement':
        return 'bg-purple-400/10 text-purple-400 border-purple-400/30';
      default:
        return 'bg-blue-400/10 text-blue-400 border-blue-400/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-16">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-15 p-5 flex justify-between items-center bg-black/30 backdrop-blur-md border-b border-teal-400/15">
        <div className="bg-black/60 backdrop-blur-md border border-teal-400/15 rounded-xl px-5 py-3 flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-teal-500 rounded-md flex items-center justify-center">
            <svg fill="white" viewBox="0 0 24 24" width="16" height="16">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold">
            <span className="text-white">Siemens</span>
            <span className="text-teal-400">X</span>
          </h2>
        </div>
        <button 
          onClick={() => navigate('/home')}
          className="bg-black/60 backdrop-blur-md border border-teal-400/15 rounded-xl p-3 cursor-pointer hover:bg-teal-400/10 hover:scale-105 transition-all"
        >
          <FiArrowLeft className="w-6 h-6 text-teal-400" />
        </button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-32 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent">
          Notifications
        </h1>

        {/* Loading State */}
        {loading && (
          <div className="bg-black/30 backdrop-blur-md border border-teal-400/20 rounded-xl p-8 text-center">
            <div className="inline-block w-8 h-8 border-2 border-white/30 border-t-teal-400 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Loading notifications...</p>
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchNotifications}
              disabled={refreshing}
              className={`flex items-center justify-center mx-auto px-4 py-2 rounded-lg bg-teal-400/10 border border-teal-400/30 text-teal-400 transition-all ${
                refreshing ? 'opacity-70' : 'hover:bg-teal-400/20 hover:-translate-y-0.5'
              }`}
            >
              {refreshing ? (
                <>
                  <FiRefreshCw className="animate-spin mr-2" />
                  Refreshing...
                </>
              ) : (
                'Try Again'
              )}
            </button>
          </div>
        )}

        {/* Notifications List */}
        {!loading && !error && notifications.length > 0 && (
          <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl">
            {notifications.map((notification, index) => {
              // Handle different notification formats
              const title = notification.title || 'Notification';
              const message = notification.message || notification.content || 'No message content';
              const type = notification.type || 'info';
              const isRead = notification.isRead || notification.read || false;
              const date = notification.createdAt || notification.date || notification.timestamp || new Date().toISOString();

              return (
                <div 
                  key={index} 
                  className={`p-5 border-b border-teal-400/10 transition-all hover:bg-black/40 hover:border-teal-400/30 ${
                    index === 0 ? 'rounded-t-xl' : ''
                  } ${index === notifications.length - 1 ? 'border-b-0 rounded-b-xl' : ''}`}
                >
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-teal-400 flex-1">{title}</h3>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider border ${getTypeStyle(type)}`}>
                      {type}
                    </span>
                  </div>
                  <p className="text-gray-200 mb-4">{message}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">{formatDate(date)}</span>
                    <span className={`text-xs px-2 py-1 rounded ${isRead ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
                      {isRead ? (
                        <span className="flex items-center">
                          <FiCheck className="mr-1" /> Read
                        </span>
                      ) : 'New'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No Notifications */}
        {!loading && !error && notifications.length === 0 && (
          <div className="bg-black/30 backdrop-blur-md border border-teal-400/20 rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-teal-400 opacity-50">
              <FiCheck className="w-full h-full" />
            </div>
            <h3 className="text-xl text-teal-400 mb-2">All caught up!</h3>
            <p className="text-gray-400 mb-6">No new notifications at the moment.</p>
            <button
              onClick={fetchNotifications}
              disabled={refreshing}
              className={`flex items-center justify-center mx-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 text-white font-medium transition-all ${
                refreshing ? 'opacity-70' : 'hover:-translate-y-0.5 hover:shadow-lg'
              }`}
            >
              {refreshing ? (
                <>
                  <FiRefreshCw className="animate-spin mr-2" />
                  Checking...
                </>
              ) : 'Check for Updates'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;