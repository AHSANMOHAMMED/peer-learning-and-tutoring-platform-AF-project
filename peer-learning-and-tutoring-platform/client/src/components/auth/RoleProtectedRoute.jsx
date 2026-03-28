import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

/**
 * RoleProtectedRoute Component
 * Wraps pages to restrict access by role(s)
 * Usage: <RoleProtectedRoute roles={['moderator', 'admin']} component={ModerationDashboard} />
 */
export const RoleProtectedRoute = ({ 
  roles = [], 
  children, 
  fallbackPath = '/dashboard' 
}) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <Navigate to={fallbackPath} replace />
    );
  }

  return children;
};

/**
 * Helper hook to check if user has specific role(s)
 * Usage: const hasAccess = useHasRole(['moderator', 'admin']);
 */
export const useHasRole = (roles = []) => {
  const { user } = useAuthContext();
  if (!user || roles.length === 0) return false;
  return roles.includes(user.role);
};

/**
 * Helper function for inline checks
 * Usage: {canAccess('moderator') && <ModerationPanel />}
 */
export const canAccess = (requiredRoles, userRole) => {
  if (!userRole || !requiredRoles) return false;
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(userRole);
};

export default RoleProtectedRoute;
