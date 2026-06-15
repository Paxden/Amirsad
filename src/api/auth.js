import axios from './axios';

export const authAPI = {
  // Register user
  register: async (userData) => {
    const response = await axios.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await axios.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await axios.post('/auth/logout');
    return response.data;
  },

  // Change password
  changePassword: async (data) => {
    const response = await axios.post('/auth/change-password', data);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await axios.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await axios.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await axios.put('/auth/me', data);
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await axios.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email) => {
    const response = await axios.post('/auth/resend-verification', { email });
    return response.data;
  },
};