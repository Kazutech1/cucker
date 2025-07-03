import { useState, useEffect } from 'react';
import { 
  FiEdit2, FiTrash2, FiSave, FiX, FiUser, FiMail, FiPhone, 
  FiDollarSign, FiStar, FiCreditCard, FiPlus, FiMinus 
} from 'react-icons/fi';
import { FaBars, FaTimes } from 'react-icons/fa';
import Sidebar from './Sidebar';
import axios from 'axios';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ADashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDepositsAmount: 0,
    totalWithdrawals: 0,
    totalEarnings: 0,
  });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    vipLevel: ''
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [quickAdjust, setQuickAdjust] = useState({
    field: '',
    amount: 0,
    note: ''
  });

  // Configure axios instance
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
      'Content-Type': 'application/json'
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const statsResponse = await api.get('/api/admin/stats');
        setStats(statsResponse.data);
        
        // Fetch users with more details
        const usersResponse = await api.get('/api/admin/users');
        setUsers(usersResponse.data);
        setFilteredUsers(usersResponse.data);
        
      } catch (err) {
        setError('Failed to load data');
        console.error('API Error:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => {
      const roleMatch = !filters.role || user.role === filters.role;
      const vipMatch = !filters.vipLevel || 
        (user.profile && user.profile.vipLevel == filters.vipLevel);
      return roleMatch && vipMatch;
    });
    setFilteredUsers(filtered);
  }, [filters, users]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value,
      profile: {
        ...prev.profile,
        [name]: name === 'vipLevel' || name === 'totalInvested' ? value : undefined
      }
    }));
  };

  const handleQuickAdjustChange = (e) => {
    const { name, value } = e.target;
    setQuickAdjust(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const quickAdjustBalance = async (operation) => {
    if (!quickAdjust.amount || quickAdjust.amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const amount = operation === 'add' ? quickAdjust.amount : -quickAdjust.amount;
      const field = quickAdjust.field || 'balance';
      
      const response = await api.put(`/api/admin/users/${selectedUser.id}`, {
        [field]: selectedUser[field] + amount
      });

      // Update the users list
      setUsers(prev => prev.map(user => 
        user.id === response.data.id ? response.data : user
      ));
      
      setSelectedUser(response.data);
      setQuickAdjust({ field: '', amount: 0, note: '' });
      setSuccess(`Successfully ${operation === 'add' ? 'added to' : 'subtracted from'} user's ${field}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust balance');
      console.error('Adjust error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveUserChanges = async () => {
    try {
      setLoading(true);
      
      // Prepare the data to send
      const updateData = {
        ...editedUser,
        profile: {
          vipLevel: editedUser.profile?.vipLevel,
          totalInvested: editedUser.profile?.totalInvested
        }
      };
      
      // Remove undefined/null values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null) {
          delete updateData[key];
        }
      });
      
      // Make the API call
      const response = await api.put(`/api/admin/users/${selectedUser.id}`, updateData);
      
      // Update the users list
      setUsers(prev => prev.map(user => 
        user.id === response.data.id ? response.data : user
      ));
      
      setSelectedUser(response.data);
      setEditMode(false);
      setSuccess('User updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
      console.error('Update error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/api/admin/users/${userId}`);
      
      // Update the users list
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(null);
      }
      
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      console.error('Delete error:', err.response?.data || err.message);
    }
  };

  const toggleEditMode = () => {
    if (editMode) {
      setEditMode(false);
    } else {
      setEditedUser({
        ...selectedUser,
        profile: selectedUser.profile || {}
      });
      setEditMode(true);
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const resetUserTasks = async (userId) => {
    if (!confirm('Reset all tasks for this user?')) return;
    
    try {
      await api.post(`/api/admin/tasks/reset-user/${userId}`);
      setSuccess('User tasks reset successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset tasks');
      console.error('Reset tasks error:', err.response?.data || err.message);
    }
  };

  const updateTaskLimit = async (userId, newLimit) => {
    try {
      await api.put('/api/admin/limit', { userId, newLimit });
      setSuccess('Task limit updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task limit');
      console.error('Update limit error:', err.response?.data || err.message);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 p-8 md:ml-64">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isMobileOpen={isMobileSidebarOpen} toggleMobileSidebar={toggleMobileSidebar} />
      
      <main className="flex-1 p-4 md:p-8 md:ml-64">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-md text-white"
        >
          {isMobileSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
            <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Deposits</h3>
            <p className="text-xl md:text-2xl font-bold text-gray-800">{formatCurrency(stats.totalDepositsAmount)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Withdrawals</h3>
            <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.totalWithdrawals}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-gray-500 text-sm font-medium">Current Earnings</h3>
            <p className="text-xl md:text-2xl font-bold text-gray-800">{formatCurrency(stats.totalEarnings)}</p>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">User Management</h2>
            
            <div className="flex flex-wrap gap-2 md:gap-4 mt-4">
              <select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="px-3 py-1 md:px-4 md:py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              
              <select
                name="vipLevel"
                value={filters.vipLevel}
                onChange={handleFilterChange}
                className="px-3 py-1 md:px-4 md:py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All VIP Levels</option>
                {[0, 1, 2, 3, 4, 5].map(level => (
                  <option key={level} value={level}>Level {level}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                            <img 
                              src={user.profilePicture}
                              alt="Profile" 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(user.balance)}</div>
                        <div className="text-sm text-gray-500">Profit: {formatCurrency(user.profitBalance)}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiStar className={`mr-1 ${user.profile?.vipLevel > 0 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                          {user.profile?.vipLevel || 0}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-teal-600 hover:text-teal-900 mr-3"
                          title="View/Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  {editMode ? 'Edit User' : 'User Details'}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={toggleEditMode}
                    className={`p-1 md:p-2 rounded-md flex items-center ${editMode 
                      ? 'bg-gray-200 text-gray-800' 
                      : 'bg-teal-600 text-white'}`}
                  >
                    {editMode ? (
                      <>
                        <FiX className="mr-1" /> Cancel
                      </>
                    ) : (
                      <>
                        <FiEdit2 className="mr-1" /> Edit
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setEditMode(false);
                    }}
                    className="p-1 md:p-2 text-gray-400 hover:text-gray-500"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>
              
              {success && (
                <div className="mt-2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
                  {success}
                </div>
              )}
              
              {error && (
                <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                  {error}
                </div>
              )}
              
              <div className="mt-6 space-y-4">
                {/* Quick Adjust Section */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-semibold mb-3">Quick Adjust</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <select
                      name="field"
                      value={quickAdjust.field}
                      onChange={handleQuickAdjustChange}
                      className="col-span-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="">Select Field</option>
                      <option value="balance">Balance</option>
                      <option value="profitBalance">Profit Balance</option>
                      <option value="totalInvested">Total Invested</option>
                    </select>
                    
                    <input
                      type="number"
                      name="amount"
                      value={quickAdjust.amount}
                      onChange={handleQuickAdjustChange}
                      placeholder="Amount"
                      className="col-span-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                    
                    <input
                      type="text"
                      name="note"
                      value={quickAdjust.note}
                      onChange={handleQuickAdjustChange}
                      placeholder="Note (optional)"
                      className="col-span-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                    
                    <div className="col-span-1 flex space-x-2">
                      <button
                        onClick={() => quickAdjustBalance('add')}
                        className="flex-1 bg-green-500 text-white px-3 py-2 rounded-md text-sm hover:bg-green-600 flex items-center justify-center"
                      >
                        <FiPlus className="mr-1" /> Add
                      </button>
                      <button
                        onClick={() => quickAdjustBalance('subtract')}
                        className="flex-1 bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600 flex items-center justify-center"
                      >
                        <FiMinus className="mr-1" /> Subtract
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Task Management Section */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-semibold mb-3">Task Management</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => resetUserTasks(selectedUser.id)}
                      className="bg-yellow-500 text-white px-3 py-2 rounded-md text-sm hover:bg-yellow-600"
                    >
                      Reset All Tasks
                    </button>
                    
                    <div className="flex items-center">
                      <input
                        type="number"
                        placeholder="New task limit"
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 w-24"
                      />
                      <button
                        onClick={() => updateTaskLimit(selectedUser.id, /* value from input */)}
                        className="ml-2 bg-blue-500 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-600"
                      >
                        Set Task Limit
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* User Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Read-only fields */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <FiUser className="mr-1" /> User ID
                    </h3>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.id}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  
                  {/* Editable fields */}
                  <div className="p-3 rounded-md border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <FiMail className="mr-1" /> Email
                    </h3>
                    {editMode ? (
                      <input
                        type="email"
                        name="email"
                        value={editedUser.email || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                    )}
                  </div>
                  
                  <div className="p-3 rounded-md border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">Username</h3>
                    {editMode ? (
                      <input
                        type="text"
                        name="username"
                        value={editedUser.username || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.username}</p>
                    )}
                  </div>
                  
                  <div className="p-3 rounded-md border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    {editMode ? (
                      <input
                        type="text"
                        name="fullName"
                        value={editedUser.fullName || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.fullName || 'N/A'}</p>
                    )}
                  </div>
                  
                  <div className="p-3 rounded-md border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <FiPhone className="mr-1" /> Phone Number
                    </h3>
                    {editMode ? (
                      <input
                        type="text"
                        name="phoneNumber"
                        value={editedUser.phoneNumber || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.phoneNumber || 'N/A'}</p>
                    )}
                  </div>
                  
                  <div className="p-3 rounded-md border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <FiDollarSign className="mr-1" /> Balance
                    </h3>
                    {editMode ? (
                      <input
                        type="number"
                        name="balance"
                        value={editedUser.balance || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedUser.balance)}</p>
                    )}
                  </div>
                  
                  <div className="p-3 rounded-md border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">Profit Balance</h3>
                    {editMode ? (
                      <input
                        type="number"
                        name="profitBalance"
                        value={editedUser.profitBalance || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedUser.profitBalance)}</p>
                    )}
                  </div>
                  
                  <div className="p-3 rounded-md border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">Role</h3>
                    {editMode ? (
                      <select
                        name="role"
                        value={editedUser.role || 'user'}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.role}</p>
                    )}
                  </div>
                  
                  <div className="p-3 rounded-md border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <FiStar className="mr-1" /> VIP Level
                    </h3>
                    {/* {editMode ? (
                      <select
                        name="vipLevel"
                        value={editedUser.profile?.vipLevel || 0}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      >
                        {[0, 1, 2, 3, 4, 5].map(level => (
                          <option key={level} value={level}>Level {level}</option>
                        ))}
                      </select>
                    ) : (
                    
                    )} */}
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedUser.profile?.vipLevel || 0} "Edit in Vip management"
                      </p>
                  </div>
                  
                  <div className="p-3 rounded-md border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">Total Invested</h3>
                    {editMode ? (
                      <input
                        type="number"
                        name="totalInvested"
                        value={editedUser.profile?.totalInvested || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {formatCurrency(selectedUser.profile?.totalInvested || 0)}
                      </p>
                    )}
                  </div>
                  
                  <div className="p-3 rounded-md border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <FiCreditCard className="mr-1" /> Withdrawal Address
                    </h3>
                    {editMode ? (
                      <input
                        type="text"
                        name="withdrawalAddress"
                        value={editedUser.withdrawalAddress || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.withdrawalAddress || 'N/A'}</p>
                    )}
                  </div>
                  
                  {/* Read-only fields */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500">Total Deposits</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser._count?.deposit || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500">Total Withdrawals</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser._count?.withdrawal || 0}
                    </p>
                  </div>
                </div>
                
                {editMode && (
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={saveUserChanges}
                      disabled={loading}
                      className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center"
                    >
                      {loading ? (
                        'Saving...'
                      ) : (
                        <>
                          <FiSave className="mr-2" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ADashboard;