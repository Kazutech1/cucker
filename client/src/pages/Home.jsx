import React, { useState, useEffect, useRef } from 'react';
import { FiHome, FiTrendingUp, FiAward, FiUser, FiMenu, FiX } from 'react-icons/fi';
import Navbar from '../components/NavBar';
import Sidebar from '../components/SideBar';
import BottomNav from '../components/BottomNav';





// Home Page
const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showScrollWeight, setShowScrollWeight] = useState(false);
  const scrollTimeout = useRef(null);
  const scrollAccumulator = useRef(0);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
    
    setTimeout(() => {
      setShowScrollWeight(false);
    }, 800);
    
    setCurrentSlide(slideIndex);
    
    setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    
    // Increased scroll weight (threshold)
    scrollAccumulator.current += Math.abs(e.deltaY) * 1.5; // Increased multiplier
    
    if (scrollAccumulator.current >= 100) { // Higher threshold for more resistance
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

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentSlide, isScrolling]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-teal-300/10 blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-teal-300/5 blur-xl"></div>
      </div>

      {/* Navigation */}
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Scroll Progress Indicator */}
      <div className={`fixed top-0 left-0 w-full h-1 bg-teal-400/20 z-40 transition-transform duration-500 ${showScrollWeight ? 'scale-x-100' : 'scale-x-0'}`}
           style={{ transformOrigin: 'left' }}>
        <div className="h-full bg-teal-400 transition-all duration-300" 
             style={{ width: `${(currentSlide / (slides.length - 1)) * 100}%` }}></div>
      </div>

      {/* Scroll Weight Indicator */}
      {showScrollWeight && (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-teal-400 rounded-full opacity-0 animate-pulse-scale z-40"
             style={{ animation: 'pulseScale 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)' }}></div>
      )}

      {/* Vertical Carousel */}
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

      {/* Scroll Indicators */}
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

      {/* Bottom Navigation */}
      <BottomNav   />
      {/* <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-teal-400/15 rounded-t-3xl z-40">
        <div className="max-w-md mx-auto flex justify-around items-center p-2">
          {[
            { icon: <FiHome className="w-5 h-5" />, label: "Home", active: currentSlide === 0 },
            { icon: <FiTrendingUp className="w-5 h-5" />, label: "Start", active: currentSlide === 1 },
            { icon: <FiAward className="w-5 h-5" />, label: "Level", active: currentSlide === 2 },
            { icon: <FiUser className="w-5 h-5" />, label: "Profile", active: currentSlide === 3 },
          ].map((item, index) => (
            <a
              key={index}
              href="#"
              className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
                item.active ? 'text-teal-400 bg-teal-400/10' : 'text-gray-400 hover:text-teal-400'
              }`}
              onClick={(e) => {
                e.preventDefault();
                updateSlide(index);
              }}
            >
              {item.icon}
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </a>
          ))}
        </div>
      </div> */}

      {/* Global CSS for animations */}
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