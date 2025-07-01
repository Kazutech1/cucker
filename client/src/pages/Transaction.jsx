import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const TransactionHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount) || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Fetch transaction history
  const fetchTransactionHistory = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/transactions?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch transaction history');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Invalid response');
      }

      setTransactions(data.transactions || []);
      setPagination({
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.totalPages || 1,
        hasNext: data.pagination?.hasNext || false,
        hasPrev: data.pagination?.hasPrev || false
      });

    } catch (error) {
      console.error('Transaction history fetch error:', error);
      setError('Failed to load transaction history. Please try again.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data fetching
  useEffect(() => {
    fetchTransactionHistory();
  }, [navigate]);

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchTransactionHistory(page);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-16">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-15 p-5 flex justify-between items-center bg-black/30 backdrop-blur-md border-b border-teal-400/15">
        <div className="bg-black/60 backdrop-blur-md border border-teal-400/15 rounded-xl px-5 py-3 flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-teal-500 rounded-md flex items-center justify-center">
            <svg fill="white" viewBox="0 0 24 24" width="16" height="16">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold">
            <span className="text-white">Siemens</span>
            <span className="text-teal-400">X</span>
          </h2>
        </div>
        <button 
          onClick={() => navigate('/home')}
          className="bg-black/60 backdrop-blur-md border border-teal-400/15 rounded-xl p-3 cursor-pointer hover:bg-teal-400/10 hover:scale-105 transition-all"
        >
          <FiArrowLeft className="w-6 h-6 text-teal-400" />
        </button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-32 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent">
          Transaction History
        </h1>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block w-5 h-5 border-2 border-white/30 border-t-teal-400 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-400">Loading transaction history...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-3 mb-6 text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Transaction List */}
        {!loading && transactions.length > 0 ? (
          <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6 flex flex-col gap-4">
            {transactions.map((transaction, index) => {
              const amountSign = transaction.type === 'withdrawal' ? '-' : '+';
              const amountClass = transaction.type === 'withdrawal' 
                ? 'text-red-400' 
                : transaction.type === 'deposit' 
                  ? 'text-green-400' 
                  : 'text-teal-400';
              const statusClass = transaction.status.toLowerCase() === 'verified' 
                ? 'text-green-400' 
                : transaction.status.toLowerCase() === 'pending' 
                  ? 'text-yellow-400' 
                  : 'text-red-400';
              
              return (
                <div key={index} className="bg-black/40 border border-teal-400/10 rounded-lg p-4 flex justify-between items-center">
                  <div className="flex flex-col">
                    <div className="text-sm text-gray-400 capitalize">
                      {transaction.type} (<span className={statusClass}>{transaction.status}</span>)
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(transaction.date)}
                    </div>
                  </div>
                  <div className={`font-bold ${amountClass}`}>
                    {amountSign}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className={`px-4 py-2 rounded-lg border border-teal-400/20 transition-all ${
                  pagination.hasPrev 
                    ? 'bg-teal-400/10 text-teal-400 hover:bg-teal-400/20 hover:-translate-y-0.5' 
                    : 'bg-gray-800/30 text-gray-500 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              
              <span className="text-gray-400 text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className={`px-4 py-2 rounded-lg border border-teal-400/20 transition-all ${
                  pagination.hasNext 
                    ? 'bg-teal-400/10 text-teal-400 hover:bg-teal-400/20 hover:-translate-y-0.5' 
                    : 'bg-gray-800/30 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}

        {/* No Transactions */}
        {!loading && transactions.length === 0 && !error && (
          <div className="text-center py-8 text-gray-400">
            No transactions found.
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;