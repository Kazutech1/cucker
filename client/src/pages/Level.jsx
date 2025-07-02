import React, { useState, useEffect } from 'react';
import { FiCheck, FiArrowUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/NavBar';
import Sidebar from '../components/SideBar';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/Spinner';

const VIPLevelsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [userLevel, setUserLevel] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [vipLevels, setVipLevels] = useState([]);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch VIP levels and user's level from API
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch VIP levels
        const levelsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vip/levels`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (!levelsResponse.ok) throw new Error('Failed to fetch VIP levels');
        const levelsData = await levelsResponse.json();
        setVipLevels(levelsData);
        
        // Fetch user's VIP level
        const userResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vip/my-level`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (!userResponse.ok) throw new Error('Failed to fetch user VIP level');
        const userData = await userResponse.json();
        
        setUserLevel(userData.level);
        setCurrentLevel(userData.level); // Set current view to user's level
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const updateLevel = (level) => {
    if (vipLevels.length === 0) return;
    level = Math.max(0, Math.min(level, vipLevels.length - 1));
    setCurrentLevel(level);
  };

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const diffX = startX - currentX;
    const threshold = 50;
    
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0 && currentLevel < vipLevels.length - 1) {
        updateLevel(currentLevel + 1);
      } else if (diffX < 0 && currentLevel > 0) {
        updateLevel(currentLevel - 1);
      }
    }
  };

const handleUpgrade = () => {
  navigate('/support');
};

  // Get color gradient based on level
  const getLevelColor = (level) => {
    const colors = [
      'bg-gradient-to-br from-gray-400 to-gray-600', // VIP 0
      'bg-gradient-to-br from-amber-600 to-amber-800', // VIP 1
      'bg-gradient-to-br from-gray-300 to-gray-500', // VIP 2
      'bg-gradient-to-br from-yellow-400 to-yellow-600', // VIP 3
      'bg-gradient-to-br from-purple-600 to-purple-800' // VIP 4
    ];
    return colors[level % colors.length];
  };

  // Get text color based on level
  const getTextColor = (level) => {
    return level === 2 ? 'text-gray-900' : 'text-white';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-16">
      {isLoading && <LoadingSpinner />}

      {/* Navigation */}
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-24 max-w-md">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-teal-400 mb-2">VIP Levels</h1>
          <p className="text-gray-400">Unlock exclusive benefits as you level up</p>
        </div>

        {/* Level Cards Container */}
        {vipLevels.length > 0 && (
          <div 
            className="relative h-96 w-78 perspective-1000 overflow-visible mb-8 ml-5"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            {/* Level Cards */}
            <div className="absolute inset-0">
              {vipLevels.map((level, index) => (
                <div 
                  key={level.level}
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    index === currentLevel ? 'z-30 scale-100' : 
                    index === currentLevel + 1 ? 'z-20 scale-90 translate-x-1/4' :
                    index === currentLevel - 1 ? 'z-20 scale-90 -translate-x-1/4' :
                    'z-10 scale-80 opacity-70'
                  }`}
                >
                  <div className={`h-full rounded-2xl p-6 text-center ${getLevelColor(level.level)} ${getTextColor(level.level)}`}>
                    <div className={`w-20 h-20 mx-auto mb-5 rounded-full ${getLevelColor(level.level)} flex items-center justify-center text-2xl font-bold`}>
                      {level.level}
                    </div>
                    <h2 className="text-xl font-bold mb-2">{level.name}</h2>
                    <p className="mb-4">
                      {(level.profitPerOrder * 100).toFixed(1)}% profit per order<br />
                      {level.appsPerSet} apps per set<br />
                      Min. balance: ${level.minBalance.toLocaleString()}
                    </p>
                    
                    {/* Upgrade button for levels above user's current level */}
                    {level.level > userLevel && (
                      <button
                        onClick={() => handleUpgrade(level.level)}
                        className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto transition-all"
                      >
                        <FiArrowUp className="mr-2" />
                        Upgrade to {level.name}
                      </button>
                    )}
                    
                    {/* Current level indicator */}
                    {level.level === userLevel && (
                      <div className="mt-4 px-4 py-2 bg-white/10 rounded-full text-sm">
                        Your Current Level
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Level Indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {vipLevels.map((level, index) => (
            <button
              key={level.level}
              onClick={() => updateLevel(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentLevel ? 'bg-teal-400 scale-125' : 'bg-teal-400/30'
              }`}
            />
          ))}
        </div>

        {/* Current Level Progress */}
        {vipLevels.length > 0 && userLevel !== undefined && (
          <div className="bg-teal-400/10 border border-teal-400/30 rounded-xl p-4 text-center">
            <p className="text-teal-400 text-sm mb-1">Your Current Level</p>
            <h3 className="text-lg font-semibold">
              {vipLevels.find(l => l.level === userLevel)?.name || 'Loading...'}
            </h3>
            <div className="w-full h-1.5 bg-teal-400/20 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full"
                style={{ width: `${(userLevel / (vipLevels.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default VIPLevelsPage;