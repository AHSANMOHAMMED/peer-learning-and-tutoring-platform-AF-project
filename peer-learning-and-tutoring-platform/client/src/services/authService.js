import { apiService } from './api';

export const authService = {
  // Login user
  async login(credentials) {
    return await apiService.post('/api/auth/login', credentials);
  },

  // Register new user
  async register(userData) {
    return await apiService.post('/api/auth/register', userData);
  },

  // Logout user
  async logout() {
    return await apiService.post('/api/auth/logout');
  },

  // Get current user
  async getCurrentUser() {
    return await apiService.get('/api/auth/me');
  },

  // Update user profile
  async updateProfile(profileData) {
    return await apiService.put('/api/users/profile', profileData);
  },

  // Change password
  async changePassword(passwordData) {
    return await apiService.put('/api/auth/change-password', passwordData);
  },

  // Forgot password
  async forgotPassword(email) {
    return await apiService.post('/api/auth/forgot-password', { email });
  },

  // Reset password
  async resetPassword(token, newPassword) {
    return await apiService.post('/api/auth/reset-password', {
      token,
      newPassword
    });
  },

  // Verify email
  async verifyEmail(token) {
    return await apiService.post('/api/auth/verify-email', { token });
  },

  // Resend verification email
  async resendVerification() {
    return await apiService.post('/api/auth/resend-verification');
  },

  // Upload avatar
  async uploadAvatar(formData) {
    return await apiService.upload('/api/users/upload-avatar', formData);
  }
};
