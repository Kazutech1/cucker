import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, DollarSign, Clock, CheckCircle,
  Star, Edit, ArrowLeft, TrendingUp, CreditCard,
  PlusSquare, ArrowUpCircle, ArrowDownCircle, PlusCircle,
  Layers, PauseCircle, RotateCcw, X, Save, Plus, Minus, Users, RefreshCw
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import useUserAdmin from '../../../hooks/useAdminUsers';
import UserTasks from './UserTasks';
import useAdminReferralInfo from '../../../hooks/useAdminReferrals';

const UserManagement = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const {
    loading,
    error,
    getUserById,
    updateUser
  } = useUserAdmin();

  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [vipModalOpen, setVipModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [balanceAdjustment, setBalanceAdjustment] = useState({
    amount: '',
    type: 'add',
    target: 'balance',
    note: ''
  });
  const [vipLevel, setVipLevel] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userTasksRef = useRef(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById(userId);
        setUser(userData);
        setEditForm({
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          fullName: userData.fullName || '',
          withdrawalAddress: userData.withdrawalAddress,
          isBlocked: userData.isBlocked
        });
        setVipLevel(userData.profile?.vipLevel || 0);
      } catch (err) {
        setToast({
          show: true,
          message: 'Failed to load user data',
          type: 'error'
        });
      }
    };

    fetchUser();
  }, [userId]);

  const reloadUserData = async () => {
    try {
      const userData = await getUserById(userId);
      setUser(userData);
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to refresh user data',
        type: 'error'
      });
    }
  };

  const handleQuickAssign = () => {
    userTasksRef.current?.openAssignModal();
  };

  const handleEditSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateUser(userId, editForm);
      setToast({
        show: true,
        message: 'User updated successfully',
        type: 'success'
      });
      setEditModalOpen(false);
      reloadUserData();
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to update user',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBalanceAdjustment = async () => {
    setIsSubmitting(true);
    try {
      const amount = parseFloat(balanceAdjustment.amount);
      if (isNaN(amount)) {
        setToast({
          show: true,
          message: 'Please enter a valid amount',
          type: 'error'
        });
        return;
      }
      
      if (amount <= 0) {
        setToast({
          show: true,
          message: 'Amount must be greater than 0',
          type: 'error'
        });
        return;
      }

      const adjustment = balanceAdjustment.type === 'add' ? amount : -amount;
      let updateData = {};

      if (balanceAdjustment.target === 'balance') {
        const newBalance = (user.balance || 0) + adjustment;
        if (newBalance < 0) {
          setToast({
            show: true,
            message: 'Cannot have negative balance',
            type: 'error'
          });
          return;
        }
        updateData.balance = newBalance;
      } else {
        const newProfit = (user.profitBalance || 0) + adjustment;
        if (newProfit < 0) {
          setToast({
            show: true,
            message: 'Cannot have negative profit balance',
            type: 'error'
          });
          return;
        }
        updateData.profitBalance = newProfit;
      }

      await updateUser(userId, updateData);
      setToast({
        show: true,
        message: `${balanceAdjustment.target === 'balance' ? 'Balance' : 'Profit'} ${balanceAdjustment.type === 'add' ? 'added' : 'subtracted'} successfully`,
        type: 'success'
      });
      setBalanceModalOpen(false);
      setBalanceAdjustment({ amount: '', type: 'add', target: 'balance', note: '' });
      reloadUserData();
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to adjust balance',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVipUpgrade = async () => {
    setIsSubmitting(true);
    try {
      if (vipLevel < 0 || vipLevel > 5) {
        setToast({
          show: true,
          message: 'VIP level must be between 0 and 5',
          type: 'error'
        });
        return;
      }

      await updateUser(userId, { vipLevel: vipLevel });
      setToast({
        show: true,
        message: `VIP level updated to ${vipLevel}`,
        type: 'success'
      });
      setVipModalOpen(false);
      reloadUserData();
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to update VIP level',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ReferralDashboard = () => {
    const { 
      data, 
      loading, 
      error, 
      refetch 
    } = useAdminReferralInfo(userId);
  
    if (loading) return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  
    if (error) return (
      <div className="bg-red-50 border border-red-200 rounded p-4 text-red-600">
        Error: {error}
        <button 
          onClick={refetch}
          className="ml-4 px-3 py-1 bg-red-100 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Referrals</p>
            <p className="text-2xl font-bold">{data.totalReferrals}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Active Referrals</p>
            <p className="text-2xl font-bold">{data.activeReferrals}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Total Earned</p>
            <p className="text-2xl font-bold">${data.totalEarned.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium">Referred Users</h3>
            <button 
              onClick={refetch}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <RefreshCw className="mr-1" size={14} />
              Refresh
            </button>
          </div>
          
          {data.referredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deposited</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.referredUsers.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="text-gray-500" size={16} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${user.totalDeposited.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${user.totalTaskProfit.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.lastActivity ? new Date(user.lastActivity).toLocaleString() : 'No activity'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No referred users found
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading && !user) {
    return (
      <div className="flex-1 p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 p-8 flex justify-center items-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4 transition-colors"
          >
            <ArrowLeft className="mr-1" size={18} />
            Back
          </button>
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>

        {/* User Profile Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 transition-shadow hover:shadow-md">
          <div className="flex items-center">
            <div className="bg-gray-200 rounded-full p-4 mr-4">
              <User size={32} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.fullName || user.username || 'No name'}</h2>
              <div className="flex items-center text-gray-600">
                <Star className="mr-1 text-yellow-500" size={16} />
                <span>VIP {user.profile?.vipLevel || 0}</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {user.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setEditModalOpen(true)}
              className="ml-auto flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit className="mr-2" size={16} />
              Edit User
            </button>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 transition-shadow hover:shadow-md">
          <h3 className="text-lg font-semibold mb-4">USER ACTIONS</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button 
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center transition-colors"
              disabled={isSubmitting}
            >
              <RotateCcw className="mr-2" size={16} />
              Reset All Tasks
            </button>
            <button 
              onClick={async () => {
                try {
                  await deactivateUserTasks(user.id);
                  setToast({
                    show: true,
                    message: 'User task reception deactivated',
                    type: 'success'
                  });
                } catch (err) {
                  setToast({
                    show: true,
                    message: 'Deactivation failed',
                    type: 'error'
                  });
                }
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center justify-center transition-colors"
              disabled={isSubmitting}
            >
              <PauseCircle className="mr-2" size={16} />
              Deactivate Tasks
            </button>
            <button 
              onClick={() => setReferralModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center transition-colors"
              disabled={isSubmitting}
            >
              <Users className="mr-2" size={16} />
              View Referrals
            </button>
            <button 
              onClick={() => {
                setBalanceAdjustment({ 
                  amount: '', 
                  type: 'add', 
                  target: 'balance',
                  note: '' 
                });
                setBalanceModalOpen(true);
              }}
              className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 flex items-center justify-center transition-colors"
              disabled={isSubmitting}
            >
              <ArrowDownCircle className="mr-2" size={16} />
              Credit Balance
            </button>
            <button 
              onClick={() => {
                setBalanceAdjustment({ 
                  amount: '', 
                  type: 'add', 
                  target: 'profit',
                  note: '' 
                });
                setBalanceModalOpen(true);
              }}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center justify-center transition-colors"
              disabled={isSubmitting}
            >
              <TrendingUp className="mr-2" size={16} />
              Credit Profit
            </button>
            <button 
              onClick={() => setVipModalOpen(true)}
              className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 flex items-center justify-center transition-colors"
              disabled={isSubmitting}
            >
              <Star className="mr-2" size={16} />
              Upgrade VIP
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Account Balance */}
          <div className="bg-white rounded-lg shadow-sm p-6 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">Account Balance</h3>
                <p className="text-2xl font-bold">${user.balance?.toFixed(2)}</p>
              </div>
              <DollarSign className="text-blue-500" size={20} />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-gray-500 text-sm">Profit Balance</p>
              <p className="font-medium">${user.profitBalance?.toFixed(2)}</p>
            </div>
          </div>

          {/* Investment */}
          <div className="bg-white rounded-lg shadow-sm p-6 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">Total Invested</h3>
                <p className="text-2xl font-bold">${user.profile?.totalInvested?.toFixed(2)}</p>
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-gray-500 text-sm">Task Limit</p>
              <p className="font-medium">{user.taskLimit}</p>
            </div>
          </div>

          {/* Deposits */}
          <div className="bg-white rounded-lg shadow-sm p-6 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">Total Deposits</h3>
                <p className="text-2xl font-bold">{user.deposits?.length || 0}</p>
              </div>
              <CreditCard className="text-purple-500" size={20} />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-gray-500 text-sm">Last Deposit</p>
              <p className="font-medium">
                {user.deposits?.length ? new Date(user.deposits[0].createdAt).toLocaleDateString() : 'None'}
              </p>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">Account Status</h3>
                <p className="text-lg font-bold flex items-center">
                  {user.isBlocked ? (
                    <X className="text-red-500 mr-1" size={16} />
                  ) : (
                    <CheckCircle className="text-green-500 mr-1" size={16} />
                  )}
                  {user.isBlocked ? 'Blocked' : 'Active'}
                </p>
              </div>
              <Clock className="text-yellow-500" size={20} />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-gray-500 text-sm">Registered</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 transition-shadow hover:shadow-md">
            <h3 className="text-lg font-semibold mb-4">USER INFORMATION</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Username</p>
                <p className="font-medium">{user.username}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Email Address</p>
                <p className="font-medium flex items-center">
                  <Mail className="mr-1 text-gray-500" size={16} />
                  {user.email}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Phone Number</p>
                <p className="font-medium flex items-center">
                  <Phone className="mr-1 text-gray-500" size={16} />
                  {user.phoneNumber}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 transition-shadow hover:shadow-md">
            <h3 className="text-lg font-semibold mb-4">ACCOUNT DETAILS</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Withdrawal Address</p>
                <p className="font-medium break-all">{user.withdrawalAddress || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Referral Code</p>
                <p className="font-medium">{user.referralCode || 'None'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Last Login</p>
                <p className="font-medium">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Tasks Section */}
        <UserTasks userId={user.id} ref={userTasksRef} />

        {/* Referral Info Modal */}
        {referralModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Referral Information</h2>
                  <button 
                    onClick={() => setReferralModalOpen(false)} 
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <ReferralDashboard />
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Edit User</h2>
                  <button 
                    onClick={() => setEditModalOpen(false)} 
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={isSubmitting}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editForm.fullName || ''}
                      onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Withdrawal Address</label>
                    <input
                      type="text"
                      value={editForm.withdrawalAddress}
                      onChange={(e) => setEditForm({...editForm, withdrawalAddress: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isBlocked"
                      checked={editForm.isBlocked}
                      onChange={(e) => setEditForm({...editForm, isBlocked: e.target.checked})}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="isBlocked" className="text-sm font-medium text-gray-700">
                      Block User
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="mr-2" size={16} />
                    )}
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Balance Adjustment Modal */}
        {balanceModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {balanceAdjustment.type === 'add' ? 'Credit' : 'Debit'} {balanceAdjustment.target === 'balance' ? 'Balance' : 'Profit'}
                  </h2>
                  <button 
                    onClick={() => setBalanceModalOpen(false)} 
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={isSubmitting}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex space-x-4 mb-4">
                    <button
                      onClick={() => setBalanceAdjustment({...balanceAdjustment, type: 'add'})}
                      className={`flex-1 py-2 rounded-md flex items-center justify-center transition-colors ${
                        balanceAdjustment.type === 'add' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      disabled={isSubmitting}
                    >
                      <Plus className="mr-2" size={16} />
                      Add
                    </button>
                    <button
                      onClick={() => setBalanceAdjustment({...balanceAdjustment, type: 'subtract'})}
                      className={`flex-1 py-2 rounded-md flex items-center justify-center transition-colors ${
                        balanceAdjustment.type === 'subtract' ? 'bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      disabled={isSubmitting}
                    >
                      <Minus className="mr-2" size={16} />
                      Subtract
                    </button>
                  </div>
                  
                  <div className="flex space-x-4 mb-4">
                    <button
                      onClick={() => setBalanceAdjustment({...balanceAdjustment, target: 'balance'})}
                      className={`flex-1 py-2 rounded-md flex items-center justify-center transition-colors ${
                        balanceAdjustment.target === 'balance' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      disabled={isSubmitting}
                    >
                      <DollarSign className="mr-2" size={16} />
                      Main Balance
                    </button>
                    <button
                      onClick={() => setBalanceAdjustment({...balanceAdjustment, target: 'profit'})}
                      className={`flex-1 py-2 rounded-md flex items-center justify-center transition-colors ${
                        balanceAdjustment.target === 'profit' ? 'bg-teal-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      disabled={isSubmitting}
                    >
                      <TrendingUp className="mr-2" size={16} />
                      Profit Balance
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                      <input
                        type="number"
                        value={balanceAdjustment.amount}
                        onChange={(e) => setBalanceAdjustment({...balanceAdjustment, amount: e.target.value})}
                        className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                    <input
                      type="text"
                      value={balanceAdjustment.note}
                      onChange={(e) => setBalanceAdjustment({...balanceAdjustment, note: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Reason for adjustment"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p className="text-sm font-medium">
                      Current {balanceAdjustment.target === 'balance' ? 'Balance' : 'Profit'}: $
                      {balanceAdjustment.target === 'balance' 
                        ? user.balance?.toFixed(2)
                        : user.profitBalance?.toFixed(2)}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      New {balanceAdjustment.target === 'balance' ? 'Balance' : 'Profit'}: $
                      {balanceAdjustment.amount 
                        ? (balanceAdjustment.type === 'add'
                            ? (balanceAdjustment.target === 'balance'
                                ? (user.balance + parseFloat(balanceAdjustment.amount))
                                : (user.profitBalance + parseFloat(balanceAdjustment.amount))).toFixed(2)
                            : (balanceAdjustment.target === 'balance'
                                ? (user.balance - parseFloat(balanceAdjustment.amount))
                                : (user.profitBalance - parseFloat(balanceAdjustment.amount))).toFixed(2))
                        : balanceAdjustment.target === 'balance'
                          ? user.balance?.toFixed(2)
                          : user.profitBalance?.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setBalanceModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBalanceAdjustment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center transition-colors"
                    disabled={isSubmitting || !balanceAdjustment.amount}
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="mr-2" size={16} />
                    )}
                    {isSubmitting ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIP Upgrade Modal */}
        {vipModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Upgrade VIP Level</h2>
                  <button 
                    onClick={() => setVipModalOpen(false)} 
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={isSubmitting}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current VIP Level</label>
                    <p className="font-medium">VIP {user.profile?.vipLevel || 0}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New VIP Level (0-5)</label>
                    <div className="flex items-center space-x-2">
                      {[0, 1, 2, 3, 4, 5].map(level => (
                        <button
                          key={level}
                          onClick={() => setVipLevel(level)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            vipLevel === level ? 'bg-violet-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                          disabled={isSubmitting}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setVipModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVipUpgrade}
                    className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 flex items-center transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="mr-2" size={16} />
                    )}
                    {isSubmitting ? 'Updating...' : 'Upgrade'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({...toast, show: false})} 
          />
        )}
        
      </div>
    </div>
  );
};

export default UserManagement;