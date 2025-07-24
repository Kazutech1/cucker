import React, { useState, useEffect } from 'react';
import { 
  FiX, 
  FiClock, 
  FiCheck, 
  FiAlertCircle, 
  FiDollarSign,
  FiRefreshCw
} from 'react-icons/fi';
import useTaskManagement from '../../hooks/useStart';

const TaskHistoryModal = ({ onClose }) => {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1
  });
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [loading, setLoading] = useState(true);
  
  const { getTaskHistory } = useTaskManagement();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { tasks, pagination: paginationData } = await getTaskHistory({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      
      setHistory(tasks);
      setPagination({
        page: paginationData.currentPage,
        limit: paginationData.itemsPerPage,
        totalItems: paginationData.totalItems,
        totalPages: paginationData.totalPages
      });
    } catch (error) {
      console.error('Failed to fetch task history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [pagination.page, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const changePage = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <FiCheck className="text-green-500" />;
      case 'rejected':
        return <FiAlertCircle className="text-red-500" />;
      default:
        return <FiClock className="text-yellow-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-teal-400/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent">
            Task History
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 transition-colors"
            aria-label="Close modal"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1">
            <label className="block text-gray-400 text-sm font-medium">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="assigned">Assigned</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="block text-gray-400 text-sm font-medium">From Date</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-gray-400 text-sm font-medium">To Date</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-gray-400 text-sm font-medium">Sort By</label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="createdAt">Date</option>
              <option value="profitAmount">Profit</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          
          <div className="text-sm text-gray-400">
            Showing {history.length} of {pagination.totalItems} tasks
          </div>
        </div>

        {/* History Table */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No task history found matching your filters
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Task</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {history.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {task.product?.image && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <img 
                                className="h-10 w-10 rounded-md object-cover" 
                                src={task.product.image} 
                                alt={task.product?.name || 'Task'} 
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-white">
                              {task.product?.name || 'Task'}
                            </div>
                            <div className="text-xs text-gray-400">
                              #{task.taskNumber} • ID: {task.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className="capitalize text-white">{task.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                        {formatDate(task.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <FiDollarSign className="text-green-400" />
                          <span className="font-bold text-green-400">
                            ${task.profitAmount?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 px-2">
              <button
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-4 py-2 rounded-lg flex items-center gap-1 transition-colors ${
                  pagination.page === 1 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-teal-500 hover:bg-teal-600 text-white'
                }`}
              >
                Previous
              </button>
              
              <div className="text-sm text-gray-300">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              
              <button
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`px-4 py-2 rounded-lg flex items-center gap-1 transition-colors ${
                  pagination.page === pagination.totalPages 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-teal-500 hover:bg-teal-600 text-white'
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskHistoryModal;