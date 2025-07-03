import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import useAuthStore from '../store/authStore';
import AuthService from '../services/authService';

// Lazy load page components
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegistrationPage = lazy(() => import('../pages/RegistrationPage')); // Added RegistrationPage
const DashboardPage = lazy(() => import('../pages/DashboardPage'));

const AppRoutes = () => {
  const { isAuthenticated, clearError } = useAuthStore(state => ({ // Added clearError
    isAuthenticated: state.isAuthenticated,
    clearError: state.loginFailure, // To clear errors on navigation
  }));

  const handleLogout = async () => {
    await AuthService.logoutUser();
    // Navigation to /login should be handled by ProtectedRoute or effects watching isAuthenticated
  };

  const handleNavLinkClick = () => {
    clearError(null); // Clear any existing auth errors when navigating via nav links
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-gray-800 p-4 text-white">
          <ul className="flex space-x-4 items-center">
            <li>
              <Link to="/" onClick={handleNavLinkClick}>Home</Link>
            </li>
            {isAuthenticated() ? (
              <>
                <li>
                  <Link to="/dashboard" onClick={handleNavLinkClick}>Dashboard</Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" onClick={handleNavLinkClick}>Login</Link>
                </li>
                <li>
                  <Link to="/register" onClick={handleNavLinkClick}>Register</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        <Suspense fallback={<div className="p-4 text-center text-xl font-semibold">Loading page...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} /> {/* Added Registration Route */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            {/* Add more routes here later */}
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default AppRoutes;
