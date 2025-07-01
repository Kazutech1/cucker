import React from 'react';

const LoadingSpinner = () => {
  

 return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
      <div className="w-50 h-40 bg-gray-800/80 p-6 rounded-xl border border-teal-400/30 shadow-lg flex flex-col items-center">
        <div className="w-13 h-13 border-4 border-gray-600 border-t-teal-400 rounded-full animate-spin mb-4"></div>
        <p className="text-white font-medium">Loading...</p>
      </div>
    </div>
  );
};


export default LoadingSpinner;