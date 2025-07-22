import { useState } from 'react';
import axios from 'axios';

const useTaskManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem('admin_token') || '';
  };

  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  /**
   * Assign tasks to a user (with optional forced task)
   * @param {object} params
   * @param {string} params.userId
   * @param {number} params.taskCount
   * @param {number} params.totalProfit
   * @param {number} [params.forcedNumber]
   * @param {number} [params.depositAmount]
   * @param {number} [params.customProfit]
   * @returns {Promise<{data: Array, stats: object}>}
   */
  const assignTasksToUser = async ({
    userId,
    taskCount,
    totalProfit,
    forcedNumber,
    depositAmount,
    customProfit
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/admin/assign', {
        userId,
        taskCount,
        totalProfit,
        ...(forcedNumber !== undefined && { forcedNumber }),
        ...(depositAmount !== undefined && { depositAmount }),
        ...(customProfit !== undefined && { customProfit })
      });
      
      return {
        data: response.data.data,
        stats: response.data.stats
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign tasks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Edit an existing task
   * @param {string} taskId
   * @param {object} params
   * @param {string} [params.status]
   * @param {number} [params.profitAmount]
   * @param {boolean} [params.makeForced]
   * @param {number} [params.depositAmount]
   * @param {number} [params.customProfit]
   * @returns {Promise<object>} Updated task
   */
  const editTask = async (taskId, {
    status,
    profitAmount,
    makeForced,
    depositAmount,
    customProfit
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/api/admin/${taskId}`, {
        ...(status && { status }),
        ...(profitAmount !== undefined && { profitAmount }),
        ...(makeForced !== undefined && { makeForced }),
        ...(depositAmount !== undefined && { depositAmount }),
        ...(customProfit !== undefined && { customProfit })
      });
      
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get all users' tasks with filtering and pagination
   * @param {object} params
   * @param {string} [params.userId]
   * @param {string} [params.status]
   * @param {boolean} [params.isForced]
   * @param {string} [params.productId]
   * @param {string} [params.dateFrom] - ISO date string
   * @param {string} [params.dateTo] - ISO date string
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   * @param {string} [params.sortBy='createdAt']
   * @param {string} [params.sortOrder='desc']
   * @returns {Promise<{data: Array, pagination: object}>}
   */
  const getAllUsersTasks = async ({
    userId,
    status,
    isForced,
    productId,
    dateFrom,
    dateTo,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/admin/tasks', {
        params: {
          userId,
          status,
          isForced,
          productId,
          dateFrom,
          dateTo,
          page,
          limit,
          sortBy,
          sortOrder
        }
      });
      
      return {
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Soft delete a task
   * @param {string} taskId
   * @returns {Promise<void>}
   */
  const deleteTask = async (taskId) => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`/api/admin/${taskId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  };


  /**
 * Update task deposit amount and custom profit
 * @param {object} params
 * @param {string} params.userId
 * @param {number} params.taskNumber
 * @param {number} [params.depositAmount]
 * @param {number} [params.taskProfit]
 * @returns {Promise<object>} Updated task and change information
 */
const updateTaskDetails = async ({
  userId,
  taskNumber,
  depositAmount,
  taskProfit
}) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await api.post('/api/admin/forced', {
      userId,
      taskNumber,
      ...(depositAmount !== undefined && { depositAmount }),
      ...(taskProfit !== undefined && { taskProfit })
    });
    
    return response.data.data;
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to update task details');
    throw err;
  } finally {
    setLoading(false);
  }
};



 return {
  loading,
  error,
  assignTasksToUser,
  editTask,
  getAllUsersTasks,
  deleteTask,
  updateTaskDetails // Add this line
};
};

export default useTaskManagement;