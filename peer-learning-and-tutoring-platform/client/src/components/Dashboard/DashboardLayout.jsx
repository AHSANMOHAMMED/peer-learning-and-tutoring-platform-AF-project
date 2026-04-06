import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthViewModel } from '../../viewmodels/AuthViewModel';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * DashboardLayout - Main layout wrapper for all dashboard views
 * Provides responsive sidebar navigation and header
 * 
 * MVC Pattern: View (Pure UI - Logic handled by useAuthViewModel)
 */
const DashboardLayout = () => {
  const { user, isLoading } = useAuthViewModel();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Role-based theme colors
  const getThemeColors = () => {
    if (!user) return 'from-gray-700 to-gray-900';
    
    switch (user.role) {
      case 'student':
        return 'from-blue-500 to-indigo-600';
      case 'tutor':
        return 'from-emerald-500 to-teal-600';
      case 'parent':
        return 'from-cyan-500 to-blue-600';
      case 'admin':
      case 'moderator':
        return 'from-slate-700 to-slate-900';
      default:
        return 'from-blue-500 to-indigo-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={user}
        themeGradient={getThemeColors()}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        {/* Header */}
        <Header 
          user={user} 
          onMenuClick={() => setSidebarOpen(true)}
          themeGradient={getThemeColors()}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
