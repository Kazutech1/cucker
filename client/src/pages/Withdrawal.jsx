import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import LoadingSpinner from '../components/Spinner';



const WithdrawPage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [balance, setBalance] = useState(0);
  const [minWithdrawal, setMinWithdrawal] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state for API fetch

  // Fetch withdrawal info
  const fetchWithdrawalInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/withdrawal/info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(parseFloat(data.profitBalance).toFixed(2));
        setWalletAddress(data.withdrawalAddress || '');
        setMinWithdrawal(parseFloat(data.minWithdrawal).toFixed(2));
      } else {
        throw new Error('Failed to fetch withdrawal info');
      }
    } catch (error) {
      console.error('Withdrawal info fetch error:', error);
      setError('Failed to load withdrawal info. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle withdrawal submission
  const handleWithdrawal = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validation
      if (!amount || !walletAddress) {
        throw new Error('Please ensure all fields are filled and a withdrawal address is set.');
      }

      const amountNum = parseFloat(amount);
      if (amountNum <= 0) {
        throw new Error('Please enter a valid amount greater than zero.');
      }

      if (amountNum < parseFloat(minWithdrawal)) {
        throw new Error(`Withdrawal amount must be at least $${minWithdrawal}`);
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/withdrawal/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: amountNum })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Withdrawal request failed');
      }

      // Update UI on success
      setBalance(parseFloat(data.newProfitBalance).toFixed(2));
      setWalletAddress(data.address);
      setAmount('');
      
      // Show success message
      alert(`Withdrawal request submitted successfully! Withdrawal ID: ${data.withdrawalId}`);
      
    } catch (error) {
      console.error('Withdrawal error:', error);
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
    fetchWithdrawalInfo();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-16">
            {isLoading && <LoadingSpinner />}

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
          Withdraw Funds
        </h1>

        {/* Balance Card */}
        <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6 mb-6 text-center">
          <div className="text-gray-400 mb-2">Available Profit Balance</div>
          <div className="text-teal-400 text-3xl font-bold">${balance}</div>
          <div className="text-gray-400 mt-2 text-sm">Minimum Withdrawal: ${minWithdrawal}</div>
        </div>

        {/* Withdraw Form */}
        <form onSubmit={handleWithdrawal} className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6">
          {error && (
            <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Amount Input */}
          <div className="mb-5">
            <label className="block text-gray-400 text-sm mb-2" htmlFor="amount">
              Amount (USD)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/30 border border-teal-400/30 rounded-xl p-4 text-white focus:border-teal-400 focus:outline-none"
              placeholder="Enter amount to withdraw"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Wallet Address */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2" htmlFor="wallet-address">
              Withdrawal Address
            </label>
            <input
              type="text"
              id="wallet-address"
              value={walletAddress}
              readOnly
              className="w-full bg-black/30 border border-teal-400/30 rounded-xl p-4 text-gray-400 focus:border-teal-400 focus:outline-none cursor-not-allowed"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-gradient-to-r from-teal-400 to-teal-500 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawPage;