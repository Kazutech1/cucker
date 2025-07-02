import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiHome, 
  FiTrendingUp, 
  FiAward, 
  FiUser, 
  FiMenu, 
  FiX,
  FiBookmark,
  FiMail,
  FiHelpCircle,
  FiBell,
  FiLogOut,
  FiCamera,
  FiTrash2
} from 'react-icons/fi';
import Navbar from '../components/NavBar';
import Sidebar from '../components/SideBar';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/Spinner';

const UpdateProfilePage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({
    username: 'Loading...',
    email: 'Loading...',
    fullName: '',
    phoneNumber: '',
    profilePicture: '',
    referralCode: 'Loading...',
    vipLevel: { name: 'Loading...', profitPerOrder: 0 },
    balance: 0,
    walletAddress: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const fileInputRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch current profile data and withdrawal address
  const fetchProfileAndAddress = async () => {
    if (!token) {
      navigate('/');
      return;
    }

    try {
      setIsLoading(true);

      // Fetch profile data
      const profileResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!profileResponse.ok) {
        throw new Error('Profile request failed');
      }

      const profileData = await profileResponse.json();
      if (profileData.message !== 'Profile retrieved successfully') {
        throw new Error(profileData.message || 'Failed to fetch profile');
      }

      // Fetch withdrawal address
      const withdrawalResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/withdrawal/info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!withdrawalResponse.ok) {
        throw new Error('Failed to fetch withdrawal info');
      }

      const withdrawalData = await withdrawalResponse.json();

      setUserData({
        username: profileData.user.username || 'Loading...',
        email: profileData.user.email || 'Loading...',
        fullName: profileData.user.fullName || '',
        phoneNumber: profileData.user.phoneNumber || '',
        profilePicture: profileData.user.profilePicture || '',
        referralCode: profileData.user.referralCode || 'Loading...',
        vipLevel: profileData.user.vipLevel || { name: 'Loading...', profitPerOrder: 0 },
        balance: profileData.user.balance || 0,
        walletAddress: withdrawalData.withdrawalAddress || ''
      });

      if (profileData.user.profilePicture) {
        setProfilePicturePreview(profileData.user.profilePicture);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile picture selection
  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.match('image.*')) {
        setError('Please select an image file (JPEG, PNG)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }

      setProfilePictureFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicturePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected profile picture
  const removePicture = () => {
    setProfilePictureFile(null);
    setProfilePicturePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission for profile and wallet address
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      
      // Add profile data if changed
      if (userData.fullName) formData.append('fullName', userData.fullName);
      if (userData.phoneNumber) formData.append('phoneNumber', userData.phoneNumber);
      
      // Add profile picture if selected
      if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile);
      }

      // First update profile (including picture if needed)
      if (formData.has('fullName') || formData.has('phoneNumber') || formData.has('profilePicture')) {
        const profileResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        });

        const profileData = await profileResponse.json();

        if (!profileResponse.ok || profileData.message !== 'Profile updated successfully') {
          throw new Error(profileData.message || 'Failed to update profile');
        }
      }

      // Then update wallet address if changed
      if (userData.walletAddress) {
        const addressResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/withdrawal/address`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ address: userData.walletAddress })
        });

        const addressData = await addressResponse.json();

        if (!addressResponse.ok || addressData.message !== 'Withdrawal address set successfully') {
          throw new Error(addressData.message || 'Failed to update withdrawal address');
        }
      }

      // Only show success if at least one update was made
      if (formData.has('fullName') || formData.has('phoneNumber') || formData.has('profilePicture') || userData.walletAddress) {
        setSuccess('Profile updated successfully!');
        // Refresh profile data
        fetchProfileAndAddress();
      } else {
        throw new Error('Please fill in at least one field to update.');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize page
  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchProfileAndAddress();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-16">
      {isLoading && <LoadingSpinner />}

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-15 p-5 flex justify-between items-center bg-black/30 backdrop-blur-md border-b border-teal-400/15">
        <button 
          onClick={() => navigate(-1)}
          className="bg-black/60 backdrop-blur-md border border-teal-400/15 rounded-xl p-3 cursor-pointer"
        >
          <FiArrowLeft className="w-6 h-6 text-teal-400" />
        </button>
        <div className="w-14"></div> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-32 max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent">
          Update Profile
        </h1>

        {/* Profile Card */}
        <div className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6 mb-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-teal-400/30 bg-gray-800 flex items-center justify-center">
                {profilePicturePreview ? (
                  <img 
                    src={profilePicturePreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="w-16 h-16 text-gray-500" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 bg-teal-500 rounded-full p-2 hover:bg-teal-400 transition-colors"
              >
                <FiCamera className="w-5 h-5 text-white" />
              </button>
              {profilePicturePreview && (
                <button
                  onClick={removePicture}
                  className="absolute top-0 right-0 bg-red-500 rounded-full p-2 hover:bg-red-400 transition-colors"
                >
                  <FiTrash2 className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePictureChange}
              accept="image/*"
              className="hidden"
            />
            <p className="text-gray-400 text-sm mt-2">
              {profilePictureFile ? 'New image selected' : 'Click camera to upload'}
            </p>
          </div>

          {/* Read-Only Profile Info */}
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-gray-400 text-sm">Username</p>
              <p className="text-teal-400 font-medium">{userData.username}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Email</p>
              <p className="text-teal-400 font-medium">{userData.email}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Referral Code</p>
              <p className="text-teal-400 font-medium">{userData.referralCode}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">VIP Level</p>
              <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-gray-300 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                <svg className="mr-1" fill="currentColor" viewBox="0 0 24 24" width="14" height="14">
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z"/>
                </svg>
                {userData.vipLevel.name}
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Balance</p>
              <p className="text-teal-400 font-medium">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(userData.balance)}
              </p>
            </div>
          </div>

          {/* Update Profile Form */}
          <form onSubmit={handleUpdateProfile} className="bg-black/60 backdrop-blur-md border border-teal-400/20 rounded-xl p-6">
            {error && (
              <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-3 mb-4 text-green-400 text-sm">
                {success}
              </div>
            )}

            {/* Full Name Input */}
            <div className="mb-5">
              <label className="block text-gray-400 text-sm mb-2" htmlFor="fullName">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={userData.fullName}
                onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                className="w-full bg-black/30 border border-teal-400/30 rounded-xl p-4 text-white focus:border-teal-400 focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>

            {/* Phone Number Input */}
            <div className="mb-5">
              <label className="block text-gray-400 text-sm mb-2" htmlFor="phoneNumber">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={userData.phoneNumber}
                onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                className="w-full bg-black/30 border border-teal-400/30 rounded-xl p-4 text-white focus:border-teal-400 focus:outline-none"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Wallet Address Input */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2" htmlFor="walletAddress">
                Withdrawal Address
              </label>
              <input
                type="text"
                id="walletAddress"
                value={userData.walletAddress}
                onChange={(e) => setUserData({ ...userData, walletAddress: e.target.value })}
                className="w-full bg-black/30 border border-teal-400/30 rounded-xl p-4 text-white focus:border-teal-400 focus:outline-none"
                placeholder="Enter your withdrawal address"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-teal-400 to-teal-500 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
              }`}
            >
              {isSubmitting ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfilePage;