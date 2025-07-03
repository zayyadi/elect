import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute'; // Import ProtectedRoute
import useAuthStore from '../store/authStore'; // To conditionally show logout
import AuthService from '../services/authService'; // For logout button in nav

// Lazy load page components
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage')); // Lazy load Dashboard

const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore(state => ({
    isAuthenticated: state.isAuthenticated
  }));

  const handleLogout = async () => {
    await AuthService.logoutUser();
    // Navigation to /login will happen automatically if current route is protected
    // or can be handled by an effect watching isAuthenticated
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-gray-800 p-4 text-white">
          <ul className="flex space-x-4 items-center">
            <li>
              <Link to="/">Home</Link>
            </li>
            {isAuthenticated() ? (
              <>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
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
              <li>
                <Link to="/login">Login</Link>
              </li>
            )}
          </ul>
        </nav>
        <Suspense fallback={<div className="p-4 text-center">Loading page...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
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
