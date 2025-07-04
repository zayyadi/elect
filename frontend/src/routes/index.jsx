import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import useAuthStore from '../store/authStore';
import AuthService from '../services/authService';

// Lazy load page components
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegistrationPage = lazy(() => import('../pages/RegistrationPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const SubmissionPage = lazy(() => import('../pages/SubmissionPage')); // Added SubmissionPage

const AppRoutes = () => {
  const { isAuthenticated, clearError } = useAuthStore(state => ({
    isAuthenticated: state.isAuthenticated,
    clearError: state.loginFailure,
  }));

  const handleLogout = async () => {
    await AuthService.logoutUser();
  };

  const handleNavLinkClick = () => {
    clearError(null);
  };

  // Placeholder for a component that lists form templates or ways to start a submission
  const SelectFormTemplatePage = () => (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Select a Form to Submit</h2>
      <p className="mb-2">Imagine a list of available forms here. For now, let's link to a test form.</p>
      <ul className="list-disc pl-5">
        <li>
          {/* Example: Link to a submission page for a form template with ID 1 */}
          <Link to="/submissions/template/1/new" className="text-indigo-600 hover:text-indigo-800">
            Submit Sample Form (ID: 1)
          </Link>
        </li>
        <li>
          <Link to="/submissions/template/2/new" className="text-indigo-600 hover:text-indigo-800">
            Submit Another Sample Form (ID: 2)
          </Link>
        </li>
        {/* In a real app, this list would be dynamically generated */}
      </ul>
    </div>
  );


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
                  <Link to="/submit-form" onClick={handleNavLinkClick}>Submit New Form</Link> {/* Link to form selection */}
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
            <Route path="/register" element={<RegistrationPage />} />
            <Route
              path="/dashboard"
              element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
            />
            <Route
              path="/submit-form" // Page to select a form
              element={<ProtectedRoute><SelectFormTemplatePage /></ProtectedRoute>}
            />
            <Route
              path="/submissions/template/:templateId/new" // Page to fill out and submit a specific form
              element={<ProtectedRoute><SubmissionPage /></ProtectedRoute>}
            />
            {/* Add more routes here later */}
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default AppRoutes;
