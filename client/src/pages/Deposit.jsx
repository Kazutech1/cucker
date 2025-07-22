import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCopy, FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import QRCode from 'react-qr-code';
import useDeposit from '../../hooks/useDeposit';
import Toast from '../components/Toast';

const DepositPage = () => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    getDepositAddresses,
    submitDepositProof
  } = useDeposit();

  const [availableWallets, setAvailableWallets] = useState(null);
  const [expandedCurrency, setExpandedCurrency] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    txHash: '',
    proofImage: null
  });
  const [copySuccess, setCopySuccess] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  // Fetch deposit info on component mount
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const addresses = await getDepositAddresses();
        setAvailableWallets(addresses);
      } catch (err) {
        console.error('Failed to load deposit addresses:', err);
        setToast({
          show: true,
          message: 'Failed to load deposit addresses',
          type: 'error'
        });
      }
    };
    fetchWallets();
  }, []);

  // Toggle currency expansion
  const toggleCurrency = (currency) => {
    setExpandedCurrency(expandedCurrency === currency ? null : currency);
    setCopySuccess(null);
  };

  // Copy address to clipboard
  const copyAddressToClipboard = async (currency) => {
    try {
      await navigator.clipboard.writeText(availableWallets[currency]);
      setCopySuccess(currency);
      setToast({
        show: true,
        message: 'Address copied to clipboard!',
        type: 'success'
      });
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
      setToast({
        show: true,
        message: 'Failed to copy address',
        type: 'error'
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

  // Handle file input
  const handleFileChange = (e) => {
    setFormData({...formData, proofImage: e.target.files[0]});
  };

  // Submit deposit form
  const handleSubmit = async (currency, e) => {
    e.preventDefault();
    try {
      await submitDepositProof({
        amount: formData.amount,
        currency: currency,
        txHash: formData.txHash
      }, formData.proofImage);

      // Reset form on success
      setFormData({
        amount: '',
        txHash: '',
        proofImage: null
      });
      setExpandedCurrency(null);

      setToast({
        show: true,
        message: 'Deposit submitted successfully! Your deposit is being reviewed.',
        type: 'success'
      });
    } catch (err) {
      console.error('Deposit submission error:', err);
      setToast({
        show: true,
        message: err.message || 'Failed to submit deposit',
        type: 'error'
      });
    }
  };

  if (!availableWallets) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400"></div>
      </div>
    );
  }

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
          Crypto Deposit
        </h1>

        {/* Warning Box */}
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3 mb-6 text-yellow-400 text-sm">
          ⚠️ Only send the selected cryptocurrency to the displayed address. Sending other tokens may result in permanent loss.
        </div>

        {/* Currency Selection */}
        <div className="space-y-4 mb-8">
          {Object.keys(availableWallets).map((currency) => (
            <div key={currency} className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl overflow-hidden">
              {/* Currency Header */}
              <button
                onClick={() => toggleCurrency(currency)}
                className="w-full flex justify-between items-center p-4 text-left"
              >
                <div className="flex items-center">
                  <div className="bg-teal-400/10 rounded-lg p-2 mr-3">
                    <div className="w-6 h-6 flex items-center justify-center">
                      {currency === 'bitcoin' && <span>₿</span>}
                      {currency === 'ethereum' && <span>Ξ</span>}
                      {currency === 'usdt' && <span>$</span>}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">{currency.toUpperCase()}</div>
                    <div className="text-xs text-gray-400">
                      {currency === 'bitcoin' && 'Bitcoin Network'}
                      {currency === 'ethereum' && 'Ethereum Network'}
                      {currency === 'usdt' && 'TRC20 Network'}
                    </div>
                  </div>
                </div>
                {expandedCurrency === currency ? (
                  <FiChevronUp className="text-teal-400" />
                ) : (
                  <FiChevronDown className="text-gray-400" />
                )}
              </button>

              {/* Expanded Content */}
              {expandedCurrency === currency && availableWallets[currency] && (
                <div className="p-4 border-t border-teal-400/20">
                  {/* Address and QR Code */}
                  <div className="bg-teal-400/10 border border-teal-400/30 rounded-xl p-4 mb-4">
                    <div className="flex justify-center mb-4">
                      <div className="bg-white p-2 rounded-lg">
                        <QRCode 
                          value={availableWallets[currency]} 
                          size={128} 
                          level="H"
                          bgColor="#ffffff"
                          fgColor="#000000"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-400 text-sm mb-2">Deposit Address</label>
                      <div className="relative">
                        <div className="bg-black/30 border border-teal-400/20 rounded-lg p-3 pr-16 break-all text-sm">
                          {availableWallets[currency]}
                        </div>
                        <button
                          onClick={() => copyAddressToClipboard(currency)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-400/20 border border-teal-400 rounded-lg px-3 py-1 text-teal-400 text-xs flex items-center"
                        >
                          {copySuccess === currency ? (
                            <>
                              <FiCheck className="mr-1" /> Copied!
                            </>
                          ) : (
                            <>
                              <FiCopy className="mr-1" /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Deposit Form */}
                  <form onSubmit={(e) => handleSubmit(currency, e)}>
                    {error && (
                      <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Amount Input */}
                    <div className="mb-4">
                      <label className="block text-gray-400 text-sm mb-2">Amount (USD)</label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="w-full bg-black/30 border border-teal-400/30 rounded-xl p-3 text-white focus:border-teal-400 focus:outline-none"
                        placeholder="Enter amount"
                        min="10"
                        step="0.01"
                        required
                      />
                    </div>

                    {/* Transaction Hash */}
                    <div className="mb-4">
                      <label className="block text-gray-400 text-sm mb-2">Transaction Hash</label>
                      <input
                        type="text"
                        name="txHash"
                        value={formData.txHash}
                        onChange={handleInputChange}
                        className="w-full bg-black/30 border border-teal-400/30 rounded-xl p-3 text-white focus:border-teal-400 focus:outline-none"
                        placeholder="Enter transaction hash"
                        required
                      />
                    </div>

                    {/* Proof Image */}
                    <div className="mb-4">
                      <label className="block text-gray-400 text-sm mb-2">Proof Image (Optional)</label>
                      <input
                        type="file"
                        name="proofImage"
                        onChange={handleFileChange}
                        className="w-full bg-black/30 border border-teal-400/30 rounded-xl p-3 text-white focus:border-teal-400 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-400/20 file:text-teal-400"
                        accept="image/*"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full bg-gradient-to-r from-teal-400 to-teal-500 text-white font-semibold py-3 px-6 rounded-xl mt-2 ${
                        loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'
                      }`}
                    >
                      {loading ? 'Submitting...' : 'Submit Deposit'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({...toast, show: false})} 
        />
      )}
    </div>
  );
};

export default DepositPage;