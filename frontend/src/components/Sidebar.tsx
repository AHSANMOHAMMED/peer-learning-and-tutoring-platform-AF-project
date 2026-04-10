import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  User, 
  Search, 
  PenTool, 
  Award,
  Zap,
  BarChart3,
  Sparkles,
  Trophy,
  BrainCircuit,
  Mic,
  Users,
  School,
  HelpCircle,
  X
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../controllers/useAuth';

interface SidebarProps {
  role?: string;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role = 'student', isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const getRoleTheme = () => {
    switch (role) {
      case 'tutor': return { color: 'text-secondary', bg: 'bg-secondary', hover: 'hover:bg-secondary/10' };
      case 'admin': return { color: 'text-accent', bg: 'bg-accent', hover: 'hover:bg-accent/10' };
      default: return { color: 'text-primary', bg: 'bg-primary', hover: 'hover:bg-primary/10' };
    }
  };

  const theme = getRoleTheme();

  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { title: 'Smart Match', icon: BrainCircuit, path: '/match', show: role === 'student', badge: 'AI' },
    { title: 'AI Assistant', icon: Sparkles, path: '/ai-homework', show: role === 'student' },
    { title: 'Study Planner', icon: Calendar, path: '/planner', show: role === 'student' },
    { title: 'Voice Tutor', icon: Mic, path: '/voice-tutor', show: role === 'student' },
    { title: 'Social Feed', icon: Users, path: '/social' },
    { title: 'Marketplace', icon: Zap, path: '/marketplace' },
    { title: 'Materials', icon: BookOpen, path: '/materials' },
    { title: 'My Bookings', icon: Calendar, path: '/bookings' },
    { title: 'Certificates', icon: Award, path: '/certificates', show: role === 'student' },
    { title: 'My Profile', icon: User, path: '/profile' },
    { title: 'Learning Games', icon: Trophy, path: '/games', show: role === 'student' || role === 'superadmin' },
    { title: 'Gamification', icon: BarChart3, path: '/gamification', show: role === 'student' },
    { title: 'Q&A Forum', icon: HelpCircle, path: '/qa', show: role === 'student' },
    { title: 'Tutor Workspace', icon: PenTool, path: '/tutor-workspace', show: role === 'tutor' || role === 'superadmin' },
    { title: 'School Admin', icon: School, path: '/school-dashboard', show: role === 'schoolAdmin' || role === 'superadmin' },
    { title: 'Moderation Hub', icon: ShieldCheck, path: '/moderation', show: role === 'admin' || role === 'moderator' || role === 'superadmin' },
    { title: 'User Index', icon: Users, path: '/admin/users', show: role === 'admin' || role === 'superadmin' },
    { title: 'Global Admin', icon: BarChart3, path: '/admin', show: role === 'admin' || role === 'superadmin' },
    { title: 'Settings', icon: Settings, path: '/settings' },

  ];

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        initial={false}
        animate={{ 
          x: isOpen ? 0 : (window.innerWidth < 768 ? -300 : 0),
          opacity: 1 
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed md:relative top-0 left-0 w-72 h-screen bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-white/5 flex flex-col pt-10 pb-8 z-50 transition-all",
          !isOpen && "hidden md:flex"
        )}
      >
        {/* Brand Header */}
        <div className="px-8 mb-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-[1.25rem] shadow-lg shadow-indigo-500/20", theme.bg)}>
              <Zap size={24} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tighter text-gray-950 dark:text-white">PeerLearn</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">{role} Portal</span>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav Section */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.filter(item => item.show !== false).map((item) => (
            <NavLink
              key={item.title}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) onClose();
              }}
              className={({ isActive }) => cn(
                "group flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all duration-500 font-bold text-sm uppercase tracking-widest",
                isActive 
                  ? `${theme.bg} text-white shadow-2xl shadow-indigo-500/30 scale-[1.02]` 
                  : "text-gray-400 hover:text-gray-950 dark:hover:text-white"
              )}
            >
              <div className="flex items-center gap-4">
                 <item.icon size={20} className={cn("transition-transform duration-500 group-hover:scale-110")} />
                 {item.title}
              </div>
              {item.badge && (
                 <span className="px-2 py-0.5 bg-white/20 text-[8px] font-bold rounded-lg backdrop-blur-md">
                   {item.badge}
                 </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Profile Mini */}
        <div className="px-6 mt-8 space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 flex items-center gap-3">
             <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold", theme.bg)}>
                {user?.username?.[0] || 'U'}
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate dark:text-white">{user?.profile?.firstName || user?.username || 'User'}</p>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Level {user?.gamification?.level || 1}</p>
             </div>
             <ShieldCheck size={16} className="text-teal-500" />
          </div>

          <button 
            onClick={logout}
            className="flex items-center justify-center gap-3 w-full py-5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-[1.5rem] transition-all font-bold text-xs uppercase tracking-widest border border-transparent hover:border-red-500/20"
          >
            <LogOut size={18} />
            Safe Terminate
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Sidebar;
