import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronRight, CheckCircle2, Clock, Flame, Percent, Sparkles, BookOpen, Users, Zap, ArrowRight, ShieldCheck, Gamepad2, MessageSquare, Megaphone } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

import Layout from '../components/Layout';
import { useAuth } from '../controllers/useAuth';
import { useTutors } from '../controllers/useTutors';
import { useBookings } from '../controllers/useBookings';
import { gamificationApi, groupsApi, announcementApi, parentApi, questionApi, bookingApi } from '../services/api';
import { toast } from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fetchTutors } = useTutors();
  const { bookings, fetchBookings } = useBookings();
  const [myGroups, setMyGroups] = useState([]);
  const [gamificationProfile, setGamificationProfile] = useState(null);
  const [loadingGamification, setLoadingGamification] = useState(true);

  const [gameCatalog, setGameCatalog] = useState([]);
  const [qaQuestions, setQaQuestions] = useState([]);
  const [tutorChallenges, setTutorChallenges] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingQA, setLoadingQA] = useState(true);

  // Skip Request State
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [selectedBookingForSkip, setSelectedBookingForSkip] = useState(null);
  const [skipReason, setSkipReason] = useState('');
  const [skipLoading, setSkipLoading] = useState(false);

  useEffect(() => {
    fetchTutors();
    fetchBookings();
    fetchMyGroups();
    fetchGamification();
    fetchGameCatalog();
    fetchQAQuestions();
    fetchTutorChallenges();
    fetchAnnouncements();
  }, [fetchTutors, fetchBookings]);

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementApi.getMy();
      if (res.success) setAnnouncements(res.data || []);
    } catch (err) {
      console.error("Error fetching announcements", err);
    }
  };

  const fetchGameCatalog = async () => {
    try {
      const data = await gamificationApi.getCatalog();
      if (data.success) {
        setGameCatalog(data.data.catalog || []);
      } else if (data.catalog) {
        setGameCatalog(data.catalog);
      } else {
        setGameCatalog(data || []);
      }
    } catch (err) {
      console.error('Game catalog fetch error:', err);
    }
  };

  const activeChallenge = gameCatalog[0] || { title: 'No active challenge', difficulty: 'N/A' };

  const fetchGamification = async () => {
    try {
      setLoadingGamification(true);
      const data = await gamificationApi.getProfile();
      if (data.success) {
        setGamificationProfile(data.data);
      } else {
        setGamificationProfile(data || null);
      }
    } catch (err) {
      console.error('Gamification fetch error:', err);
    } finally {
      setLoadingGamification(false);
    }
  };

  const fetchMyGroups = async () => {
    try {
      const data = await groupsApi.getMyRooms();
      if (data.success) {
        setMyGroups(data.data?.groupRooms || data.data || []);
      } else {
        setMyGroups(data || []);
      }
    } catch (err) {
      console.error('Groups fetch error:', err);
    }
  };

  const [parentRequests, setParentRequests] = useState([]);
  const [linkedParents, setLinkedParents] = useState([]);

  const fetchParentRequests = async () => {
    try {
      const res = await parentApi.getStudentLinkRequests();
      if (res.success) setParentRequests(res.data.requests || []);
    } catch (err) {
      console.error('Error fetching parent requests:', err);
    }
  };

  const fetchLinkedParents = async () => {
     try {
        const res = await parentApi.getLinkedParents();
        if (res.success) setLinkedParents(res.data.parents || []);
     } catch (err) {
        console.error('Error fetching linked parents:', err);
     }
  };

  const handleRespondParent = async (requestId, approve) => {
    try {
      await parentApi.respondToLink(requestId, { approve });
      toast.success(approve ? 'Parent linked!' : 'Request declined');
      fetchParentRequests();
      fetchLinkedParents();
    } catch (err) {
      toast.error('Failed to respond to request');
    }
  };

  useEffect(() => {
    fetchParentRequests();
    fetchLinkedParents();
  }, []);

  const fetchTutorChallenges = async () => {
    try {
      // Fetch questions tagged as challenges that are appropriate for student's grade
      const gradeMatch = user?.grade?.match(/\d+/);
      const numericGrade = gradeMatch ? parseInt(gradeMatch[0]) : null;
      
      const res = await questionApi.getAll({ 
        tags: 'challenge',
        grade: numericGrade,
        limit: 5
      });
      
      setTutorChallenges(res.questions || res.data?.questions || res.data || []);
    } catch (err) {
      console.error('Error fetching tutor challenges:', err);
    }
  };

  const fetchQAQuestions = async () => {
    try {
      setLoadingQA(true);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      
      const streamMap = {
        'Maths': 'Combined Mathematics',
        'Physical Sciences': 'Physical Sciences',
        'Science': 'Biological Sciences',
        'Biological Sciences': 'Biological Sciences',
        'Commerce': 'Commercial Stream',
        'Arts': 'Arts Stream',
        'Arts Stream': 'Arts Stream',
        'Tech': 'Technology Stream',
        'Technology Stream': 'Technology Stream',
        'O/L': 'O/L General',
        'O/L General': 'O/L General'
      };
      const userStream = streamMap[user?.stream] || 'all';

      const gradeMatch = user?.grade?.match(/\d+/);
      const numericGrade = gradeMatch ? gradeMatch[0] : 'all';

      const res = await questionApi.getAll({ grade: numericGrade, subject: userStream });
      
      if (res.questions || res.data?.questions) {
        const rawQuestions = res.questions || res.data.questions;
        const questions = rawQuestions.map(q => ({
          id: q._id,
          author: q.author?.username || 'Tutor',
          subject: q.subject || 'General',
          title: q.title || 'Untitled',
          body: q.body || q.content || '',
          hasAnswer: (q.answers?.length || 0) > 0,
          answerPreview: q.answers?.[0]?.content || '',
          date: new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }));
        setQaQuestions(questions);
      }
    } catch (err) {
      console.error('QA fetch error:', err);
    } finally {
      setLoadingQA(false);
    }
  };

  const handleSkipRequest = async () => {
    if (!skipReason.trim()) return toast.error('Please provide a reason');
    setSkipLoading(true);
    try {
      const res = await bookingApi.requestSkip(selectedBookingForSkip._id, { reason: skipReason });
      if (res.status === 'skip_requested') {
        toast.success('Absence request sent to tutor');
        setSkipModalOpen(false);
        setSkipReason('');
        fetchBookings();
      }
    } catch (err) {
      toast.error('Failed to send skip request');
    } finally {
      setSkipLoading(false);
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'scheduled' || b.status === 'confirmed' || b.status === 'skip_requested').slice(0, 3);
  
  const stats = {
    streakDays: gamificationProfile?.streaks?.current || 0,
    lessonDone: gamificationProfile?.stats?.totalSessions || 0,
    studyTime: gamificationProfile?.stats?.totalHours ? `${Math.floor(gamificationProfile.stats.totalHours)}h ${Math.round((gamificationProfile.stats.totalHours % 1) * 60)}m` : "0h 0m",
    points: gamificationProfile?.points?.lifetime || 0,
    level: gamificationProfile?.level?.current || 1,
    levelTitle: gamificationProfile?.level?.title || 'Novice'
  };

  const performanceData = [
    { name: 'Mastery', val: Math.min(100, (gamificationProfile?.stats?.coursesCompleted || 0) * 20), fill: 'url(#blueGradient)' },
    { name: 'Progress', val: Math.round(gamificationProfile?.level?.progress || 0), fill: 'url(#indigoGradient)' },
    { name: 'Analytics', val: Math.min(100, (gamificationProfile?.stats?.totalSessions || 0) * 5), fill: 'url(#emeraldGradient)' },
    { name: 'Effort', val: Math.min(100, (gamificationProfile?.stats?.totalHours || 0) * 2), fill: 'url(#amberGradient)' },
    { name: 'Streak', val: Math.min(100, (gamificationProfile?.streaks?.current || 0) * 10), fill: 'url(#violetGradient)' },
    { name: 'Global', val: Math.max(5, 100 - (gamificationProfile?.ranking?.global || 100)), fill: 'url(#slateGradient)' },
  ];

  const gaugeData = [
    { name: 'Done', value: Math.round(gamificationProfile?.level?.progress || 0) },
    { name: 'Remain', value: 100 - Math.round(gamificationProfile?.level?.progress || 0) }
  ];

  return (
    <Layout userRole="student">
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 font-sans">
        
        {/* Header Region */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-10"
        >
           <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles size={14} /> Student Dashboard
              </div>
              <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-3">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{user?.profile?.firstName || user?.username || 'Learner'}</span>!
              </h1>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-full text-[12px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-200/50 transition-transform hover:scale-105 cursor-default">
                    Level {stats.level}: {stats.levelTitle}
                 </div>
                 <p className="text-slate-500 text-[15px] font-medium border-l-2 border-slate-200 pl-4 py-1">
                    Ready to achieve your goals?
                 </p>
                 <Link to="/profile" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors ml-2">
                    View Profile
                 </Link>
              </div>
           </div>
           
           <div className="flex flex-wrap items-center gap-5">
              {[
                { label: 'Current Streak', value: stats.streakDays, sub: 'Day Streak', icon: <Flame size={18} />, color: 'orange', border: 'border-orange-400' },
                { label: 'Merit Points', value: stats.points.toLocaleString(), sub: 'Lifetime', icon: <Sparkles size={18} />, color: 'indigo', border: 'border-indigo-500' },
                { label: 'Global Rank', value: `#${gamificationProfile?.ranking?.global || '--'}`, sub: 'Overall', icon: <Users size={18} />, color: 'emerald', border: 'border-emerald-500' }
              ].map((stat, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -5 }}
                  className={`bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-2xl shadow-slate-200/50 min-w-[180px] border-b-4 ${stat.border} border-l border-t border-r border-slate-50 relative overflow-hidden`}
                >
                  <div className="flex justify-between items-center mb-3 relative z-10">
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">{stat.label}</p>
                    <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-500 rounded-xl`}>{stat.icon}</div>
                  </div>
                  <div className="flex items-baseline justify-between relative z-10">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.sub}</span>
                  </div>
                  <div className={`absolute -right-2 -bottom-2 opacity-[0.03] text-slate-900`}>{stat.icon}</div>
                </motion.div>
              ))}
           </div>
        </motion.div>

         {/* Announcements Section */}
         <AnimatePresence>
           {announcements.length > 0 && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="mb-8"
             >
               <div className="bg-gradient-to-r from-indigo-600/90 to-violet-600/90 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl shadow-indigo-200/40 border border-white/20 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                     <Megaphone size={120} />
                  </div>
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                     <div className="p-2.5 bg-white/20 rounded-xl">
                        <Megaphone size={20} />
                     </div>
                     <div>
                        <h2 className="text-xl font-bold tracking-tight">System Announcements</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Important updates for your role</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                     {announcements.slice(0, 3).map((ann) => (
                       <div key={ann._id} className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/10 transition-all cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                             <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                               ann.priority === 'urgent' ? 'bg-rose-500 text-white' : 
                               ann.priority === 'high' ? 'bg-orange-500 text-white' : 'bg-white/30 text-white'
                             }`}>
                                {ann.priority}
                             </span>
                             <span className="text-[9px] font-bold opacity-60">{new Date(ann.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h4 className="text-sm font-bold mb-1 line-clamp-1">{ann.title}</h4>
                          <p className="text-xs opacity-80 line-clamp-2 leading-relaxed">{ann.content}</p>
                       </div>
                     ))}
                  </div>
               </div>
             </motion.div>
           )}
         </AnimatePresence>

         {/* Main Content Grid */}
         <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
           
           {/* Profile Summary & Personalization */}
           <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="xl:col-span-3 flex flex-col gap-6"
           >
              <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/30 border border-white flex-1 flex flex-col">
                 <div className="flex flex-col items-center text-center mb-6">
                    <div className="relative group mb-4">
                       <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 p-1">
                          <img 
                            src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${user?.profile?.firstName || user?.username}&background=random`} 
                            className="w-full h-full rounded-full object-cover border-4 border-white" 
                            alt="Profile" 
                          />
                       </div>
                       <motion.button 
                         whileHover={{ scale: 1.1 }}
                         onClick={() => navigate('/profile')}
                         className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-indigo-600 border border-slate-100"
                       >
                          <Zap size={14} />
                       </motion.button>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{user?.profile?.firstName} {user?.profile?.lastName}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">@{user?.username}</p>
                 </div>

                 <div className="space-y-3">
                    {[
                      { label: 'Grade', value: user?.grade || 'N/A', icon: <BookOpen size={14}/> },
                      { label: 'Stream', value: user?.stream || 'N/A', icon: <ChevronRight size={14}/> }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <div className="flex items-center gap-2 text-slate-500">
                           {item.icon}
                           <span className="text-[11px] font-bold uppercase tracking-wider">{item.label}</span>
                        </div>
                        <span className="text-[12px] font-bold text-slate-800">{item.value}</span>
                      </div>
                    ))}
                 </div>

                 {/* Parent Link Section */}
                 <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Guardian Connection</h4>
                    
                    {linkedParents.length > 0 && (
                       <div className="space-y-2">
                          {linkedParents.map(lp => (
                             <div key={lp.linkId} className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/30">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs uppercase">
                                   {lp.parent?.username?.[0] || 'G'}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                   <p className="text-[11px] font-bold text-slate-800 truncate">{lp.parent?.username || lp.parent?.email}</p>
                                   <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">Active Link • {lp.relationship}</p>
                                </div>
                                <ShieldCheck size={14} className="text-emerald-500" />
                             </div>
                          ))}
                       </div>
                    )}

                    {parentRequests.length > 0 ? (
                       <div className="space-y-3">
                          {parentRequests.map(req => (
                             <div key={req._id} className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <p className="text-xs font-bold text-indigo-900 mb-2">{req.parent?.email} wants to link.</p>
                                <div className="flex gap-2">
                                   <button onClick={() => handleRespondParent(req._id, true)} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase">Approve</button>
                                   <button onClick={() => handleRespondParent(req._id, false)} className="flex-1 py-2 bg-white text-slate-400 rounded-xl text-[10px] font-bold uppercase border border-slate-200">Decline</button>
                                </div>
                             </div>
                          ))}
                       </div>
                    ) : linkedParents.length === 0 && (
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                          <p className="text-[10px] font-bold text-slate-400 italic">No pending parent requests</p>
                       </div>
                    )}
                 </div>

                 <button 
                  onClick={() => navigate('/profile')}
                  className="w-full mt-auto py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all"
                 >
                    Manage Profile
                 </button>
              </div>
           </motion.div>

           {/* Performance Overview */}
           <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-5 bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/40 border border-white/40 relative overflow-hidden"
           >
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Academic Pulse</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Real-time performance metrics across your learning journey</p>
                 </div>
                 <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100/50">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider">Live Stats</span>
                 </div>
              </div>
              <div className="h-72">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData} maxBarSize={65}>
                       <defs>
                          <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={1}/>
                          </linearGradient>
                          <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#818cf8" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity={1}/>
                          </linearGradient>
                          <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#34d399" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#10b981" stopOpacity={1}/>
                          </linearGradient>
                          <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fbbf24" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity={1}/>
                          </linearGradient>
                          <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a78bfa" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1}/>
                          </linearGradient>
                          <linearGradient id="slateGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#94a3b8" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#475569" stopOpacity={1}/>
                          </linearGradient>
                       </defs>
                       <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'}} 
                        dy={20} 
                       />
                       <Tooltip 
                        cursor={{fill: '#f8fafc', radius: 16}} 
                        contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '15px'}} 
                       />
                       <Bar dataKey="val" radius={[16, 16, 16, 16]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </motion.div>

           {/* Progress Gauge */}
           <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-10 shadow-2xl text-white relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="relative z-10 flex flex-col h-full">
                 <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold tracking-tight">Study Progress</h2>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                      <Clock size={20} className="text-indigo-400" />
                    </div>
                 </div>
                 
                 <div className="flex-1 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={240}>
                       <PieChart>
                          <Pie 
                            data={gaugeData} 
                            cx="50%" 
                            cy="80%" 
                            startAngle={180} 
                            endAngle={0} 
                            innerRadius={70} 
                            outerRadius={100} 
                            paddingAngle={0} 
                            dataKey="value" 
                            stroke="none"
                          >
                             <Cell key="cell-0" fill="#6366f1" />
                             <Cell key="cell-1" fill="rgba(255,255,255,0.05)" />
                          </Pie>
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-[55%] text-center">
                       <h3 className="text-5xl font-black tracking-tighter">
                          {Math.round(gamificationProfile?.level?.progress || 0)}%
                       </h3>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">To Next Level</p>
                    </div>
                 </div>

                 <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-sm font-medium text-slate-300">Total Study Time</span>
                       <span className="text-sm font-bold text-indigo-400">{stats.studyTime}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        className="h-full bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                       />
                    </div>
                 </div>
              </div>
           </motion.div>

        </div>

        {/* Skip Modal */}
        <AnimatePresence>
          {skipModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSkipModalOpen(false)} />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl p-8 w-full max-w-md relative z-10 shadow-2xl"
              >
                <button onClick={() => setSkipModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X size={20}/></button>
                <h3 className="text-xl font-black text-slate-900 mb-2">Request Absence</h3>
                <p className="text-slate-500 text-sm mb-6">Please provide a reason to inform your tutor about this session.</p>
                <textarea 
                  value={skipReason} onChange={(e) => setSkipReason(e.target.value)}
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                  rows={4} placeholder="e.g. Due to a family emergency..."
                />
                <button 
                  onClick={handleSkipRequest} disabled={skipLoading}
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 disabled:opacity-50"
                >
                  {skipLoading ? 'Sending...' : 'Confirm Request'}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Upcoming Sessions */}
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/30 border border-white"
           >
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight">Schedule</h2>
                 <Link to="/bookings" className="group flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-4 py-2 rounded-xl">
                    View All <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                 </Link>
              </div>
              <div className="space-y-4">
                 {upcomingBookings.length > 0 ? upcomingBookings.map((b, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 5 }}
                      className="group flex flex-col gap-4 bg-slate-50/50 p-5 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all" 
                    >
                       <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/session/${b._id}`)}>
                         <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-200">
                            {b.subject?.[0]}
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className="text-[15px] font-bold text-slate-900 truncate">{b.subject}</h4>
                            <div className="flex items-center gap-2 mt-1">
                               <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                                  <Clock size={12} /> {new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </div>
                               <span className="text-slate-300">•</span>
                               <div className="text-[11px] font-bold text-indigo-500 truncate">{b.tutorId?.name || 'Tutor Kamal'}</div>
                            </div>
                         </div>
                         <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm border border-slate-100 transition-opacity">
                          <ChevronRight size={16} className="text-indigo-600" />
                         </div>
                       </div>

                       {b.status === 'confirmed' && (
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             setSelectedBookingForSkip(b);
                             setSkipModalOpen(true);
                           }}
                           className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-slate-200 border-dashed hover:border-rose-200"
                         >
                            Request Absence
                         </button>
                       )}
                       
                       {b.status === 'skip_requested' && (
                         <div className="w-full py-2.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-xl text-center border border-amber-100">
                            Absence Pending Approval
                         </div>
                       )}
                    </motion.div>
                 )) : (
                    <div className="py-12 text-center flex flex-col items-center justify-center">
                       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200 border-2 border-dashed border-slate-100">
                        <Calendar size={32} />
                       </div>
                       <p className="text-sm font-bold text-slate-400">No upcoming sessions</p>
                       <button 
                        onClick={() => navigate('/tutors')} 
                        className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all hover:shadow-xl hover:shadow-indigo-200"
                       >
                        Explore Tutors
                       </button>
                    </div>
                 )}
              </div>
           </motion.div>

            {/* Knowledge Challenges (Tutor Posted) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-indigo-600 rounded-[2.5rem] p-1 shadow-2xl relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-1000">
                <Zap size={180} />
               </div>
               <div className="h-full bg-slate-900 rounded-[2.3rem] p-9 relative z-10 flex flex-col justify-between border border-white/5">
                  <div>
                     <div className="flex items-center justify-between mb-8">
                        <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/20">
                          <Zap size={24} className="text-slate-900" />
                        </div>
                        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-amber-400">
                          Tutor Challenges
                        </div>
                     </div>
                     <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Knowledge Challenges</h2>
                     <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">Expert-curated challenges specifically for your grade and stream. Answer to earn double points!</p>
                     
                     <div className="space-y-4 mb-10 overflow-y-auto max-h-48 custom-scrollbar">
                        {tutorChallenges.length > 0 ? tutorChallenges.slice(0, 2).map((tc, tci) => (
                           <div key={tci} className="p-5 bg-white/5 border border-white/10 rounded-[1.5rem] backdrop-blur-md hover:bg-white/10 cursor-pointer transition-all" onClick={() => navigate(`/qa/attempt/${tc._id}`)}>
                              <div className="flex justify-between items-center mb-2">
                                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{tc.subject}</span>
                                 <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg">
                                    +{tc.points || 10} XP
                                 </span>
                              </div>
                              <h4 className="text-sm font-bold text-white">{tc.title}</h4>
                           </div>
                        )) : (
                           <div className="p-5 bg-white/5 border border-white/10 rounded-[1.5rem] backdrop-blur-md text-center">
                              <p className="text-xs text-slate-400 italic">No active tutor challenges</p>
                           </div>
                        )}
                     </div>
                  </div>
                  <button 
                    onClick={() => navigate('/qa')} 
                    className="group relative w-full h-16 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black rounded-2xl transition-all hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] overflow-hidden"
                  >
                     <span className="relative z-10 flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
                        View Challenge Hub <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                     </span>
                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </button>
               </div>
            </motion.div>

            {/* AI Homework Assistant */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-cyan-500 rounded-[2.5rem] p-1 shadow-2xl relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-1000">
                <Sparkles size={180} />
               </div>
               <div className="h-full bg-slate-900 rounded-[2.3rem] p-9 relative z-10 flex flex-col justify-between border border-white/5">
                  <div>
                     <div className="flex items-center justify-between mb-8">
                        <div className="w-12 h-12 bg-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-400/20">
                          <Sparkles size={24} className="text-slate-900" />
                        </div>
                        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                          Multilingual AI
                        </div>
                     </div>
                     <h2 className="text-3xl font-black text-white mb-3 tracking-tight">AI Assistant</h2>
                     <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">Stuck on a problem? Chat with Aura AI tailored to your stream and language medium.</p>
                     
                     <div className="space-y-4 mb-10">
                        <div className="p-5 bg-white/5 border border-white/10 rounded-[1.5rem] backdrop-blur-md">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Always Available</span>
                              <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg">
                                 ONLINE
                              </span>
                           </div>
                           <h4 className="text-lg font-bold text-white">Solve Complex Equations</h4>
                        </div>
                     </div>
                  </div>
                  <button 
                    onClick={() => navigate('/ai-homework')} 
                    className="group relative w-full h-16 bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-black rounded-2xl transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] overflow-hidden"
                  >
                     <span className="relative z-10 flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
                        Ask Aura AI <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                     </span>
                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </button>
               </div>
            </motion.div>

            {/* Achievements/Badges */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/30 border border-white flex flex-col relative overflow-hidden"
            >
               <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hall of Fame</h2>
                  <Link to="/gamification" className="text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 px-4 py-2 rounded-xl">View Trophy Room</Link>
               </div>
               
               <div className="flex-1">
                  {gamificationProfile?.badges?.length > 0 ? (
                     <div className="grid grid-cols-4 gap-4">
                        {gamificationProfile.badges.slice(0, 12).map((b, i) => (
                           <motion.div 
                            key={i} 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="aspect-square rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group/badge relative cursor-pointer shadow-sm hover:shadow-lg transition-all" 
                            title={b.badge?.name}
                           >
                              {b.badge?.icon ? (
                                 <img src={b.badge.icon} className="w-10 h-10 object-contain group-hover/badge:scale-110 transition-transform" alt={b.badge.name} />
                              ) : (
                                 <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                  <ShieldCheck size={24} className="text-indigo-500" />
                                 </div>
                              )}
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full border-2 border-white flex items-center justify-center">
                                <Sparkles size={8} className="text-white" />
                              </div>
                           </motion.div>
                        ))}
                     </div>
                  ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-6">
                        <div className="w-24 h-24 bg-gradient-to-tr from-slate-50 to-white rounded-full flex items-center justify-center mb-6 shadow-inner">
                           <Sparkles size={36} className="text-slate-200" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 mb-2">The Collection is Empty</h4>
                        <p className="text-xs font-medium text-slate-400 leading-relaxed">Your legendary achievements will appear here. Start your first session to unlock a badge!</p>
                     </div>
                  )}
               </div>
              
              <div className="mt-10 pt-8 border-t border-slate-100">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Next Milestone</span>
                    <span className="text-[11px] font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg">{gamificationProfile?.progress?.pointsToNextLevel || 1000} XP TO GO</span>
                 </div>
                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${gamificationProfile?.progress?.progressPercentage || 15}%` }}
                       className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.4)]" 
                    />
                 </div>
              </div>
           </motion.div>

        </div>

        {/* Learning Groups Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/30 border border-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
                  <Users size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active Circles</h2>
                  <p className="text-slate-500 text-sm font-medium mt-0.5">Collaborative study groups you are currently part of</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/groups')} 
                className="group px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                Find Circles <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {myGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGroups.slice(0, 6).map((group, i) => (
                  <motion.div 
                    key={group._id || i} 
                    whileHover={{ scale: 1.02 }}
                    className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:border-emerald-200 hover:bg-white hover:shadow-2xl hover:shadow-emerald-500/5 transition-all cursor-pointer relative overflow-hidden group"
                  >
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
                    <div className="flex items-center gap-5 mb-5 relative z-10">
                      <div className="w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-200">
                        {group.title?.[0] || 'G'}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-[17px] font-bold text-slate-900 truncate tracking-tight">{group.title || 'Study Group'}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{group.subject}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">{group.grade}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(m => (
                          <div key={m} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?u=${group._id}${m}`} alt="member" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          +{Math.max(0, (group.participants?.length || 0) - 3)}
                        </div>
                      </div>
                      <div className={`text-[10px] font-black uppercase tracking-[0.15em] px-4 py-1.5 rounded-full ${group.isActive !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                        {group.isActive !== false ? 'Active Now' : 'Hibernating'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                    <Users size={40} className="text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No active circles found</h3>
                  <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto leading-relaxed">Knowledge grows when shared. Join or create a study circle to start collaborating with peers.</p>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/groups')} 
                    className="mt-8 px-10 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
                  >
                    Browse available circles
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Q&A Forum Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/30 border border-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-100">
                  <MessageSquare size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Q&A Forum</h2>
                  <p className="text-slate-500 text-sm font-medium mt-0.5">Questions posted by tutors and your conversations</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/qa')} 
                className="group px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {loadingQA ? (
              <div className="text-center py-12 text-slate-400 font-medium text-sm">Loading Q&A...</div>
            ) : qaQuestions.length > 0 ? (
              <div className="space-y-4">
                {qaQuestions.slice(0, 5).map((q) => (
                  <div 
                    key={q.id} 
                    onClick={() => navigate('/qa')}
                    className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-cyan-200 hover:bg-white hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 uppercase tracking-wider">{q.subject}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${q.hasAnswer ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${q.hasAnswer ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                            {q.hasAnswer ? 'Answered' : 'Pending'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">{q.date}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-[15px] mb-1 group-hover:text-cyan-700 transition-colors">{q.title}</h4>
                        <p className="text-slate-500 text-xs line-clamp-1">{q.body}</p>
                        {q.hasAnswer && q.answerPreview && (
                          <div className="mt-3 p-3 bg-cyan-50/60 border border-cyan-100 rounded-xl">
                            <p className="text-xs text-cyan-700 font-medium line-clamp-2">
                              <span className="font-bold">Tutor Reply:</span> {q.answerPreview}
                            </p>
                          </div>
                        )}
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-cyan-500 transition-colors shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-slate-200/50">
                  <MessageSquare size={36} className="text-slate-200" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No questions yet</h3>
                <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto leading-relaxed">Ask your first question or check back for tutor-posted Q&A material.</p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/qa')} 
                  className="mt-6 px-8 py-3 bg-cyan-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-cyan-200 hover:bg-cyan-700 transition-all"
                >
                  Ask a Question
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Skip Request Modal */}
        {skipModalOpen && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden"
              >
                 <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Request Absence</h3>
                    <button onClick={() => setSkipModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors"><X size={20} className="text-slate-400" /></button>
                 </div>
                 <div className="p-8 space-y-6">
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                       <p className="text-xs font-bold text-amber-700 leading-relaxed">
                          Please provide a valid reason for missing your session. Your tutor will be notified and can approve or reschedule the class.
                       </p>
                    </div>
                    <div>
                       <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Reason for Absence</label>
                       <textarea 
                         rows={4}
                         value={skipReason}
                         onChange={(e) => setSkipReason(e.target.value)}
                         placeholder="e.g. I have a school activity at the same time..."
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-medium text-slate-700 resize-none"
                       />
                    </div>
                    <button 
                      onClick={handleSkipRequest}
                      disabled={skipLoading}
                      className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                    >
                       {skipLoading ? 'Sending...' : 'Submit Request'}
                    </button>
                 </div>
              </motion.div>
           </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentDashboard;
