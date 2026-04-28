import React from 'react';
import { useAuth } from '../controllers/useAuth';

/**
 * A wrapper component that only renders its children if the current user
 * has one of the allowed roles.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The UI to conditionally render
 * @param {string[]} props.allowedRoles - Array of roles that can see this UI
 * @param {React.ReactNode} [props.fallback=null] - Optional UI to show if not authorized
 */
const RoleGuard = ({ children, allowedRoles, fallback = null }) => {
  const { user } = useAuth();

  if (!user || !user.role) {
    return fallback;
  }

  // Include superadmin automatically for all guards as they should see everything
  const rolesWithSuperAdmin = [...allowedRoles, 'superadmin'];

  if (rolesWithSuperAdmin.includes(user.role)) {
    return <>{children}</>;
  }

  return fallback;
};

export default RoleGuard;
