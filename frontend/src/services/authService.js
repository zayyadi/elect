import axiosInstance from './axiosConfig';
import useAuthStore from '../store/authStore';

const AuthService = {
  loginUser: async (credentials) => {
    const { loginRequest, loginSuccess, loginFailure } = useAuthStore.getState();
    loginRequest();

    try {
      // Assuming Django REST Framework Simple JWT endpoint
      const response = await axiosInstance.post('/auth/token/', credentials);
      const { access, refresh } = response.data;

      // Fetch user details separately after getting token
      // This is a common pattern. Adjust if your backend sends user data with tokens.
      const userResponse = await axiosInstance.get('/auth/user/', {
        headers: { Authorization: `Bearer ${access}` } // Use the new access token
      });
      const userData = userResponse.data;

      loginSuccess(userData, access, refresh);
      console.log('Login successful in authService');
      return { success: true, user: userData };

    } catch (error) {
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.response) {
        console.error('Login API Error Response:', error.response.data);
        if (error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (typeof error.response.data === 'object') {
          const fieldErrors = Object.values(error.response.data).flat().join(' ');
          if (fieldErrors) errorMessage = fieldErrors;
        } else if (error.response.status === 401) {
             errorMessage = "Invalid username or password.";
        }
      } else if (error.request) {
        console.error('Login API No Response:', error.request);
        errorMessage = 'No response from server. Please try again later.';
      } else {
        console.error('Login API Request Setup Error:', error.message);
        errorMessage = `An error occurred: ${error.message}`;
      }
      loginFailure(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  registerUser: async (userData) => {
    const { loginRequest, loginFailure } = useAuthStore.getState();
    // Re-using loginRequest and loginFailure for loading/error state,
    // but not calling loginSuccess as registration might not auto-login.
    loginRequest(); // Indicate loading

    try {
      // Replace '/auth/register/' with your actual Django registration endpoint
      // The userData should include: username, email, password
      const response = await axiosInstance.post('/auth/register/', userData);

      // Assuming the backend returns the created user data (or a success message)
      // For example: { id: 1, username: "newuser", email: "new@example.com" }
      console.log('Registration successful in authService:', response.data);

      // Clear loading and any previous errors.
      // We don't call loginSuccess here as the user might need to login separately.
      // Or, if your backend returns tokens on registration, you could call loginSuccess.
      useAuthStore.setState({ isLoading: false, error: null });
      return { success: true, data: response.data };

    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response) {
        console.error('Registration API Error Response:', error.response.data);
        // Customize error message based on backend response
        // e.g., username already exists, email already in use, password too weak
        if (typeof error.response.data === 'object') {
          const fieldErrors = Object.entries(error.response.data)
            .map(([field, messages]) => `${field}: ${messages.join(' ')}`)
            .join('; ');
          if (fieldErrors) errorMessage = fieldErrors;
        } else if (error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.request) {
        console.error('Registration API No Response:', error.request);
        errorMessage = 'No response from server. Please try again later.';
      } else {
        console.error('Registration API Request Setup Error:', error.message);
        errorMessage = `An error occurred: ${error.message}`;
      }
      loginFailure(errorMessage); // Update store with error
      return { success: false, error: errorMessage };
    }
  },

  logoutUser: async () => {
    const { logout, refreshToken } = useAuthStore.getState(); // Get refreshToken for backend logout

    try {
      // Only attempt backend logout if a refresh token exists
      if (refreshToken) {
        // Assuming your backend has a /auth/logout/ endpoint that accepts the refresh token
        // to blacklist it or perform other server-side session cleanup.
        await axiosInstance.post('/auth/logout/', { refresh: refreshToken });
        console.log("Backend logout successful: refresh token invalidated.");
      }
    } catch (error) {
      console.error('Backend logout failed:', error.response?.data || error.message);
      // Still proceed with client-side logout even if backend call fails.
      // The user experience should be that they are logged out regardless.
    }

    logout(); // Clears user and tokens from Zustand store (and localStorage via persist)
    console.log('Client-side logout successful in authService');
  },

  fetchUserProfile: async () => {
    const { loginSuccess, logout } = useAuthStore.getState();
    try {
      // This endpoint should be protected and return the current authenticated user's details
      const response = await axiosInstance.get('/auth/user/');

      // If user data is fetched successfully, update the store.
      // This is useful if user data changes or needs to be re-fetched.
      // Note: loginSuccess also sets tokens; here we might only want to update user object.
      // For simplicity, if we are re-fetching user, let's assume tokens are still valid.
      // A more robust way would be to have a dedicated setUser action in the store.
      const existingTokens = {
        accessToken: useAuthStore.getState().accessToken,
        refreshToken: useAuthStore.getState().refreshToken
      };
      loginSuccess(response.data, existingTokens.accessToken, existingTokens.refreshToken);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      if (error.response?.status === 401) {
        // If unauthorized (e.g., token expired and refresh failed), log out the user.
        logout();
      }
      throw error; // Re-throw to be caught by the caller if needed
    }
  }
};

export default AuthService;
