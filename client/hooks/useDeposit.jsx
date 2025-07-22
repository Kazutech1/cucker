import { useState } from 'react';
import axios from 'axios';

const useDeposit = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token') || '';
  };

  // Create axios instance with auth headers
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  // Get deposit addresses
  const getDepositAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/deposit/info');
      return response.data.addresses;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch deposit addresses');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Submit deposit proof
  const submitDepositProof = async (depositData, proofImage) => {
    try {
      setLoading(true);
      setError(null);

      // Create FormData if image is included
      const formData = new FormData();
      formData.append('amount', depositData.amount);
      formData.append('currency', depositData.currency);
      if (depositData.txHash) formData.append('txHash', depositData.txHash);
      if (proofImage) formData.append('proofImage', proofImage);

      // Use different content-type for file upload
      const config = proofImage 
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};

      const response = await api.post('/api/deposit/submit', formData, config);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit deposit proof');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check deposit status
  const checkDepositStatus = async (depositId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/deposit/status/${depositId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check deposit status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getDepositAddresses,
    submitDepositProof,
    checkDepositStatus,
  };
};

export default useDeposit;