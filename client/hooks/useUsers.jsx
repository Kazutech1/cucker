// useUserManagement.js
import { useState, useEffect } from 'react';

const useUserManagement = () => {
  // State for users list and filters
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    role: ''
  });

  // State for selected user
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTaskHistory, setUserTaskHistory] = useState([]);

  // State for tasks
  const [tasks, setTasks] = useState([]);
  const [comboTasks, setComboTasks] = useState([]);

  // Modal states
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isUpdateBalanceModalOpen, setIsUpdateBalanceModalOpen] = useState(false);
  const [isUpdateTaskLimitModalOpen, setIsUpdateTaskLimitModalOpen] = useState(false);
  const [isVerifyTaskModalOpen, setIsVerifyTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [editableTaskDetails, setEditableTaskDetails] = useState({
  profit: '',
  depositAmount: ''
});


  // Form data states
  const [taskAssignmentData, setTaskAssignmentData] = useState({
    taskId: '',
    // isCombo: false
  });
  const [balanceUpdateData, setBalanceUpdateData] = useState({
    balance: '',
    profitBalance: ''
  });
  const [taskLimitData, setTaskLimitData] = useState({
    taskLimit: ''
  });
  const [verificationData, setVerificationData] = useState({
    userTaskId: '',
    approve: true
  });
  const [editTaskData, setEditTaskData] = useState({
    id: '',
    appName: '',
    appReview: '',
    profit: '',
    depositAmount: '',
    appImage: ''
  });

  // Fetch users with filters
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.role) queryParams.append('role', filters.role);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized: Invalid or missing token');
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const data = await response.json();
      setTasks(data.tasks.filter(task => task.depositAmount === null));
      setComboTasks(data.tasks.filter(task => task.depositAmount !== null));
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch user details
  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch user details');
      
      const data = await response.json();
      setSelectedUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user task history
  const getUserTaskHistory = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${userId}/task-history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch user task history');

      const data = await response.json();
      setUserTaskHistory(data.tasks);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Modal handlers
const openAssignTaskModal = () => {
  setTaskAssignmentData({
    taskId: '',
    // isCombo: false
  });
  setEditableTaskDetails({
    profit: '',
    depositAmount: ''
  });
  setIsAssignTaskModalOpen(true);
};

  const openUpdateBalanceModal = () => {
    setBalanceUpdateData({
      balance: selectedUser.balance,
      profitBalance: selectedUser.profitBalance
    });
    setIsUpdateBalanceModalOpen(true);
  };

  const openUpdateTaskLimitModal = () => {
    setTaskLimitData({
      taskLimit: selectedUser.taskLimit
    });
    setIsUpdateTaskLimitModalOpen(true);
  };

  const openVerifyTaskModal = (userTaskId) => {
    setVerificationData({
      userTaskId,
      approve: true
    });
    setIsVerifyTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditTaskData({
      id: task.userTaskId,
      appName: task.appName,
      appReview: task.appReview,
      profit: task.profit,
      depositAmount: task.depositAmount || '',
      appImage: task.appImage
    });
    setIsEditTaskModalOpen(true);
  };

  const closeModal = () => {
    setIsAssignTaskModalOpen(false);
    setIsUpdateBalanceModalOpen(false);
    setIsUpdateTaskLimitModalOpen(false);
    setIsVerifyTaskModalOpen(false);
    setIsEditTaskModalOpen(false);
  };

  // Form change handlers
  const handleTaskAssignmentChange = (e) => {
    const { name, value } = e.target;
    setTaskAssignmentData(prev => ({ ...prev, [name]: value }));
  };

  const handleBalanceUpdateChange = (e) => {
    const { name, value } = e.target;
    setBalanceUpdateData(prev => ({ ...prev, [name]: value }));
  };

  const handleTaskLimitChange = (e) => {
    const { name, value } = e.target;
    setTaskLimitData(prev => ({ ...prev, [name]: value }));
  };

  const handleVerificationChange = (e) => {
    const { name, value } = e.target;
    setVerificationData(prev => ({ ...prev, [name]: value === 'true' }));
  };

  const handleEditTaskChange = (e) => {
    const { name, value } = e.target;
    setEditTaskData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditableTaskChange = (e) => {
  const { name, value } = e.target;
  setEditableTaskDetails(prev => ({ ...prev, [name]: value }));
};

  // Action handlers
const assignTask = async () => {
  try {
    const allTasks = [...tasks, ...comboTasks];
    const selectedTask = allTasks.find(t => t.id === taskAssignmentData.taskId);

    if (!selectedTask) {
      throw new Error('No task selected');
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/assign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        taskId: taskAssignmentData.taskId,
        userIds: [selectedUser.id]
      })
    });
    
    if (!response.ok) throw new Error('Failed to assign task');
    
    const data = await response.json();
    alert(`Successfully assigned task to user. ${data.assigned} assignments made.`);
    closeModal();
    fetchUserDetails(selectedUser.id);
  } catch (err) {
    setError(err.message);
  }
};


const updateTasks = async () => {
  try {
    const allTasks = [...tasks, ...comboTasks];
    const selectedTask = allTasks.find(t => t.id === taskAssignmentData.taskId);

    if (!selectedTask) {
      throw new Error('No task selected');
      
    }

    console.log(selectedTask.id);
    



    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tasks/${selectedTask.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profit: parseFloat(editableTaskDetails.profit),
        depositAmount: editableTaskDetails.depositAmount 
          ? parseFloat(editableTaskDetails.depositAmount)
          : null
      })
    });
    
    if (!response.ok) throw new Error('Failed to update task');
    
    const data = await response.json();
    alert('Task updated successfully');
    closeModal();
    fetchTasks();
    fetchUserDetails(selectedUser.id);
  } catch (err) {
    setError(err.message);
  }
};


  const assignTasks = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/task/${selectedUser.id}/assign-tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      const data = await res.json();
      alert(data.message);
      fetchUserDetails(selectedUser.id);
    } catch (err) {
      alert('Failed to assign tasks');
    }
  };

  const addBonus = async () => {
    try {
      const currentBalance = parseFloat(balanceUpdateData.balance) || 0;
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          balance: currentBalance + 10,
        })
      });

      if (!response.ok) throw new Error('Failed to add bonus');

      const data = await response.json();
      alert('$10 bonus added!');
      fetchUserDetails(selectedUser.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateTask = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/user/tasks/${editTaskData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profit: parseFloat(editTaskData.profit),
          depositAmount: editTaskData.depositAmount ? parseFloat(editTaskData.depositAmount) : null
        })
      });
      
      if (!response.ok) throw new Error('Failed to update task');
      
      const data = await response.json();
      alert('Task updated successfully');
      closeModal();
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateBalance = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          balance: parseFloat(balanceUpdateData.balance),
          profitBalance: parseFloat(balanceUpdateData.profitBalance)
        })
      });
      
      if (!response.ok) throw new Error('Failed to update balance');
      
      const data = await response.json();
      alert('Balance updated successfully');
      closeModal();
      fetchUserDetails(selectedUser.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateTaskLimit = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${selectedUser.id}/task-limit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskLimit: parseInt(taskLimitData.taskLimit)
        })
      });
      
      if (!response.ok) throw new Error('Failed to update task limit');
      
      const data = await response.json();
      alert('Task limit updated successfully');
      closeModal();
      fetchUserDetails(selectedUser.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const verifyTask = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/user-tasks/${verificationData.userTaskId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approve: verificationData.approve
        })
      });
      
      if (!response.ok) throw new Error('Failed to verify task');
      
      const data = await response.json();
      alert(data.message);
      closeModal();
      fetchUserDetails(selectedUser.id);
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Format helpers
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
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Effect to fetch users and tasks when filters change
  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, [filters]);

  // Effect to fetch task history when selected user changes
  useEffect(() => {
    if (selectedUser?.id) {
      getUserTaskHistory(selectedUser.id);
    }
  }, [selectedUser]);

  return {
    // State
    users,
    loading,
    error,
    selectedUser,
    tasks,
    comboTasks,
    isAssignTaskModalOpen,
    isUpdateBalanceModalOpen,
    isUpdateTaskLimitModalOpen,
    isVerifyTaskModalOpen,
    isEditTaskModalOpen,
    isMobileSidebarOpen,
    editableTaskDetails,
    userTaskHistory,
    taskAssignmentData,
    balanceUpdateData,
    taskLimitData,
    verificationData,
    editTaskData,
    filters,
    setTaskAssignmentData,
    setEditableTaskDetails,

    // Handlers
    handleFilterChange,
    handleTaskAssignmentChange,
    handleBalanceUpdateChange,
    handleTaskLimitChange,
    handleVerificationChange,
    handleEditTaskChange,
    handleEditableTaskChange,

    // Actions
    fetchUserDetails,
    assignTask,
    assignTasks,
    addBonus,
    updateTask,
    updateTasks,
    updateBalance,
    updateTaskLimit,
    verifyTask,

    // Modal controls
    openAssignTaskModal,
    openUpdateBalanceModal,
    openUpdateTaskLimitModal,
    openVerifyTaskModal,
    openEditTaskModal,
    closeModal,
    toggleMobileSidebar,
    setSelectedUser,

    // Helpers
    formatCurrency,
    formatDate,
    getStatusBadge
  };
};

export default useUserManagement;