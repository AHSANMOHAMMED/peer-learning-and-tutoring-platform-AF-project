export const ROLE_HOME_ROUTES = {
  student: '/dashboard',
  tutor: '/tutor-dashboard',
  mentor: '/tutor-dashboard',
  schoolMentor: '/tutor-dashboard',
  parent: '/dashboard',
  admin: '/admin',
  websiteAdmin: '/admin',
  superadmin: '/super-admin',
  moderator: '/moderation',
  schoolAdmin: '/school-dashboard',
  demo: '/dashboard'
};

export const getDefaultRouteForUser = (user) => {
  if (!user) return '/login';

  if (!user.isVerified) return '/verify';

  if (user.role === 'tutor' || user.role === 'mentor' || user.role === 'schoolMentor') {
    if (user.verificationStatus === 'not_created') return '/tutor-onboarding';
    if (user.verificationStatus === 'pending' || user.verificationStatus === 'rejected') return '/tutor-pending';
  }

  if (user.role === 'student' && !user.grade) {
    return '/profile-setup';
  }

  return ROLE_HOME_ROUTES[user.role] || '/dashboard';
};
