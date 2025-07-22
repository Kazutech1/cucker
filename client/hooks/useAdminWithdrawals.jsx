import { useState } from 'react';
import axios from 'axios';

const useWithdrawalAdmin = () => {
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

  // Get all withdrawals
  const getWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/admin/withdrawals');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch withdrawals');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get withdrawal by ID
  const getWithdrawalById = async (withdrawalId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/admin/withdrawals/${withdrawalId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch withdrawal');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Process withdrawal (approve/reject)
  const processWithdrawal = async (withdrawalId, status) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put('/api/admin/withdrawals/process', {
        withdrawalId,
        status
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process withdrawal');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getWithdrawals,
    getWithdrawalById,
    processWithdrawal
  };
};

export default useWithdrawalAdmin;