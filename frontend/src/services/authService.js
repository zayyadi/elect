import axiosInstance from './axiosConfig';
import useAuthStore from '../store/authStore';

const AuthService = {
  loginUser: async (credentials) => {
    const { loginRequest, loginSuccess, loginFailure } = useAuthStore.getState();
    loginRequest(); // Set loading state

    try {
      // In a real application, the backend would return user data and tokens
      // For now, we'll simulate this.
      // Replace '/auth/login/' with your actual Django login endpoint
      const response = await axiosInstance.post('/auth/token/', credentials);

      // Assuming the response structure from djangorestframework-simplejwt is:
      // { access: "...", refresh: "..." }
      // And user data might come from a separate '/auth/user/' endpoint after login,
      // or be part of a custom token response.
      // For this example, let's assume tokens are in response.data
      // and we'll create mock user data.

      const { access, refresh } = response.data;

      // Simulate fetching user data or decode from token if it contains user info
      // This is highly dependent on your backend JWT setup.
      // For now, using a placeholder user object.
      // A common practice is to have another endpoint like /api/auth/user/ to get user details
      // after obtaining the token.
      let userData = { username: credentials.username, email: `${credentials.username}@example.com` };

      // If your token includes user data, you might decode it here (client-side decoding is okay for non-sensitive display data)
      // import { jwtDecode } from 'jwt-decode'; (install jwt-decode if using)
      // try {
      //   const decodedToken = jwtDecode(access);
      //   userData = { id: decodedToken.user_id, username: decodedToken.username /*, etc. */ };
      // } catch (e) {
      //   console.error("Failed to decode token", e);
      //   loginFailure("Received invalid token.");
      //   return;
      // }


      // Simulate a successful API call for user data if needed after token retrieval
      // For example:
      // const userResponse = await axiosInstance.get('/auth/user/');
      // userData = userResponse.data;

      loginSuccess(userData, access, refresh);
      console.log('Login successful in authService');
      return { success: true, user: userData };

    } catch (error) {
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Login API Error Response:', error.response.data);
        if (error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (typeof error.response.data === 'object') {
          // Handle cases where DRF returns field errors, e.g. { username: ["This field is required."]}
          const fieldErrors = Object.values(error.response.data).flat().join(' ');
          if (fieldErrors) errorMessage = fieldErrors;
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Login API No Response:', error.request);
        errorMessage = 'No response from server. Please try again later.';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Login API Request Setup Error:', error.message);
        errorMessage = `An error occurred: ${error.message}`;
      }
      loginFailure(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  logoutUser: async () => {
    const { logout, accessToken } = useAuthStore.getState();

    // Optionally, call a backend endpoint to invalidate the refresh token or session
    // This is good practice, especially if refresh tokens are long-lived.
    // For example:
    // try {
    //   if (accessToken) { // Only if logged in
    //     await axiosInstance.post('/auth/logout/', { refresh: useAuthStore.getState().refreshToken });
    //     console.log("Backend logout successful");
    //   }
    // } catch (error) {
    //   console.error('Backend logout failed:', error.response?.data || error.message);
    //   // Still proceed with client-side logout even if backend call fails
    // }

    logout(); // Clears user and tokens from Zustand store (and localStorage via persist)
    console.log('Logout successful in authService');
    // Additional cleanup like clearing Axios default headers is handled by the store/interceptors
  },

  // Placeholder for fetching user profile if not included in login
  fetchUserProfile: async () => {
    try {
      const response = await axiosInstance.get('/auth/user/'); // Replace with your user profile endpoint
      // Potentially update user in authStore if needed
      // useAuthStore.getState().setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // Handle error, maybe logout if token is invalid
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
      }
      throw error;
    }
  }
};

export default AuthService;
