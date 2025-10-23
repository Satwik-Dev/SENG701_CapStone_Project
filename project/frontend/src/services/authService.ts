import api from './api';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '../types/auth';

export const authService = {
  // Register new user
  async register(data: RegisterData): Promise<{ message: string; user: User }> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Request password reset
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password with token and email
  async resetPassword(email: string, token: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', { 
      email,
      token, 
      new_password: newPassword 
    });
    return response.data;
  },

  // Logout
  logout(): void {
    // Clear any client-side data if needed
  },
};