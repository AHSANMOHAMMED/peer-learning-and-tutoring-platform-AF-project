import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  User,
  Briefcase,
  Video,
  FileText,
  CircleDollarSign,
  Settings,
  HelpCircle,
  LogOut,
  Users,
  X,
  CreditCard,
  Gamepad2,
  Zap,
  Mail
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../controllers/useAuth';
import AuraLogo from './AuraLogo';

const Sidebar = ({ role: defaultRole = 'student', isOpen, onClose }) => {
  const { user, logout } = useAuth();
  
  // Use the verified user role from backend context, falling back to the component prop
  const role = user?.role || defaultRole;

  const getMenuItems = () => {
    const defaultNav = [
      { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { title: 'Q&A Forum', icon: MessageSquare, path: '/qa' },
      { title: 'Direct Messages', icon: Mail, path: '/messages' },
      { title: 'My Profile', icon: User, path: '/profile' },
    ];
    
    const settingsNav = [
      { title: 'Settings', icon: Settings, path: '/settings' },
    ];

    switch (role) {
      case 'websiteAdmin':
      case 'admin':
        return {
          main: [
            { title: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
            { title: 'Direct Messages', icon: MessageSquare, path: '/messages' },
            { title: 'Student Management', icon: Users, path: '/admin/students' },
            { title: 'Tutor Management', icon: Briefcase, path: '/admin/tutors' },
            { title: 'Session Management', icon: Video, path: '/bookings' },
            { title: 'Game Management', icon: Gamepad2, path: '/admin/games' },
            { title: 'Admin Settings', icon: Settings, path: '/admin/settings' },
          ],
          settings: settingsNav
        };
      case 'superadmin':
        return {
          main: [
            { title: 'Dashboard', icon: LayoutDashboard, path: '/super-admin' },
            { title: 'Direct Messages', icon: MessageSquare, path: '/messages' },
            { title: 'User Management', icon: Users, path: '/admin/users' },
            { title: 'Tutor Management', icon: Briefcase, path: '/admin/tutors' },
            { title: 'All Sessions', icon: Video, path: '/bookings' },
            { title: 'Game Management', icon: Gamepad2, path: '/admin/games' },
            { title: 'Moderation', icon: FileText, path: '/moderation' },
            { title: 'Q&A Inbox', icon: MessageSquare, path: '/tutor/qa' },
            { title: 'Admin Settings', icon: Settings, path: '/admin/settings' },
          ],
          settings: settingsNav
        };
      case 'tutor':
      case 'mentor':
      case 'schoolMentor':
        return {
          main: [
            { title: 'Dashboard', icon: LayoutDashboard, path: '/tutor-dashboard' },
            { title: 'Direct Messages', icon: MessageSquare, path: '/messages' },
            { title: 'Q&A Inbox', icon: MessageSquare, path: '/tutor/qa' },
            { title: 'My Profile', icon: User, path: '/profile' },
            { title: 'Course Materials', icon: Briefcase, path: '/materials' },
            { title: 'My Sessions', icon: Video, path: '/bookings' },
            { title: 'Workspace', icon: FileText, path: '/tutor-workspace' },
          ],
          settings: settingsNav
        };
      case 'parent':
        return {
          main: [
            { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
            { title: 'My Child\'s Progress', icon: Users, path: '/parent' },
            { title: 'Direct Messages', icon: MessageSquare, path: '/messages' },
            { title: 'My Profile', icon: User, path: '/profile' },
          ],
          settings: settingsNav
        };
      case 'moderator':
        return {
          main: [
            { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
            { title: 'Direct Messages', icon: MessageSquare, path: '/messages' },
            { title: 'Moderation Hub', icon: FileText, path: '/moderation' },
            { title: 'My Profile', icon: User, path: '/profile' },
          ],
          settings: settingsNav
        };
      case 'schoolAdmin':
        return {
          main: [
            { title: 'Dashboard', icon: LayoutDashboard, path: '/school-dashboard' },
            { title: 'Direct Messages', icon: MessageSquare, path: '/messages' },
            { title: 'My Profile', icon: User, path: '/profile' },
          ],
          settings: settingsNav
        };
      case 'demo':
      default: // student
        return {
          main: [
            ...defaultNav,
            { title: 'Study Circle', icon: Users, path: '/social' },
            { title: 'AI Assistant', icon: Zap, path: '/ai-homework' },
            { title: 'My Sessions', icon: Video, path: '/bookings' },
            { title: 'Browse Tutors', icon: Briefcase, path: '/tutors' },
            { title: 'Refresh Zone', icon: Gamepad2, path: '/refresh-zone' },
          ],
          settings: settingsNav
        };
    }
  };

  const { main: mainItems, settings: settingItems } = getMenuItems();

  return (
    <AnimatePresence>
      {(isOpen || window.innerWidth >= 768) && (
        <motion.div
          initial={{ x: -250, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -250, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed left-0 top-0 h-full w-[250px] bg-[#fdfdfc] border-r border-[#eef2f6] z-[1000] flex flex-col pt-6 pb-4"
        >
          {/* Header */}
          <div className="px-6 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer">
              <AuraLogo size={28} className="text-primary" />
              <span className="text-xl font-bold tracking-tight text-slate-800">Aura</span>
            </div>
            <button onClick={onClose} className="md:hidden p-1.5 bg-slate-100 rounded-md text-slate-400 hover:text-primary transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col justify-between">
            {/* Main Nav Links */}
            <nav className="px-4 space-y-1">
              {mainItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.path}
                  end={['/admin', '/dashboard', '/super-admin', '/school-dashboard'].includes(item.path)}
                  onClick={() => window.innerWidth < 768 && onClose()}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium text-[15px]",
                    isActive 
                      ? "bg-[#e8f6fa] text-[#00a8cc]" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  <item.icon size={20} className="transition-all" />
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </nav>

            {/* Settings Nav Links */}
            <div className="mt-8 px-4">
              <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Settings</p>
              <nav className="space-y-1">
                {settingItems.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.path}
                    end={['/admin', '/dashboard', '/super-admin', '/school-dashboard'].includes(item.path)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium text-[15px]",
                      isActive 
                        ? "bg-[#e8f6fa] text-[#00a8cc]" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    )}
                  >
                    <item.icon size={20} />
                    <span>{item.title}</span>
                  </NavLink>
                ))}
                
                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-500 font-medium text-[15px] hover:bg-red-50 transition-colors mt-2"
                >
                  <LogOut size={20} />
                  <span>Log out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Bottom User Profile */}
          <div className="mt-4 px-6 pt-4 border-t border-[#eef2f6]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                 {user?.profile?.firstName?.[0] || user?.username?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {user?.profile?.firstName || user?.username || 'Guest User'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
