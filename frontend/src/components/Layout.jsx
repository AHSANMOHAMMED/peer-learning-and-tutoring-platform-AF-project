import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';

const Layout = ({ children, userRole }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f8f9fc] text-[#2b2d42] overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar
        role={userRole}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:ml-[250px] overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-[#eef2f6] sticky top-0 z-[60]">
          <span className="text-xl font-bold text-slate-800">Aura</span>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-slate-100 rounded-md text-slate-500 hover:text-primary transition-colors">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-10 py-5 bg-[#f8f9fc] sticky top-0 z-50">
          <div className="flex-1" /> {/* Spacer */}
          <div className="flex items-center gap-5">
            <NotificationBell />
            {userRole === 'tutor' && (
              <button className="flex items-center gap-2 bg-[#00a8cc] hover:bg-[#008ba8] text-white px-5 py-2.5 rounded-md font-medium transition-colors shadow-sm">
                <Plus size={18} />
                Post a job
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar p-4 md:p-10 pt-0 relative z-10 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default Layout;