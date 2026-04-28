/**
 * Centralized navigation resolver to determine the correct default route
 * based on the user's role and verification status.
 */
export const getDefaultRouteForUser = (user) => {
  if (!user) return '/login';

  // Email verification check
  if (!user.isVerified) {
    return '/verify';
  }

  // Role-specific onboarding or pending states
  if (user.role === 'tutor' || user.role === 'mentor') {
    if (user.verificationStatus === 'not_created') {
      return '/tutor-onboarding';
    }
    if (user.verificationStatus === 'pending' || user.verificationStatus === 'rejected') {
      return '/tutor-pending';
    }
  }

  if (user.role === 'student' && !user.grade) {
    return '/profile-setup';
  }

  // Default dashboards by role
  switch (user.role) {
    case 'student':
      return '/dashboard';
    case 'tutor':
    case 'mentor':
      return '/tutor-dashboard';
    case 'parent':
      return '/parent';
    case 'websiteAdmin':
      return '/admin';
    case 'superadmin':
      return '/super-admin';
    case 'moderator':
      return '/moderation';
    case 'schoolAdmin':
      return '/school-dashboard';
    case 'demo':
      return '/dashboard';
    default:
      return '/dashboard';
  }
};
