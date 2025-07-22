import { useState } from 'react';
import axios from 'axios';

const useWithdrawal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem('token') || '';
  };

  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  // Set withdrawal address
  const setWithdrawalAddress = async (address) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/withdrawal/address', { address });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set address');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get withdrawal info
  const getWithdrawalInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/withdrawal/info');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get withdrawal info');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Request withdrawal
  const requestWithdrawal = async (amount, withdrawalPassword) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/withdrawal/request', {
        amount,
        withdrawalPassword
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request withdrawal');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    setWithdrawalAddress,
    getWithdrawalInfo,
    requestWithdrawal
  };
};

export default useWithdrawal;