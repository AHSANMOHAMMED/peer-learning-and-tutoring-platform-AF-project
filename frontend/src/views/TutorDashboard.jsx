import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calendar as CalendarIcon, Clock, AlertTriangle, MessageCircle, Video, Flag, DollarSign, User, Briefcase, BookOpen, CheckCircle, Star, FileText } from 'lucide-react';
import { format, isFuture, isPast } from 'date-fns';

import Layout from '../components/Layout';
import { useAuth } from '../controllers/useAuth';
import { useBookings } from '../controllers/useBookings';
import { useTutors } from '../controllers/useTutors';
import { homeworkApi } from '../services/api';
import { toast } from 'react-hot-toast';

const TutorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bookings, fetchBookings } = useBookings();
  const [activeTab, setActiveTab] = useState('completed');

  const { tutors, fetchTutors, getTutorByUserId, loading: tutorLoading } = useTutors();
  const [tutorProfile, setTutorProfile] = useState(null);
  const [pendingHomework, setPendingHomework] = useState([]);
  const [gradingId, setGradingId] = useState(null);
  const [gradeData, setGradeData] = useState({ marks: '', feedback: '' });
  const [gradingLoading, setGradingLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
    if (user?._id) {
      getTutorByUserId(user._id)
        .then(data => setTutorProfile(data))
        .catch(err => console.log("Tutor profile not yet created"));
    }
  }, [fetchBookings, getTutorByUserId, user?._id]);

  useEffect(() => {
    if (activeTab === 'Homework') fetchPendingHomework();
  }, [activeTab]);

  const fetchPendingHomework = async () => {
    try {
      const res = await homeworkApi.getTutorPending();
      if (res.success) setPendingHomework(res.data || []);
    } catch (err) {
      console.error('Homework fetch error:', err);
    }
  };

  const handleGrade = async (id) => {
    if (!gradeData.marks) return toast.error('Please enter marks');
    setGradingLoading(true);
    try {
      await homeworkApi.grade(id, { marks: Number(gradeData.marks), feedback: gradeData.feedback });
      toast.success('Homework graded successfully!');
      setGradingId(null);
      setGradeData({ marks: '', feedback: '' });
      fetchPendingHomework();
    } catch (err) {
      toast.error('Failed to grade homework');
    } finally {
      setGradingLoading(false);
    }
  };

  // Derived Stats
  const activeSessions = bookings.filter(b => b.status === 'in_progress' || (b.status === 'scheduled' && isFuture(new Date(b.date)))).length;
  const pendingReschedules = bookings.filter(b => b.status === 'cancelled' || b.status === 'pending').length;
  const completedSessions = bookings.filter(b => b.status === 'completed' || isPast(new Date(b.date))).length;
  const totalEarnings = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.price || 0), 0);

  const tabs = ['Calendar', 'Upcoming', 'Homework', 'Reschedule', 'Completed'];

  const filteredBookings = useMemo(() => {
    if (activeTab === 'Upcoming') return bookings.filter(b => b.status === 'scheduled' && isFuture(new Date(b.date)));
    if (activeTab === 'Completed') return bookings.filter(b => b.status === 'completed' || isPast(new Date(b.date)));
    if (activeTab === 'Reschedule') return bookings.filter(b => b.status === 'cancelled');
    return bookings;
  }, [bookings, activeTab]);

  // Handle Loading State
  if (tutorLoading) {
    return (
      <Layout userRole="tutor">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a8cc]"></div>
        </div>
      </Layout>
    );
  }

  // Handle "Not Yet Approved" or "No Profile" state
  if (!tutorProfile || tutorProfile.verificationStatus !== 'approved') {
    return (
      <Layout userRole="tutor">
        <div className="max-w-4xl mx-auto py-12 px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-soft border border-slate-100 text-center"
          >
            <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
               <AlertTriangle size={40} className="text-amber-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              {tutorProfile ? 'Verification Pending' : 'Profile Incomplete'}
            </h1>
            
            <p className="text-slate-500 font-medium mb-10 max-w-lg mx-auto leading-relaxed">
              {tutorProfile 
                ? "Your application is currently being reviewed by our administrative team. You will have full access to your workspace once approved."
                : "Welcome to Aura! You're almost there. To start tutoring, please complete your professional profile for review."}
            </p>
            
            {!tutorProfile && (
              <button 
                onClick={() => navigate('/settings')} // Or a specific /tutor-setup page
                className="bg-[#00a8cc] hover:bg-[#008ba8] text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95"
              >
                Complete Tutor Setup
              </button>
            )}

            {tutorProfile && (
              <div className="flex flex-col items-center gap-4">
                 <div className="px-6 py-3 bg-slate-50 rounded-xl text-slate-600 font-bold border border-slate-100">
                    Status: <span className="text-amber-600 uppercase ml-1">{tutorProfile.verificationStatus}</span>
                 </div>
                 <p className="text-xs text-slate-400 font-medium">Expected review time: 24-48 hours</p>
              </div>
            )}
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="tutor">
      <div className="max-w-[1400px] mx-auto w-full">
        
        {/* Header Region */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
           <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-1">
                Good morning, {user?.profile?.firstName || user?.username || 'Tutor'}
              </h1>
              <p className="text-slate-500 text-sm">
                Here is your job listings statistic report from Jul 19 - Jul 25.
              </p>
           </div>
           <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50">
              <span>Jul 19 - Jul 25</span>
              <CalendarIcon size={16} className="text-[#00a8cc]" />
           </div>
        </div>

        {/* Action Cards (Mentoos pastel theme) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           
           <div className="p-6 rounded-2xl bg-[#fadcf1] relative overflow-hidden transition-transform hover:scale-[1.02]">
              <h3 className="text-4xl font-bold text-slate-800 mb-2">{activeSessions || 3}</h3>
              <p className="text-[15px] font-medium text-slate-700">Active session</p>
              <CalendarIcon size={20} className="absolute right-6 top-6 text-slate-600 opacity-60" />
           </div>

           <div className="p-6 rounded-2xl bg-[#cbf2fc] relative overflow-hidden transition-transform hover:scale-[1.02]">
              <h3 className="text-4xl font-bold text-slate-800 mb-2">{pendingReschedules || 2}</h3>
              <p className="text-[15px] font-medium text-slate-700">Pending Reschedules</p>
              <Clock size={20} className="absolute right-6 top-6 text-slate-600 opacity-60" />
           </div>

           <div className="p-6 rounded-2xl bg-[#d4cffc] relative overflow-hidden transition-transform hover:scale-[1.02]">
              <h3 className="text-4xl font-bold text-slate-800 mb-2">1</h3>
              <p className="text-[15px] font-medium text-slate-700">Teacher Issues</p>
              <AlertTriangle size={20} className="absolute right-6 top-6 text-slate-600 opacity-60" />
           </div>

           <div className="p-6 rounded-2xl bg-[#ffccf9] relative overflow-hidden transition-transform hover:scale-[1.02]">
              <h3 className="text-4xl font-black text-slate-800 mb-2">{tutors?.length || 0}</h3>
              <p className="text-[15px] font-medium text-slate-700">Available Teachers</p>
              <Users size={20} className="absolute right-6 top-6 text-slate-600 opacity-60" />
           </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-8 border-b border-slate-200 mb-8 pt-2">
           {tabs.map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`pb-4 px-1 text-[15px] font-medium border-b-2 transition-colors duration-300 ${
                 activeTab.toLowerCase() === tab.toLowerCase()
                   ? 'border-[#00a8cc] text-[#00a8cc]'
                   : 'border-transparent text-slate-500 hover:text-slate-800'
               }`}
             >
               {tab}
             </button>
           ))}
        </div>

        {/* Main Content Area (Session Cards) */}
        {activeTab !== 'Homework' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
           <AnimatePresence mode="popLayout">
             {filteredBookings.length > 0 ? filteredBookings.map((booking, idx) => (
               <motion.div
                 key={booking._id || idx}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-white border-[1.5px] border-slate-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
               >
                  <div className="absolute left-0 top-[10%] bottom-[10%] w-[3px] bg-[#00a8cc] rounded-r-md"></div>
                  <div className="flex items-center gap-2 mb-6 ml-2">
                     <h3 className="text-lg font-bold text-slate-800 capitalize leading-none">{booking.subject}</h3>
                     <span className="text-sm font-medium text-slate-400">| ID: JB-2024-{booking._id?.slice(-3) || idx + 100}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 ml-2 mb-8">
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0"><User size={18} className="text-slate-400" /></div>
                        <div>
                           <p className="font-bold text-slate-800 leading-tight">{booking.studentId?.profile?.firstName || booking.studentId?.username || 'Student'}</p>
                           <p className="text-[13px] text-slate-400 mt-1">Student</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0"><CalendarIcon size={18} className="text-indigo-400" /></div>
                        <div>
                           <p className="font-bold text-slate-800 leading-tight">{booking.date ? format(new Date(booking.date), 'dd MMM yyyy') : 'TBD'}</p>
                           <p className="text-[13px] text-slate-400 mt-1">{booking.date ? format(new Date(booking.date), 'HH:mm') : '--:--'}</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0"><Flag size={18} className="text-rose-400" /></div>
                        <div>
                           <p className="font-bold text-slate-800 leading-tight capitalize">{booking.status}</p>
                           <p className="text-[13px] text-slate-400 mt-1">Status</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0"><DollarSign size={18} className="text-amber-500" /></div>
                        <div>
                           <p className="font-bold text-slate-800 leading-tight">${booking.price || '50'}</p>
                           <p className="text-[13px] text-slate-400 mt-1">Session fee</p>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-5 ml-2">
                     <div className="flex items-center gap-2 text-amber-500 font-bold text-[15px]">★ {Math.floor(Math.random() * 2) + 4} Rating</div>
                     <div className="flex items-center gap-3">
                        <button className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"><MessageCircle size={20} /></button>
                        <button onClick={() => navigate(`/session/${booking._id}`)} className="flex items-center gap-2 bg-[#00a8cc] hover:bg-[#008ba8] text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm">
                           <Video size={18} />{activeTab === 'Upcoming' ? 'Join' : 'View'}
                        </button>
                     </div>
                  </div>
               </motion.div>
             )) : (
                <div className="col-span-1 xl:col-span-2 py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                   <CalendarIcon size={48} className="text-slate-300 mb-4" />
                   <h3 className="text-lg font-bold text-slate-600 mb-1">No {activeTab} Sessions Found</h3>
                   <p className="text-slate-400 text-sm">No sessions matching this criteria.</p>
                </div>
             )}
           </AnimatePresence>
        </div>
        )}

        {/* Homework Grading Panel */}
        {activeTab === 'Homework' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {pendingHomework.length > 0 ? pendingHomework.map((hw, idx) => (
                <motion.div key={hw._id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white border-[1.5px] border-slate-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                  <div className="absolute left-0 top-[10%] bottom-[10%] w-[3px] bg-amber-400 rounded-r-md"></div>
                  <div className="flex items-center justify-between mb-4 ml-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{hw.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">Subject: <span className="capitalize font-semibold text-slate-600">{hw.subject}</span> &bull; Grade: {hw.grade}</p>
                    </div>
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-lg uppercase">Pending</span>
                  </div>
                  <div className="ml-2 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><User size={14} className="text-slate-500" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{hw.student?.profile?.firstName || hw.student?.username || 'Student'} {hw.student?.profile?.lastName || ''}</p>
                      <p className="text-xs text-slate-400">Submitted {new Date(hw.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {hw.description && <p className="text-sm text-slate-500 ml-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">{hw.description}</p>}
                  {hw.submittedFiles?.length > 0 && (
                    <div className="ml-2 mb-4 flex flex-wrap gap-2">
                      {hw.submittedFiles.map((f, fi) => (
                        <a key={fi} href={f.url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors">
                          <FileText size={14} /> {f.name || `File ${fi + 1}`}
                        </a>
                      ))}
                    </div>
                  )}
                  {gradingId === hw._id ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-2 space-y-4 pt-4 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Marks</label>
                          <input type="number" min="0" max="100" value={gradeData.marks} onChange={e => setGradeData(p => ({...p, marks: e.target.value}))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00a8cc] outline-none font-bold text-slate-800" placeholder="0-100" />
                        </div>
                        <div className="flex items-end gap-2">
                          <button onClick={() => handleGrade(hw._id)} disabled={gradingLoading} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"><CheckCircle size={16} /> Submit</button>
                          <button onClick={() => setGradingId(null)} className="py-3 px-4 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Feedback</label>
                        <textarea rows={3} value={gradeData.feedback} onChange={e => setGradeData(p => ({...p, feedback: e.target.value}))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00a8cc] outline-none font-medium text-slate-700 resize-none" placeholder="Great work! You can improve by..." />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-end mt-4 border-t border-slate-100 pt-4">
                      <button onClick={() => { setGradingId(hw._id); setGradeData({ marks: '', feedback: '' }); }} className="flex items-center gap-2 bg-[#00a8cc] hover:bg-[#008ba8] text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-sm"><Star size={16} /> Grade Homework</button>
                    </div>
                  )}
                </motion.div>
              )) : (
                <div className="col-span-1 xl:col-span-2 py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  <BookOpen size={48} className="text-slate-300 mb-4" />
                  <h3 className="text-lg font-bold text-slate-600 mb-1">No Pending Homework</h3>
                  <p className="text-slate-400 text-sm">All student submissions have been graded. Great job!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default TutorDashboard;
