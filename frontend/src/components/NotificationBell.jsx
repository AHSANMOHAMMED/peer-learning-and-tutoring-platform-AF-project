import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, Calendar, MessageSquare, Shield, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationApi } from '../services/api';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      if (res.success && res.data) setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationApi.getNotifications({ limit: 5 });
      if (res.success) setNotifications(res.data || []);
    } catch (err) {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) fetchNotifications();
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id) => {
    try {
      const res = await notificationApi.markAsRead(id);
      if (res.success) {
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await notificationApi.markAllAsRead();
      if (res.success) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success("All caught up!");
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await notificationApi.deleteNotification(id);
      if (res.success) {
        setNotifications(notifications.filter(n => n._id !== id));
        fetchUnreadCount();
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'booking': return <Calendar size={16} className="text-blue-500" />;
      case 'message': return <MessageSquare size={16} className="text-emerald-500" />;
      case 'system': return <Shield size={16} className="text-indigo-500" />;
      case 'urgent': return <AlertTriangle size={16} className="text-rose-500" />;
      default: return <Info size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={cn(
          "relative p-2.5 rounded-xl transition-all duration-300 group",
          isOpen ? "bg-indigo-600 text-white shadow-lg" : "bg-white border border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-600"
        )}
      >
        <Bell size={20} className={cn(unreadCount > 0 && !isOpen && "animate-wiggle")} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm ring-2 ring-rose-500/10">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-80 sm:w-96 bg-white rounded-[2rem] border border-slate-100 shadow-4xl z-[100] overflow-hidden"
          >
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 backdrop-blur-xl">
               <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Notifications</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Your updates</p>
               </div>
               {unreadCount > 0 && (
                 <button 
                  onClick={handleMarkAllAsRead}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all group"
                 >
                    <Check size={16} className="group-hover:scale-110" />
                 </button>
               )}
            </div>

            <div className="max-h-[400px] overflow-y-auto no-scrollbar py-2">
              {isLoading ? (
                <div className="p-10 flex flex-col items-center justify-center gap-4">
                   <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                   <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading...</p>
                </div>
              ) : (notifications || []).length > 0 ? (
                (notifications || []).map((n) => (
                  <div 
                    key={n._id}
                    onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                    className={cn(
                      "group p-6 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer relative overflow-hidden",
                      !n.isRead && "bg-indigo-50/30"
                    )}
                  >
                     <div className="flex gap-4 items-start relative z-10">
                        <div className={cn(
                          "p-3 rounded-2xl border shrink-0",
                          !n.isRead ? "bg-white border-indigo-100 shadow-sm" : "bg-slate-50 border-slate-100"
                        )}>
                           {getIcon(n.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                           <div className="flex justify-between items-start">
                              <h4 className={cn("text-sm font-black tracking-tight leading-none", !n.isRead ? "text-slate-900" : "text-slate-600")}>
                                {n.title}
                              </h4>
                              <button 
                                onClick={(e) => handleDelete(n._id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
                              >
                                 <Trash2 size={14} />
                              </button>
                           </div>
                           <p className="text-xs font-medium text-slate-400 leading-relaxed line-clamp-2">
                              {n.message}
                           </p>
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest pt-1">
                              {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                        </div>
                     </div>
                     {!n.isRead && <div className="absolute top-6 right-6 w-2 h-2 bg-indigo-600 rounded-full" />}
                  </div>
                ))
              ) : (
                <div className="p-16 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4 border border-slate-100">
                      <Bell size={24} className="text-slate-200" />
                   </div>
                   <h4 className="text-sm font-black text-slate-900 tracking-tight">Zero Notifications</h4>
                   <p className="text-xs font-medium text-slate-400 mt-1">You're all caught up for now.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50/50 backdrop-blur-md border-t border-slate-100">
               <button className="w-full py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all active:scale-95">
                  View All Notifications
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
