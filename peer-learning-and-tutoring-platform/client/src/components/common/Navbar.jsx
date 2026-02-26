import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Navbar = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    const roleRoutes = {
      admin: '/admin/dashboard',
      tutor: '/tutor/dashboard',
      parent: '/parent/dashboard',
      student: '/student/dashboard'
    };
    return roleRoutes[user?.role] || '/dashboard';
  };

  // Get role-based navigation items
  const getNavItems = () => {
    if (!user?.role) return [];

    const navItems = {
      admin: [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Moderation', path: '/moderation' },
        { label: 'Resources', path: '/resources' },
        { label: 'Browse Tutors', path: '/browse-tutors' }
      ],
      tutor: [
        { label: 'Dashboard', path: '/tutor/dashboard' },
        { label: 'Calendar', path: '/calendar' },
        { label: 'Resources', path: '/resources' }
      ],
      parent: [
        { label: 'Dashboard', path: '/parent/dashboard' },
        { label: 'Browse Tutors', path: '/browse-tutors' },
        { label: 'Resources', path: '/resources' }
      ],
      student: [
        { label: 'Dashboard', path: '/student/dashboard' },
        { label: 'Browse Tutors', path: '/browse-tutors' },
        { label: 'Resources', path: '/resources' }
      ]
    };

    return navItems[user.role] || navItems.student;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              PeerLearn
            </Link>
            
            {/* Role Badge */}
            {isAuthenticated && user?.role && (
              <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                user.role === 'tutor' ? 'bg-green-100 text-green-800' :
                user.role === 'parent' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            ) : isAuthenticated ? (
              <>
                {/* Role-based Navigation */}
                {getNavItems().map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}

                {/* User Info & Logout */}
                <div className="flex items-center space-x-3 ml-4 border-l pl-4 border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      {user?.profile?.avatar ? (
                        <img 
                          className="h-8 w-8 rounded-full object-cover" 
                          src={user.profile.avatar} 
                          alt={user.displayName || user.username}
                        />
                      ) : (
                        <span className="text-primary-600 font-medium text-sm">
                          {(user?.profile?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-700 text-sm hidden md:block">
                      {user?.displayName || user?.username}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
