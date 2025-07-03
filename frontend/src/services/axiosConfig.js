import axios from 'axios';
import useAuthStore from '../store/authStore'; // Import the store

// Placeholder for your Django API base URL
// In a real application, this would come from an environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    // 'Accept': 'application/json', // Usually default, but can be explicit
  },
});

// Request Interceptor:
// Adds the Authorization header to requests if an access token is available.
axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState(); // Get current token from Zustand
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (Conceptual - full implementation needs more context):
// Handles token refresh logic for 401 errors.
// This is a simplified example. A robust implementation would handle:
// - Queuing requests while token is being refreshed.
// - Preventing multiple refresh attempts simultaneously.
// - Handling refresh token expiry.
axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const { refreshToken, setTokens, logout } = useAuthStore.getState();

    // Check if it's a 401 error, not a retry request, and a refresh token exists
    if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
      originalRequest._retry = true; // Mark that we've tried to refresh for this request

      try {
        console.log('Attempting to refresh token...');
        // Replace with your actual token refresh API endpoint and logic
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access: newAccessToken, refresh: newRefreshToken } = refreshResponse.data;

        // Update tokens in store and potentially localStorage (if persist middleware handles it)
        setTokens(newAccessToken, newRefreshToken || refreshToken); // Keep old refresh if not returned

        // Update the Authorization header for the original request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        console.log('Token refreshed, retrying original request.');
        // Retry the original request with the new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        logout(); // Logout user if refresh fails
        // Optionally, redirect to login page
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Any status codes that falls outside the range of 2xx cause this function to trigger
    return Promise.reject(error);
  }
);

export default axiosInstance;
