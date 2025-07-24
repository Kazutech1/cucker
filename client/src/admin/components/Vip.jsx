import React, { useState, useEffect } from 'react';
import { 
  Crown,
  User,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Percent,
  Layers,
  Star
} from 'lucide-react';
import useVipAdmin from '../../../hooks/UseAdminVip';
// import Toast from '../../components/Toast';

const VipManagement = () => {
  const {
    loading,
    error,
    getVipLevels,
    updateUserVipLevel,
    createVipLevel,
    updateVipLevelDetails,
    deleteVipLevel
  } = useVipAdmin();

  const [vipLevels, setVipLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [editingLevel, setEditingLevel] = useState(null);
  const [newLevelForm, setNewLevelForm] = useState({
    level: '',
    name: '',
    profitPerOrder: '',
    appsPerSet: '',
    minBalance: ''
  });
  const [userUpdateForm, setUserUpdateForm] = useState({
    userId: '',
    level: ''
  });
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserUpdateModal, setShowUserUpdateModal] = useState(false);

  // Fetch all VIP levels on mount
  useEffect(() => {
    fetchVipLevels();
  }, []);

  const fetchVipLevels = async () => {
    try {
      const data = await getVipLevels();
      if (Array.isArray(data)) {
        setVipLevels(data);
      } else {
        setToast({
          show: true,
          message: 'Invalid VIP levels data received',
          type: 'error'
        });
      }
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to load VIP levels',
        type: 'error'
      });
    }
  };

  const handleCreateLevel = async () => {
    try {
      await createVipLevel(newLevelForm);
      setToast({
        show: true,
        message: 'VIP level created successfully',
        type: 'success'
      });
      setShowCreateModal(false);
      setNewLevelForm({
        level: '',
        name: '',
        profitPerOrder: '',
        appsPerSet: '',
        minBalance: ''
      });
      fetchVipLevels();
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to create VIP level',
        type: 'error'
      });
    }
  };

  const handleUpdateLevel = async () => {
    if (!editingLevel) return;
    
    try {
      await updateVipLevelDetails(editingLevel.level, editingLevel);
      setToast({
        show: true,
        message: 'VIP level updated successfully',
        type: 'success'
      });
      setShowEditModal(false);
      setEditingLevel(null);
      fetchVipLevels();
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to update VIP level',
        type: 'error'
      });
    }
  };

  const handleDeleteLevel = async (level) => {
    try {
      await deleteVipLevel(level);
      setToast({
        show: true,
        message: `VIP level ${level} deleted successfully`,
        type: 'success'
      });
      fetchVipLevels();
    } catch (err) {
      setToast({
        show: true,
        message: `Failed to delete VIP level ${level}`,
        type: 'error'
      });
    }
  };

  const handleUpdateUserVip = async () => {
    try {
      await updateUserVipLevel(userUpdateForm.userId, userUpdateForm.level);
      setToast({
        show: true,
        message: 'User VIP level updated successfully',
        type: 'success'
      });
      setShowUserUpdateModal(false);
      setUserUpdateForm({
        userId: '',
        level: ''
      });
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to update user VIP level',
        type: 'error'
      });
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <Crown className="mr-2" size={24} />
          VIP Management
        </h2>

        <div className="flex justify-between mb-6">
          <div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-back transition-colors"
            >
              <Plus className="mr-2" size={16} />
              Create New Level
            </button>
          </div>
          <div>
            {/* <button
              onClick={() => setShowUserUpdateModal(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <User className="mr-2" size={16} />
              Update User VIP
            </button> */}
          </div>
        </div>

        {/* VIP Levels Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-800">VIP Levels</h3>
          </div>
          
          {loading && !vipLevels.length ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : vipLevels.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No VIP levels found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit/Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apps/Set</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vipLevels.map((level) => (
                    <tr key={level.level} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="text-yellow-500 mr-2" size={16} />
                          <span className="font-medium">{level.level}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {level.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Percent className="mr-1" size={14} />
                          {level.profitPerOrder}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Layers className="mr-1" size={14} />
                          {level.appsPerSet}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <DollarSign className="mr-1" size={14} />
                          {level.minBalance.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setEditingLevel({...level});
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="inline mr-1" size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteLevel(level.level)}
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

        {/* Create VIP Level Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-slide-down">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold flex items-center">
                    <Plus className="mr-2" size={20} />
                    Create VIP Level
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    <input
                      type="number"
                      value={newLevelForm.level}
                      onChange={(e) => setNewLevelForm({...newLevelForm, level: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                      placeholder="VIP level number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={newLevelForm.name}
                      onChange={(e) => setNewLevelForm({...newLevelForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                      placeholder="VIP level name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profit per Order (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newLevelForm.profitPerOrder}
                      onChange={(e) => setNewLevelForm({...newLevelForm, profitPerOrder: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                      placeholder="Profit percentage"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apps per Set</label>
                    <input
                      type="number"
                      value={newLevelForm.appsPerSet}
                      onChange={(e) => setNewLevelForm({...newLevelForm, appsPerSet: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                      placeholder="Number of apps per set"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Balance ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newLevelForm.minBalance}
                      onChange={(e) => setNewLevelForm({...newLevelForm, minBalance: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                      placeholder="Minimum balance required"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateLevel}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create Level
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit VIP Level Modal */}
        {showEditModal && editingLevel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-slide-down">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold flex items-center">
                    <Edit className="mr-2" size={20} />
                    Edit VIP Level {editingLevel.level}
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editingLevel.name}
                      onChange={(e) => setEditingLevel({...editingLevel, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profit per Order (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingLevel.profitPerOrder}
                      onChange={(e) => setEditingLevel({...editingLevel, profitPerOrder: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apps per Set</label>
                    <input
                      type="number"
                      value={editingLevel.appsPerSet}
                      onChange={(e) => setEditingLevel({...editingLevel, appsPerSet: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Balance ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingLevel.minBalance}
                      onChange={(e) => setEditingLevel({...editingLevel, minBalance: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateLevel}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update User VIP Modal */}
        {showUserUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-slide-down">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold flex items-center">
                    <User className="mr-2" size={20} />
                    Update User VIP Level
                  </h3>
                  <button
                    onClick={() => setShowUserUpdateModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                    <input
                      type="text"
                      value={userUpdateForm.userId}
                      onChange={(e) => setUserUpdateForm({...userUpdateForm, userId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                      placeholder="Enter user ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">VIP Level</label>
                    <select
                      value={userUpdateForm.level}
                      onChange={(e) => setUserUpdateForm({...userUpdateForm, level: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                    >
                      <option value="">Select VIP level</option>
                      {vipLevels.map((level) => (
                        <option key={level.level} value={level.level}>
                          {level.level} - {level.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowUserUpdateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateUserVip}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                  >
                    Update User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {/* {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({...toast, show: false})} 
          />
        )} */}
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

export default VipManagement;