import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

/**
 * Sidebar Component with Role-Aware Navigation
 * Shows different links based on user role
 */
export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuthContext();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const navItems = {
    student: [
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      { label: 'Browse Tutors', path: '/tutors', icon: '👨‍🏫' },
      { label: 'Schedule Session', path: '/sessions/schedule', icon: '📅' },
      { label: 'My Sessions', path: '/sessions/my-sessions', icon: '📚' },
      { label: 'Materials Library', path: '/materials', icon: '📖' },
      { label: 'Upload Material', path: '/materials/upload', icon: '⬆️' },
    ],
    tutor: [
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      { label: 'Session Requests', path: '/sessions/requests', icon: '🔔' },
      { label: 'My Sessions', path: '/sessions/my-sessions', icon: '📚' },
      { label: 'Materials Library', path: '/materials', icon: '📖' },
      { label: 'Upload Material', path: '/materials/upload', icon: '⬆️' },
      { label: 'Profile', path: '/profile', icon: '👤' },
    ],
    moderator: [
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      { label: 'Moderation', path: '/moderation', icon: '🛡️' },
      { label: 'Pending Reports', path: '/moderation/reports', icon: '⚠️' },
      { label: 'Approve Materials', path: '/moderation/materials', icon: '✅' },
      { label: 'Users Management', path: '/moderation/users', icon: '👥' },
      { label: 'Materials Library', path: '/materials', icon: '📖' },
    ],
    admin: [
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      { label: 'Moderation', path: '/moderation', icon: '🛡️' },
      { label: 'Users', path: '/admin/users', icon: '👥' },
      { label: 'Materials', path: '/admin/materials', icon: '📖' },
      { label: 'Reports', path: '/admin/reports', icon: '⚠️' },
      { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
    ],
    parent: [
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      { label: 'Browse Tutors', path: '/tutors', icon: '👨‍🏫' },
      { label: 'My Children', path: '/parent/children', icon: '👨‍👩‍👧' },
      { label: 'Payments', path: '/parent/payments', icon: '💳' },
      { label: 'Materials Library', path: '/materials', icon: '📖' },
    ],
  };

  const items = navItems[user.role] || [];

  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">PeerLearn</h1>
          <p className="text-sm text-gray-400 mt-1">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </p>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-semibold">{user.name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span>👤</span>
            <span>Profile Settings</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors text-left"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
