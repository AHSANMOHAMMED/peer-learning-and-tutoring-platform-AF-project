import { apiService } from './api';

export const userService = {
  // Get user profile
  async getProfile() {
    return await apiService.get('/api/users/profile');
  },

  // Update user profile
  async updateProfile(profileData) {
    return await apiService.put('/api/users/profile', { profile: profileData });
  },

  // Upload avatar
  async uploadAvatar(formData) {
    return await apiService.upload('/api/users/avatar', formData);
  },

  // Get user settings
  async getSettings() {
    return await apiService.get('/api/users/settings');
  },

  // Update user settings
  async updateSettings(settings) {
    return await apiService.put('/api/users/settings', { settings });
  },

  // Get all users (admin only)
  async getAllUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/users?${queryString}`);
  },

  // Get user by ID (admin only)
  async getUserById(userId) {
    return await apiService.get(`/api/users/${userId}`);
  },

  // Update user (admin only)
  async updateUser(userId, userData) {
    return await apiService.put(`/api/users/${userId}`, userData);
  },

  // Delete user (admin only)
  async deleteUser(userId) {
    return await apiService.delete(`/api/users/${userId}`);
  }
};
