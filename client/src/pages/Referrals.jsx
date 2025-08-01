import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft,
  FiUsers,
  FiDollarSign,
  FiLink2,
  FiCopy,
  FiCheckCircle,
  FiAlertCircle,
  FiUserPlus,
  FiCalendar,
  FiCreditCard,
  FiRefreshCw,
  FiShare2,
  FiInfo
} from 'react-icons/fi';
import useUserReferral from '../../hooks/useUsersReferrals';

const ReferralPage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const {
    referralInfo,
    referredUsers,
    pagination,
    loading,
    error,
    refetch
  } = useUserReferral(userId);

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });
  const [copySuccess, setCopySuccess] = useState({
    link: false,
    code: false
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch data on mount and when activeTab changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsRefreshing(true);
        await refetch.all();
      } finally {
        setIsRefreshing(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const copyToClipboard = (text, type) => {
    if (!text) {
      setToast({
        show: true,
        message: 'Nothing to copy',
        type: 'error'
      });
      return;
    }
    
    navigator.clipboard.writeText(text);
    setCopySuccess(prev => ({ ...prev, [type]: true }));
    setToast({
      show: true,
      message: `${type === 'link' ? 'Link' : 'Code'} copied to clipboard!`,
      type: 'success'
    });
    
    setTimeout(() => setCopySuccess(prev => ({ ...prev, [type]: false })), 2000);
  };

  const shareReferralLink = () => {
    if (!referralInfo.referralLink) {
      setToast({
        show: true,
        message: 'Referral link not available',
        type: 'error'
      });
      return;
    }

    if (navigator.share) {
      navigator.share({
        title: 'Join me on this amazing platform!',
        text: 'Sign up using my referral link and get a bonus!',
        url: referralInfo.referralLink
      }).catch(() => {
        copyToClipboard(referralInfo.referralLink, 'link');
      });
    } else {
      copyToClipboard(referralInfo.referralLink, 'link');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const filteredUsers = referredUsers.filter(user => {
    if (activeTab === 'active') return user.lastDeposit > 0;
    if (activeTab === 'inactive') return user.lastDeposit === 0;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-16">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-15 p-4 flex justify-between items-center bg-black/30 backdrop-blur-md border-b border-teal-400/15">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-black/60 hover:bg-teal-400/10 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5 text-teal-400" />
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent">
          Referral Program
        </h1>
        <button 
          onClick={() => {
            setIsRefreshing(true);
            refetch.all().finally(() => setIsRefreshing(false));
          }}
          className="p-2 rounded-lg bg-black/60 hover:bg-teal-400/10 transition-colors"
        >
          <FiRefreshCw className={`w-5 h-5 text-teal-400 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-20 pb-32 max-w-3xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Referrals */}
          <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-4 text-center hover:bg-teal-400/5 transition-colors">
            <div className="flex items-center justify-center text-gray-400 mb-2">
              <FiUsers className="mr-2" />
              <span>Total Referrals</span>
            </div>
            <div className="text-teal-400 text-2xl font-bold">
              {loading.info ? (
                <div className="h-8 w-8 mx-auto border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin"></div>
              ) : (
                referralInfo.totalReferrals || 0
              )}
            </div>
          </div>

          {/* Active Referrals */}
          <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-4 text-center hover:bg-teal-400/5 transition-colors">
            <div className="flex items-center justify-center text-gray-400 mb-2">
              <FiUserPlus className="mr-2" />
              <span>Active Referrals</span>
            </div>
            <div className="text-teal-400 text-2xl font-bold">
              {loading.info ? (
                <div className="h-8 w-8 mx-auto border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin"></div>
              ) : (
                referralInfo.activeReferrals || 0
              )}
            </div>
          </div>

          {/* Total Earned */}
          <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-4 text-center hover:bg-teal-400/5 transition-colors">
            <div className="flex items-center justify-center text-gray-400 mb-2">
              <FiDollarSign className="mr-2" />
              <span>Total Earned</span>
            </div>
            <div className="text-teal-400 text-2xl font-bold">
              {loading.info ? (
                <div className="h-8 w-8 mx-auto border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin"></div>
              ) : (
                formatCurrency(referralInfo.totalEarned)
              )}
            </div>
          </div>
        </div>

        {/* Referral Link Section */}
        <div className="bg-teal-400/10 border border-teal-400/30 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-teal-400">Your Referral Link</h2>
            <button
              onClick={shareReferralLink}
              className="flex items-center gap-1 px-3 py-1 bg-teal-400/20 text-teal-400 rounded-lg text-sm hover:bg-teal-400/30 transition-colors"
            >
              <FiShare2 size={14} /> Share
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2">Share this link and earn rewards</label>
            <div className="relative">
              <div className="bg-black/30 border border-teal-400/20 rounded-lg p-3 pr-10 break-all text-sm">
                {loading.info ? 'Loading referral link...' : referralInfo.referralLink || 'Not available'}
              </div>
              <button
                onClick={() => copyToClipboard(referralInfo.referralLink, 'link')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-teal-400 hover:text-teal-300 p-1"
                disabled={!referralInfo.referralLink}
                title="Copy link"
              >
                {copySuccess.link ? <FiCheckCircle className="text-green-400" /> : <FiCopy />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Or share your referral code</label>
            <div className="relative">
              <div className="bg-black/30 border border-teal-400/20 rounded-lg p-3 pr-10 text-center text-lg font-mono">
                {loading.info ? '••••••' : referralInfo.code || 'N/A'}
              </div>
              <button
                onClick={() => copyToClipboard(referralInfo.code, 'code')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-teal-400 hover:text-teal-300 p-1"
                disabled={!referralInfo.code}
                title="Copy code"
              >
                {copySuccess.code ? <FiCheckCircle className="text-green-400" /> : <FiCopy />}
              </button>
            </div>
          </div>
        </div>

        {/* Referral Program Details */}
        <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3 text-teal-400 flex items-center gap-2">
            <FiInfo /> How It Works
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-teal-400">•</span>
              <span className="text-gray-300">Earn <strong className="text-teal-400">10% commission</strong> on every deposit made by your referrals</span>
            </li>
            {/* <li className="flex items-start gap-2">
              <span className="text-teal-400">•</span>
              <span className="text-gray-300">Commission is credited <strong className="text-teal-400">instantly</strong> to your account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-400">•</span>
              <span className="text-gray-300">No limit on how much you can earn from referrals</span>
            </li> */}
            <li className="flex items-start gap-2">
              <span className="text-teal-400">•</span>
              <span className="text-gray-300">Referral earnings can be <strong className="text-teal-400">withdrawn</strong> anytime</span>
            </li>
          </ul>
        </div>

        {/* Referred Users Section */}
        <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-teal-400/20">
            <h2 className="text-lg font-semibold text-teal-400">Your Referred Users</h2>
            <div className="flex bg-black/40 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 text-sm rounded-md ${activeTab === 'all' ? 'bg-teal-400/30 text-teal-400' : 'text-gray-400'}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1 text-sm rounded-md ${activeTab === 'active' ? 'bg-teal-400/30 text-teal-400' : 'text-gray-400'}`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`px-3 py-1 text-sm rounded-md ${activeTab === 'inactive' ? 'bg-teal-400/30 text-teal-400' : 'text-gray-400'}`}
              >
                Inactive
              </button>
            </div>
          </div>

          {loading.users ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin mb-3"></div>
              <p className="text-gray-400">Loading referred users...</p>
            </div>
          ) : error.users ? (
            <div className="p-4 text-center">
              <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-3 text-red-400">
                {error.users}
                <button
                  onClick={() => refetch.users()}
                  className="mt-2 px-3 py-1 bg-red-400/10 text-red-400 rounded text-sm hover:bg-red-400/20 flex items-center gap-1 mx-auto"
                >
                  <FiRefreshCw size={14} /> Retry
                </button>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                {activeTab === 'all' 
                  ? "You haven't referred anyone yet" 
                  : activeTab === 'active' 
                    ? "No active referrals found" 
                    : "No inactive referrals found"}
              </div>
              <button
                onClick={shareReferralLink}
                className="px-4 py-2 bg-teal-400/10 text-teal-400 rounded-lg hover:bg-teal-400/20 transition-colors inline-flex items-center gap-2"
              >
                <FiShare2 size={16} /> Share your link
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-teal-400/20 text-gray-400 text-left text-sm">
                      <th className="p-3">User</th>
                      <th className="p-3">Joined</th>
                      <th className="p-3 text-right">Deposits</th>
                      <th className="p-3 text-right">Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr 
                        key={user.id} 
                        className="border-b border-teal-400/10 hover:bg-teal-400/5 transition-colors"
                      >
                        <td className="p-3">
                          <div className="font-medium">{user.username || user.email?.split('@')[0] || 'Anonymous'}</div>
                          <div className="text-xs text-gray-400">{user.email || 'No email'}</div>
                        </td>
                        <td className="p-3 text-sm text-gray-300">
                          {formatDate(user.joinedDate)}
                        </td>
                        <td className="p-3 text-sm text-right">
                          <span className={`${user.totalDeposits > 0 ? 'text-teal-400' : 'text-gray-400'}`}>
                            {formatCurrency(user.totalDeposits)}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-right">
                          <span className="text-green-400">
                            {formatCurrency(user.totalEarnedForReferrer)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-teal-400/20">
                  <button
                    onClick={() => pagination.changePage(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1 || loading.users}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      pagination.currentPage === 1 || loading.users
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-teal-400/10 text-teal-400 hover:bg-teal-400/20'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-300">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => pagination.changePage(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages || loading.users}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      pagination.currentPage === pagination.totalPages || loading.users
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-teal-400/10 text-teal-400 hover:bg-teal-400/20'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Toast Notification */}
        {/* {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({...toast, show: false})} 
          />
        )} */}
      </div>
    </div>
  );
};

export default ReferralPage;