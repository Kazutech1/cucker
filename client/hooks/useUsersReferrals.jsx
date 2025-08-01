// hooks/useUserReferral.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useUserReferral = (userId) => {
  const [referralInfo, setReferralInfo] = useState(null);
  const [referredUsers, setReferredUsers] = useState([]);
  const [loading, setLoading] = useState({
    info: false,
    users: false
  });
  const [error, setError] = useState({
    info: null,
    users: null
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem('token') || '';
  };

  const api = axios.create({
    baseURL,
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  // Fetch basic referral info
  const fetchReferralInfo = async () => {
    try {
      setLoading(prev => ({ ...prev, info: true }));
      setError(prev => ({ ...prev, info: null }));
      
      const response = await api.get(`/api/auth/my-referrals`);
      setReferralInfo(response.data.data);
    } catch (err) {
      setError(prev => ({ ...prev, info: err.response?.data?.message || 'Failed to fetch referral info' }));
    } finally {
      setLoading(prev => ({ ...prev, info: false }));
    }
  };

  // Fetch paginated referred users
  const fetchReferredUsers = async (page = 1, limit = 10) => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      setError(prev => ({ ...prev, users: null }));
      
      const response = await api.get(`/api/auth/referred-users`, {
        params: { page, limit }
      });

      setReferredUsers(response.data.data);
      setPagination({
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      });
    } catch (err) {
      setError(prev => ({ ...prev, users: err.response?.data?.message || 'Failed to fetch referred users' }));
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  // Refresh both info and users
  const refetchAll = async () => {
    await Promise.all([
      fetchReferralInfo(),
      fetchReferredUsers(pagination.page, pagination.limit)
    ]);
  };

  // Change page for referred users
  const changePage = async (newPage) => {
    await fetchReferredUsers(newPage, pagination.limit);
  };

  useEffect(() => {
    if (userId) {
      fetchReferralInfo();
      fetchReferredUsers();
    }
  }, [userId]);

  return {
    // Referral information
    referralInfo: {
      code: referralInfo?.referralCode || '',
      referredBy: referralInfo?.referredBy || null,
      totalReferrals: referralInfo?.totalReferrals || 0,
      activeReferrals: referralInfo?.activeReferrals || 0,
      totalEarned: referralInfo?.totalEarned || 0,
      referralLink: `${window.location.origin}?ref=${referralInfo?.referralCode || ''}`
    },
    
    // Referred users list
    referredUsers: referredUsers.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      balance: user.balance,
      joinedDate: user.createdAt,
      lastDeposit: user.lastDeposit || 0,
      lastTaskProfit: user.lastTaskProfit || 0
    })),
    
    // Pagination controls
    pagination: {
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      totalItems: pagination.total,
      itemsPerPage: pagination.limit,
      changePage
    },
    
    // Loading states
    loading: {
      info: loading.info,
      users: loading.users,
      any: loading.info || loading.users
    },
    
    // Error states
    error: {
      info: error.info,
      users: error.users,
      any: error.info || error.users
    },
    
    // Refresh functions
    refetch: {
      info: fetchReferralInfo,
      users: fetchReferredUsers,
      all: refetchAll
    }
  };
};

export default useUserReferral;