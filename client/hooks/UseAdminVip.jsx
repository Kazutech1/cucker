import { useState } from 'react';
import axios from 'axios';

const useVipAdmin = () => {
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

  // Get all VIP levels
  const getVipLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/admin/vip-levels');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch VIP levels');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user VIP level
  const updateUserVipLevel = async (userId, level) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put('/api/admin/users/vip', {
        userId,
        level
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user VIP level');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create new VIP level
  const createVipLevel = async (levelData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/admin/vip-levels', levelData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create VIP level');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update VIP level details
  const updateVipLevelDetails = async (level, levelData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/api/admin/vip-levels/${level}`, levelData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update VIP level');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete VIP level
  const deleteVipLevel = async (level) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete(`/api/admin/vip-levels/${level}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete VIP level');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getVipLevels,
    updateUserVipLevel,
    createVipLevel,
    updateVipLevelDetails,
    deleteVipLevel
  };
};

export default useVipAdmin;