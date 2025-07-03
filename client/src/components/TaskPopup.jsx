// src/components/TaskPopup.jsx
import React from 'react';
import { FiX, FiCheck, FiClock, FiDollarSign } from 'react-icons/fi';

const TaskPopup = ({ task, onComplete, onClose, loading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-teal-400/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{task.appReview.appName}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white"
            disabled={loading}
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="mb-6">
          <img 
            src={task.appReview.appImage} 
            alt={task.appReview.appName} 
            className="w-full h-40 object-contain rounded-lg mb-4 bg-gray-700"
          />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center gap-2">
                <FiDollarSign /> Reward:
              </span>
              <span className="text-green-400 font-medium">
                ${task.appReview.appProfit.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center gap-2">
                <FiClock /> Status:
              </span>
              <span className="capitalize flex items-center gap-1">
                {task.status === 'completed' ? (
                  <>
                    <FiCheck className="text-green-400" /> Completed
                  </>
                ) : (
                  'Pending'
                )}
              </span>
            </div>
            
            <div className="pt-3 text-sm text-gray-400">
              <p>Review the app and return here to complete the task and earn your reward.</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={onComplete}
          disabled={task.status === 'completed' || loading}
          className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            task.status === 'completed'
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-br from-teal-400 to-teal-500 text-white hover:shadow-lg hover:-translate-y-0.5'
          }`}
        >
          {loading ? (
            'Processing...'
          ) : task.status === 'completed' ? (
            'Task Completed'
          ) : (
            <>
              <FiCheck /> Complete Task
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TaskPopup;