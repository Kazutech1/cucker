import { useState, useEffect } from 'react';
import { FiFilter, FiUser, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import Sidebar from './Sidebar';
import axios from 'axios';

const VipManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    vipLevel: '',
    search: ''
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: '',
    username: '',
    currentLevel: 0,
    newLevel: 0
  });

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
      'Content-Type': 'application/json'
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [filters, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('API Error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users.filter(user => {
      const vipMatch = !filters.vipLevel || 
        (user.profile && user.profile.vipLevel.toString() === filters.vipLevel);
      const searchMatch = !filters.search || 
        user.username.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.id.toLowerCase().includes(filters.search.toLowerCase());
      return vipMatch && searchMatch;
    });
    setFilteredUsers(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openUpdateModal = (user = null) => {
    if (user) {
      setCurrentUser({
        id: user.id,
        username: user.username,
        currentLevel: user.profile?.vipLevel || 0,
        newLevel: user.profile?.vipLevel || 0
      });
    } else {
      setCurrentUser({
        id: '',
        username: '',
        currentLevel: 0,
        newLevel: 0
      });
    }
    setModalOpen(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const updateVipLevel = async () => {
  try {
    setLoading(true);
    setError('');
    
    // Convert to number and validate
    const vipLevel = parseInt(currentUser.newLevel);
    if (isNaN(vipLevel)) {
      throw new Error('Invalid VIP level');
    }

    const response = await api.put(`/api/admin/users/${currentUser.id}`, {
      vipLevel: vipLevel // Send only the VIP level
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Update failed');
    }

    // Update state in multiple ways for reliability
    // 1. From API response
    if (response.data.user) {
      setUsers(prev => prev.map(u => 
        u.id === response.data.user.id ? response.data.user : u
      ));
    }
    
    // 2. Optimistic update
    setUsers(prev => prev.map(user => 
      user.id === currentUser.id
        ? {
            ...user,
            profile: {
              ...user.profile,
              vipLevel: vipLevel
            }
          }
        : user
    ));

    setSuccess(`VIP level updated to ${vipLevel}`);
    setTimeout(() => setSuccess(''), 3000);
    closeModal();
    
    // Optional: Force refresh from server
    await fetchUsers();
  } catch (err) {
    setError(err.message);
    console.error('VIP update error:', err.response?.data || err.message);
  } finally {
    setLoading(false);
  }
};


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar active="vip" />
      
      <main className="flex-1 p-4 md:p-6 md:ml-64">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">VIP Management</h1>
        
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

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">User VIP Levels</h2>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="relative">
                <select
                  name="vipLevel"
                  value={filters.vipLevel}
                  onChange={handleFilterChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">All VIP Levels</option>
                  <option value="0">Level 0</option>
                  <option value="1">Level 1</option>
                  <option value="2">Level 2</option>
                  <option value="3">Level 3</option>
                  <option value="4">Level 4</option>
                  <option value="5">Level 5</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="text-gray-400" />
                </div>
              </div>
              
              <div className="relative flex-grow">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by username or ID"
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
              </div>

              <button
                onClick={() => openUpdateModal()}
                className="px-4 py-2 bg-teal-600 text-white rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Update User VIP
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-5">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIP Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invested</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        {users.length === 0 ? 'No users found' : 'No matching users found'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Level {user.profile?.vipLevel || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(user.balance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(user.profile?.totalInvested || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openUpdateModal(user)}
                            className="text-teal-600 hover:text-teal-900 mr-3"
                            title="Update VIP Level"
                          >
                            <FiEdit2 className="text-lg" />
                          </button>
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

      {/* Update VIP Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">
                  {currentUser.id ? `Update VIP for ${currentUser.username}` : 'Update User VIP Level'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                {!currentUser.id && (
                  <div>
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700">User ID</label>
                    <input
                      type="text"
                      id="userId"
                      name="id"
                      value={currentUser.id}
                      onChange={(e) => setCurrentUser(prev => ({ ...prev, id: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="newLevel" className="block text-sm font-medium text-gray-700">New VIP Level</label>
                  <select
                    id="newLevel"
                    name="newLevel"
                    value={currentUser.newLevel}
                    onChange={(e) => setCurrentUser(prev => ({ ...prev, newLevel: parseInt(e.target.value) }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    {[0, 1, 2, 3, 4, 5].map(level => (
                      <option key={level} value={level}>Level {level}</option>
                    ))}
                  </select>
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
                  onClick={updateVipLevel}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VipManagement;