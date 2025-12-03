import axios from 'axios';
import { API_CONFIG } from './config';

const authApi = axios.create({
  baseURL: API_CONFIG.AUTH_API,
});

export const authService = {
  // Register new user
  register: (userData) => 
    authApi.post('/auth/register', userData),
  
  // Login
  login: (credentials) => 
    authApi.post('/auth/login', credentials),
  
  // Get current user
  getCurrentUser: () => 
    authApi.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }),
  
  // Update profile
  updateProfile: (userData) => 
    authApi.put('/auth/profile', userData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }),
  
  // Change password
  changePassword: (passwordData) => 
    authApi.put('/auth/change-password', passwordData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }),
  
  // Forgot password
  forgotPassword: (email) => 
    authApi.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (token, newPassword) => 
    authApi.post('/auth/reset-password', { token, newPassword }),
  
  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // Check if authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },
  
  // Set auth token
  setAuthToken: (token) => {
    localStorage.setItem('token', token);
  },
  
  // Get auth token
  getAuthToken: () => localStorage.getItem('token'),
};