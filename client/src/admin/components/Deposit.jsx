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
  ArrowUpRight
} from 'lucide-react';
import useDepositAdmin from '../../../hooks/useAdminDeposit';
import Toast from '../../components/Toast';

const Deposit = () => {
  const {
    loading,
    error,
    getPendingDeposits,
    verifyDeposit
  } = useDepositAdmin();

  const [deposits, setDeposits] = useState([]);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });
  const [showModal, setShowModal] = useState(false);

  // Fetch all deposits on mount
  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const data = await getPendingDeposits();
      console.log(data);
      
      if (Array.isArray(data)) {
        setDeposits(data);
      } else {
        setToast({
          show: true,
          message: 'Invalid deposits data received',
          type: 'error'
        });
      }
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to load deposits',
        type: 'error'
      });
    }
  };

  const handleViewDeposit = (deposit) => {
    setSelectedDeposit(deposit);
    setShowModal(true);
  };

  const handleVerify = async (status) => {
    if (!selectedDeposit) return;
    
    try {
      await verifyDeposit(selectedDeposit.id, status, adminNote);
      setToast({
        show: true,
        message: `Deposit ${status} successfully`,
        type: 'success'
      });
      setShowModal(false);
      setSelectedDeposit(null);
      setAdminNote('');
      fetchDeposits();
    } catch (err) {
      setToast({
        show: true,
        message: `Failed to ${status} deposit`,
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
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </span>
    );
  };

  const safeCurrencyDisplay = (currency) => {
    return currency ? currency.toUpperCase() : 'N/A';
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <DollarSign className="mr-2" size={24} />
          Deposit Management
        </h2>

        {/* Deposits Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-800">All Deposits</h3>
          </div>
          
          {loading && !deposits.length ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : deposits.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No deposits found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deposits.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="flex-shrink-0 h-10 w-10 text-gray-400" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {deposit.user?.username || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {deposit.user?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${deposit.amount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {safeCurrencyDisplay(deposit.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(deposit.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(deposit.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewDeposit(deposit)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Eye className="inline mr-1" size={16} />
                          View
                        </button>
                        {deposit.status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedDeposit(deposit);
                              setShowModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <XCircle className="inline mr-1" size={16} />
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Deposit Detail Modal */}
        {showModal && selectedDeposit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-down">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold flex items-center">
                    <ArrowUpRight className="mr-2" size={20} />
                    Deposit Details
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
                        <span>{selectedDeposit.user?.username || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="mr-2 text-gray-400" size={16} />
                        <span>{selectedDeposit.user?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Transaction Details</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">${selectedDeposit.amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Currency:</span>
                        <span className="font-medium">{safeCurrencyDisplay(selectedDeposit.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium">{getStatusBadge(selectedDeposit.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedDeposit.proofImage && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Proof Image</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={selectedDeposit.proofImage} 
                        alt="Deposit proof" 
                        className="w-full h-auto max-h-64 object-contain"
                      />
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Transaction Hash</h4>
                  <div className="bg-gray-50 p-3 rounded-lg break-all">
                    {selectedDeposit.txHash || 'Not provided'}
                  </div>
                </div>

                {selectedDeposit.status === 'pending' && (
                  <>
                    <div className="mb-6">
                      <label htmlFor="adminNote" className="block text-sm font-medium text-gray-500 mb-2">
                        Admin Note
                      </label>
                      <textarea
                        id="adminNote"
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                        rows={3}
                        placeholder="Add verification notes (optional)"
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleVerify('rejected')}
                        className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="mr-2" size={16} />
                        Reject
                      </button>
                      <button
                        onClick={() => handleVerify('verified')}
                        className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2" size={16} />
                        Approve
                      </button>
                    </div>
                  </>
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

export default Deposit;