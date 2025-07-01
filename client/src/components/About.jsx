import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const AboutUsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-16">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-15 p-5 flex justify-between items-center bg-black/30 backdrop-blur-md border-b border-teal-400/15">
        <button 
          onClick={() => navigate(-1)}
          className="bg-black/60 backdrop-blur-md border border-teal-400/15 rounded-xl p-3 cursor-pointer hover:bg-teal-400/10 hover:scale-105 transition-all"
        >
          <FiArrowLeft className="w-6 h-6 text-teal-400" />
        </button>
        <div className="w-14"></div> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-32 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent">
          About Us
        </h1>

        {/* About Card */}
        <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6 md:p-8">
          <h2 className="text-xl text-teal-400 mt-6 mb-3 font-semibold">Our Mission</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            At Siemens X, we aim to revolutionize digital finance and innovation through secure, intelligent solutions. Our goal is to make high-tech investment platforms accessible, transparent, and future-ready for everyone.
          </p>

          <h2 className="text-xl text-teal-400 mt-6 mb-3 font-semibold">Our Vision</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            We envision a world where technology and finance merge seamlessly to create sustainable opportunities. Through Siemens X, we are building the next-generation ecosystem that empowers users and institutions globally.
          </p>

          <h2 className="text-xl text-teal-400 mt-6 mb-3 font-semibold">Our Team</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Siemens X is powered by a team of passionate engineers, designers, and thinkers who believe in innovation with integrity. We bring decades of combined experience in blockchain, AI, and fintech to create truly transformative digital experiences.
          </p>

          <h2 className="text-xl text-teal-400 mt-6 mb-3 font-semibold">What We Offer</h2>
          <p className="text-gray-300 leading-relaxed">
            From crypto investments to automated withdrawals, referral programs, and event-based rewards, Siemens X provides a secure, user-first experience with powerful tools for both personal and institutional growth.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;