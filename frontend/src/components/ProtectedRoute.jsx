import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../controllers/useAuth';







const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>);

  }

  if (!user) {
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.isVerified && location.pathname !== '/verify') {
    return <Navigate to="/verify" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user role is not allowed, redirect to their default dashboard
    const defaultDashboards = {
      student: '/dashboard',
      tutor: '/tutor-dashboard',
      parent: '/dashboard',
      admin: '/admin',
      superadmin: '/super-admin',
      moderator: '/moderation',
      schoolAdmin: '/school-dashboard'
    };
    return <Navigate to={defaultDashboards[user.role] || '/dashboard'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;