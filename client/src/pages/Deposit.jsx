import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCopy, FiCheck } from 'react-icons/fi';

const DepositPage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [availableWallets, setAvailableWallets] = useState({});
  const [userBalance, setUserBalance] = useState(0);
  const [minDeposit, setMinDeposit] = useState(10);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    currency: '',
    txHash: '',
    proofImage: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile to get balance
  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message === 'Profile retrieved successfully') {
          setUserBalance(parseFloat(data.user.balance).toFixed(2));
          return data.user;
        }
      }
      throw new Error('Failed to fetch profile');
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Failed to load profile data. Please try again.');
      navigate('/login');
    }
  };

  // Fetch deposit info and populate wallets
  const fetchDepositInfo = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/deposit/info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch deposit info');
      }

      const data = await response.json();
      
      if (data.depositWallets && data.depositWallets.length > 0) {
        const walletsObj = {};
        data.depositWallets.forEach(wallet => {
          walletsObj[wallet.currency] = {
            address: wallet.address,
            network: wallet.network
          };
        });
        setAvailableWallets(walletsObj);
      } else {
        throw new Error('No deposit wallets available');
      }
      
      if (data.minDeposit) {
        setMinDeposit(data.minDeposit);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching deposit info:', error);
      setError('Failed to load deposit information. Please try again.');
    }
  };

  // Handle crypto currency change
  const handleCurrencyChange = (e) => {
    const currency = e.target.value;
    setSelectedCurrency(currency);
    setFormData({...formData, currency});
  };

  // Copy address to clipboard
  const copyAddressToClipboard = async () => {
    if (!selectedCurrency || !availableWallets[selectedCurrency]) return;
    
    try {
      await navigator.clipboard.writeText(availableWallets[selectedCurrency].address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
      setError('Failed to copy address. Please copy manually.');
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validation
      if (parseFloat(formData.amount) < minDeposit) {
        throw new Error(`Minimum deposit amount is $${minDeposit}`);
      }
      
      if (!formData.currency) {
        throw new Error('Please select a cryptocurrency');
      }
      
      if (!formData.txHash) {
        throw new Error('Please enter your transaction hash');
      }
      
      // Create form data
      const submissionData = new FormData();
      submissionData.append('amount', formData.amount);
      submissionData.append('currency', formData.currency);
      submissionData.append('txHash', formData.txHash);
      if (formData.proofImage) submissionData.append('proofImage', formData.proofImage);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/deposit/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submissionData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Deposit submission failed');
      }
      
      // Reset form on success
      setFormData({
        amount: '',
        currency: '',
        txHash: '',
        proofImage: null
      });
      setSelectedCurrency('');
      
      // Refresh balance
      await fetchUserProfile();
      
      // Show success message
      alert(data.message || 'Deposit submitted successfully! Your deposit is being reviewed.');
      
    } catch (error) {
      console.error('Deposit error:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize page
  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const initializePage = async () => {
      try {
        await Promise.all([
          fetchUserProfile(),
          fetchDepositInfo()
        ]);
      } catch (error) {
        console.error('Page initialization error:', error);
      }
    };

    initializePage();
  }, [token, navigate]);

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
        <div className="w-14"></div> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-32 max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent">
          Crypto Deposit
        </h1>

        {/* Balance Card */}
        <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6 mb-6 text-center">
          <div className="text-gray-400 mb-2">Current Balance</div>
          <div className="text-teal-400 text-3xl font-bold">${userBalance}</div>
          <div className="text-gray-400 mt-2 text-sm">Minimum deposit: ${minDeposit}</div>
        </div>

        {/* Warning Box */}
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3 mb-6 text-yellow-400 text-sm">
          ⚠️ Only send the selected cryptocurrency to the displayed address. Sending other tokens may result in permanent loss.
        </div>

        {/* Deposit Form */}
        <form onSubmit={handleSubmit} className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6">
          {error && (
            <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Amount Input */}
          <div className="mb-5">
            <label className="block text-gray-400 text-sm mb-2" htmlFor="amount">
              Deposit Amount (USD)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full bg-black/30 border border-teal-400/30 rounded-xl p-4 text-white focus:border-teal-400 focus:outline-none"
              placeholder="Enter amount to deposit"
              min={minDeposit}
              step="0.01"
              required
            />
          </div>

          {/* Currency Select */}
          <div className="mb-5">
            <label className="block text-gray-400 text-sm mb-2" htmlFor="currency">
              Select Cryptocurrency
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleCurrencyChange}
              className="w-full bg-black/30 border border-teal-400/30 rounded-xl p-4 text-white focus:border-teal-400 focus:outline-none appearance-none"
              required
            >
              <option value="" disabled>Select cryptocurrency</option>
              {Object.keys(availableWallets).map((currency) => (
                <option key={currency} value={currency}>
                  {currency} - {availableWallets[currency].network}
                </option>
              ))}
            </select>
          </div>

          {/* Wallet Info (shown when currency selected) */}
          {selectedCurrency && availableWallets[selectedCurrency] && (
            <div className="bg-teal-400/10 border border-teal-400/30 rounded-xl p-4 mb-5">
              <div className="mb-3">
                <label className="block text-gray-400 text-sm mb-2">Deposit Address</label>
                <div className="relative">
                  <div className="bg-black/30 border border-teal-400/20 rounded-lg p-3 pr-16 break-all text-sm">
                    {availableWallets[selectedCurrency].address}
                  </div>
                  <button
                    type="button"
                    onClick={copyAddressToClipboard}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-400/20 border border-teal-400 rounded-lg px-3 py-1 text-teal-400 text-xs flex items-center"
                  >
                    {copySuccess ? (
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
                <div className="text-gray-400 text-xs mt-1">
                  Network: {availableWallets[selectedCurrency].network}
                </div>
              </div>
            </div>
          )}

          {/* Transaction Hash */}
          <div className="mb-5">
            <label className="block text-gray-400 text-sm mb-2" htmlFor="txHash">
              Transaction Hash/ID
            </label>
            <input
              type="text"
              id="txHash"
              name="txHash"
              value={formData.txHash}
              onChange={handleInputChange}
              className="w-full bg-black/30 border border-teal-400/30 rounded-xl p-4 text-white focus:border-teal-400 focus:outline-none"
              placeholder="Enter transaction hash from your wallet"
              required
            />
          </div>

          {/* Proof Image */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2" htmlFor="proofImage">
              Transaction Proof (Optional)
            </label>
            <input
              type="file"
              id="proofImage"
              name="proofImage"
              onChange={handleFileChange}
              className="w-full bg-black/30 border border-teal-400/30 rounded-xl p-4 text-white focus:border-teal-400 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-400/20 file:text-teal-400"
              accept="image/jpeg,image/png,.pdf"
            />
            <div className="text-gray-400 text-xs mt-1">
              Upload screenshot or PDF of your transaction (max 5MB)
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-gradient-to-r from-teal-400 to-teal-500 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Deposit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DepositPage;