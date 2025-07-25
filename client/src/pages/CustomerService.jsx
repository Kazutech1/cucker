import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft,
  FiPhone,
  FiMessageCircle,
  FiMail,
  FiSend
} from 'react-icons/fi';

const CustomerService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-16">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-15 p-5 flex justify-between items-center bg-black/30 backdrop-blur-md border-b border-teal-400/15">
        <button 
          onClick={() => navigate(-1)}
          className="bg-black/60 backdrop-blur-md border border-teal-400/15 rounded-xl p-3 cursor-pointer"
        >
          <FiArrowLeft className="w-6 h-6 text-teal-400" />
        </button>
        <div className="w-14"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-32 max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent">
          Customer Support
        </h1>

        <p className="text-gray-400 text-center mb-6">
          Need help? Reach out to our support team through any of the channels below.
        </p>

        <div className="space-y-5">
          {/* Telegram */}
          <a
            href="#"
            className="flex items-center bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-4 hover:bg-black/70 transition"
          >
            <FiSend className="text-teal-400 mr-4" size={24} />
            <span className="text-teal-300 font-medium">Contact us on Telegram</span>
          </a>

          {/* WhatsApp */}
          <a
            href="#"
            className="flex items-center bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-4 hover:bg-black/70 transition"
          >
            <FiMessageCircle className="text-green-400 mr-4" size={24} />
            <span className="text-green-300 font-medium">Chat on WhatsApp</span>
          </a>

          {/* Email */}
          <a
            href="mailto:support@example.com"
            className="flex items-center bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-4 hover:bg-black/70 transition"
          >
            <FiMail className="text-blue-400 mr-4" size={24} />
            <span className="text-blue-300 font-medium">Send us an Email</span>
          </a>

          {/* Phone (optional) */}
          <a
            href="tel:+1234567890"
            className="flex items-center bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-4 hover:bg-black/70 transition"
          >
            <FiPhone className="text-yellow-400 mr-4" size={24} />
            <span className="text-yellow-300 font-medium">Call Us</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default CustomerService;
