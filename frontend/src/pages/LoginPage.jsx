import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import AuthService from '../services/authService';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(''); // For form validation errors

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/"; // For redirecting after login

  // Get state and actions from Zustand store
  const { isLoading, error: authError, isAuthenticated, loginRequest, loginSuccess, loginFailure } = useAuthStore(
    (state) => ({
      isLoading: state.isLoading,
      error: state.error,
      isAuthenticated: state.isAuthenticated,
      // We typically don't call loginRequest, loginSuccess, loginFailure directly from component
      // They are called by the AuthService. So, just observing state here.
    })
  );

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(''); // Clear previous local errors

    if (!username || !password) {
      setLocalError('Username and password are required.');
      return;
    }

    // AuthService will call loginRequest, loginSuccess, or loginFailure from the store
    const result = await AuthService.loginUser({ username, password });

    if (result.success) {
      // Navigation is handled by the useEffect hook based on isAuthenticated state
      console.log('Login successful, navigating...');
    } else {
      // AuthService already updated the global authError in the store.
      // We could also set localError here if we want to display it differently
      // or if the global error isn't specific enough for the form.
      // For now, relying on the global authError.
      console.error('Login failed in component:', result.error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">Log In</h1>

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
              onChange={(e) => setUsername(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="your_password"
              disabled={isLoading}
            />
          </div>

          {localError && (
            <p className="text-sm text-red-600">{localError}</p>
          )}
          {authError && ( // Display global auth error from Zustand store
            <p className="text-sm text-red-600">{authError}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          {/* Replace with Link to a registration page if you have one */}
          <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
