import { useState } from 'react';
import axios from 'axios';

const useTaskManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem('token') || '';
  };

  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  const getUserTasks = async (status, isForced) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await api.get('/api/tasks', {
      params: { 
        status,
        isForced
        // Remove page and limit parameters
      }
    });

    return response.data.data;
    
  } catch (err) {
    let errorMessage = 'Failed to fetch tasks';
    if (axios.isAxiosError(err)) {
      errorMessage = err.response?.data?.message || errorMessage;
      
      if (err.response?.status === 403) {
        errorMessage = "User is blocked or unauthorized";
      } else if (err.response?.status === 404) {
        errorMessage = "No tasks found";
      }
    }
    setError(errorMessage);
    throw new Error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const completeTask = async (taskId, proof) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await api.patch(`/api/tasks/${taskId}/complete`, { proof });
    
    // Log the response for debugging
    console.log('Complete Task Response:', response.data);
    
    // Ensure the response has the expected structure
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Invalid response from server');
    }

    return {
      taskId: response.data.data.id,
      productName: response.data.data.product.name,
      completedAt: response.data.data.completedAt
    };
  } catch (err) {
    let errorMessage = 'Failed to complete task';
    
    if (axios.isAxiosError(err)) {
      // Handle axios-specific errors
      if (err.response) {
        errorMessage = err.response.data?.message || errorMessage;
        
        if (err.response.status === 403) {
          errorMessage = "You don't have permission to complete this task";
        } else if (err.response.status === 400) {
          if (err.response.data?.message?.includes('Proof is required')) {
            errorMessage = "Please provide proof of completion";
          }
        }
      }
    }
    
    setError(errorMessage);
    throw new Error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const declineTask = async (taskId) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await api.patch(`/api/tasks/${taskId}/decline`);
    
    return {
      taskId: response.data.data.id,
      status: response.data.data.status,
      message: response.data.message || 'Task declined successfully'
    };
  } catch (err) {
    let errorMessage = 'Failed to decline task';
    if (axios.isAxiosError(err)) {
      errorMessage = err.response?.data?.message || errorMessage;
      
      if (err.response?.status === 400) {
        if (err.response?.data?.message?.includes('declinable state')) {
          errorMessage = "Task is not in a declinable state";
        }
      } else if (err.response?.status === 404) {
        errorMessage = "Task not found";
      }
    }
    setError(errorMessage);
    throw new Error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const getCurrentTask = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/tasks/current-task');
      
      return response.data.data;
    } catch (err) {
      let errorMessage = 'Failed to get current task';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
        
        if (err.response?.status === 404) {
          errorMessage = "No current task available";
        }
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetError = () => setError(null);

  return {
    loading,
    error,
    getUserTasks,
    completeTask,
    declineTask,
    getCurrentTask,
    resetError
  };
};

export default useTaskManagement;