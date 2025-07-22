import { useState } from 'react';
import axios from 'axios';

const useUserAdmin = () => {
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

  // Get all users
  const getUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/admin/users');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user by ID
  const getUserById = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/admin/users/${userId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const updateUser = async (userId, userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/api/admin/users/${userId}`, userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete(`/api/admin/users/${userId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  };


  const deactivateUserTasks = async (userId) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await api.post('/api/admin/deactivate-tasks', { userId });
    
    return response.data;
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to deactivate user tasks');
    throw err;
  } finally {
    setLoading(false);
  }
};

  return {
    loading,
    error,
    getUsers,
    getUserById,
    updateUser,
    deactivateUserTasks,
    deleteUser
  };
};

export default useUserAdmin;