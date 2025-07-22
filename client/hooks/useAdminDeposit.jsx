import { useState } from 'react';
import axios from 'axios';

const useDepositAdmin = () => {
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

  // Get all pending deposits
  const getPendingDeposits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/admin/deposits', {
        // params: { status: 'pending' }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch deposits');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get deposit by ID
  const getDepositById = async (depositId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/admin/deposits/${depositId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch deposit');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify/Reject deposit
  const verifyDeposit = async (depositId, status, adminNote = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put('/api/admin/deposits/verify', {
        depositId,
        status,
        adminNote
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify deposit');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getPendingDeposits,
    getDepositById,
    verifyDeposit
  };
};

export default useDepositAdmin;