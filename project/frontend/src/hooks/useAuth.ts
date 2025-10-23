import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import type { LoginCredentials, RegisterData } from '../types/auth';
import { useState } from 'react';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(data);
      toast.success(response.message || 'Registration successful! Please check your email.');
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      setAuth(response);
      toast.success('Login successful!');
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    clearAuth();
    toast.success('Logged out successfully');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
  };
};