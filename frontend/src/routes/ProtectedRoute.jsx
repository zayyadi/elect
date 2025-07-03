import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated, // Assuming isAuthenticated is a selector or derived state
                                          // Or simply: state.accessToken
  }));
  const location = useLocation();

  if (!isAuthenticated()) {
    // If not authenticated, redirect them to the /login page.
    // Pass the current location in state so we can redirect back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children; // If authenticated, render the children components.
};

export default ProtectedRoute;
