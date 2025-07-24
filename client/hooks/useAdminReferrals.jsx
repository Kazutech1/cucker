// useAdminReferralInfo.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useAdminReferralInfo = (userId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem('admin_token') || '';
  };

  const fetchReferralInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${baseURL}/api/admin/referrals/${userId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch referral info');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchReferralInfo();
  };

  useEffect(() => {
    if (userId) {
      fetchReferralInfo();
    }
  }, [userId]);

  return {
    data: {
      user: data?.user || null,
      referredUsers: data?.referredUsers || [],
      referralEarnings: data?.referralEarnings || [],
      totalEarned: data?.totalEarned || 0,
      totalReferrals: data?.totalReferrals || 0,
      activeReferrals: data?.activeReferrals || 0
    },
    loading,
    error,
    refetch
  };
};

export default useAdminReferralInfo;