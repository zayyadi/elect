import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Lazy load page components
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));

const AppRoutes = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-gray-800 p-4 text-white">
          <ul className="flex space-x-4">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </ul>
        </nav>
        <Suspense fallback={<div className="p-4 text-center">Loading page...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            {/* Add more routes here later */}
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default AppRoutes;
