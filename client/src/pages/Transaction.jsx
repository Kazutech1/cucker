import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiFilter, FiSearch } from 'react-icons/fi';

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
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: '',
    dateRange: null
  });
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount) || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  // Get transaction type icon
  const getTransactionIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'deposit':
        return '💰';
      case 'withdrawal':
        return '💸';
      case 'bonus':
        return '🎁';
      case 'profit':
        return '📈';
      default:
        return '🔹';
    }
  };

  // Fetch transaction history
  const fetchTransactionHistory = async (page = 1) => {
    try {
      setLoading(page === 1);
      setRefreshing(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange[0].toISOString());
        params.append('endDate', filters.dateRange[1].toISOString());
      }

      const response = await fetch(`${API_BASE_URL}/api/transactions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
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
      setError(error.message || 'Failed to load transaction history. Please try again.');
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initialize data fetching
  useEffect(() => {
    fetchTransactionHistory();
  }, [navigate, filters]);

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchTransactionHistory(page);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchTransactionHistory(pagination.currentPage);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      search: '',
      dateRange: null
    });
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-16">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-15 p-4 flex justify-between items-center bg-black/30 backdrop-blur-md border-b border-teal-400/15">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-black/60 hover:bg-teal-400/10 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-teal-400" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent">
            Transaction History
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-black/60 hover:bg-teal-400/10 transition-colors"
          >
            <FiRefreshCw className={`w-5 h-5 text-teal-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg bg-black/60 hover:bg-teal-400/10 transition-colors"
          >
            <FiFilter className="w-5 h-5 text-teal-400" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-20 pb-32 max-w-3xl">
        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Transaction Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="">All Types</option>
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="bonus">Bonus</option>
                  <option value="profit">Profit</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="verified">Verified</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search transactions..."
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <FiSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-teal-400/10 text-teal-400 rounded-lg hover:bg-teal-400/20 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Stats Summary */}

        

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-white/10 border-t-teal-400 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading your transaction history...</p>
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 mb-6 flex flex-col items-center">
            <div className="text-red-400 mb-2">{error}</div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-400/10 text-red-400 rounded-lg hover:bg-red-400/20 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              Try Again
            </button>
          </div>
        )}

        {/* Transaction List */}
        {!loading && transactions.length > 0 && (
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const isPositive = ['deposit', 'bonus', 'profit'].includes(transaction.type.toLowerCase());
              const amountClass = isPositive ? 'text-green-400' : 'text-red-400';
              const statusClass = {
                pending: 'text-yellow-400',
                completed: 'text-green-400',
                rejected: 'text-red-400',
                verified: 'text-teal-400'
              }[transaction.status.toLowerCase()] || 'text-gray-400';
              
              return (
                <div 
                  key={transaction.id}
                  className="bg-black/40 border border-teal-400/10 rounded-lg p-4 hover:bg-teal-400/5 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl mt-1">{getTransactionIcon(transaction.type)}</div>
                      <div>
                        <div className="font-medium capitalize">
                          {transaction.type}
                          <span className={`text-xs ml-2 px-2 py-1 rounded-full ${statusClass} bg-opacity-10`}>
                            {transaction.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(transaction.date)}
                        </div>
                        {/* {transaction.reference && (
                          <div className="text-xs text-gray-500 mt-1">
                            Ref: {transaction.reference}
                          </div>
                        )} */}
                      </div>
                    </div>
                    <div className={`text-right ${amountClass}`}>
                      <div className="font-bold">
                        {isPositive ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      {transaction.fee > 0 && (
                        <div className="text-xs text-gray-400">
                          Fee: {formatCurrency(transaction.fee)}
                        </div>
                      )}
                    </div>
                  </div>
                  {transaction.description && (
                    <div className="mt-3 text-sm text-gray-300">
                      {transaction.description}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev || loading}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  pagination.hasPrev 
                    ? 'bg-teal-400/10 text-teal-400 hover:bg-teal-400/20' 
                    : 'bg-gray-800/30 text-gray-500 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              
              <div className="text-sm text-gray-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext || loading}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  pagination.hasNext 
                    ? 'bg-teal-400/10 text-teal-400 hover:bg-teal-400/20' 
                    : 'bg-gray-800/30 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && transactions.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">No transactions found</h3>
            <p className="text-gray-500 mb-6">
              {filters.type || filters.status || filters.search 
                ? 'Try adjusting your filters' 
                : 'Your transaction history appears to be empty'}
            </p>
            {filters.type || filters.status || filters.search ? (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-teal-400/10 text-teal-400 rounded-lg hover:bg-teal-400/20 transition-colors"
              >
                Clear Filters
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;