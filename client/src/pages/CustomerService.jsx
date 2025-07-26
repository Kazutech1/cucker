import React, { useEffect, useRef, useState } from 'react';
import { FiX, FiSend, FiMessageCircle } from 'react-icons/fi';

const CustomerService = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);

  // Handle animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match this with the transition duration
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div
        ref={modalRef}
        className={`relative w-full max-w-md bg-gray-900 rounded-t-2xl border-t border-teal-400/20 shadow-xl transform transition-transform duration-300 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag Handle */}
        <div className="pt-3 flex justify-center">
          <div className="h-1 w-10 bg-gray-600 rounded-full"></div>
        </div>
        
        {/* Modal Header */}
        <div className="px-4 pt-2 pb-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Contact Support</h2>
          <button 
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="px-4 pb-6">
          <p className="text-gray-400 mb-4 text-sm">
            Choose a support channel to get immediate help
          </p>
          
          <div className="space-y-3">
            {/* Telegram 1 */}
            <a
              href="https://t.me/CS3_SiemensX"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors active:bg-gray-700"
            >
              <div className="flex items-center">
                <div className="bg-blue-900/30 p-2 rounded-lg mr-3">
                  <FiSend className="text-blue-400" size={18} />
                </div>
                <div>
                  <p className="font-medium text-white">Telegram Support 1</p>
                  <p className="text-xs text-gray-400">@support_team1</p>
                </div>
              </div>
              <span className="text-blue-400 text-xs bg-blue-900/20 px-2 py-1 rounded">Instant</span>
            </a>
            
            {/* Telegram 2 */}
            <a
              href="https://t.me/CS1_SiemensX"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors active:bg-gray-700"
            >
              <div className="flex items-center">
                <div className="bg-blue-900/30 p-2 rounded-lg mr-3">
                  <FiSend className="text-blue-400" size={18} />
                </div>
                <div>
                  <p className="font-medium text-white">Telegram Support 2</p>
                  <p className="text-xs text-gray-400">@support_team2</p>
                </div>
              </div>
              <span className="text-blue-400 text-xs bg-blue-900/20 px-2 py-1 rounded">Instant</span>
            </a>
            
            {/* WhatsApp 1 */}
            <a
              href="https://wa.me/17866033764"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors active:bg-gray-700"
            >
              <div className="flex items-center">
                <div className="bg-green-900/30 p-2 rounded-lg mr-3">
                  <FiMessageCircle className="text-green-400" size={18} />
                </div>
                <div>
                  <p className="font-medium text-white">WhatsApp Support 1</p>
                  <p className="text-xs text-gray-400">+1 786 603 3764</p>
                </div>
              </div>
              <span className="text-green-400 text-xs bg-green-900/20 px-2 py-1 rounded">24/7</span>
            </a>
            
            {/* WhatsApp 2 */}
            <a
              href="https://wa.me/18322381774"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors active:bg-gray-700"
            >
              <div className="flex items-center">
                <div className="bg-green-900/30 p-2 rounded-lg mr-3">
                  <FiMessageCircle className="text-green-400" size={18} />
                </div>
                <div>
                  <p className="font-medium text-white">WhatsApp Support 2</p>
                  <p className="text-xs text-gray-400">+1 832 238 1774</p>
                </div>
              </div>
              <span className="text-green-400 text-xs bg-green-900/20 px-2 py-1 rounded">24/7</span>
            </a>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="px-4 py-3 border-t border-gray-800 text-center text-gray-400 text-xs">
          <p>Typically replies within minutes</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerService;