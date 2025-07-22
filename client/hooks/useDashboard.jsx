import { useState, useEffect } from 'react';
import axios from 'axios';

const useAdminAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  // Get admin token from localStorage or context
  const getAdminToken = () => {
    return localStorage.getItem('admin_token'); // Or your preferred storage method
  };

  // Create axios instance with auth headers
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAdminToken()}`
    }
  });

  // Get dashboard stats
  const getDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/stats');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get all users
  const getUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/users');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      setLoading(true);
      const response = await api.delete(`/api/admin/users/${userId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user role or status
  const updateUser = async (userId, updateData) => {
    try {
      setLoading(true);
      const response = await api.patch(
        `/api/admin/users/${userId}`,
        updateData
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add admin login function
  const adminLogin = async (credentials) => {
    try {
      setLoading(true);
      const response = await axios.post(`${baseURL}/api/admin/login`, credentials);
      localStorage.setItem('adminToken', response.data.token); // Store the token
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add admin logout function
  const adminLogout = () => {
    localStorage.removeItem('adminToken');
  };

  // Verify admin token
  const verifyAdminToken = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/verify-token');
      return response.data.valid;
    } catch (err) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getDashboardStats,
    getUsers,
    deleteUser,
    updateUser,
    adminLogin,
    adminLogout,
    verifyAdminToken
  };
};

export default useAdminAPI;