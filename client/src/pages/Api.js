// api.js
export const fetchUserProfile = async (token) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch profile');
  return await response.json();
};

export const fetchWithdrawalInfo = async (token) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/withdrawal/info`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch withdrawal info');
  return await response.json();
};

export const fetchUserTasks = async (token) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return await response.json();
};

export const completeTask = async (token, taskId, depositAmount = null) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/${taskId}/complete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: depositAmount ? JSON.stringify({ depositAmount }) : null
  });
  if (!response.ok) throw new Error('Failed to complete task');
  return await response.json();
};

export const rejectTask = async (token, taskId) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/${taskId}/reject`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to reject task');
  return await response.json();
};

export const fetchTaskHistory = async (token) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch task history');
  return await response.json();
};