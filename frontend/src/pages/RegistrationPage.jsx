import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import AuthService from '../services/authService';

const RegistrationPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const navigate = useNavigate();
  const { isLoading, error: authServiceError, clearError } = useAuthStore(state => ({ // Added clearError
    isLoading: state.isLoading,
    error: state.error,
    clearError: state.loginFailure, // loginFailure(null) will clear the error
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    useAuthStore.getState().loginFailure(null); // Clear global error before new attempt

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (password.length < 8) { // Basic password length validation
      setLocalError('Password must be at least 8 characters long.');
      return;
    }
    // Basic email validation (very simple)
    if (!email.includes('@')) {
        setLocalError('Please enter a valid email address.');
        return;
    }

    const result = await AuthService.registerUser({ username, email, password });

    if (result.success) {
      console.log('Registration successful. Navigating to login page.');
      // Optionally, display a success message before navigating or pass state
      navigate('/login?registration=success', { state: { message: "Registration successful! Please log in." } });
    } else {
      // Error is already set in authStore by AuthService
      // No need to set localError unless you want to override or add to it
      console.error('Registration failed in component:', result.error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username-reg"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username-reg"
              name="username"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); useAuthStore.getState().loginFailure(null); setLocalError(''); }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Choose a username"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="email-reg"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email-reg"
              name="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); useAuthStore.getState().loginFailure(null); setLocalError(''); }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password-reg"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password-reg"
              name="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); useAuthStore.getState().loginFailure(null); setLocalError(''); }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Create a password (min. 8 characters)"
              required
              disabled={isLoading}
            />
          </div>

           <div>
            <label
              htmlFor="confirm-password-reg"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password-reg"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); useAuthStore.getState().loginFailure(null); setLocalError(''); }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Confirm your password"
              required
              disabled={isLoading}
            />
          </div>

          {localError && <p className="text-sm text-red-600 text-center">{localError}</p>}
          {authServiceError && <p className="text-sm text-red-600 text-center">{authServiceError}</p>}


          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Registering...' : 'Create Account'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500" onClick={() => useAuthStore.getState().loginFailure(null)}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegistrationPage;
