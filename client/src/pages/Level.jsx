import React, { useState, useEffect } from 'react';
import { 
  FiHome, 
  FiTrendingUp, 
  FiAward, 
  FiUser, 
  FiMenu, 
  FiX,
  FiBookmark,
  FiMail,
  FiHelpCircle,
  FiCheck
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/NavBar';
import Sidebar from '../components/SideBar';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/Spinner';





// VIP Levels Page
const VIPLevelsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(3); // Default to VIP 3
  const [userLevel, setUserLevel] = useState(3); // User's actual VIP level
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Loading state for API fetch
  const navigate = useNavigate

//   const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const vipLevels = [
    {
      id: 0,
      name: "VIP 0",
      color: "bg-gradient-to-br from-gray-400 to-gray-600",
      iconColor: "text-white",
      requirement: "Starting Level",
      benefits: [
        "Basic trading access",
        "Standard support",
        "Daily market updates"
      ],
      profit: "0.3%",
      apps: "30",
      minBalance: "$0"
    },
    {
      id: 1,
      name: "VIP 1",
      color: "bg-gradient-to-br from-amber-600 to-amber-800",
      iconColor: "text-white",
      requirement: "0.5% profit per order\n40 apps per set\nMin. balance: $50",
      benefits: [
        "5% bonus on deposits",
        "Priority support",
        "Weekly market analysis"
      ],
      profit: "0.5%",
      apps: "40",
      minBalance: "$50"
    },
    {
      id: 2,
      name: "VIP 2",
      color: "bg-gradient-to-br from-gray-300 to-gray-500",
      iconColor: "text-gray-900",
      requirement: "0.6% profit per order\n45 apps per set\nMin. balance: $1,000",
      benefits: [
        "10% bonus on deposits",
        "Dedicated account manager",
        "Advanced trading tools"
      ],
      profit: "0.6%",
      apps: "45",
      minBalance: "$1,000"
    },
    {
      id: 3,
      name: "VIP 3",
      color: "bg-gradient-to-br from-yellow-400 to-yellow-600",
      iconColor: "text-gray-900",
      requirement: "0.9% profit per order\n50 apps per set\nMin. balance: $4,000",
      benefits: [
        "15% bonus on deposits",
        "Personal trading coach",
        "Exclusive market insights"
      ],
      profit: "0.9%",
      apps: "50",
      minBalance: "$4,000"
    },
    {
      id: 4,
      name: "VIP 4",
      color: "bg-gradient-to-br from-purple-600 to-purple-800",
      iconColor: "text-white",
      requirement: "1.2% profit per order\n60 apps per set\nMin. balance: $10,000",
      benefits: [
        "20% bonus on deposits",
        "24/7 premium support",
        "Private trading signals"
      ],
      profit: "1.2%",
      apps: "60",
      minBalance: "$10,000"
    }
  ];

  // Fetch user's actual VIP level from API
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
    //   navigate('/');
      return;
    }

      const fetchUserVipLevel = async () => {
      try {
        setIsLoading(true);

          const url = `${import.meta.env.VITE_API_BASE_URL}/api/vip/my-level`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserLevel(data.level);
          setCurrentLevel(data.level); // Set current view to user's level
        } else {
          throw new Error('Failed to fetch user VIP level');
        }
      } catch (error) {
        console.error('User VIP level fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };


    fetchUserVipLevel();
  }, [navigate]);

  const updateLevel = (level) => {
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

  const handleMouseDown = (e) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && currentLevel > 0) {
        updateLevel(currentLevel - 1);
      } else if (e.key === 'ArrowRight' && currentLevel < vipLevels.length - 1) {
        updateLevel(currentLevel + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLevel]);

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
        <div 
          className="relative h-96 w-78 perspective-1000 overflow-visible mb-8 ml-5"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDragging(false)}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Level Cards */}
          <div className="absolute inset-0">
            {vipLevels.map((level, index) => (
              <div 
                key={level.id}
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  index === currentLevel ? 'z-30 scale-100' : 
                  index === currentLevel + 1 ? 'z-20 scale-90 translate-x-1/4' :
                  index === currentLevel - 1 ? 'z-20 scale-90 -translate-x-1/4' :
                  'z-10 scale-80 opacity-70'
                }`}
              >
                <div className={`h-full rounded-2xl p-6 text-center ${level.color} ${level.iconColor}`}>
                  <div className={`w-20 h-20 mx-auto mb-5 rounded-full ${level.color} flex items-center justify-center text-2xl font-bold`}>
                    {level.id}
                  </div>
                  <h2 className="text-xl font-bold mb-2">{level.name}</h2>
                  <p className="mb-4 whitespace-pre-line">{level.requirement}</p>
                  <div className="text-left">
                    {level.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center mb-2">
                        <FiCheck className="mr-2" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Level Indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {vipLevels.map((level, index) => (
            <button
              key={level.id}
              onClick={() => updateLevel(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentLevel ? 'bg-teal-400 scale-125' : 'bg-teal-400/30'
              }`}
            />
          ))}
        </div>

        {/* Current Level */}
        <div className="bg-teal-400/10 border border-teal-400/30 rounded-xl p-4 text-center">
          <p className="text-teal-400 text-sm mb-1">Your Current Level</p>
          <h3 className="text-lg font-semibold">{vipLevels[userLevel].name}</h3>
          <div className="w-full h-1.5 bg-teal-400/20 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full"
              style={{ width: `${(userLevel / (vipLevels.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default VIPLevelsPage;