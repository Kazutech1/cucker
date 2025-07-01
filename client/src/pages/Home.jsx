import React, { useState, useEffect, useRef } from 'react';
import { FiHome, FiTrendingUp, FiAward, FiUser } from 'react-icons/fi';
import Navbar from '../components/NavBar';
import Sidebar from '../components/SideBar';
import BottomNav from '../components/BottomNav';

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showScrollWeight, setShowScrollWeight] = useState(false);
  const scrollTimeout = useRef(null);
  const scrollAccumulator = useRef(0);
  const touchStartY = useRef(null);
  const lastTouchMove = useRef(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const slides = [
    {
      imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      title: "Innovation",
      description: "Cutting-edge technology solutions that transform the way we work and live"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      title: "Analytics",
      description: "Data-driven insights that power intelligent business decisions"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      title: "Collaboration",
      description: "Building stronger teams through seamless communication and shared goals"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68e2c6b696?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      title: "Growth",
      description: "Scaling your business with sustainable strategies and innovative approaches"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      title: "Success",
      description: "Achieving excellence through dedication, innovation, and strategic thinking"
    }
  ];

  const updateSlide = (slideIndex) => {
    if (slideIndex < 0 || slideIndex >= slides.length || isScrolling) return;

    setIsScrolling(true);
    setShowScrollWeight(true);

    setTimeout(() => setShowScrollWeight(false), 800);
    setCurrentSlide(slideIndex);

    clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 700);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    scrollAccumulator.current += Math.abs(e.deltaY) * 1.5;

    if (scrollAccumulator.current >= 100) {
      if (e.deltaY > 0 && currentSlide < slides.length - 1) {
        updateSlide(currentSlide + 1);
      } else if (e.deltaY < 0 && currentSlide > 0) {
        updateSlide(currentSlide - 1);
      }
      scrollAccumulator.current = 0;
    }

    clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      scrollAccumulator.current = 0;
    }, 200);
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    lastTouchMove.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (isScrolling || touchStartY.current === null || lastTouchMove.current === null) return;

    const deltaY = touchStartY.current - lastTouchMove.current;

    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0 && currentSlide < slides.length - 1) {
        updateSlide(currentSlide + 1);
      } else if (deltaY < 0 && currentSlide > 0) {
        updateSlide(currentSlide - 1);
      }
    }

    touchStartY.current = null;
    lastTouchMove.current = null;
  };

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentSlide, isScrolling]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-teal-300/10 blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-teal-300/5 blur-xl"></div>
      </div>

      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={`fixed top-0 left-0 w-full h-1 bg-teal-400/20 z-40 transition-transform duration-500 ${showScrollWeight ? 'scale-x-100' : 'scale-x-0'}`}
           style={{ transformOrigin: 'left' }}>
        <div className="h-full bg-teal-400 transition-all duration-300" 
             style={{ width: `${(currentSlide / (slides.length - 1)) * 100}%` }}></div>
      </div>

      {showScrollWeight && (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-teal-400 rounded-full opacity-0 animate-pulse-scale z-40"
             style={{ animation: 'pulseScale 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)' }}></div>
      )}

      <div className="relative z-10 h-screen">
        <div 
          className="h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateY(-${currentSlide * 100}vh)` }}
        >
          {slides.map((slide, index) => (
            <div 
              key={index} 
              className={`h-screen w-full relative flex items-center justify-center transition-all duration-700 ${
                isScrolling && index === currentSlide ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
              }`}
            >
              <img 
                src={slide.imageUrl} 
                alt={slide.title} 
                className="absolute inset-0 w-full h-full object-cover brightness-70 transition-transform duration-1000 ease-out"
                style={{ transform: isScrolling && index === currentSlide ? 'scale(1.03)' : 'scale(1)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 via-gray-800/30 to-gray-900/40 flex items-center justify-center">
                <div 
                  className={`text-center text-white p-10 transition-all duration-1000 ease-out ${
                    currentSlide === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                >
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 bg-clip-text text-transparent">
                    {slide.title}
                  </h2>
                  <p className="text-gray-300 max-w-xl mx-auto text-lg">
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-20 flex flex-col gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => updateSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index ? 'bg-teal-400 scale-150' : 'bg-teal-400/30 hover:bg-teal-400/60 hover:scale-125'
            }`}
          />
        ))}
      </div>

      <BottomNav />

      <style jsx global>{`
        @keyframes pulseScale {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Home;