import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Video,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  XCircle,
  PlayCircle,
  Activity,
  Zap,
  Globe,
  Settings,
  ArrowUpRight,
  Target,
  Signal,
  BadgeCheck,
  BookOpen,
  RefreshCw,
  Database,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useBookings } from '../controllers/useBookings';
import { useAuth } from '../controllers/useAuth';
import { cn } from '../utils/cn';
import { toast } from 'react-hot-toast';

const MyBookings = () => {
  const { bookings, loading, fetchBookings, updateBookingStatus } = useBookings();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const activeSessionId = bookings.find((b) => b.status === 'in_progress')?._id || 'peerlearn-live-123';

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      toast.success(`Session ${status}`);
    } catch (err) {
      console.error('Update failed');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  if (loading && bookings.length === 0) {
    return (
       <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-6">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
             <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
                <Calendar className="text-[#00a8cc] animate-pulse" size={32} />
             </div>
          </motion.div>
          <p className="text-sm font-semibold text-slate-400 animate-pulse">Loading your sessions...</p>
       </div>
    );
  }

  return (
    <Layout userRole={user?.role}>
      <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-8 font-sans">
        
        <motion.div 
          className="max-w-[1400px] mx-auto space-y-8"
          variants={containerVariants}
          initial="hidden" animate="visible"
        >
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2.5">
                   <div className="w-2 h-2 bg-[#00a8cc] rounded-full animate-pulse" />
                   <span className="text-sm font-bold text-slate-800">My Sessions</span>
                </div>
                <div className="hidden sm:flex items-center gap-2.5 text-slate-400">
                   <Signal size={14} className="text-slate-400" />
                   <span className="text-sm font-medium">All systems operational</span>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <button 
                   onClick={fetchBookings}
                   className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                   title="Refresh Sessions"
                >
                   <RefreshCw size={18} className={cn(loading ? "animate-spin" : "")} />
                </button>
             </div>
          </div>

          {/* Hero Section */}
          <motion.div 
            variants={itemVariants} 
            className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 md:p-12 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-12"
          >
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#e8f6fa] to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none opacity-60" />
            
            <div className="relative z-10 flex-1 max-w-3xl space-y-6">
               <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#f0f9fb] border border-[#d1f0f7] text-[#00a8cc] text-sm font-bold">
                  <Calendar size={16} /> Manage Schedule
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                  Your Academic <br />
                  <span className="text-[#00a8cc]">Session Hub.</span>
               </h1>
               <p className="text-slate-500 text-lg leading-relaxed max-w-xl">
                  Keep track of all your upcoming tutoring sessions, join active classrooms, and manage your learning schedule from one centralized dashboard.
               </p>

               <div className="flex items-center gap-4 pt-4">
                  <div className="px-5 py-3 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-3 text-slate-700 font-bold">
                     <TrendingUp size={18} className="text-[#00a8cc]" /> {bookings.length} Total Sessions
                  </div>
               </div>
            </div>

            {/* Active Session Card */}
            <div className="w-full xl:w-96 p-8 bg-slate-800 rounded-3xl shadow-xl flex flex-col items-center text-center relative overflow-hidden shrink-0">
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
               <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto backdrop-blur-md">
                     <Video size={28} />
                  </div>
                  <p className="text-sm font-bold text-slate-300 mb-2">Upcoming Session</p>
                  <h4 className="text-2xl font-black text-white mb-8">Ready to Connect</h4>
                  <button
                    onClick={() => navigate(`/session/${activeSessionId}`)}
                    className="w-full py-4 bg-[#00a8cc] text-white rounded-xl font-bold transition-all hover:bg-[#008fba] shadow-md flex items-center justify-center gap-3"
                  >
                     Join Room <ArrowRight size={18} />
                  </button>
               </div>
            </div>
          </motion.div>

          {/* Bookings List Section */}
          <div className="space-y-6 pb-20">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
                <div className="space-y-1">
                   <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                      <LayoutGrid size={24} className="text-[#00a8cc]" /> Upcoming Schedule
                   </h3>
                   <p className="text-sm text-slate-500">View and manage all your scheduled tutoring sessions.</p>
                </div>
                <div className="flex items-center gap-6 py-2 px-4 border border-slate-200 rounded-xl bg-white shadow-sm">
                   <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                      <span className="text-sm font-bold text-slate-600">Confirmed</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                      <span className="text-sm font-bold text-slate-600">Pending</span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                   {bookings.length > 0 ? (
                     bookings.map((booking) => (
                       <motion.div
                         key={booking._id}
                         layout
                         initial={{ opacity: 0, scale: 0.98 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.98 }}
                         className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-[#00a8cc]/30 transition-all flex flex-col xl:flex-row items-center justify-between gap-8 group"
                       >
                          <div className="flex items-center gap-6 flex-1 w-full">
                             <div className={cn(
                               "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                               booking.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                             )}>
                                <Clock size={24} />
                             </div>
                             
                             <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-4">
                                   <h4 className="text-lg font-bold text-slate-800 group-hover:text-[#00a8cc] transition-colors">
                                      {booking.subject || 'Tutoring Session'}
                                   </h4>
                                   <span className={cn(
                                     "px-3 py-1 rounded-md text-xs font-bold uppercase",
                                     booking.status === 'confirmed' ? "bg-emerald-100 text-emerald-700" :
                                     booking.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                                   )}>
                                      {booking.status}
                                   </span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
                                   <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                      <User size={16} className="text-slate-400" />
                                      {user?.role === 'student' ? booking.tutorId?.userId?.username || 'Tutor' : booking.studentId?.username || 'Student'}
                                   </div>
                                   <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                      <Calendar size={16} className="text-slate-400" />
                                      {new Date(booking.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                   </div>
                                   <div className="flex items-center gap-2 bg-[#f0f9fb] text-[#00a8cc] px-3 py-1.5 rounded-lg border border-[#e8f6fa]">
                                      <Activity size={16} />
                                      {booking.startTime} - {booking.endTime}
                                   </div>
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 w-full xl:w-auto justify-end">
                             <div className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-bold">
                                ${(booking.price || 0).toLocaleString()}
                             </div>
                             
                             <div className="flex gap-2 text-center">
                                {user?.role === 'tutor' && booking.status === 'pending' && (
                                  <button
                                    onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                    className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center border border-emerald-100 shadow-sm"
                                    title="Confirm Session"
                                  >
                                     <CheckCircle2 size={20} />
                                  </button>
                                )}
                                
                                {(booking.status === 'pending' || (user?.role === 'student' && booking.status === 'confirmed')) && (
                                  <button
                                    onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                    className="w-11 h-11 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center border border-rose-100 shadow-sm"
                                    title="Cancel Session"
                                  >
                                     <XCircle size={20} />
                                  </button>
                                )}
    
                                {booking.status === 'confirmed' && (
                                  <button
                                    onClick={() => navigate(`/session/${booking._id}`)}
                                    className="px-6 py-2.5 bg-[#00a8cc] text-white rounded-xl font-bold transition-all hover:bg-[#008fba] shadow-sm flex items-center gap-2"
                                  >
                                     <PlayCircle size={18} /> Join
                                  </button>
                                )}
                             </div>
                          </div>
                       </motion.div>
                     ))
                   ) : (
                     <div className="text-center py-20 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col items-center gap-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                           <Calendar className="text-slate-300" size={32} />
                        </div>
                        <div className="space-y-2 max-w-sm px-4">
                           <h4 className="text-xl font-bold text-slate-800">No sessions scheduled</h4>
                           <p className="text-sm text-slate-500">
                                Apparently, your schedule is clear. Let's find you the perfect session to accelerate your learning.
                           </p>
                        </div>
                        <button
                          onClick={() => navigate('/tutors')}
                          className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold transition-all hover:bg-slate-700 shadow-sm flex items-center gap-2 mt-2"
                        >
                           Browse Tutors <ArrowUpRight size={18} />
                        </button>
                     </div>
                   )}
                </AnimatePresence>
             </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default MyBookings;