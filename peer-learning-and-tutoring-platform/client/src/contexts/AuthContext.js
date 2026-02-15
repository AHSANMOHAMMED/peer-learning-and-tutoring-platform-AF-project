import React, { createContext, useContext, useEffect } from 'react';
import { useAuthViewModel } from '../viewmodels/AuthViewModel';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const authViewModel = useAuthViewModel();

  // Check authentication status on app load
  useEffect(() => {
    authViewModel.checkAuth();
  }, []);

  const value = {
    ...authViewModel
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
