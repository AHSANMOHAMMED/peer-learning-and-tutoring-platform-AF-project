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
    console.log('AuthViewModel: Attempting login with email:', credentials.email);
    this.setLoading(true);
    try {
      const response = await authService.login(credentials);
      console.log('AuthViewModel: Login response:', response);
      
      if (response.success) {
        // Support both { token, user } and { data: { token, user } } shapes
        const payload = response.data?.data || response.data;
        const token = payload?.token;
        const user = payload?.user;

        console.log('AuthViewModel: Login successful - Token length:', token?.length, 'User ID:', user?._id, 'User role:', user?.role);

        if (token) {
          localStorage.setItem('token', token);
          console.log('AuthViewModel: Token saved to localStorage');
        }
        this.setUser(user);
        console.log('AuthViewModel: User set in state - isAuthenticated:', !!this.user);
        return { success: true, data: response.data };
      } else {
        console.error('AuthViewModel: Login failed -', response.message);
        this.setError(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('AuthViewModel: Login error -', error);
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
        const payload = response.data?.data || response.data;
        const token = payload?.token;
        const user = payload?.user;

        if (token) {
          localStorage.setItem('token', token);
        }
        this.setUser(user);
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.errors?.[0]?.message || response.message || 'Registration failed';
        this.setError(errorMessage);
        return { success: false, message: errorMessage, errors: response.errors };
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
    console.log('AuthViewModel: Checking auth - Token exists:', !!token);
    
    if (!token) {
      console.log('AuthViewModel: No token found, user not authenticated');
      this.setUser(null);
      return { success: false };
    }

    this.setLoading(true);
    try {
      const response = await authService.getCurrentUser();
      console.log('AuthViewModel: getCurrentUser response:', response);
      
      if (response.success) {
        console.log('AuthViewModel: Auth check successful, user:', response.data);
        this.setUser(response.data);
        return { success: true, data: response.data };
      } else {
        console.log('AuthViewModel: Auth check failed, removing token');
        localStorage.removeItem('token');
        this.setUser(null);
        return { success: false };
      }
    } catch (error) {
      console.error('AuthViewModel: Auth check error:', error);
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

  // Get dashboard route for current user role
  getDashboardRoute() {
    if (!this.user) return '/login';
    
    const roleRoutes = {
      admin: '/dashboard',
      moderator: '/dashboard',
      tutor: '/dashboard/tutor/qa/overview',
      parent: '/dashboard',
      student: '/dashboard'
    };
    
    return roleRoutes[this.user.role] || '/dashboard';
  }

  // Check if user has specific role
  hasRole(role) {
    return this.user?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    return roles.includes(this.user?.role);
  }

  // Check if user is admin
  isAdmin() {
    return this.user?.role === 'admin';
  }

  // Check if user is tutor
  isTutor() {
    return this.user?.role === 'tutor';
  }

  // Check if user is student
  isStudent() {
    return this.user?.role === 'student';
  }

  // Check if user is parent
  isParent() {
    return this.user?.role === 'parent';
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
  }, [updateState]);

  return {
    ...state,
    login: authViewModel.login.bind(authViewModel),
    register: authViewModel.register.bind(authViewModel),
    logout: authViewModel.logout.bind(authViewModel),
    checkAuth: authViewModel.checkAuth.bind(authViewModel),
    updateProfile: authViewModel.updateProfile.bind(authViewModel),
    clearError: authViewModel.clearError.bind(authViewModel),
    getDashboardRoute: authViewModel.getDashboardRoute.bind(authViewModel),
    hasRole: authViewModel.hasRole.bind(authViewModel),
    hasAnyRole: authViewModel.hasAnyRole.bind(authViewModel),
    isAdmin: authViewModel.isAdmin.bind(authViewModel),
    isTutor: authViewModel.isTutor.bind(authViewModel),
    isStudent: authViewModel.isStudent.bind(authViewModel),
    isParent: authViewModel.isParent.bind(authViewModel)
  };
}
