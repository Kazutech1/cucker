import React, { useState, useEffect } from 'react';
import { 
  Users,
  User,
  Mail,
  Phone,
  DollarSign,
  ArrowUpRight,
  Trash2,
  Edit,
  Shield,
  Star
} from 'lucide-react';
import Toast from '../../components/Toast';
import { Link } from 'react-router-dom';
import useUserAdmin from '../../../hooks/useAdminUsers';

const UsersList = () => {
  const {
    loading,
    error,
    getUsers,
    deleteUser
  } = useUserAdmin();

  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Fetch all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setToast({
          show: true,
          message: 'Invalid users data received',
          type: 'error'
        });
      }
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to load users',
        type: 'error'
      });
    }
  };

  const handleDeleteClick = (userId) => {
    setSelectedUserId(userId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserId) return;
    
    try {
      await deleteUser(selectedUserId);
      setToast({
        show: true,
        message: 'User deleted successfully',
        type: 'success'
      });
      setShowDeleteModal(false);
      setSelectedUserId(null);
      fetchUsers();
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to delete user',
        type: 'error'
      });
    }
  };

  const formatDate = (dateString) => {
    try {
      return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const getRoleBadge = (role) => {
    const roleClasses = {
      ADMIN: 'bg-purple-100 text-purple-800',
      USER: 'bg-blue-100 text-blue-800',
      default: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleClasses[role] || roleClasses.default}`}>
        {role || 'Unknown'}
      </span>
    );
  };

  const getVipBadge = (vipLevel) => {
    return vipLevel ? (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
        <Star className="mr-1" size={12} />
        VIP {vipLevel}
      </span>
    ) : null;
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <Users className="mr-2" size={24} />
          User Management
        </h2>

        {/* Users Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-800">All Users</h3>
          </div>
          
          {loading && !users.length ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balances</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.profilePicture ? (
                              <img className="h-10 w-10 rounded-full" src={user.profilePicture} alt="" />
                            ) : (
                              <User className="h-10 w-10 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullName || user.username || 'No name'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Mail className="mr-1" size={14} />
                          {user.email}
                        </div>
                        {user.phoneNumber && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone className="mr-1" size={14} />
                            {user.phoneNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="mr-1" size={14} />
                          <span className="text-sm text-gray-900">
                            {user.balance?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <DollarSign className="mr-1" size={14} />
                          <span className="text-sm text-gray-500">
                            {user.profitBalance?.toFixed(2) || '0.00'} (Profit)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {getRoleBadge(user.role)}
                          {getVipBadge(user.profile?.vipLevel)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          to={`/admin/users/${user.id}`}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <ArrowUpRight className="inline mr-1" size={16} />
                          Manage
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(user.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="inline mr-1" size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-slide-down">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold flex items-center">
                    <AlertCircle className="mr-2 text-red-500" size={20} />
                    Confirm Deletion
                  </h3>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <p className="mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({...toast, show: false})} 
          />
        )}
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default UsersList;