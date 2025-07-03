import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Initial state for the store
const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null, // For simplicity, managing this in localStorage via persist
  isLoading: false,
  error: null,
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      loginRequest: () => set({ isLoading: true, error: null }),

      loginSuccess: (userData, accessToken, refreshToken) => {
        set({
          user: userData,
          accessToken: accessToken,
          refreshToken: refreshToken,
          isLoading: false,
          error: null,
        });
        // In a real app, you might set axios default headers here if not handled by interceptors
        // For example: axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        console.log("Login successful, tokens stored.");
      },

      loginFailure: (errorMessage) =>
        set({
          error: errorMessage,
          isLoading: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        }),

      logout: () => {
        set(initialState); // Reset to initial state
        // In a real app, you might also want to:
        // - Call a backend logout endpoint
        // - Clear axios default headers: delete axiosInstance.defaults.headers.common['Authorization'];
        // - Remove refresh token from HttpOnly cookie if that strategy is used
        console.log("User logged out, tokens cleared from store.");
      },

      // Example action to update tokens if using refresh token flow handled by store
      // This is a simplified version. A full refresh flow would involve an API call.
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        // axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      },

      // Example getter
      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'auth-storage', // name of the item in storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({
        // Only persist user and refreshToken. AccessToken is often kept in memory
        // or handled by HttpOnly cookies for security.
        // For this example, persisting refreshToken. AccessToken can be rehydrated or fetched.
        user: state.user,
        refreshToken: state.refreshToken,
        accessToken: state.accessToken, // Persisting accessToken for simplicity in this example
                                       // In a more secure setup, accessToken might be session-only
                                       // and re-fetched using refreshToken on app load.
      }),
    }
  )
);

export default useAuthStore;
