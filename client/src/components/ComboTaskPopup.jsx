import React from 'react';
import { FiX, FiCheck, FiAlertCircle, FiDollarSign, FiLayers } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';

const ComboTaskPopup = ({ task, message, penalty, onVerify, onClose, loading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-purple-500/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FiAlertCircle className="text-yellow-400" /> Combo Task Verification
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white"
            disabled={loading}
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="text-purple-400">
                <FiLayers size={24} />
              </div>
              <div>
                <h4 className="font-medium">{task.appName}</h4>
                <p className="text-sm text-gray-400">Combo Task ({task.comboAmount}x completions)</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-400">{message}</p>
              {penalty && (
                <p className="text-sm text-yellow-400 mt-1">
                  Penalty applied: {formatCurrency(penalty)}
                </p>
              )}
            </div>
            
            <div className="pt-3 text-sm text-gray-400">
              <p>This combo task requires a verified deposit of {formatCurrency(task.comboAmount)} to complete.</p>
              <p className="mt-2">Please make a deposit and verify it to continue with this task.</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 rounded-lg font-medium transition-all bg-gray-700 hover:bg-gray-600 text-white"
          >
            Cancel
          </button>
       
        </div>
      </div>
    </div>
  );
};

export default ComboTaskPopup;