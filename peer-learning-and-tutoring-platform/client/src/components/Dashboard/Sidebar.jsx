import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiBook, 
  FiSearch, 
  FiUser, 
  FiCalendar, 
  FiClock, 
  FiAward,
  FiDollarSign,
  FiStar,
  FiShield,
  FiUsers,
  FiBarChart2,
  FiAlertTriangle,
  FiCheckSquare,
  FiMessageSquare,
  FiX,
  FiLogOut
} from 'react-icons/fi';
import { useAuthViewModel } from '../../viewmodels/AuthViewModel';

/**
 * Sidebar - Responsive navigation sidebar with role-based links
 * 
 * MVC Pattern: View (Pure UI - Navigation logic handled by React Router)
 */
const Sidebar = ({ isOpen, onClose, user, themeGradient }) => {
  const location = useLocation();
  const { logout } = useAuthViewModel();

  // Role-based navigation links
  const getNavigationLinks = () => {
    const common = [
      { path: '/dashboard', icon: FiHome, label: 'Home' },
      { path: '/resources', icon: FiBook, label: 'Study Materials' },
      { path: '/browse-tutors', icon: FiSearch, label: 'Search Tutors' },
      { path: '/profile', icon: FiUser, label: 'Profile' },
    ];

    const student = [
      { path: '/dashboard/student/bookings', icon: FiCalendar, label: 'My Bookings' },
      { path: '/dashboard/student/tutors', icon: FiSearch, label: 'Recommended Tutors' },
      { path: '/qa', icon: FiMessageSquare, label: 'Q&A Forum' },
      { path: '/dashboard/student/progress', icon: FiAward, label: 'Progress' },
      { path: '/dashboard/student/calendar', icon: FiClock, label: 'Calendar' },
    ];

    const tutor = [
      { path: '/dashboard/tutor/sessions', icon: FiCalendar, label: 'My Sessions' },
      { path: '/dashboard/tutor/requests', icon: FiClock, label: 'Requests' },
      { path: '/dashboard/tutor/qa/overview', icon: FiMessageSquare, label: 'Q&A Forum' },
      { path: '/dashboard/tutor/availability', icon: FiCalendar, label: 'Availability' },
      { path: '/dashboard/tutor/earnings', icon: FiDollarSign, label: 'Earnings' },
      { path: '/dashboard/tutor/reviews', icon: FiStar, label: 'Reviews' },
    ];

    const parent = [
      { path: '/dashboard', icon: FiUsers, label: 'My Children' },
      { path: '/browse-tutors', icon: FiMessageSquare, label: 'Contact Tutors' },
      { path: '/profile', icon: FiUser, label: 'Profile' },
    ];

    const admin = [
      { path: '/dashboard/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
      { path: '/dashboard/admin/qa-overview', icon: FiMessageSquare, label: 'QA Overview' },
      { path: '/dashboard/admin/qa-moderation', icon: FiShield, label: 'QA Moderation' },
      { path: '/dashboard/admin/tutor-approvals', icon: FiCheckSquare, label: 'Tutor Approvals' },
      { path: '/dashboard/admin/reports', icon: FiAlertTriangle, label: 'Reports' },
      { path: '/dashboard/admin/users', icon: FiUsers, label: 'User Management' },
      { path: '/dashboard/admin/moderation', icon: FiShield, label: 'Moderation' },
    ];

    const adminOnly = [
      { path: '/dashboard/admin/parent-links', icon: FiUsers, label: 'Parent Link Requests' },
    ];

    if (!user) return common;

    switch (user.role) {
      case 'student':
        return [...common, ...student];
      case 'tutor':
        return [...common, ...tutor];
      case 'parent':
        return parent;
      case 'admin':
        return [...common, ...admin, ...adminOnly];
      case 'moderator':
        return [...common, ...admin];
      default:
        return common;
    }
  };

  const links = getNavigationLinks();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:static'}
  `;

  return (
    <aside className={sidebarClasses}>
      {/* Header */}
      <div className={`h-16 bg-gradient-to-r ${themeGradient} flex items-center justify-between px-6`}>
        <h1 className="text-white font-bold text-xl">PeerLearn</h1>
        <button 
          onClick={onClose}
          className="lg:hidden text-white hover:text-gray-200 transition-colors"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>

      {/* User Info Card */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${themeGradient} flex items-center justify-center text-white font-semibold text-lg`}>
            {user?.profile?.avatar ? (
              <img 
                src={user.profile.avatar} 
                alt={user.displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user?.initials || 'U'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.displayName || 'User'}
            </p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user?.roleBadgeColor || 'bg-gray-100 text-gray-800'}`}>
              {user?.roleDisplay || 'User'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || 
                           location.pathname.startsWith(`${link.path}/`);

            return (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  onClick={() => onClose()}
                  className={`
                    flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? `bg-gradient-to-r ${themeGradient} text-white shadow-md` 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <FiLogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
