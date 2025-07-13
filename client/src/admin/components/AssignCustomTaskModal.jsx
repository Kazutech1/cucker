import { useState } from 'react';

export default function AssignCustomTaskModal({ isOpen, onClose, userId, tasks, onSuccess }) {
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [profit, setProfit] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isComboTask, setIsComboTask] = useState(false);

  const handleAssign = async () => {
    if (!selectedTaskId || !profit) {
      setError('Task and profit are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/user-tasks/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          userId,
          taskId: selectedTaskId,
          profit: parseFloat(profit),
          depositAmount: depositAmount ? parseFloat(depositAmount) : null
        })
      });

      if (!response.ok) throw new Error('Failed to assign task');

      const result = await response.json();
      onSuccess?.(result.userTask);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
  <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Assign Custom Task</h2>
      
      {/* Tabbed interface */}
      <div className="flex mb-6 border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsComboTask(false)}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            !isComboTask 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Normal Task
        </button>
        <button
          onClick={() => setIsComboTask(true)}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            isComboTask 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Combo Task
        </button>
      </div>

      {/* Task selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Task
        </label>
        <select
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={selectedTaskId}
          onChange={e => setSelectedTaskId(e.target.value)}
        >
          <option value="">Select a task</option>
          {tasks.map(task => (
            <option key={task.id} value={task.id}>
              {task.appName} {task.depositAmount && `(Combo)`}
            </option>
          ))}
        </select>
      </div>

      {/* Task details */}
      <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium">Task Details</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profit ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter profit amount"
            value={profit}
            onChange={e => setProfit(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {isComboTask && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deposit Amount ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter deposit amount"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150"
        >
          Cancel
        </button>
        <button
          onClick={handleAssign}
          disabled={loading || !selectedTaskId || !profit || (isComboTask && !depositAmount)}
          className={`px-4 py-2.5 rounded-lg text-white ${
            isComboTask 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          } disabled:opacity-50 transition-colors duration-150`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Assigning...
            </>
          ) : 'Assign Task'}
        </button>
      </div>
    </div>
  </div>
</div>
  );
}
