import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Briefcase, Video, Clock, MessageSquare, 
  CircleDollarSign, Calendar as CalendarIcon, 
  ShieldCheck, AlertTriangle, Settings, ChevronRight 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import Layout from '../components/Layout';
import { useTutors } from '../controllers/useTutors';
import { useReports } from '../controllers/useReports';
import { useAnalytics } from '../controllers/useAnalytics';
import { useParentLinks } from '../controllers/useParentLinks';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { tutors, fetchTutors } = useTutors();
  const { reports, fetchReports } = useReports();
  const { analytics, fetchAnalytics } = useAnalytics();
  const { linkRequests, fetchLinkRequests } = useParentLinks();

  useEffect(() => {
    fetchTutors();
    fetchReports();
    fetchAnalytics();
    fetchLinkRequests();
  }, [fetchTutors, fetchReports, fetchAnalytics, fetchLinkRequests]);

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
    return [];
  }, [analytics]);

  const earningsData = useMemo(() => {
    const raw = analytics?.timeSeriesData || [];
    if(raw.length > 0) {
      return raw.slice(-7).map(d => ({
        name: new Date(d.date || d.name).toLocaleDateString('en-US', {weekday: 'short'}).toUpperCase(),
        amount: d.amount || 0
      }));
    }
    return [];
  }, [analytics]);

  return (
    <Layout userRole="admin">
      <div className="max-w-[1400px] mx-auto w-full">
        
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard</h1>

        {/* Top Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
           
           <div className="bg-white rounded-2xl p-6 shadow-soft flex items-center gap-6 border-b-4 border-transparent hover:border-[#00a8cc] transition-all cursor-pointer">
              <div className="bg-[#fff3e0] text-[#f57c00] p-4 rounded-xl shrink-0">
                 <Users size={32} />
              </div>
              <div>
                 <p className="text-sm font-semibold text-slate-500 mb-1">Total Students</p>
                 <h2 className="text-3xl font-black text-slate-800">{stats.students.toLocaleString()}</h2>
              </div>
           </div>

           <div className="bg-white rounded-2xl p-6 shadow-soft flex items-center gap-6 border-b-4 border-transparent hover:border-[#00a8cc] transition-all cursor-pointer">
              <div className="bg-[#fff3e0] text-[#f57c00] p-4 rounded-xl shrink-0">
                 <Briefcase size={32} />
              </div>
              <div>
                 <p className="text-sm font-semibold text-slate-500 mb-1">Total Tutors</p>
                 <h2 className="text-3xl font-black text-slate-800">{stats.tutors.toLocaleString()}</h2>
              </div>
           </div>

           <div className="bg-white rounded-2xl p-6 shadow-soft flex items-center gap-6 border-b-4 border-transparent hover:border-[#00a8cc] transition-all cursor-pointer">
              <div className="bg-[#e6f7fa] text-[#00a8cc] p-4 rounded-xl shrink-0">
                 <Video size={32} />
              </div>
              <div>
                 <p className="text-sm font-semibold text-slate-500 mb-1">Active Sessions</p>
                 <h2 className="text-3xl font-black text-slate-800">{stats.activeSessions.toLocaleString()}</h2>
              </div>
           </div>

           <div className="bg-white rounded-2xl p-6 shadow-soft flex items-center gap-6 border-b-4 border-transparent hover:border-[#00a8cc] transition-all cursor-pointer">
              <div className="bg-[#fff3e0] text-[#f57c00] p-4 rounded-xl shrink-0">
                 <Clock size={32} />
              </div>
              <div>
                 <p className="text-sm font-semibold text-slate-500 mb-1">Total Tutoring Hours</p>
                 <h2 className="text-3xl font-black text-slate-800">{stats.tutoringHours} hrs</h2>
              </div>
           </div>

           <div className="bg-white rounded-2xl p-6 shadow-soft flex items-center gap-6 border-b-4 border-transparent hover:border-[#00a8cc] transition-all cursor-pointer">
              <div className="bg-white border-2 border-[#f57c00] text-[#f57c00] p-3.5 rounded-xl shrink-0">
                 <MessageSquare size={32} />
              </div>
              <div>
                 <p className="text-sm font-semibold text-slate-500 mb-1">Avg Rating & Review</p>
                 <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-black text-slate-800">{stats.avgRating}</h2>
                    <span className="text-xs font-semibold text-slate-400">(23 Reviews)</span>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-2xl p-6 shadow-soft flex items-center gap-6 border-b-4 border-transparent hover:border-[#00a8cc] transition-all cursor-pointer">
              <div className="bg-[#fff3e0] text-[#f57c00] p-4 rounded-xl shrink-0">
                 <CircleDollarSign size={32} />
              </div>
              <div>
                 <p className="text-sm font-semibold text-slate-500 mb-1">Total Earned Money</p>
                 <h2 className="text-3xl font-black text-slate-800">${stats.totalEarned.toLocaleString()}</h2>
              </div>
           </div>

        </div>

        {/* Operations Center */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 mt-8">
           <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />
              <div className="relative z-10">
                 <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                    <ShieldCheck size={28} className="text-[#00a8cc]" />
                    Operations Center
                 </h2>
                 <p className="text-slate-400 text-sm mb-8">Maintain platform integrity by reviewing pending applications and reports.</p>
                 
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate('/admin/approvals')}>
                       <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                             <Briefcase size={20} />
                          </div>
                          <span className="text-xs font-bold text-indigo-400 px-2 py-1 bg-indigo-500/10 rounded-md">ACTION REQUIRED</span>
                       </div>
                       <h3 className="text-2xl font-bold mb-1">{pendingTutorsCount}</h3>
                       <p className="text-slate-400 text-sm">Tutor applications awaiting verification</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate('/moderation')}>
                       <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
                             <AlertTriangle size={20} />
                          </div>
                          <span className="text-xs font-bold text-rose-400 px-2 py-1 bg-rose-500/10 rounded-md">URGENT</span>
                       </div>
                       <h3 className="text-2xl font-bold mb-1">{pendingReportsCount}</h3>
                       <p className="text-slate-400 text-sm">Unresolved platform reports</p>
                    </div>

                    {linkRequests.length > 0 && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate('/admin/parent-links')}>
                         <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                               <ShieldCheck size={20} />
                            </div>
                            <span className="text-xs font-bold text-amber-400 px-2 py-1 bg-amber-500/10 rounded-md">NEW</span>
                         </div>
                         <h3 className="text-2xl font-bold mb-1">{linkRequests.length}</h3>
                         <p className="text-slate-400 text-sm">Parent-Student link requests</p>
                      </div>
                    )}
                  </div>
              </div>
           </div>

           <div className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 flex flex-col justify-between">
              <div>
                 <h3 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-wider">Quick Actions</h3>
                 <div className="space-y-3">
                    <button onClick={() => navigate('/admin/users')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-[#e8f6fa] rounded-2xl transition-colors group">
                       <div className="flex items-center gap-3">
                          <Users size={18} className="text-slate-400 group-hover:text-[#00a8cc]" />
                          <span className="text-sm font-bold text-slate-700">Manage Users</span>
                       </div>
                       <ChevronRight size={16} className="text-slate-300" />
                    </button>
                    <button onClick={() => navigate('/bookings')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-[#e8f6fa] rounded-2xl transition-colors group">
                       <div className="flex items-center gap-3">
                          <CalendarIcon size={18} className="text-slate-400 group-hover:text-[#00a8cc]" />
                          <span className="text-sm font-bold text-slate-700">Review Sessions</span>
                       </div>
                       <ChevronRight size={16} className="text-slate-300" />
                    </button>
                    <button onClick={() => navigate('/admin/settings')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-[#e8f6fa] rounded-2xl transition-colors group">
                       <div className="flex items-center gap-3">
                          <Settings size={18} className="text-slate-400 group-hover:text-[#00a8cc]" />
                          <span className="text-sm font-bold text-slate-700">Platform Settings</span>
                       </div>
                       <ChevronRight size={16} className="text-slate-300" />
                    </button>
                 </div>
              </div>
              <div className="mt-8 p-4 bg-[#f8f9fc] rounded-2xl border border-slate-100 italic text-[11px] text-slate-400">
                 System Version 4.2 Stable. Last sync: {new Date().toLocaleTimeString()}
              </div>
           </div>
        </div>

        {/* Charts Region */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           
           {/* Sessions Chart */}
           <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-bold text-slate-800">Total Sessions</h3>
                 <div className="flex items-center gap-4">
                    <div className="text-right">
                       <p className="text-xs font-bold text-slate-800">Sessions Taken: 32</p>
                       <p className="text-[10px] text-slate-400">This Week: 16 Feb - 22 Feb</p>
                    </div>
                    <div className="p-2 bg-slate-800 text-white rounded-lg cursor-pointer">
                       <CalendarIcon size={16} />
                    </div>
                 </div>
              </div>
              <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionsData} margin={{top: 10, right: 10, left: -20, bottom: 0}} barSize={12}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} />
                       <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                       <Bar dataKey="sessions" fill="#60a5fa" radius={[4, 4, 4, 4]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </motion.div>

           {/* Earnings Chart */}
           <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-white rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-bold text-slate-800">Platform's Earning</h3>
                 <div className="flex items-center gap-4">
                    <div className="text-right">
                       <p className="text-xs font-bold text-slate-800">Earning: $220</p>
                       <p className="text-[10px] text-slate-400">This Week: 16 Feb - 22 Feb</p>
                    </div>
                    <div className="p-2 bg-slate-800 text-white rounded-lg cursor-pointer">
                       <CalendarIcon size={16} />
                    </div>
                 </div>
              </div>
              <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={earningsData} margin={{top: 10, right: 10, left: -20, bottom: 0}} barSize={12}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} />
                       <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} formatter={(val) => `$${val}`} />
                       <Bar dataKey="amount" fill="#fcd34d" radius={[4, 4, 4, 4]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </motion.div>

        </div>

      </div>
    </Layout>
  );
};

export default AdminDashboard;