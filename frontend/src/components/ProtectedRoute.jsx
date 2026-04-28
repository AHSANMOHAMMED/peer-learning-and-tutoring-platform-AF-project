import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../controllers/useAuth';
import { getDefaultRouteForUser } from '../utils/roleRouting';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.isVerified && location.pathname !== '/verify') {
    return <Navigate to="/verify" state={{ from: location }} replace />;
  }

  // Tutor Verification & Onboarding Redirects
  if (user.role === 'tutor' || user.role === 'mentor' || user.role === 'schoolMentor') {
    if (user.verificationStatus === 'not_created' && location.pathname !== '/tutor-onboarding') {
      return <Navigate to="/tutor-onboarding" replace />;
    }
    if (user.verificationStatus === 'pending' && location.pathname !== '/tutor-pending') {
      return <Navigate to="/tutor-pending" replace />;
    }
    if (user.verificationStatus === 'rejected' && location.pathname !== '/tutor-pending') {
      return <Navigate to="/tutor-pending" replace />;
    }
  }

  // Role-based Access Control
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForUser(user)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;