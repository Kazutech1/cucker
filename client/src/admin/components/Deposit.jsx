import { useState, useEffect } from 'react';
import { FiFilter, FiUser, FiCheck, FiX, FiEye, FiClock } from 'react-icons/fi';
import Sidebar from './Sidebar';

const ADeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    userId: ''
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDeposit, setCurrentDeposit] = useState({
    id: '',
    status: 'verified',
    proofImage: ''
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDeposits();
  }, [filters]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.userId) queryParams.append('userId', filters.userId);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/deposits?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error('Failed to fetch deposits');
      }
      
      const data = await response.json();
      setDeposits(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openProcessModal = (deposit, action = 'verify') => {
    setCurrentDeposit({
      id: deposit.id,
      status: action === 'verify' ? 'verified' : 'rejected',
      proofImage: deposit.proofImage
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentDeposit({
      id: '',
      status: 'verified',
      proofImage: ''
    });
  };

  const handleStatusChange = (e) => {
    setCurrentDeposit(prev => ({ ...prev, status: e.target.value }));
  };

  const submitAction = async () => {
    try {
      const body = {
        depositId: currentDeposit.id,
        status: currentDeposit.status
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/deposits/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error('Failed to verify deposit');
      }
      
      const data = await response.json();
      alert(data.message);
      closeModal();
      fetchDeposits();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar active="deposits" isMobileOpen={isMobileSidebarOpen} toggleMobileSidebar={toggleMobileSidebar} />
      
      <main className="flex-1 p-4 md:p-4 md:ml-64">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Deposit Management</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Deposits</h2>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="relative">
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="text-gray-400" />
                </div>
              </div>
              
              <div className="relative flex-grow">
                <input
                  type="text"
                  name="userId"
                  value={filters.userId}
                  onChange={handleFilterChange}
                  placeholder="Filter by User ID"
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proof Image</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deposits.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No deposits found</td>
                    </tr>
                  ) : (
                    deposits.map((deposit) => (
                      <tr key={deposit.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{deposit.id}</td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{deposit.user.username}</div>
                          <div className="text-sm text-gray-500">{deposit.user.id}</div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(deposit.amount)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          <a 
                            href={deposit.proofImage} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:text-teal-800 flex items-center"
                          >
                            <FiEye className="mr-1" /> View Proof
                          </a>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(deposit.status)}`}>
                            {deposit.status}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(deposit.createdAt)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                          {deposit.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openProcessModal(deposit, 'verify')}
                                className="flex items-center px-3 py-1 bg-teal-100 text-teal-800 rounded hover:bg-teal-200 text-sm"
                              >
                                <FiCheck className="mr-1" /> Verify
                              </button>
                              <button
                                onClick={() => openProcessModal(deposit, 'decline')}
                                className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
                              >
                                <FiX className="mr-1" /> Decline
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Verify/Decline Deposit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">
                  {currentDeposit.status === 'verified' ? 'Verify Deposit' : 'Decline Deposit'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="actionId" className="block text-sm font-medium text-gray-700">Deposit ID</label>
                  <input
                    type="text"
                    id="actionId"
                    value={currentDeposit.id}
                    readOnly
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="actionStatus" className="block text-sm font-medium text-gray-700">Action</label>
                  <select
                    id="actionStatus"
                    value={currentDeposit.status}
                    onChange={handleStatusChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    <option value="verified">Verify</option>
                    <option value="rejected">Decline</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Proof Image</label>
                  <div className="mt-2 border border-gray-200 rounded-md p-2">
                    <img 
                      src={currentDeposit.proofImage} 
                      alt="Deposit proof" 
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAction}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    currentDeposit.status === 'verified' 
                      ? 'bg-teal-600 hover:bg-teal-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
                >
                  {currentDeposit.status === 'verified' ? 'Verify' : 'Decline'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ADeposits;