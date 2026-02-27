import { useState, useCallback, useEffect } from 'react';
import { Notification } from '../models/Notification';
import { notificationService } from '../services/notificationService';

export class NotificationViewModel {
  constructor() {
    this.notifications = [];
    this.unreadCount = 0;
    this.isLoading = false;
    this.error = null;
    this.filters = {
      type: '',
      isRead: ''
    };
    this.pagination = {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    };
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  getState() {
    return {
      notifications: this.notifications,
      unreadCount: this.unreadCount,
      isLoading: this.isLoading,
      error: this.error,
      filters: this.filters,
      pagination: this.pagination
    };
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.error = null;
    this.notify();
  }

  setError(error) {
    this.error = error;
    this.isLoading = false;
    this.notify();
  }

  setNotifications(notificationsData) {
    this.notifications = notificationsData.map(notification => Notification.fromAPI(notification));
    this.isLoading = false;
    this.error = null;
    this.notify();
  }

  setUnreadCount(count) {
    this.unreadCount = count;
    this.notify();
  }

  setPagination(paginationData) {
    this.pagination = { ...this.pagination, ...paginationData };
    this.notify();
  }

  updateFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    this.pagination.page = 1;
    this.notify();
  }

  async fetchNotifications() {
    this.setLoading(true);
    try {
      const params = {
        ...this.filters,
        page: this.pagination.page,
        limit: this.pagination.limit
      };

      const response = await notificationService.getNotifications(params);
      if (response.success) {
        this.setNotifications(response.data.notifications);
        this.setUnreadCount(response.data.unreadCount);
        this.setPagination(response.data.pagination);
        return { success: true };
      } else {
        this.setError(response.message || 'Failed to fetch notifications');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to fetch notifications');
      return { success: false, message: error.message };
    }
  }

  async fetchUnreadCount() {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        this.setUnreadCount(response.data.unreadCount);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async markAsRead(notificationId) {
    try {
      const response = await notificationService.markAsRead(notificationId);
      if (response.success) {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index >= 0) {
          this.notifications[index].markAsRead();
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          this.notify();
        }
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async markAllAsRead() {
    this.setLoading(true);
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        this.notifications.forEach(notification => {
          if (!notification.isRead) {
            notification.markAsRead();
          }
        });
        this.unreadCount = 0;
        this.notify();
        return { success: true };
      }
      this.setError(response.message || 'Failed to mark all as read');
      return { success: false, message: response.message };
    } catch (error) {
      this.setError(error.message || 'Failed to mark all as read');
      return { success: false, message: error.message };
    }
  }

  async deleteNotification(notificationId) {
    try {
      const response = await notificationService.deleteNotification(notificationId);
      if (response.success) {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index >= 0) {
          if (!this.notifications[index].isRead) {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
          this.notifications.splice(index, 1);
          this.pagination.total = Math.max(0, this.pagination.total - 1);
          this.notify();
        }
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  addNotification(notificationData) {
    const notification = Notification.fromAPI(notificationData);
    this.notifications.unshift(notification);
    if (!notification.isRead) {
      this.unreadCount += 1;
    }
    this.notify();
  }

  getGroupedNotifications() {
    return Notification.groupByDate(this.notifications);
  }

  setPage(page) {
    this.pagination.page = page;
    this.notify();
  }

  clearError() {
    this.error = null;
    this.notify();
  }

  resetFilters() {
    this.filters = {
      type: '',
      isRead: ''
    };
    this.pagination.page = 1;
    this.notify();
  }
}

export const notificationViewModel = new NotificationViewModel();

export function useNotificationViewModel() {
  const [state, setState] = useState(notificationViewModel.getState());

  const updateState = useCallback(() => {
    setState(notificationViewModel.getState());
  }, []);

  useEffect(() => {
    const unsubscribe = notificationViewModel.subscribe(updateState);
    return unsubscribe;
  }, [updateState]);

  return {
    ...state,
    fetchNotifications: notificationViewModel.fetchNotifications.bind(notificationViewModel),
    fetchUnreadCount: notificationViewModel.fetchUnreadCount.bind(notificationViewModel),
    markAsRead: notificationViewModel.markAsRead.bind(notificationViewModel),
    markAllAsRead: notificationViewModel.markAllAsRead.bind(notificationViewModel),
    deleteNotification: notificationViewModel.deleteNotification.bind(notificationViewModel),
    setPage: notificationViewModel.setPage.bind(notificationViewModel),
    clearError: notificationViewModel.clearError.bind(notificationViewModel),
    resetFilters: notificationViewModel.resetFilters.bind(notificationViewModel)
  };
}
