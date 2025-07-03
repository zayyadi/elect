import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; // Added Link
import useAuthStore from '../store/authStore';
import AuthService from '../services/authService';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const registrationMessage = location.state?.message; // Check for message from registration

  const {
    isLoading,
    error: authError,
    isAuthenticated,
    clearError // Using loginFailure(null) to clear error
  } = useAuthStore(state => ({
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,
    clearError: state.loginFailure,
  }));

  useEffect(() => {
    // Clear any existing auth errors when component mounts or location changes
    // This prevents showing old errors from other pages (like registration)
    clearError(null);
  }, [clearError, location]); // Depend on location to clear error if user navigates here explicitly

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError(null); // Clear global error before new attempt


    if (!username || !password) {
      setLocalError('Username and password are required.');
      return;
    }

    const result = await AuthService.loginUser({ username, password });

    if (result.success) {
      console.log('Login successful, navigating...');
      // Navigation is handled by the useEffect hook
    } else {
      console.error('Login failed in component:', result.error);
      // Error is set in authStore by AuthService
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (localError) setLocalError(''); // Clear local error on input change
    if (authError) clearError(null); // Clear global error on input change
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">Log In</h1>

        {registrationMessage && (
          <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
            {registrationMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={handleInputChange(setUsername)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="your_username"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={handleInputChange(setPassword)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="your_password"
              disabled={isLoading}
            />
          </div>

          {localError && (
            <p className="text-sm text-red-600 text-center">{localError}</p>
          )}
          {authError && (
            <p className="text-sm text-red-600 text-center">{authError}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500" onClick={() => clearError(null)}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
