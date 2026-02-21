import { useState, useCallback, useEffect } from 'react';
import { User } from '../models/User';
import { authService } from '../services/authService';

export class AuthViewModel {
  constructor() {
    this.user = null;
    this.isLoading = false;
    this.error = null;
    this.listeners = [];
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of state changes
  notify() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  // Get current state
  getState() {
    return {
      user: this.user,
      isLoading: this.isLoading,
      error: this.error,
      isAuthenticated: !!this.user
    };
  }

  // Set loading state
  setLoading(loading) {
    this.isLoading = loading;
    this.error = null;
    this.notify();
  }

  // Set error state
  setError(error) {
    this.error = error;
    this.isLoading = false;
    this.notify();
  }

  // Set user and clear loading/error
  setUser(userData) {
    this.user = userData ? User.fromAPI(userData) : null;
    this.isLoading = false;
    this.error = null;
    this.notify();
  }

  // Login method
  async login(credentials) {
    this.setLoading(true);
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        this.setUser(response.data.user);
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Login failed');
      return { success: false, message: error.message };
    }
  }

  // Register method
  async register(userData) {
    this.setLoading(true);
    try {
      const response = await authService.register(userData);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        this.setUser(response.data.user);
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Registration failed');
      return { success: false, message: error.message };
    }
  }

  // Logout method
  async logout() {
    this.setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      this.setUser(null);
    }
  }

  // Check authentication status
  async checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.setUser(null);
      return { success: false };
    }

    this.setLoading(true);
    try {
      const response = await authService.getCurrentUser();
      if (response.success) {
        this.setUser(response.data);
        return { success: true, data: response.data };
      } else {
        localStorage.removeItem('token');
        this.setUser(null);
        return { success: false };
      }
    } catch (error) {
      localStorage.removeItem('token');
      this.setUser(null);
      return { success: false };
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    this.setLoading(true);
    try {
      const response = await authService.updateProfile(profileData);
      if (response.success) {
        this.setUser({ ...this.user, ...response.data });
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Profile update failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Profile update failed');
      return { success: false, message: error.message };
    }
  }

  // Clear error
  clearError() {
    this.error = null;
    this.notify();
  }
}

// Create singleton instance
export const authViewModel = new AuthViewModel();

// Custom hook for using AuthViewModel in React components
export function useAuthViewModel() {
  const [state, setState] = useState(authViewModel.getState());

  const updateState = useCallback(() => {
    setState(authViewModel.getState());
  }, []);

  // Subscribe to auth view model changes
  useEffect(() => {
    const unsubscribe = authViewModel.subscribe(updateState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    login: authViewModel.login.bind(authViewModel),
    register: authViewModel.register.bind(authViewModel),
    logout: authViewModel.logout.bind(authViewModel),
    checkAuth: authViewModel.checkAuth.bind(authViewModel),
    updateProfile: authViewModel.updateProfile.bind(authViewModel),
    clearError: authViewModel.clearError.bind(authViewModel)
  };
}
