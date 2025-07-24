import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiUser, 
  FiMenu, 
  FiX,
  FiCamera,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import LoadingSpinner from '../components/Spinner';

const UpdateProfilePage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    profilePicture: '',
    referralCode: '',
    vipLevel: { name: '', profitPerOrder: 0 },
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
        username: profileData.user.username || '',
        email: profileData.user.email || '',
        fullName: profileData.user.fullName || '',
        phoneNumber: profileData.user.phoneNumber || '',
        profilePicture: profileData.user.profilePicture || '',
        referralCode: profileData.user.referralCode || '',
        vipLevel: profileData.user.vipLevel || { name: '', profitPerOrder: 0 },
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
      
      if (file.size > 2 * 1024 * 1024) { // 2MB limit (reduced from 5MB for better UX)
        setError('Image size should be less than 2MB');
        return;
      }

      setProfilePictureFile(file);
      setError(null); // Clear previous errors
      
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
    setProfilePicturePreview(userData.profilePicture || '');
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
      if (userData.fullName !== '') formData.append('fullName', userData.fullName);
      if (userData.phoneNumber !== '') formData.append('phoneNumber', userData.phoneNumber);
      
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
      if (userData.walletAddress && userData.walletAddress !== '') {
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
      if (formData.has('fullName') || formData.has('phoneNumber') || formData.has('profilePicture') || (userData.walletAddress && userData.walletAddress !== '')) {
        setSuccess('Profile updated successfully!');
        // Refresh profile data
        setTimeout(() => setSuccess(null), 3000); // Auto-dismiss success message
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
    <div className="min-h-screen bg-gray-900 text-white pb-16">
      {isLoading && <LoadingSpinner />}

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-15 p-4 flex justify-between items-center bg-gray-800 border-b border-gray-700 shadow-md">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          aria-label="Go back"
        >
          <FiArrowLeft className="w-6 h-6 text-teal-400" />
        </button>
        <h1 className="text-xl font-bold text-teal-400">Update Profile</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-20 pb-20 max-w-md">
        {/* Profile Card */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-400/20 bg-gray-700 flex items-center justify-center transition-all duration-300 group-hover:border-teal-400/40">
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
                className="absolute bottom-0 right-0 bg-teal-500 rounded-full p-2 hover:bg-teal-400 transition-all shadow-md hover:shadow-teal-400/30"
                aria-label="Change profile picture"
              >
                <FiCamera className="w-5 h-5 text-white" />
              </button>
              {profilePicturePreview && (
                <button
                  onClick={removePicture}
                  className="absolute top-0 right-0 bg-red-500 rounded-full p-2 hover:bg-red-400 transition-all shadow-md hover:shadow-red-400/30"
                  aria-label="Remove profile picture"
                >
                  <FiTrash2 className="w-5 h-5 text-white" />
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePictureChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {profilePictureFile ? 'New image selected' : 'Click to upload (max 2MB)'}
            </p>
          </div>

          {/* Read-Only Profile Info */}
          <div className="space-y-4 mb-8">
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Username</p>
              <p className="text-teal-400 font-medium truncate">{userData.username || 'Not set'}</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Email</p>
              <p className="text-teal-400 font-medium truncate">{userData.email || 'Not set'}</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Referral Code</p>
              <p className="text-teal-400 font-medium">{userData.referralCode || 'Not set'}</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <p className="text-gray-400 text-xs uppercase tracking-wider">VIP Level</p>
              <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mt-1">
                {userData.vipLevel.name || 'Not set'}
              </div>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Balance</p>
              <p className="text-teal-400 font-medium">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(userData.balance)}
              </p>
            </div>
          </div>

          {/* Update Profile Form */}
          <form onSubmit={handleUpdateProfile}>
            {error && (
              <div className="flex items-center bg-red-900/20 border border-red-400/50 rounded-lg p-3 mb-4 text-red-400 text-sm">
                <FiAlertCircle className="mr-2 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center bg-green-900/20 border border-green-400/50 rounded-lg p-3 mb-4 text-green-400 text-sm">
                <FiCheckCircle className="mr-2 flex-shrink-0" />
                {success}
              </div>
            )}

            {/* Full Name Input */}
            <div className="mb-4">
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1" htmlFor="fullName">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={userData.fullName}
                onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400 focus:outline-none transition"
                placeholder="Your full name"
              />
            </div>

            {/* Phone Number Input */}
            <div className="mb-4">
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1" htmlFor="phoneNumber">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={userData.phoneNumber}
                onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400 focus:outline-none transition"
                placeholder="Your phone number"
              />
            </div>

            {/* Wallet Address Input */}
            <div className="mb-6">
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1" htmlFor="walletAddress">
                Withdrawal Address
              </label>
              <input
                type="text"
                id="walletAddress"
                value={userData.walletAddress}
                onChange={(e) => setUserData({ ...userData, walletAddress: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400 focus:outline-none transition"
                placeholder="Your withdrawal address"
              />
              <p className="text-gray-500 text-xs mt-1">This is where your earnings will be sent</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-teal-500/30 hover:-translate-y-0.5'
              } flex items-center justify-center`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfilePage;