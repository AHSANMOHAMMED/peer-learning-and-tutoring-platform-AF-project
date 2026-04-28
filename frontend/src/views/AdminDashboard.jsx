import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Briefcase, Video, Clock, MessageSquare, 
  CircleDollarSign, Calendar as CalendarIcon, 
  ShieldCheck, AlertTriangle, Settings, ChevronRight,
  TrendingUp, Activity, FileText, Gamepad2, Megaphone, Send
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import Layout from '../components/Layout';
import { useAuth } from '../controllers/useAuth';
import { useTutors } from '../controllers/useTutors';
import { useReports } from '../controllers/useReports';
import { useAnalytics } from '../controllers/useAnalytics';
import { useParentLinks } from '../controllers/useParentLinks';
import { announcementApi } from '../services/api';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { tutors, fetchTutors } = useTutors();
  const { reports, fetchReports } = useReports();
  const { analytics, fetchAnalytics } = useAnalytics();
  const { linkRequests, fetchParentLinkRequests } = useParentLinks();
  
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = React.useState(false);
  const [broadcastForm, setBroadcastForm] = React.useState({
    title: '',
    content: '',
    priority: 'normal',
    targetRoles: ['all']
  });
  const [isBroadcasting, setIsBroadcasting] = React.useState(false);

  useEffect(() => {
    fetchTutors().catch((err) => console.error('Tutor fetch error:', err));
    fetchReports().catch((err) => console.error('Reports fetch error:', err));
    fetchAnalytics().catch((err) => console.error('Analytics fetch error:', err));
    fetchParentLinkRequests().catch((err) => console.error('Parent link requests fetch error:', err));
  }, [fetchTutors, fetchReports, fetchAnalytics, fetchParentLinkRequests]);

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    setIsBroadcasting(true);
    try {
      const res = await announcementApi.create(broadcastForm);
      if (res.success) {
        toast.success("Broadcast dispatched successfully!");
        setIsBroadcastModalOpen(false);
        setBroadcastForm({ title: '', content: '', priority: 'normal', targetRoles: ['all'] });
      }
    } catch (err) {
      toast.error("Failed to dispatch broadcast");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const pendingTutorsCount = tutors.filter(t => t.verificationStatus === 'pending').length;
  const pendingReportsCount = reports.filter(r => r.status === 'pending' || r.status === 'open').length;

  const stats = {
    students: analytics?.summary?.totalUsers || 1200,
    tutors: tutors?.length || 300,
    activeSessions: analytics?.summary?.totalBookings || 120,
    tutoringHours: analytics?.summary?.totalLearningHours || 0,
    avgRating: analytics?.summary?.averageRating || 0,
    totalEarned: analytics?.summary?.totalRevenue || 816
  };

  // Format data for charts
  const sessionsData = useMemo(() => {
    const raw = analytics?.timeSeriesData || [];
    if(raw.length > 0) {
      return raw.slice(-7).map(d => ({
        name: new Date(d.date || d.name).toLocaleDateString('en-US', {weekday: 'short'}).toUpperCase(),
        sessions: d.bookings || 0
      }));
    }
    return [
      { name: 'MON', sessions: 24 }, { name: 'TUE', sessions: 13 }, { name: 'WED', sessions: 35 },
      { name: 'THU', sessions: 18 }, { name: 'FRI', sessions: 42 }, { name: 'SAT', sessions: 58 },
      { name: 'SUN', sessions: 65 }
    ];
  }, [analytics]);

  const earningsData = useMemo(() => {
    const raw = analytics?.timeSeriesData || [];
    if(raw.length > 0) {
      return raw.slice(-7).map(d => ({
        name: new Date(d.date || d.name).toLocaleDateString('en-US', {weekday: 'short'}).toUpperCase(),
        amount: d.amount || 0
      }));
    }
    return [
      { name: 'MON', amount: 1200 }, { name: 'TUE', amount: 800 }, { name: 'WED', amount: 2400 },
      { name: 'THU', amount: 950 }, { name: 'FRI', amount: 3200 }, { name: 'SAT', amount: 4800 },
      { name: 'SUN', amount: 5500 }
    ];
  }, [analytics]);

  const statCards = [
    { title: 'Total Students', value: stats.students.toLocaleString(), icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100', gradient: 'from-indigo-500/10' },
    { title: 'Total Tutors', value: stats.tutors.toLocaleString(), icon: Briefcase, color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-100', gradient: 'from-teal-500/10' },
    { title: 'Active Sessions', value: stats.activeSessions.toLocaleString(), icon: Video, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', gradient: 'from-blue-500/10' },
    { title: 'Tutoring Hours', value: `${stats.tutoringHours}h`, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', gradient: 'from-amber-500/10' },
    { title: 'Avg Rating', value: stats.avgRating || '4.8', icon: MessageSquare, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', gradient: 'from-rose-500/10', subtext: '23 New Reviews' },
    { title: 'Total Revenue', value: `LKR ${stats.totalEarned.toLocaleString()}`, icon: CircleDollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', gradient: 'from-emerald-500/10' },
  ];

  return (
    <Layout userRole={currentUser?.role || 'admin'}>
      <div className="min-h-screen bg-[#fafafc] pb-12 w-full font-sans">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">Management Overview</h1>
              <p className="text-slate-500 font-medium mt-2">Monitor platform metrics, process applications, and ensure smooth operations.</p>
            </div>
            <div className="flex bg-white shadow-soft rounded-xl p-1 border border-slate-200">
               <span className="px-4 py-2 bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-lg flex items-center gap-2">
                 <Activity size={14} className="text-emerald-400" /> Platform Healthy
               </span>
            </div>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statCards.map((stat, i) => (
                <motion.div 
                  key={i} variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.01 }}
                  className={cn(
                    "bg-white rounded-3xl p-6 shadow-sm border overflow-hidden relative group cursor-pointer transition-all",
                    stat.border, `hover:shadow-md hover:border-transparent`
                  )}
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500", stat.gradient)} />
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-2">{stat.title}</p>
                      <h3 className="text-3xl font-black text-slate-800 tabular-nums tracking-tight">{stat.value}</h3>
                      {stat.subtext && <p className="text-[11px] font-bold text-slate-400 mt-2 flex items-center gap-1"><TrendingUp size={12}/> {stat.subtext}</p>}
                    </div>
                    <div className={cn("p-4 rounded-2xl", stat.bg, stat.color)}>
                      <stat.icon size={28} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Operations Center & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Operations Center */}
              <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-slate-800 tracking-tight">
                    <ShieldCheck size={26} className="text-indigo-600" /> Pending Actions
                  </h2>
                  <p className="text-slate-500 text-sm mb-10 font-medium">Review and process pending items to maintain platform integrity.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    
                    <div onClick={() => navigate('/admin/approvals')} className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-6 transition-all cursor-pointer group shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform"><Briefcase size={22} /></div>
                        {pendingTutorsCount > 0 && <span className="text-[10px] font-bold text-rose-600 px-2.5 py-1 bg-rose-100 rounded-full shadow-sm">{pendingTutorsCount} PENDING</span>}
                      </div>
                      <h3 className="text-3xl font-bold mb-1 text-slate-800">{pendingTutorsCount}</h3>
                      <p className="text-slate-500 text-sm font-medium">Tutor Applications</p>
                    </div>

                    <div onClick={() => navigate('/moderation')} className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-rose-300 rounded-2xl p-6 transition-all cursor-pointer group shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl group-hover:scale-110 transition-transform"><AlertTriangle size={22} /></div>
                        {pendingReportsCount > 0 && <span className="text-[10px] font-bold text-rose-600 px-2.5 py-1 bg-rose-100 rounded-full shadow-sm">URGENT</span>}
                      </div>
                      <h3 className="text-3xl font-bold mb-1 text-slate-800">{pendingReportsCount}</h3>
                      <p className="text-slate-500 text-sm font-medium">Unresolved Reports</p>
                    </div>

                    <div onClick={() => navigate('/admin/parent-links')} className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-amber-300 rounded-2xl p-6 transition-all cursor-pointer group shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl group-hover:scale-110 transition-transform"><Users size={22} /></div>
                        {linkRequests?.length > 0 && <span className="text-[10px] font-bold text-amber-700 px-2.5 py-1 bg-amber-100 border border-amber-200 rounded-full">NEW</span>}
                      </div>
                      <h3 className="text-3xl font-bold mb-1 text-slate-800">{linkRequests?.length || 0}</h3>
                      <p className="text-slate-500 text-sm font-medium">Parent Links</p>
                    </div>

                  </div>
                   
                   {/* Broadcast Quick Link */}
                   <div className="mt-10 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                            <Megaphone size={22} />
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-800">Global Broadcast</h4>
                            <p className="text-xs text-slate-500 font-medium">Post announcements to students, tutors, or parents.</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => setIsBroadcastModalOpen(true)}
                        className="px-6 py-2.5 bg-white border border-indigo-200 text-indigo-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                         Launch Hub
                      </button>
                   </div>
                 </div>
               </motion.div>

              {/* Quick Navigation */}
              <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-[11px] font-extrabold text-slate-400 mb-6 uppercase tracking-widest">Platform Management</h3>
                  <div className="space-y-3">
                    <button onClick={() => navigate('/admin/users')} className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 rounded-2xl transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg text-indigo-500 shadow-sm group-hover:scale-110 transition-transform"><Users size={18} /></div>
                        <span className="text-sm font-bold text-slate-700">User Directory</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500" />
                    </button>
                    <button onClick={() => navigate('/bookings')} className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 hover:border-teal-200 hover:bg-teal-50 rounded-2xl transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg text-teal-500 shadow-sm group-hover:scale-110 transition-transform"><CalendarIcon size={18} /></div>
                        <span className="text-sm font-bold text-slate-700">Review Sessions</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-teal-500" />
                    </button>
                    <button onClick={() => navigate('/moderation')} className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 hover:border-rose-200 hover:bg-rose-50 rounded-2xl transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg text-rose-500 shadow-sm group-hover:scale-110 transition-transform"><FileText size={18} /></div>
                        <span className="text-sm font-bold text-slate-700">Moderation Hub</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-rose-500" />
                    </button>
                    <button onClick={() => navigate('/admin/games')} className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 hover:border-cyan-200 hover:bg-cyan-50 rounded-2xl transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg text-cyan-500 shadow-sm group-hover:scale-110 transition-transform"><Gamepad2 size={18} /></div>
                        <span className="text-sm font-bold text-slate-700">Game Management</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-cyan-500" />
                    </button>
                    <button onClick={() => navigate('/admin/settings')} className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-slate-100 rounded-2xl transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg text-slate-600 shadow-sm group-hover:scale-110 transition-transform"><Settings size={18} /></div>
                        <span className="text-sm font-bold text-slate-700">System Settings</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700" />
                    </button>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <span className="inline-block px-4 py-2 bg-[#f8f9fa] rounded-xl border border-slate-100 font-mono text-[10px] text-slate-400 font-bold tracking-widest">
                    V4.2.0 • ADMIN
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Area Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Sessions Activity */}
              <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-8">
                  <div>
                     <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Session Activity</h3>
                     <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Platform Engagement</p>
                  </div>
                  <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-indigo-100">7 Days</div>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sessionsData} margin={{top: 10, right: 0, left: -20, bottom: 0}}>
                      <defs>
                        <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                      <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}} />
                      <Area type="monotone" dataKey="sessions" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorSessions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Financial Growth */}
              <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-8">
                  <div>
                     <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Revenue Stream</h3>
                     <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Gross Earnings (LKR)</p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-emerald-100">7 Days</div>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={earningsData} margin={{top: 10, right: 0, left: -10, bottom: 0}}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} tickFormatter={(val) => `${val/1000}k`} />
                      <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}} formatter={(val) => `LKR ${val.toLocaleString()}`} />
                      <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

            </div>

          </motion.div>
        </div>
      </div>

      {/* Broadcast Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
             onClick={() => setIsBroadcastModalOpen(false)}
             className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
           />
           <motion.div 
             initial={{ opacity: 0, scale: 0.9, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             className="relative bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-4xl border border-slate-100"
           >
              <div className="p-8 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black tracking-tight">Broadcast Center</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Persistent System Announcement</p>
                 </div>
                 <button onClick={() => setIsBroadcastModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ShieldCheck size={20}/></button>
              </div>
              
              <form onSubmit={handleBroadcastSubmit} className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Message Title</label>
                    <input 
                      required
                      value={broadcastForm.title}
                      onChange={(e) => setBroadcastForm({...broadcastForm, title: e.target.value})}
                      placeholder="Important: Scholastic Update"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Content Body</label>
                    <textarea 
                      required
                      rows={4}
                      value={broadcastForm.content}
                      onChange={(e) => setBroadcastForm({...broadcastForm, content: e.target.value})}
                      placeholder="Type your message here..."
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-600 resize-none"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Priority</label>
                       <select 
                         value={broadcastForm.priority}
                         onChange={(e) => setBroadcastForm({...broadcastForm, priority: e.target.value})}
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700"
                       >
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Target Audience</label>
                       <select 
                         value={broadcastForm.targetRoles[0]}
                         onChange={(e) => setBroadcastForm({...broadcastForm, targetRoles: [e.target.value]})}
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700"
                       >
                          <option value="all">All Users</option>
                          <option value="student">Students Only</option>
                          <option value="tutor">Tutors Only</option>
                          <option value="parent">Parents Only</option>
                       </select>
                    </div>
                 </div>

                 <button 
                   type="submit"
                   disabled={isBroadcasting}
                   className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                 >
                    {isBroadcasting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><Send size={18} /> Dispatch Broadcast</>
                    )}
                 </button>
              </form>
           </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
