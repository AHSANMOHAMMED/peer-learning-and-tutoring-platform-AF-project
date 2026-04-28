import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';













const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/profile');
      const normalizedUser = data?.user || data?.data || data;
      setUser(normalizedUser);
      return normalizedUser;
    } catch (err) {
      localStorage.removeItem('token');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      const normalizedUser = data?.user || data?.data || data;
      setUser(normalizedUser);
      return { ...data, user: normalizedUser };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      const normalizedUser = data?.user || data?.data || data;
      setUser(normalizedUser);
      return { ...data, user: normalizedUser };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', profileData);
      const normalizedUser = data?.user || data?.data || data;
      setUser(normalizedUser);
      return { ...data, user: normalizedUser };
    } catch (err) {
      const msg = err.response?.data?.message || 'Profile update failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Password change failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (email, purpose = 'login') => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/send-otp', { email, purpose });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email, otp, purpose = 'login') => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp, purpose });
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verification failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      register, 
      logout, 
      updateProfile, 
      changePassword,
      sendOTP, 
      verifyOTP, 
      refreshUser: fetchProfile 
    }}>
      {children}
    </AuthContext.Provider>);

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};