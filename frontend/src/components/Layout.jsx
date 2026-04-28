import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import AuraLogo from './AuraLogo';

const Layout = ({ children, userRole }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar
        role={userRole}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:ml-[250px] overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-[60] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <AuraLogo size={32} />
            <span className="text-xl font-bold text-slate-800">Aura</span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-slate-100 rounded-md text-slate-500 hover:text-aura-600 transition-colors">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>
        
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-10 py-5 bg-white sticky top-0 z-50 backdrop-blur-xl border-b border-slate-100">
          <div className="flex-1" /> {/* Spacer */}
          <div className="flex items-center gap-5">
            <NotificationBell />
            {userRole === 'tutor' && (
              <button className="flex items-center gap-2 bg-aura-500 hover:bg-aura-600 text-white px-5 py-2.5 rounded-md font-medium transition-colors shadow-lg">
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