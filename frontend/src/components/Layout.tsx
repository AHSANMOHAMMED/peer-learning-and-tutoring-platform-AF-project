import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';
import Sidebar from './Sidebar';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Mobile Header Dashboard */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-white/5 sticky top-0 z-[60]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl text-white">
            <Zap size={20} fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-950 dark:text-white">PeerLearn</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-500 dark:text-gray-400"
        >
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Sidebar with Mobile Support */}
      <Sidebar 
        role={userRole} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
