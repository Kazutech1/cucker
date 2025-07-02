// import { useState, useEffect } from 'react';
// import { FiFilter, FiUser, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
// import Sidebar from './Sidebar';
// import axios from 'axios';

// const VipManagement = () => {
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [filters, setFilters] = useState({
//     vipLevel: '',
//     search: ''
//   });
//   const [modalOpen, setModalOpen] = useState(false);
//   const [currentUser, setCurrentUser] = useState({
//     id: '',
//     username: '',
//     currentLevel: 0,
//     newLevel: 0
//   });
//    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

   
//   const api = axios.create({
//     baseURL: import.meta.env.VITE_API_BASE_URL,
//     headers: {
//       'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
//       'Content-Type': 'application/json'
//     }
//   });

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   useEffect(() => {
//     filterUsers();
//   }, [filters, users]);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get('/api/admin/users');
//       setUsers(response.data);
//       setFilteredUsers(response.data);
//     } catch (err) {
//       setError('Failed to fetch users');
//       console.error('API Error:', err.response?.data || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterUsers = () => {
//     let filtered = users.filter(user => {
//       const vipMatch = !filters.vipLevel || 
//         (user.profile && user.profile.vipLevel.toString() === filters.vipLevel);
//       const searchMatch = !filters.search || 
//         user.username.toLowerCase().includes(filters.search.toLowerCase()) ||
//         user.id.toLowerCase().includes(filters.search.toLowerCase());
//       return vipMatch && searchMatch;
//     });
//     setFilteredUsers(filtered);
//   };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const openUpdateModal = (user = null) => {
//     if (user) {
//       setCurrentUser({
//         id: user.id,
//         username: user.username,
//         currentLevel: user.profile?.vipLevel || 0,
//         newLevel: user.profile?.vipLevel || 0
//       });
//     } else {
//       setCurrentUser({
//         id: '',
//         username: '',
//         currentLevel: 0,
//         newLevel: 0
//       });
//     }
//     setModalOpen(true);
//     setError('');
//     setSuccess('');
//   };

//   const closeModal = () => {
//     setModalOpen(false);
//   };

//   const updateVipLevel = async () => {
//   try {
//     setLoading(true);
//     setError('');
    
//     // Convert to number and validate
//     const vipLevel = parseInt(currentUser.newLevel);
//     if (isNaN(vipLevel)) {
//       throw new Error('Invalid VIP level');
//     }

//     const response = await api.put(`/api/admin/users/${currentUser.id}`, {
//       vipLevel: vipLevel // Send only the VIP level
//     });

//     if (!response.data.success) {
//       throw new Error(response.data.message || 'Update failed');
//     }

//     // Update state in multiple ways for reliability
//     // 1. From API response
//     if (response.data.user) {
//       setUsers(prev => prev.map(u => 
//         u.id === response.data.user.id ? response.data.user : u
//       ));
//     }
    
//     // 2. Optimistic update
//     setUsers(prev => prev.map(user => 
//       user.id === currentUser.id
//         ? {
//             ...user,
//             profile: {
//               ...user.profile,
//               vipLevel: vipLevel
//             }
//           }
//         : user
//     ));

//     setSuccess(`VIP level updated to ${vipLevel}`);
//     setTimeout(() => setSuccess(''), 3000);
//     closeModal();
    
//     // Optional: Force refresh from server
//     await fetchUsers();
//   } catch (err) {
//     setError(err.message);
//     console.error('VIP update error:', err.response?.data || err.message);
//   } finally {
//     setLoading(false);
//   }
// };


//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//     }).format(amount || 0);
//   };

  
//    const toggleMobileSidebar = () => {
//     setIsMobileSidebarOpen(!isMobileSidebarOpen);
//   };


//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar active="vip"  isMobileOpen={isMobileSidebarOpen} toggleMobileSidebar={toggleMobileSidebar}  />
      
//       <main className="flex-1 p-4 md:p-6 md:ml-64">
//         <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">VIP Management</h1>
        
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//             {error}
//           </div>
//         )}

//         {success && (
//           <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
//             {success}
//           </div>
//         )}

//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           <div className="p-4 md:p-6 border-b border-gray-200">
//             <h2 className="text-lg md:text-xl font-semibold text-gray-800">User VIP Levels</h2>
            
//             <div className="flex flex-wrap gap-4 mt-4">
//               <div className="relative">
//                 <select
//                   name="vipLevel"
//                   value={filters.vipLevel}
//                   onChange={handleFilterChange}
//                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
//                 >
//                   <option value="">All VIP Levels</option>
//                   <option value="0">Level 0</option>
//                   <option value="1">Level 1</option>
//                   <option value="2">Level 2</option>
//                   <option value="3">Level 3</option>
//                   <option value="4">Level 4</option>
//                   <option value="5">Level 5</option>
//                 </select>
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <FiFilter className="text-gray-400" />
//                 </div>
//               </div>
              
//               <div className="relative flex-grow">
//                 <input
//                   type="text"
//                   name="search"
//                   value={filters.search}
//                   onChange={handleFilterChange}
//                   placeholder="Search by username or ID"
//                   className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
//                 />
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <FiUser className="text-gray-400" />
//                 </div>
//               </div>

//               <button
//                 onClick={() => openUpdateModal()}
//                 className="px-4 py-2 bg-teal-600 text-white rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
//               >
//                 Update User VIP
//               </button>
//             </div>
//           </div>
          
//           <div className="overflow-x-auto">
//             {loading ? (
//               <div className="flex justify-center items-center p-5">
//                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
//               </div>
//             ) : (
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIP Level</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invested</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredUsers.length === 0 ? (
//                     <tr>
//                       <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
//                         {users.length === 0 ? 'No users found' : 'No matching users found'}
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredUsers.map((user) => (
//                       <tr key={user.id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm font-medium text-gray-900">{user.username}</div>
//                           <div className="text-sm text-gray-500">{user.id}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {user.email}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
//                             Level {user.profile?.vipLevel || 0}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {formatCurrency(user.balance)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {formatCurrency(user.profile?.totalInvested || 0)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                           <button
//                             onClick={() => openUpdateModal(user)}
//                             className="text-teal-600 hover:text-teal-900 mr-3"
//                             title="Update VIP Level"
//                           >
//                             <FiEdit2 className="text-lg" />
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* Update VIP Modal */}
//       {modalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
//             <div className="p-6">
//               <div className="flex justify-between items-start">
//                 <h3 className="text-lg font-medium text-gray-900">
//                   {currentUser.id ? `Update VIP for ${currentUser.username}` : 'Update User VIP Level'}
//                 </h3>
//                 <button
//                   onClick={closeModal}
//                   className="text-gray-400 hover:text-gray-500"
//                 >
//                   <FiX className="text-lg" />
//                 </button>
//               </div>
              
//               <div className="mt-4 space-y-4">
//                 {!currentUser.id && (
//                   <div>
//                     <label htmlFor="userId" className="block text-sm font-medium text-gray-700">User ID</label>
//                     <input
//                       type="text"
//                       id="userId"
//                       name="id"
//                       value={currentUser.id}
//                       onChange={(e) => setCurrentUser(prev => ({ ...prev, id: e.target.value }))}
//                       className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
//                     />
//                   </div>
//                 )}
                
//                 <div>
//                   <label htmlFor="newLevel" className="block text-sm font-medium text-gray-700">New VIP Level</label>
//                   <select
//                     id="newLevel"
//                     name="newLevel"
//                     value={currentUser.newLevel}
//                     onChange={(e) => setCurrentUser(prev => ({ ...prev, newLevel: parseInt(e.target.value) }))}
//                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
//                   >
//                     {[0, 1, 2, 3, 4, 5].map(level => (
//                       <option key={level} value={level}>Level {level}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
              
//               <div className="mt-6 flex justify-end space-x-3">
//                 <button
//                   onClick={closeModal}
//                   className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={updateVipLevel}
//                   disabled={loading}
//                   className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
//                 >
//                   {loading ? 'Updating...' : 'Update'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VipManagement;




import { useState, useEffect } from 'react';
import { FiFilter, FiUser, FiEdit2, FiPlus, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import Sidebar from './Sidebar';
import axios from 'axios';

const VipManagement = () => {
  const [users, setUsers] = useState([]);
  const [vipLevels, setVipLevels] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    vipLevel: '',
    search: ''
  });
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: '',
    username: '',
    currentLevel: 0,
    newLevel: 0
  });
  const [currentLevel, setCurrentLevel] = useState({
    id: null,
    level: '',
    name: '',
    profitPerOrder: '',
    appsPerSet: '',
    minBalance: ''
  });
  const [levelToDelete, setLevelToDelete] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
      'Content-Type': 'application/json'
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [filters, users]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, levelsRes] = await Promise.all([
        api.get('/api/admin/users'),
        api.get('/api/admin/vip-levels')
      ]);
      setUsers(usersRes.data);
      setFilteredUsers(usersRes.data);
      setVipLevels(levelsRes.data);
    } catch (err) {
      setError('Failed to load data');
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

  // User VIP Management Functions
  const openUserModal = (user = null) => {
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
    setUserModalOpen(true);
    setError('');
    setSuccess('');
  };

  const updateVipLevel = async () => {
    try {
      setLoading(true);
      setError('');
      
      const vipLevel = parseInt(currentUser.newLevel);
      if (isNaN(vipLevel)) {
        throw new Error('Invalid VIP level');
      }

      const response = await api.put(`/api/admin/users/${currentUser.id}`, {
        vipLevel: vipLevel
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Update failed');
      }

      setUsers(prev => prev.map(u => 
        u.id === response.data.user.id ? response.data.user : u
      ));
      
      setSuccess(`VIP level updated to ${vipLevel}`);
      setTimeout(() => setSuccess(''), 3000);
      setUserModalOpen(false);
    } catch (err) {
      setError(err.message);
      console.error('VIP update error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // VIP Level Management Functions
  const openLevelModal = (level = null) => {
    if (level) {
      setCurrentLevel({
        id: level.level,
        level: level.level.toString(),
        name: level.name || '',
        profitPerOrder: level.profitPerOrder.toString(),
        appsPerSet: level.appsPerSet.toString(),
        minBalance: level.minBalance.toString()
      });
    } else {
      setCurrentLevel({
        id: null,
        level: '',
        name: '',
        profitPerOrder: '',
        appsPerSet: '',
        minBalance: ''
      });
    }
    setLevelModalOpen(true);
    setError('');
    setSuccess('');
  };

  const openDeleteModal = (level) => {
    setLevelToDelete(level);
    setDeleteModalOpen(true);
  };

  const handleLevelChange = (e) => {
    const { name, value } = e.target;
    setCurrentLevel(prev => ({ ...prev, [name]: value }));
  };

  const saveVipLevel = async () => {
    try {
      setLoading(true);
      setError('');

      const levelData = {
        level: parseInt(currentLevel.level),
        name: currentLevel.name,
        profitPerOrder: parseFloat(currentLevel.profitPerOrder),
        appsPerSet: parseInt(currentLevel.appsPerSet),
        minBalance: parseFloat(currentLevel.minBalance)
      };

      let response;
      if (currentLevel.id) {
        response = await api.put(`/api/admin/vip-levels/${currentLevel.id}`, levelData);
      } else {
        response = await api.post('/api/admin/vip-levels', levelData);
      }

      setSuccess(`VIP level ${currentLevel.id ? 'updated' : 'created'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
      setLevelModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save VIP level');
      console.error('Save VIP level error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteVipLevel = async () => {
    try {
      setLoading(true);
      setError('');

      await api.delete(`/api/admin/vip-levels/${levelToDelete.level}`);
      
      setSuccess(`VIP level ${levelToDelete.level} deleted successfully`);
      setTimeout(() => setSuccess(''), 3000);
      setDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete VIP level');
      console.error('Delete VIP level error:', err.response?.data || err.message);
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

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar active="vip" isMobileOpen={isMobileSidebarOpen} toggleMobileSidebar={toggleMobileSidebar} />
      
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

        {/* VIP Levels Configuration Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">VIP Levels Configuration</h2>
            <button
              onClick={() => openLevelModal()}
              className="px-4 py-2 bg-teal-600 text-white rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center"
            >
              <FiPlus className="mr-2" /> Add VIP Level
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vipLevels.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No VIP levels found</td>
                  </tr>
                ) : (
                  vipLevels.map((level) => (
                    <tr key={level.level} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {level.level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {level.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(level.profitPerOrder * 100).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(level.minBalance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openLevelModal(level)}
                          className="text-teal-600 hover:text-teal-900 mr-3"
                          title="Edit"
                        >
                          <FiEdit2 className="text-lg" />
                        </button>
                        {level.level > 0 && (
                          <button
                            onClick={() => openDeleteModal(level)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FiTrash2 className="text-lg" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User VIP Management Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">User VIP Management</h2>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="relative">
                <select
                  name="vipLevel"
                  value={filters.vipLevel}
                  onChange={handleFilterChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">All VIP Levels</option>
                  {vipLevels.map(level => (
                    <option key={level.level} value={level.level}>Level {level.level}</option>
                  ))}
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
                onClick={() => openUserModal()}
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
                            onClick={() => openUserModal(user)}
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

      {/* Update User VIP Modal */}
      {userModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">
                  {currentUser.id ? `Update VIP for ${currentUser.username}` : 'Update User VIP Level'}
                </h3>
                <button
                  onClick={() => setUserModalOpen(false)}
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
                    {vipLevels.map(level => (
                      <option key={level.level} value={level.level}>Level {level.level} - {level.name || 'No name'}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setUserModalOpen(false)}
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

      {/* VIP Level Create/Edit Modal */}
      {levelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">
                  {currentLevel.id ? 'Edit VIP Level' : 'Create New VIP Level'}
                </h3>
                <button
                  onClick={() => setLevelModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700">Level Number</label>
                  <input
                    type="number"
                    id="level"
                    name="level"
                    value={currentLevel.level}
                    onChange={handleLevelChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    disabled={currentLevel.id !== null}
                  />
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={currentLevel.name}
                    onChange={handleLevelChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="profitPerOrder" className="block text-sm font-medium text-gray-700">Profit Per Order (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    id="profitPerOrder"
                    name="profitPerOrder"
                    value={currentLevel.profitPerOrder}
                    onChange={handleLevelChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="appsPerSet" className="block text-sm font-medium text-gray-700">Apps Per Set</label>
                  <input
                    type="number"
                    id="appsPerSet"
                    name="appsPerSet"
                    value={currentLevel.appsPerSet}
                    onChange={handleLevelChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="minBalance" className="block text-sm font-medium text-gray-700">Minimum Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    id="minBalance"
                    name="minBalance"
                    value={currentLevel.minBalance}
                    onChange={handleLevelChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setLevelModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  onClick={saveVipLevel}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete VIP Level Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-700">
                  Are you sure you want to delete VIP Level {levelToDelete?.level}?
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteVipLevel}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
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

export default VipManagement;