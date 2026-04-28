import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Bell, TrendingUp, Calendar, CheckCircle, 
  MessageCircle, Zap, Shield, Plus, X, Search, Mail, 
  Clock, Award, BookOpen, AlertCircle, ChevronRight, BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, Cell 
} from 'recharts';
import { toast } from 'react-hot-toast';

import Layout from '../components/Layout';
import { useAuth } from '../controllers/useAuth';
import { parentApi } from '../services/api';
import { cn } from '../utils/cn';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchChildren();
    fetchAlerts();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const res = await parentApi.getLinkedStudents();
      if (res.success) {
        const students = res.data.students || [];
        setChildren(students);
        if (students.length > 0) {
          fetchChildSummary(students[0].studentId?._id || students[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching children:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await parentApi.getAlerts();
      if (res.success) setAlerts(res.data.alerts || []);
    } catch (err) {}
  };

  const fetchChildSummary = async (childId) => {
    try {
      setLoadingSummary(true);
      const res = await parentApi.getStudentSummary(childId);
      if (res.success) {
        setSummary(res.data);
        setSelectedChild(children.find(c => (c.studentId?._id || c._id) === childId));
      }
    } catch (err) {
      console.error('Error fetching child summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleLinkStudent = async () => {
    if (!studentEmail.trim()) return toast.error('Enter student email');
    setLinkLoading(true);
    try {
      const res = await parentApi.linkStudent({ studentEmail, relationship: 'parent' });
      if (res.success) {
        toast.success('Link request sent successfully!');
        setLinkModalOpen(false);
        setStudentEmail('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send request');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleNudge = async (type) => {
    if (!selectedChild) return;
    try {
      const childId = selectedChild.studentId?._id || selectedChild._id;
      await parentApi.nudgeStudent(childId, type);
      toast.success(`Nudge sent: ${type.replace('_', ' ')}`);
    } catch (err) {
      toast.error('Failed to send nudge');
    }
  };

  // Mock Performance Data for Chart
  const performanceData = [
    { day: 'Mon', score: 75, sessions: 2 },
    { day: 'Tue', score: 82, sessions: 1 },
    { day: 'Wed', score: 68, sessions: 3 },
    { day: 'Thu', score: 90, sessions: 2 },
    { day: 'Fri', score: 85, sessions: 1 },
    { day: 'Sat', score: 95, sessions: 4 },
    { day: 'Sun', score: 88, sessions: 0 },
  ];

  return (
    <Layout userRole="parent">
      <div className="max-w-[1400px] mx-auto w-full font-sans">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
           <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold uppercase tracking-wider mb-3">
                <Shield size={14} /> Parent Guardian Space
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">
                Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">{user?.profile?.firstName || user?.username}</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm">Monitoring progress and achievements for your linked students.</p>
           </div>
           <div className="flex gap-3">
              <button 
                onClick={() => setLinkModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                <UserPlus size={18} /> Link New Student
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Left Sidebar - Children List */}
           <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">My Children</h3>
                 <div className="space-y-3">
                    {children.map((child) => {
                       const c = child.studentId || child;
                       const isActive = selectedChild && (selectedChild.studentId?._id === c._id || selectedChild._id === c._id);
                       return (
                          <div 
                             key={c._id}
                             onClick={() => fetchChildSummary(c._id)}
                             className={cn(
                                "p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 group",
                                isActive ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-transparent hover:bg-white hover:border-slate-200"
                             )}
                          >
                             <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                                isActive ? "bg-emerald-600 text-white" : "bg-white text-slate-400 border border-slate-200"
                             )}>
                                {c.firstName?.[0] || c.username?.[0]}
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-bold truncate", isActive ? "text-emerald-900" : "text-slate-700")}>
                                   {c.firstName} {c.lastName}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade {c.grade || '10'}</p>
                             </div>
                             {isActive && <ChevronRight size={16} className="text-emerald-400" />}
                          </div>
                       );
                    })}
                    {children.length === 0 && !loading && (
                       <div className="py-10 text-center">
                          <Users size={32} className="text-slate-200 mx-auto mb-3" />
                          <p className="text-xs font-bold text-slate-400">No students linked yet.</p>
                       </div>
                    )}
                 </div>
              </div>

              {/* Activity Alerts */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Recent Alerts</h3>
                    <Bell size={16} className="text-slate-300" />
                 </div>
                 <div className="space-y-4">
                    {alerts.slice(0, 5).map((alert, i) => (
                       <div key={i} className="flex gap-3 items-start group">
                          <div className={cn(
                             "w-2 h-2 rounded-full mt-1.5 shrink-0",
                             alert.priority === 'urgent' ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-emerald-500"
                          )} />
                          <div>
                             <p className="text-xs font-bold text-slate-700 leading-relaxed">{alert.message}</p>
                             <p className="text-[10px] font-medium text-slate-400 mt-1">{new Date(alert.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                          </div>
                       </div>
                    ))}
                    {alerts.length === 0 && (
                       <p className="text-xs font-bold text-slate-300 text-center italic">All systems normal.</p>
                    )}
                 </div>
              </div>
           </div>

           {/* Main Content - Child Details */}
           <div className="lg:col-span-9 space-y-8">
              
              {!selectedChild ? (
                 <div className="h-[60vh] bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center p-10">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                       <Users size={48} className="text-slate-200" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Select a student to view details</h2>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">Click on a child's name from the left sidebar to see their academic performance, attendance and achievements.</p>
                 </div>
              ) : (
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                 >
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                       {[
                          { label: 'Academic Streak', value: summary?.streak || '0 Days', icon: <Zap />, color: 'amber' },
                          { label: 'Merit Points', value: summary?.points || '0', icon: <Award />, color: 'indigo' },
                          { label: 'Sessions Done', value: summary?.sessionsCompleted || '0', icon: <CheckCircle />, color: 'emerald' },
                          { label: 'Current Level', value: `Level ${summary?.level || '1'}`, icon: <TrendingUp />, color: 'violet' },
                       ].map((stat, i) => (
                          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft hover:scale-[1.02] transition-transform">
                             <div className={cn("w-10 h-10 rounded-xl mb-4 flex items-center justify-center", `bg-${stat.color}-50 text-${stat.color}-600`)}>
                                {stat.icon}
                             </div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                             <h4 className="text-xl font-black text-slate-800 tracking-tight">{stat.value}</h4>
                          </div>
                       ))}
                    </div>

                    {/* Chart Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                       <div className="xl:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-soft">
                          <div className="flex justify-between items-center mb-10">
                             <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Performance Analysis</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Weekly assessment scores and session frequency.</p>
                             </div>
                             <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
                                <BarChart3 size={16} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-600">Last 7 Days</span>
                             </div>
                          </div>
                          <div className="h-72">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={performanceData}>
                                   <defs>
                                      <linearGradient id="emeraldFade" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                         <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                      </linearGradient>
                                   </defs>
                                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                   <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                                   <YAxis hide />
                                   <Tooltip 
                                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} 
                                   />
                                   <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#emeraldFade)" />
                                </AreaChart>
                             </ResponsiveContainer>
                          </div>
                       </div>

                       <div className="xl:col-span-4 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Zap size={140} /></div>
                          <h3 className="text-xl font-bold tracking-tight mb-8 relative z-10">Parent Controls</h3>
                          <div className="space-y-4 relative z-10">
                             <button 
                               onClick={() => handleNudge('session_reminder')}
                               className="w-full flex items-center justify-between p-5 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all group text-left"
                             >
                                <div>
                                   <h4 className="text-sm font-bold mb-1">Send Session Nudge</h4>
                                   <p className="text-[10px] font-medium text-slate-400">Remind student of upcoming class</p>
                                </div>
                                <Clock size={20} className="text-emerald-400 group-hover:rotate-12 transition-transform" />
                             </button>
                             <button 
                               onClick={() => handleNudge('homework_check')}
                               className="w-full flex items-center justify-between p-5 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all group text-left"
                             >
                                <div>
                                   <h4 className="text-sm font-bold mb-1">Homework Check-in</h4>
                                   <p className="text-[10px] font-medium text-slate-400">Request status of assignments</p>
                                </div>
                                <BookOpen size={20} className="text-indigo-400 group-hover:-rotate-12 transition-transform" />
                             </button>
                             <button 
                               className="w-full flex items-center justify-between p-5 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all group text-left"
                             >
                                <div>
                                   <h4 className="text-sm font-bold mb-1">Message Tutors</h4>
                                   <p className="text-[10px] font-medium text-slate-400">Start a direct chat with mentors</p>
                                </div>
                                <MessageCircle size={20} className="text-teal-400 group-hover:scale-110 transition-transform" />
                             </button>
                          </div>
                       </div>
                    </div>

                    {/* Upcoming Sessions List */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-soft">
                       <div className="flex justify-between items-center mb-8">
                          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Live Attendance</h3>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                             <Calendar size={16} /> Schedule Overview
                          </div>
                       </div>
                       <div className="space-y-4">
                          {(summary?.schedule || performanceData.slice(0, 3)).map((session, i) => (
                             <div key={i} className="p-6 bg-slate-50/50 rounded-3xl border border-transparent hover:border-slate-200 hover:bg-white transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-emerald-600 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                      {session.day?.[0] || 'M'}
                                   </div>
                                   <div>
                                      <h4 className="text-lg font-bold text-slate-800">{session.subject || 'Combined Mathematics'}</h4>
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{session.time || '04:30 PM'} &bull; Tutor Kamal</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-4">
                                   <div className="text-right">
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</p>
                                      <p className="text-sm font-black text-emerald-500 uppercase">Confirmed</p>
                                   </div>
                                   <button className="p-3 hover:bg-slate-100 rounded-xl transition-colors"><ChevronRight size={20} className="text-slate-300" /></button>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </motion.div>
              )}
           </div>
        </div>

        {/* Link Student Modal */}
        <AnimatePresence>
           {linkModalOpen && (
              <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setLinkModalOpen(false)} />
                 <motion.div 
                    initial={{ opacity: 0, scale:0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-[2.5rem] p-10 w-full max-w-md relative z-10 shadow-2xl"
                 >
                    <button onClick={() => setLinkModalOpen(false)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} className="text-slate-400"/></button>
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                       <UserPlus className="text-emerald-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Connect Child</h2>
                    <p className="text-slate-500 font-medium text-sm mb-8">Enter your child's registered Aura email address to request a connection.</p>
                    
                    <div className="space-y-6">
                       <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                             type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)}
                             placeholder="child@example.com"
                             className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold focus:outline-none focus:border-emerald-500 transition-all"
                          />
                       </div>
                       <button 
                          onClick={handleLinkStudent} disabled={linkLoading}
                          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-200 disabled:opacity-50"
                       >
                          {linkLoading ? 'Sending Request...' : 'Send Link Request'}
                       </button>
                       <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">Student will need to approve this request</p>
                    </div>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>

      </div>
    </Layout>
  );
};

export default ParentDashboard;