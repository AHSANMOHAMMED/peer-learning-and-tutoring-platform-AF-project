import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
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
  PlayCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useBookings } from '../controllers/useBookings';
import { useAuth } from '../controllers/useAuth';
import { cn } from '../utils/cn';

const MyBookings: React.FC = () => {
  const { bookings, loading, fetchBookings, updateBookingStatus } = useBookings();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const activeSessionId = bookings.find(b => b.status === 'in_progress')?._id || 'peerlearn-live-123';

  const handleStatusUpdate = async (id: string, status: string) => {
    if (window.confirm(`Are you sure you want to ${status} this booking?`)) {
      try {
        await updateBookingStatus(id, status);
        alert(`Booking ${status} successfully.`);
      } catch (err) {
        alert('Failed to update booking status.');
      }
    }
  };

  return (
    <Layout userRole={user?.role as any}>
      <div className="min-h-screen space-y-8 p-4 md:p-8 bg-gray-50/50 dark:bg-gray-950/50">
        {/* Hub Header */}
        <div className="relative overflow-hidden rounded-[3rem] bg-indigo-600 p-8 md:p-16 text-white shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
                  <Calendar className="text-white" size={24} />
                </div>
                <span className="text-xs font-black tracking-[0.3em] uppercase text-indigo-100">Schedule Command Center</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
                My Session <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-white underline decoration-white/30 underline-offset-8">Inventory.</span>
              </h1>
              <p className="text-indigo-100/80 text-lg md:text-xl font-medium leading-relaxed mb-6">
                Manage your live classes, review past records, and access private mentoring sessions in one central hub.
              </p>
              <div className="flex items-center gap-4 py-4">
                 <div className="px-6 py-3 bg-white/10 rounded-2xl border border-white/20 text-xs font-bold flex items-center gap-2">
                    <TrendingUp size={16} /> {bookings.length} total sessions
                 </div>
                 <div className="px-6 py-3 bg-teal-400/20 rounded-2xl border border-teal-400/30 text-xs font-bold flex items-center gap-2">
                    <ShieldCheck size={16} /> Secure Learning Node
                 </div>
              </div>
            </div>
            
            {/* Rapid Join UI */}
            <div className="p-8 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-2xl flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-teal-400 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-teal-500/30 animate-pulse">
                  <Video size={32} />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-teal-200 mb-2">Live Session Access</p>
               <h4 className="text-xl font-black mb-6">Sync to Real-time <br /> Learning Hub</h4>
               <button 
                 onClick={() => navigate(`/session/${activeSessionId}`)}
                 className="px-10 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl active:scale-95 group"
               >
                 Join Room <ArrowRight size={16} className="inline ml-1 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-6">
              <h3 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white uppercase flex items-center gap-3">
                <LayoutGrid size={28} className="text-indigo-600" />
                Live Agenda
              </h3>
              <div className="flex items-center gap-4 text-xs font-black text-gray-400 tracking-widest uppercase">
                 <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal-500" /> Confirmed</span>
                 <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Pending</span>
              </div>
           </div>

           {loading ? (
             <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-[2.5rem] animate-pulse" />)}
             </div>
           ) : (
             <div className="space-y-6 pb-20">
                {bookings.length > 0 ? bookings.map((booking, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={booking._id} 
                    className="group bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:border-indigo-500/30 transition-all flex flex-col xl:flex-row items-center justify-between gap-8"
                  >
                     <div className="flex items-center gap-8 flex-1">
                        <div className="p-5 rounded-3xl bg-gray-50 dark:bg-gray-800 text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg shadow-indigo-500/10">
                           <Clock size={32} />
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-2">
                             <h4 className="text-2xl font-black text-gray-950 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                               {booking.subject}
                             </h4>
                             <span className={cn(
                               "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                               booking.status === 'confirmed' ? "bg-teal-50 text-teal-600" : 
                               booking.status === 'pending' ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"
                             )}>
                               {booking.status}
                             </span>
                           </div>
                           <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-400 mt-2">
                              <span className="flex items-center gap-2"><User size={14} className="text-indigo-400" /> 
                                {user?.role === 'student' ? (booking.tutorId as any)?.userId?.username || 'Tutor' : (booking.studentId as any)?.username || 'Student'}
                              </span>
                              <span className="flex items-center gap-2"><Calendar size={14} className="text-indigo-400" /> {new Date(booking.date).toLocaleDateString()}</span>
                              <span className="flex items-center gap-2"><Clock size={14} className="text-indigo-400" /> {booking.startTime} - {booking.endTime}</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-wrap items-center gap-4 shrink-0">
                        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 border border-gray-100 dark:border-gray-700">
                           LKR {booking.price} • PREPAID
                        </div>
                        
                        <div className="flex gap-2">
                          {user?.role === 'tutor' && booking.status === 'pending' && (
                            <button 
                              onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                              className="p-4 bg-teal-500 text-white rounded-2xl hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20"
                            >
                               <CheckCircle2 size={20} />
                            </button>
                          )}
                          
                          {(booking.status === 'pending' || (user?.role === 'student' && booking.status === 'confirmed')) && (
                            <button 
                              onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                              className="p-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                            >
                               <XCircle size={20} />
                            </button>
                          )}

                          {booking.status === 'confirmed' && (
                            <button 
                              onClick={() => navigate(`/session/${booking._id}`)}
                              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
                            >
                               <PlayCircle size={18} /> Start Session
                            </button>
                          )}
                        </div>
                     </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-40 rounded-[3.5rem] border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                     <AlertCircle className="mx-auto text-gray-300 mb-6" size={64} />
                     <h4 className="text-3xl font-black text-gray-900 dark:text-gray-400 mb-4">Agenda Empty</h4>
                     <p className="text-gray-500 max-w-xs mx-auto text-lg">You haven't booked any sessions yet. Start by exploring our 'Smart Match' tutor recommendations.</p>
                     <button 
                       onClick={() => navigate('/tutors')}
                       className="mt-8 px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-sm transition-all"
                     >
                       Find a Mentor Now
                     </button>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>
    </Layout>
  );
};

export default MyBookings;
