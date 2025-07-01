import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const TermsAndConditions = () => {
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
          Terms & Conditions
        </h1>

        {/* Terms Box */}
        <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6 md:p-8 max-h-[70vh] overflow-y-auto">
          <p className="font-bold text-gray-200">
            SIEMENS X Terms and Conditions for Using the Siemens X Website
          </p>
          
          <hr className="my-6 border-gray-700" />

          <h2 className="text-xl text-teal-400 mt-6 mb-3 font-semibold">1. Acceptance of Terms</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Before accessing or using Siemens X, please read the following terms, conditions of use, and 
            disclaimers carefully. By accessing or using the Siemens X website, you agree to comply 
            with these terms and all applicable internet regulations. If you do not agree with any part of 
            these terms, conditions, or applicable laws, please do not use the Siemens X website.
          </p>

          <h2 className="text-xl text-teal-400 mt-6 mb-3 font-semibold">2. Ownership and Copyright</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Unless otherwise stated in writing, the websites{' '}
            <a 
              href="https://www.siemensx.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-teal-400 hover:underline"
            >
              https://www.siemensx.com
            </a>{' '}
            and{' '}
            <a 
              href="https://www.siemensx.tech" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-teal-400 hover:underline"
            >
              https://www.siemensx.tech
            </a>{' '}
            are the exclusive property of SIEMENS X and are operated and 
            maintained by the Siemens X team. The main domain is used for informational, commercial, 
            and communication purposes, while subdomains may be used for tools, data processing, or 
            product offerings.
          </p>

          <h2 className="text-xl text-teal-400 mt-6 mb-3 font-semibold">3. Commercial Use Limitation</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            All content provided by Siemens X is intended for commercial and authorized use only. 
            Unless explicitly granted in writing, you may not reproduce, alter, distribute, publish, 
            license, sell, or create derivative works from any materials, infographics, applications, or 
            software obtained from Siemens X. Siemens X reserves the right to revoke, limit, or modify 
            access to its services at its sole discretion.
          </p>

          <hr className="my-6 border-gray-700" />

          <p className="font-bold text-gray-200">
            President, Siemens<br />
            Official Seal
          </p>

          <p className="text-center text-gray-500 mt-8 text-sm">
            © 2025 Siemens X. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;