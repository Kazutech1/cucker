import { useState } from 'react';
import axios from 'axios';

const useNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem('admin_token') || '';
  };

  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  // Send a new notification
  const sendNotification = async (title, message, type = 'info') => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/admin/notifications', {
        title,
        message,
        type
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send notification');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get notifications with optional filters
  const getNotifications = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/admin/notifications', {
        params: {
          isRead: params?.isRead,
          limit: params?.limit,
          type: params?.type
        }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete(`/api/admin/notifications/${notificationId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete notification');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    sendNotification,
    getNotifications,
    deleteNotification
  };
};

export default useNotifications;