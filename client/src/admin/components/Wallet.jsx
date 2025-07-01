import { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiX, 
  FiCheck,
  FiFilter,
  FiToggleLeft,
  FiToggleRight
} from 'react-icons/fi';
import Sidebar from './Sidebar';

const AWallets = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    currency: '',
    status: ''
  });
  const [newWallet, setNewWallet] = useState({
    currency: '',
    address: '',
    network: ''
  });
  const [editWallet, setEditWallet] = useState({
    id: '',
    currency: '',
    address: '',
    network: '',
    isActive: true
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  

  const currencies = [
    { value: 'BTC', label: 'Bitcoin (BTC)' },
    { value: 'ETH', label: 'Ethereum (ETH)' },
    { value: 'USDT', label: 'Tether (USDT)' },
    { value: 'USDC', label: 'USD Coin (USDC)' },
    { value: 'LTC', label: 'Litecoin (LTC)' },
    { value: 'XRP', label: 'Ripple (XRP)' }
  ];

  const networks = [
    { value: 'Mainnet', label: 'Mainnet' },
    { value: 'TRC20', label: 'TRC20' },
    { value: 'ERC20', label: 'ERC20' },
    { value: 'BEP20', label: 'BEP20' },
    { value: 'Polygon', label: 'Polygon' }
  ];

  useEffect(() => {
    fetchWallets();
  }, [filters]);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.currency) queryParams.append('currency', filters.currency);
      if (filters.status) queryParams.append('isActive', filters.status);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/wallets?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error('Failed to fetch wallets');
      }
      
      const data = await response.json();
      setWallets(data);
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

  const handleNewWalletChange = (e) => {
    const { name, value } = e.target;
    setNewWallet(prev => ({ ...prev, [name]: value }));
  };

  const handleEditWalletChange = (e) => {
    const { name, value } = e.target;
    setEditWallet(prev => ({ 
      ...prev, 
      [name]: name === 'isActive' ? value === 'true' : value 
    }));
  };

  const addWallet = async () => {
    try {
      if (!newWallet.currency || !newWallet.address || !newWallet.network) {
        setError('All fields are required');
        return;
      }

      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/wallets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newWallet)
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        if (response.status === 400) throw new Error('Invalid wallet data');
        throw new Error('Failed to add wallet');
      }
      
      const data = await response.json();
      setSuccess(data.message);
      setNewWallet({
        currency: '',
        address: '',
        network: ''
      });
      fetchWallets();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (wallet) => {
    setEditWallet(wallet);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditWallet({
      id: '',
      currency: '',
      address: '',
      network: '',
      isActive: true
    });
  };

  const updateWallet = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/wallets/${editWallet.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editWallet)
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        if (response.status === 404) throw new Error('Wallet not found');
        throw new Error('Failed to update wallet');
      }
      
      const data = await response.json();
      setSuccess(data.message);
      closeEditModal();
      fetchWallets();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (walletId) => {
    setWalletToDelete(walletId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setWalletToDelete(null);
  };

  const deleteWallet = async () => {
    if (!walletToDelete) return;

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/wallets/${walletToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        if (response.status === 404) throw new Error('Wallet not found');
        throw new Error('Failed to delete wallet');
      }
      
      const data = await response.json();
      setSuccess(data.message);
      closeDeleteModal();
      fetchWallets();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  const getCurrencyBadgeClass = (currency) => {
    switch (currency) {
      case 'BTC': return 'bg-orange-500';
      case 'ETH': return 'bg-blue-500';
      case 'USDT': return 'bg-green-500';
      case 'USDC': return 'bg-blue-600';
      case 'LTC': return 'bg-gray-400';
      case 'XRP': return 'bg-gray-800';
      default: return 'bg-gray-500';
    }
  };

  
   const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };


  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar active="wallets" isMobileOpen={isMobileSidebarOpen} toggleMobileSidebar={toggleMobileSidebar} />
      
      <main className="flex-1 p-4 md:p-4 md:ml-64">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Wallet Management</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Add Wallet Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Add New Wallet</h2>
          </div>
          
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={newWallet.currency}
                  onChange={handleNewWalletChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                >
                  <option value="">Select Currency</option>
                  {currencies.map(currency => (
                    <option key={currency.value} value={currency.value}>{currency.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Wallet Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={newWallet.address}
                  onChange={handleNewWalletChange}
                  placeholder="Enter wallet address"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="network" className="block text-sm font-medium text-gray-700">Network</label>
                <select
                  id="network"
                  name="network"
                  value={newWallet.network}
                  onChange={handleNewWalletChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                >
                  <option value="">Select Network</option>
                  {networks.map(network => (
                    <option key={network.value} value={network.value}>{network.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                onClick={addWallet}
                disabled={loading}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center"
              >
                <FiPlus className="mr-1" /> Add Wallet
              </button>
            </div>
          </div>
        </div>

        {/* Wallets List Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-0">Admin Wallets</h2>
              
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
                <div className="relative">
                  <select
                    name="currency"
                    value={filters.currency}
                    onChange={handleFilterChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">All Currencies</option>
                    {currencies.map(currency => (
                      <option key={currency.value} value={currency.value}>{currency.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiFilter className="text-gray-400" />
                  </div>
                </div>
                
                <div className="relative">
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {filters.status === 'true' ? (
                      <FiToggleRight className="text-green-500" />
                    ) : filters.status === 'false' ? (
                      <FiToggleLeft className="text-red-500" />
                    ) : (
                      <FiFilter className="text-gray-400" />
                    )}
                  </div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Network</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {wallets.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No wallets found</td>
                    </tr>
                  ) : (
                    wallets.map((wallet) => (
                      <tr key={wallet.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{wallet.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getCurrencyBadgeClass(wallet.currency)}`}>
                            {wallet.currency}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          <span title={wallet.address}>
                            {`${wallet.address.substring(0, 10)}...${wallet.address.substring(wallet.address.length - 10)}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {wallet.network}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${wallet.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {wallet.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(wallet.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(wallet)}
                              className="text-teal-600 hover:text-teal-900 flex items-center"
                            >
                              <FiEdit2 className="mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => openDeleteModal(wallet.id)}
                              className="text-red-600 hover:text-red-900 flex items-center"
                            >
                              <FiTrash2 className="mr-1" /> Delete
                            </button>
                          </div>
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

      {/* Edit Wallet Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">Edit Wallet</h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="editCurrency" className="block text-sm font-medium text-gray-700">Currency</label>
                  <select
                    id="editCurrency"
                    name="currency"
                    value={editWallet.currency}
                    onChange={handleEditWalletChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    {currencies.map(currency => (
                      <option key={currency.value} value={currency.value}>{currency.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="editAddress" className="block text-sm font-medium text-gray-700">Wallet Address</label>
                  <input
                    type="text"
                    id="editAddress"
                    name="address"
                    value={editWallet.address}
                    onChange={handleEditWalletChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="editNetwork" className="block text-sm font-medium text-gray-700">Network</label>
                  <select
                    id="editNetwork"
                    name="network"
                    value={editWallet.network}
                    onChange={handleEditWalletChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    {networks.map(network => (
                      <option key={network.value} value={network.value}>{network.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    id="editStatus"
                    name="isActive"
                    value={editWallet.isActive.toString()}
                    onChange={handleEditWalletChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  onClick={updateWallet}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  {loading ? 'Updating...' : 'Update Wallet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-700">Are you sure you want to delete this wallet? This action cannot be undone.</p>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteWallet}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AWallets;