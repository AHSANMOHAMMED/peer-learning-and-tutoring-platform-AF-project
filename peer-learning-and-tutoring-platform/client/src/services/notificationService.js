import { apiService } from './api';

export const notificationService = {
  // Get all notifications
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/api/notifications?${queryString}`);
  },

  // Get unread notification count
  async getUnreadCount() {
    return await apiService.get('/api/notifications/unread-count');
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    return await apiService.put(`/api/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  async markAllAsRead() {
    return await apiService.put('/api/notifications/read-all');
  },

  // Delete notification
  async deleteNotification(notificationId) {
    return await apiService.delete(`/api/notifications/${notificationId}`);
  }
};
