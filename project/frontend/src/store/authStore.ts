import { create } from 'zustand';
import type { AuthState, AuthResponse, User } from '../types/auth';

export const useAuthStore = create<AuthState>((set) => {
  // Load initial state from localStorage
  const storedAuth = localStorage.getItem('auth-storage');
  const initialState = storedAuth ? JSON.parse(storedAuth) : {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  };

  return {
    ...initialState,
    isLoading: false,

    setAuth: (data: AuthResponse) => {
      const newState = {
        user: data.user,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        isAuthenticated: true,
        isLoading: false,
      };
      
      // Save to localStorage
      localStorage.setItem('auth-storage', JSON.stringify({
        user: newState.user,
        accessToken: newState.accessToken,
        refreshToken: newState.refreshToken,
        isAuthenticated: newState.isAuthenticated,
      }));
      
      set(newState);
    },

    setUser: (user: User) => {
      set({ user });
      
      // Update localStorage
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const data = JSON.parse(stored);
        data.user = user;
        localStorage.setItem('auth-storage', JSON.stringify(data));
      }
    },

    clearAuth: () => {
      localStorage.removeItem('auth-storage');
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },
  };
});