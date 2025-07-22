import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft,
  FiDollarSign,
  FiCreditCard,
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiCopy
} from 'react-icons/fi';
import useWithdrawal from '../../hooks/useWithdrawals';
import Toast from '../components/Toast';


const WithdrawPage = () => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    setWithdrawalAddress,
    getWithdrawalInfo,
    requestWithdrawal
  } = useWithdrawal();

  const [withdrawalInfo, setWithdrawalInfo] = useState(null);
  const [formData, setFormData] = useState({
    address: '',
    amount: '',
    withdrawalPassword: ''
  });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch withdrawal info on mount
  useEffect(() => {
    const fetchWithdrawalInfo = async () => {
      try {
        const info = await getWithdrawalInfo();
        setWithdrawalInfo(info);
        // console.log(info);
        
        setFormData(prev => ({
          ...prev,
          address: info.withdrawalAddress || ''
        }));
        
        // Show address modal if no address is set
        if (!info.withdrawalAddress) {
          setShowAddressModal(true);
        }
      } catch (err) {
        console.error('Failed to load withdrawal info:', err);
      }
    };
    fetchWithdrawalInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSetAddress = async (e) => {
    e.preventDefault();
    try {
      await setWithdrawalAddress(formData.address);
      setToast({
        show: true,
        message: 'Withdrawal address updated successfully',
        type: 'success'
      });
      const info = await getWithdrawalInfo();
      setWithdrawalInfo(info);
      setShowAddressModal(false);
    } catch (err) {
      console.error('Failed to set address:', err);
    }
  };

  const handleWithdrawalRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await requestWithdrawal(
        parseFloat(formData.amount),
        formData.withdrawalPassword
      );
      setToast({
        show: true,
        message: response.message || 'Withdrawal request submitted',
        type: 'success'
      });
      setFormData({
        ...formData,
        amount: '',
        withdrawalPassword: ''
      });
      const info = await getWithdrawalInfo();
      setWithdrawalInfo(info);
    } catch (err) {
      console.error('Withdrawal failed:', err);
    }
  };

  const copyToClipboard = () => {
    if (!withdrawalInfo?.withdrawalAddress) return;
    navigator.clipboard.writeText(withdrawalInfo.withdrawalAddress);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-16">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-15 p-5 flex justify-between items-center bg-black/30 backdrop-blur-md border-b border-teal-400/15">
        <button 
          onClick={() => navigate(-1)}
          className="bg-black/60 backdrop-blur-md border border-teal-400/15 rounded-xl p-3 cursor-pointer"
        >
          <FiArrowLeft className="w-6 h-6 text-teal-400" />
        </button>
        <div className="w-14"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-32 max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent">
          Withdraw Funds
        </h1>

        {/* Balance Card */}
        {withdrawalInfo && (
          <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6 mb-6 text-center">
            <div className="text-gray-400 mb-2">Available Balance</div>
            <div className="text-teal-400 text-3xl font-bold">
              ${withdrawalInfo.profitBalance?.toFixed(2) || '0.00'}
            </div>
            <div className="text-gray-400 mt-2 text-sm">
              Minimum withdrawal: ${withdrawalInfo.minWithdrawal || '10'}
            </div>
          </div>
        )}

        {/* Current Address Display */}
        {withdrawalInfo?.withdrawalAddress && (
          <div className="bg-teal-400/10 border border-teal-400/30 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Your Withdrawal Address</span>
              <button 
                onClick={() => setShowAddressModal(true)}
                className="text-teal-400 text-sm hover:text-teal-300"
              >
                Change
              </button>
            </div>
            <div className="relative">
              <div className="bg-black/30 border border-teal-400/20 rounded-lg p-3 pr-10 break-all text-sm">
                {withdrawalInfo.withdrawalAddress}
              </div>
              <button
                onClick={copyToClipboard}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-teal-400 hover:text-teal-300"
                title="Copy address"
              >
                {copySuccess ? <FiCheckCircle /> : <FiCopy />}
              </button>
            </div>
          </div>
        )}

        {/* Warning Box */}
        {/* <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3 mb-6 text-yellow-400 text-sm">
          ⚠️ Withdrawals may take 1-3 business days to process
        </div> */}

        {/* Withdrawal Form */}
        <form onSubmit={handleWithdrawalRequest} className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6">
          {error && (
            <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2" htmlFor="amount">
              Amount (USD)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full bg-black/30 border border-teal-400/30 rounded-xl p-3 text-white focus:border-teal-400 focus:outline-none"
              placeholder="Enter amount to withdraw"
              min={withdrawalInfo?.minWithdrawal || 10}
              step="0.01"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2" htmlFor="withdrawalPassword">
              Withdrawal Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="withdrawalPassword"
                name="withdrawalPassword"
                value={formData.withdrawalPassword}
                onChange={handleInputChange}
                className="w-full bg-black/30 border border-teal-400/30 rounded-xl p-3 text-white focus:border-teal-400 focus:outline-none"
                placeholder="Enter your withdrawal password"
                required
              />
              <FiLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !withdrawalInfo?.withdrawalAddress}
            className={`w-full bg-gradient-to-r from-teal-400 to-teal-500 text-white font-semibold py-3 px-6 rounded-xl mt-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            {loading ? 'Processing...' : 'Request Withdrawal'}
          </button>
        </form>

        {/* Address Setup Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 border border-teal-400/30 rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-teal-400">
                  {withdrawalInfo?.withdrawalAddress ? 'Update' : 'Set'} Withdrawal Address
                </h2>
                <button 
                  onClick={() => setShowAddressModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSetAddress}>
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-teal-400 focus:outline-none"
                    placeholder="Enter your wallet address"
                    required
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Save Address
                  </button>
                </div>
              </form>
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

export default WithdrawPage;