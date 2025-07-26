// AdminLogin.jsx (updated)
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const AdminLogin = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setErrorMessage('');

    if (!login.trim()) {
      setErrorMessage('Please enter your email, username, or phone');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    const result = await authLogin({
      login: login.trim(),
      password
    });

    if (result.success) {
      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { state: { loginSuccess: true } });
    } else {
      setErrorMessage(result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] text-white p-4">
      <div className="w-full max-w-md">
        <div className="bg-black bg-opacity-60 backdrop-blur-md rounded-xl border border-teal-200 border-opacity-20 p-8 shadow-2xl shadow-teal-900/20 transition-all duration-500 hover:shadow-teal-900/30">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#40e0d0] to-[#00ced1] bg-clip-text text-transparent mb-2">
              Admin Portal
            </h1>
            <p className="text-gray-400 text-sm">Sign in to access the dashboard</p>
          </div>
          
          {/* Error Message */}
          {errorMessage && (
            <div className="animate-fade-in mb-6">
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 flex items-start">
                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-red-300 text-sm">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label htmlFor="login" className="block text-gray-300 text-sm font-medium mb-2">
                Email, Username, or Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="login"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className={`w-full p-3 bg-black/30 border ${isSubmitted && !login.trim() ? 'border-red-500/50' : 'border-teal-200/30'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all duration-200`}
                  placeholder="admin@example.com"
                  autoComplete="username"
                />
                {isSubmitted && !login.trim() && (
                  <div className="absolute right-3 top-3 text-red-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-gray-300 text-sm font-medium">
                  Password
                </label>
                {/* <a href="#" className="text-xs text-teal-300 hover:text-teal-200 transition-colors">Forgot password?</a> */}
              </div>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full p-3 bg-black/30 border ${isSubmitted && !password ? 'border-red-500/50' : 'border-teal-200/30'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all duration-200`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {isSubmitted && !password && (
                  <div className="absolute right-3 top-3 text-red-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            <button
              type="submit"
              // disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#40e0d0] to-[#00ced1] rounded-lg text-white font-semibold shadow-md hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
            >
              <span className="transition-opacity duration-200 opacity-100">
                Sign In
              </span>
              {/* {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )} */}
            </button>
          </form>

          
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;