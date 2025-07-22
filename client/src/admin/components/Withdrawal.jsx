import React, { useState, useEffect } from 'react';
import { 
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  User,
  DollarSign,
  AlertCircle,
  Mail,
  ArrowUpRight,
  CreditCard,
  Bitcoin,
  HardDrive
} from 'lucide-react';
import useWithdrawalAdmin from '../../../hooks/useAdminWithdrawals';
import Toast from '../../components/Toast';

const Withdrawals = () => {
  const {
    loading,
    error,
    getWithdrawals,
    processWithdrawal
  } = useWithdrawalAdmin();

  const [withdrawals, setWithdrawals] = useState([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });
  const [showModal, setShowModal] = useState(false);

  // Fetch all withdrawals on mount
  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const data = await getWithdrawals();
      if (Array.isArray(data)) {
        setWithdrawals(data);
      } else {
        setToast({
          show: true,
          message: 'Invalid withdrawals data received',
          type: 'error'
        });
      }
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to load withdrawals',
        type: 'error'
      });
    }
  };

  const handleViewWithdrawal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowModal(true);
  };

  const handleProcess = async (status) => {
    if (!selectedWithdrawal) return;
    
    try {
      await processWithdrawal(selectedWithdrawal.id, status);
      setToast({
        show: true,
        message: `Withdrawal ${status} successfully`,
        type: 'success'
      });
      setShowModal(false);
      setSelectedWithdrawal(null);
      fetchWithdrawals();
    } catch (err) {
      setToast({
        show: true,
        message: `Failed to ${status} withdrawal`,
        type: 'error'
      });
    }
  };

  const formatDate = (dateString) => {
    try {
      return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case 'Bitcoin':
        return <Bitcoin className="mr-1" size={16} />;
      case 'Ethereum':
        return <HardDrive className="mr-1" size={16} />;
      case 'USDT (TRC20)':
      case 'USDT (Omni)':
        return <DollarSign className="mr-1" size={16} />;
      default:
        return <CreditCard className="mr-1" size={16} />;
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <DollarSign className="mr-2" size={24} />
          Withdrawal Management
        </h2>

        {/* Withdrawals Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-800">All Withdrawals</h3>
          </div>
          
          {loading && !withdrawals.length ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No withdrawals found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="flex-shrink-0 h-10 w-10 text-gray-400" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {withdrawal.user?.username || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {withdrawal.user?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${withdrawal.amount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {getPaymentMethodIcon(withdrawal.paymentMethod)}
                          {withdrawal.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(withdrawal.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(withdrawal.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewWithdrawal(withdrawal)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Eye className="inline mr-1" size={16} />
                          View
                        </button>
                        {withdrawal.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setShowModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              <XCircle className="inline mr-1" size={16} />
                              Reject
                            </button>
                            <button
                              onClick={() => handleProcess('completed')}
                              className="text-green-600 hover:text-green-900 transition-colors"
                            >
                              <CheckCircle className="inline mr-1" size={16} />
                              Approve
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Withdrawal Detail Modal */}
        {showModal && selectedWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-down">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold flex items-center">
                    <ArrowUpRight className="mr-2" size={20} />
                    Withdrawal Details
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">User Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <User className="mr-2 text-gray-400" size={16} />
                        <span>{selectedWithdrawal.user?.username || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="mr-2 text-gray-400" size={16} />
                        <span>{selectedWithdrawal.user?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Transaction Details</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">${selectedWithdrawal.amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Method:</span>
                        <span className="font-medium">
                          {getPaymentMethodIcon(selectedWithdrawal.paymentMethod)}
                          {selectedWithdrawal.paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium">{getStatusBadge(selectedWithdrawal.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Wallet Address</h4>
                  <div className="bg-gray-50 p-3 rounded-lg break-all">
                    {selectedWithdrawal.address || 'Not provided'}
                  </div>
                </div>

                {selectedWithdrawal.status === 'pending' && (
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        handleProcess('rejected');
                        setShowModal(false);
                      }}
                      className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="mr-2" size={16} />
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        handleProcess('completed');
                        setShowModal(false);
                      }}
                      className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2" size={16} />
                      Approve
                    </button>
                  </div>
                )}
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

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Withdrawals;