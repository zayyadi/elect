import React from 'react';
import useAuthStore from '../store/authStore';
import AuthService from '../services/authService'; // For logout button
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const navigate = useNavigate();

  const handleLogout = async () => {
    await AuthService.logoutUser();
    // The ProtectedRoute or main app logic should ideally handle redirecting
    // to login after logout, but we can also do it explicitly here.
    navigate('/login');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      {user ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-lg mb-2">
            Welcome, <span className="font-semibold">{user.username || 'User'}</span>!
          </p>
          <p className="text-gray-600 mb-4">This is your protected dashboard area.</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
          >
            Log Out
          </button>
        </div>
      ) : (
        <p className="text-gray-600">Loading user data or not logged in...</p>
      )}
    </div>
  );
};

export default DashboardPage;
