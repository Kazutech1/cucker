import { useEffect, useState } from 'react';
import { FiShield, FiZap, FiGithub } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Toast Component
const Toast = ({ message, type = 'info', onClose }) => {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  }[type];

  return (
    <div className={`${bgColor} text-white px-4 py-3 rounded-md shadow-lg mb-2 flex justify-between items-center`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white font-bold">
        ×
      </button>
    </div>
  );
};

const AuthPage = () => {
  const [currentTab, setCurrentTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Form state
  const [loginForm, setLoginForm] = useState({
    loginInput: '',
    loginPassword: ''
  });
  
  const [signupForm, setSignupForm] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    securityPin: '',
    referredBy: ''
  });

  const navigate = useNavigate();

    useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const refCode = queryParams.get('ref');
    if (refCode) {
      setSignupForm(prev => ({ ...prev, referredBy: refCode }));
    }
  }, []);


  // Toast functions
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Form handlers
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm(prev => ({ ...prev, [name]: value }));
  };

  const switchTab = (tab) => {
    if (currentTab === tab) return;
    setCurrentTab(tab);
  };

  // Submit handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          login: loginForm.loginInput, 
          password: loginForm.loginPassword 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        addToast('Login successful! Redirecting...', 'success');
        localStorage.setItem('token', data.token);
        navigate("/home");
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      addToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (signupForm.password !== signupForm.confirmPassword) {
      addToast('Passwords do not match!', 'error');
      setIsLoading(false);
      return;
    }

    if (!/^\d{4,6}$/.test(signupForm.securityPin)) {
      addToast('Security pin must be 4-6 digits', 'error');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: signupForm.email,
          username: signupForm.username,
          phoneNumber: signupForm.phoneNumber,
          password: signupForm.password,
          withdrawalPassword: signupForm.securityPin,
          referredBy: signupForm.referredBy || undefined
        }),
      });

      const data = await response.json();
      if (response.ok) {
        addToast('Registration successful! Please log in.', 'success');
        setCurrentTab('login');
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      addToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showForgotPassword = () => {
    addToast('Password reset functionality coming soon!', 'info');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] relative overflow-x-hidden">
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-teal-300/10 blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-teal-300/5 blur-xl"></div>
      </div>

      <div className="container max-w-7xl mx-auto flex flex-col lg:flex-row min-h-screen relative z-10">
        {/* Left Section */}
        <div className="lg:w-1/2 flex flex-col justify-center px-8 py-12 lg:py-24 lg:px-16 text-white">
          <div className="flex items-center mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold">
              <span className="text-white">Siemens</span>
              <span className="text-teal-500">X</span>
            </h2>
          </div>

          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 bg-clip-text text-transparent leading-tight">
              Welcome
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Transform insights into growth. Increase app installs and hit your LTV goals with the <span className="text-teal-400 font-semibold">#1 measurement partner</span>.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center text-gray-500 text-sm">
              <FiShield className="w-5 h-5 text-teal-400 mr-2" />
              Secure & Trusted
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <FiZap className="w-5 h-5 text-teal-400 mr-2" />
              Lightning Fast
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <FiGithub className="w-5 h-5 text-teal-400 mr-2" />
              Open Source
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-teal-400/15">
            <div className="text-center mb-6">
              <h2 className="text-xl font-medium text-white mb-1">Get Started</h2>
              <p className="text-gray-500 text-sm">Join thousands of users worldwide</p>
            </div>

            {/* Tabs */}
            <div className="bg-black/20 rounded-lg p-1 mb-6 relative">
              <div 
                className={`absolute top-1 left-1 w-[calc(50%-0.5rem)] h-[calc(100%-0.5rem)] bg-teal-400/20 rounded-md transition-transform duration-200 ${
                  currentTab === 'signup' ? 'translate-x-full' : ''
                }`}
              ></div>
              <button
                onClick={() => switchTab('login')}
                className={`w-1/2 py-2.5 px-4 text-sm font-medium relative z-10 rounded-md transition-colors ${
                  currentTab === 'login' ? 'text-white' : 'text-gray-500'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => switchTab('signup')}
                className={`w-1/2 py-2.5 px-4 text-sm font-medium relative z-10 rounded-md transition-colors ${
                  currentTab === 'signup' ? 'text-white' : 'text-gray-500'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Login Form */}
            <div className={`transition-opacity duration-300 ${currentTab !== 'login' ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'}`}>
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-gray-300 text-xs font-normal mb-1.5">Email, Username, or Phone</label>
                  <input
                    type="text"
                    name="loginInput"
                    value={loginForm.loginInput}
                    onChange={handleLoginChange}
                    placeholder="Enter your email, username, or phone"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:border-teal-400 focus:bg-black/40 outline-none transition"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 text-xs font-normal mb-1.5">Password</label>
                  <input
                    type="password"
                    name="loginPassword"
                    value={loginForm.loginPassword}
                    onChange={handleLoginChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:border-teal-400 focus:bg-black/40 outline-none transition"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-400 to-teal-500 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-teal-400/25 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none disabled:shadow-none"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
              <div className="text-center mt-4">
                <button
                  onClick={showForgotPassword}
                  className="text-teal-400 text-xs hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            {/* Signup Form */}
            <div className={`transition-opacity duration-300 ${currentTab !== 'signup' ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'}`}>
              <form onSubmit={handleSignup}>
                <div className="mb-3">
                  <label className="block text-gray-300 text-xs font-normal mb-1.5">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={signupForm.username}
                    onChange={handleSignupChange}
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:border-teal-400 focus:bg-black/40 outline-none transition"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-300 text-xs font-normal mb-1.5">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={signupForm.email}
                    onChange={handleSignupChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:border-teal-400 focus:bg-black/40 outline-none transition"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-300 text-xs font-normal mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={signupForm.phoneNumber}
                    onChange={handleSignupChange}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:border-teal-400 focus:bg-black/40 outline-none transition"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-300 text-xs font-normal mb-1.5">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={signupForm.password}
                    onChange={handleSignupChange}
                    placeholder="Create a password"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:border-teal-400 focus:bg-black/40 outline-none transition"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-300 text-xs font-normal mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={signupForm.confirmPassword}
                    onChange={handleSignupChange}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:border-teal-400 focus:bg-black/40 outline-none transition"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-300 text-xs font-normal mb-1.5">Security Pin (4-6 digits)</label>
                  <input
                    type="password"
                    name="securityPin"
                    value={signupForm.securityPin}
                    onChange={handleSignupChange}
                    placeholder="Enter your security pin"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:border-teal-400 focus:bg-black/40 outline-none transition"
                    inputMode="numeric"
                    pattern="\d{4,6}"
                    maxLength="6"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 text-xs font-normal mb-1.5">Referral Code</label>
                  <input
                    type="text"
                    name="referredBy"
                    value={signupForm.referredBy}
                    onChange={handleSignupChange}
                    placeholder="Enter referral code (Required)"
                    readOnly={!!new URLSearchParams(window.location.search).get('ref')}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:border-teal-400 focus:bg-black/40 outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-400 to-teal-500 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-teal-400/25 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none disabled:shadow-none"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-teal-400/20 border-t-teal-400 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;