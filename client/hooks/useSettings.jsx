import { useState } from 'react';
import axios from 'axios';

const useAppSettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('admin_token') || '';
  };

  // Create axios instance with default headers
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  // Get app settings
  const getAppSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/admin/settings');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch settings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update app settings
  const updateAppSettings = async (settingsData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put('/api/admin/settings', settingsData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset settings to defaults
  const resetAppSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/admin/settings/reset');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset settings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getAppSettings,
    updateAppSettings,
    resetAppSettings,
  };
};

export default useAppSettings;