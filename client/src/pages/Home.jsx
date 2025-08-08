// Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/NavBar';
import Sidebar from '../components/SideBar';
import BottomNav from '../components/BottomNav';

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef(null);
  const touchStartY = useRef(null);
  const lastTouchMove = useRef(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const slides = [
    {
      imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      title: "AI Revolution",
      description: "Embrace the future with intelligent systems that learn, adapt, and transform industries."
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      title: "Data Visualization",
      description: "Transform complex data into compelling stories with beautiful, intuitive visualizations."
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      title: "Cloud Computing",
      description: "Leverage scalable and secure infrastructure to power your digital transformation."
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      title: "Smart Collaboration",
      description: "Unite teams across the globe with seamless communication tools and workflows."
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      title: "Business Growth",
      description: "Accelerate your organization with strategies that adapt to changing landscapes."
    }
  ];

  const updateSlide = (index) => {
    if (index === currentSlide || index < 0 || index >= slides.length || isScrolling) return;

    setIsScrolling(true);
    setCurrentSlide(index);

    clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 700); // transition duration
  };

  const handleWheel = (e) => {
    if (isScrolling) return;
    e.preventDefault();

    const delta = e.deltaY;

    if (delta > 50 && currentSlide < slides.length - 1) {
      updateSlide(currentSlide + 1);
    } else if (delta < -50 && currentSlide > 0) {
      updateSlide(currentSlide - 1);
    }
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="relative z-10 h-screen">
        <div
          className="h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateY(-${currentSlide * 100}vh)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="h-screen w-full relative flex items-center justify-center overflow-hidden"
            >
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover brightness-60 scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70 flex items-center justify-center">
                <div
                  className={`text-center text-white p-10 transition-all duration-700 ease-out ${
                    currentSlide === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                >
                  <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 bg-clip-text text-transparent">
                    {slide.title}
                  </h2>
                  <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-20 flex flex-col gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => updateSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? 'bg-teal-400 scale-150'
                : 'bg-teal-400/30 hover:bg-teal-400/60 hover:scale-125'
            }`}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;





