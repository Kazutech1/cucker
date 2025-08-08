import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import { useAuth } from '../AuthContext';

const AdminLogin = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    setIsSubmitting(true);
    const result = await authLogin({
      login: login.trim(),
      password,
    });
    setIsSubmitting(false);

    if (result.success) {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { state: { loginSuccess: true } });
    } else {
      setErrorMessage(result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Admin Login
        </h2>
        <form onSubmit={handleAdminLogin} className="space-y-5">
          <div>
            <label htmlFor="login" className="block mb-2 text-sm font-medium text-gray-700">
              Email / Username / Phone
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <FaUser />
              </span>
              <input
                type="text"
                id="login"
                className={`w-full px-10 py-3 border ${
                  isSubmitted && !login ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <FaLock />
              </span>
              <input
                type="password"
                id="password"
                className={`w-full px-10 py-3 border ${
                  isSubmitted && !password ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#40e0d0] to-[#00ced1] rounded-lg text-white font-semibold shadow-md hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Signing in...</span>
              </div>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
