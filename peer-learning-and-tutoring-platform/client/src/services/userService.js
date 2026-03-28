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

  // Get all users (admin only) - alias for getAllUsers
  async getUsers(params = {}) {
    return await this.getAllUsers(params);
  },

  // Ban user (admin only)
  async banUser(userId, data = {}) {
    return await apiService.post(`/api/users/${userId}/ban`, data);
  },

  // Unban user (admin only)
  async unbanUser(userId) {
    return await apiService.post(`/api/users/${userId}/unban`);
  },

  // Suspend user (admin only)
  async suspendUser(userId, data = {}) {
    return await apiService.post(`/api/users/${userId}/suspend`, data);
  },

  // Activate user (admin only)
  async activateUser(userId) {
    return await apiService.post(`/api/users/${userId}/activate`);
  },

  // Delete user (admin only)
  async deleteUser(userId) {
    return await apiService.delete(`/api/users/${userId}`);
  },

  // Get list of tutors for session booking
  async getTutors(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return await apiService.get(`/api/users/tutors?${queryString}`);
  },

  // Ban a user (permanent) - Moderator action
  async banUser(userId, reason) {
    return await apiService.put(`/api/users/${userId}/ban`, { reason, actionType: 'ban' });
  },

  // Suspend a user temporarily - Moderator action
  async suspendUser(userId, reason, days) {
    return await apiService.put(`/api/users/${userId}/suspend`, {
      reason,
      days,
      actionType: 'suspend'
    });
  },

  // Warn a user - Moderator action
  async warnUser(userId, reason) {
    return await apiService.put(`/api/users/${userId}/warn`, { reason, actionType: 'warn' });
  },

  // Unban a user - Admin action
  async unbanUser(userId) {
    return await apiService.put(`/api/users/${userId}/unban`);
  },

  // Get user moderation history
  async getModerationHistory(userId) {
    return await apiService.get(`/api/users/${userId}/moderation-history`);
  }
};
