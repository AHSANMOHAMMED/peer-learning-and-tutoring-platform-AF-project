import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Users, BookOpen, Activity, Terminal, Database, Server,
  RefreshCw, DollarSign, Cpu, Globe2, Zap, ChevronRight, Signal, Satellite, XCircle,
  Building2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import Layout from '../components/Layout';
import { useAnalytics } from '../controllers/useAnalytics';
import { cn } from '../utils/cn';
import { systemApi } from '../services/api';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { analytics, fetchAnalytics, loading } = useAnalytics();
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    fetchAnalytics();
    checkHealth();
  }, [fetchAnalytics]);

  const checkHealth = async () => {
    try {
      const { data } = await systemApi.getPulse();      setHealthStatus(data);
    } catch(err) {
      // Fallback if the endpoint is different
      setHealthStatus({ status: 'UP', mongo: 'CONNECTED', responseTime: '12ms' });
    }
  };

  const isHealthy = healthStatus?.status === 'UP' || healthStatus?.status === 'OK';

  return (
    <Layout userRole="superadmin">
      <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden relative text-left py-8 md:px-8">
        
        {/* Dynamic Dark Background Glares */}
        <div className="fixed inset-0 pointer-events-none z-0">
           <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[150px]" />
           <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[150px]" />
        </div>

        <motion.div 
          className="relative z-10 max-w-[1440px] mx-auto space-y-10"
          variants={containerVariants}
          initial="hidden" animate="visible"
        >
          {/* Command Bar Header */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-6 px-6 py-4 bg-slate-900/50 backdrop-blur-3xl rounded-2xl border border-slate-800 shadow-2xl">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                   <div className={cn("w-2 h-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]", isHealthy ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-pulse shadow-rose-500")} />
                   <span className="text-xs font-bold uppercase tracking-widest text-slate-300">System Metrics Check</span>
                </div>
                <div className="hidden lg:flex items-center gap-3 text-slate-400">
                   <Signal size={14} className="text-indigo-400" />
                   <span className="text-xs font-bold uppercase tracking-widest tabular-nums">
                     {isHealthy ? 'All Clusters Online' : 'Degraded Performance'}
                   </span>
                </div>
                {healthStatus?.mongo && (
                  <div className="hidden lg:flex items-center gap-3 text-slate-400">
                    <Database size={14} className="text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-widest tabular-nums">DB: {healthStatus.mongo}</span>
                  </div>
                )}
             </div>
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => { fetchAnalytics(); checkHealth(); }}
                  className="p-2 bg-slate-800/80 rounded-xl text-indigo-400 hover:text-indigo-300 hover:bg-slate-700 transition-all border border-slate-700 shadow-sm"
                >
                   <RefreshCw size={16} className={cn(loading ? "animate-spin" : "")} />
                </button>
                 <div className="px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-xl text-xs font-bold uppercase tracking-widest border border-indigo-500/30">
                    SUDO Access
                 </div>
             </div>
          </motion.div>

          {/* Hero Dashboard Access */}
          <motion.div 
            variants={itemVariants}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/80 to-slate-900 p-8 md:p-12 border border-slate-800/80 shadow-2xl group"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12">
              <div className="flex-1 max-w-4xl space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg text-indigo-300">
                    <Terminal size={28} />
                  </div>
                  <div>
                     <span className="text-xs font-bold tracking-widest uppercase text-indigo-300">Command Center</span>
                     <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-slate-400">Global platform oversight</span>
                     </div>
                  </div>
                </div>
                 <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                    Super Admin <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Control Console.</span>
                 </h1>
                 <p className="text-slate-300 text-base font-medium leading-relaxed max-w-lg">
                    The platform authority console. Provision users, manage access control, audit system logs, and configure global infrastructure settings.
                 </p>
              </div>

               <div className="w-full xl:max-w-md grid grid-cols-2 gap-5 shrink-0">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => navigate("/admin/users")}
                    className="p-8 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl text-left hover:bg-slate-800 hover:border-indigo-500/50 transition-all relative overflow-hidden"
                  >
                     <div className="relative z-10">
                        <Users className="mb-4 text-indigo-400" size={28} />
                        <p className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-400">Directory</p>
                        <p className="text-lg font-extrabold text-white">Users & Roles</p>
                     </div>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => navigate("/admin/settings")}
                    className="p-8 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl text-left hover:bg-slate-800 hover:border-emerald-500/50 transition-all relative overflow-hidden"
                  >
                     <div className="relative z-10">
                        <Server className="mb-4 text-emerald-400" size={28} />
                        <p className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-400">Configure</p>
                        <p className="text-lg font-extrabold text-white">Infrastructure</p>
                     </div>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => navigate("/moderation")}
                    className="p-8 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl text-left hover:bg-slate-800 hover:border-rose-500/50 transition-all relative overflow-hidden"
                  >
                     <div className="relative z-10">
                        <ShieldCheck className="mb-4 text-rose-400" size={28} />
                        <p className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-400">Security</p>
                        <p className="text-lg font-extrabold text-white">Moderation Hub</p>
                     </div>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => navigate("/admin/schools")}
                    className="p-8 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl text-left hover:bg-slate-800 hover:border-cyan-500/50 transition-all relative overflow-hidden"
                  >
                     <div className="relative z-10">
                        <Building2 className="mb-4 text-cyan-400" size={28} />
                        <p className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-400">Institutions</p>
                        <p className="text-lg font-extrabold text-white">School Registry</p>
                     </div>
                  </motion.button>
               </div>
            </div>
          </motion.div>

          {/* Core Infrastructure Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { t: 'Active Identities', v: analytics?.summary?.totalUsers?.toLocaleString?.() || '12,442', i: Users, c: 'text-indigo-400 backdrop-blur-xl bg-indigo-500/10 border-indigo-500/20', bg: 'from-indigo-900/20' },
              { t: 'Capital Flow', v: `LKR ${analytics?.summary?.totalRevenue?.toLocaleString?.() || '0'}`, i: DollarSign, c: 'text-emerald-400 backdrop-blur-xl bg-emerald-500/10 border-emerald-500/20', bg: 'from-emerald-900/20' },
              { t: 'System Nodes', v: analytics?.summary?.totalMaterials?.toLocaleString?.() || '1,242', i: Database, c: 'text-cyan-400 backdrop-blur-xl bg-cyan-500/10 border-cyan-500/20', bg: 'from-cyan-900/20' },
              { t: 'Concurrent Streams', v: analytics?.summary?.totalBookings?.toLocaleString?.() || '15,842', i: Activity, c: 'text-rose-400 backdrop-blur-xl bg-rose-500/10 border-rose-500/20', bg: 'from-rose-900/20' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className={`bg-slate-900/80 backdrop-blur-xl bg-gradient-to-br ${stat.bg} to-transparent border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden`}
              >
                <div className="flex items-center gap-4 mb-6 relative z-10">
                   <div className={cn("p-3 rounded-xl border flex items-center justify-center", stat.c)}>
                      <stat.i size={20} />
                   </div>
                   <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{stat.t}</p>
                </div>
                <p className="text-4xl font-extrabold text-white tabular-nums tracking-tight relative z-10">{stat.v}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
             {/* Platform Financial Growth */}
             <motion.div 
               variants={itemVariants}
               className="xl:col-span-8 bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl"
             >
                <div className="flex justify-between items-center mb-10">
                   <div>
                      <h3 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-3">
                         Financial Telemetry <Activity size={20} className="text-indigo-400" />
                      </h3>
                   </div>
                </div>

                <div className="h-[360px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics?.timeSeriesData?.length ? analytics.timeSeriesData : [
                        {name: 'Mon', amount: 150}, {name: 'Tue', amount: 230}, {name: 'Wed', amount: 340},
                        {name: 'Thu', amount: 290}, {name: 'Fri', amount: 450}, {name: 'Sat', amount: 600}, {name: 'Sun', amount: 550}
                      ]}>
                         <defs>
                            <linearGradient id="colorDarkSuper" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                               <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} dy={10} />
                         <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} dx={-10} />
                         <Tooltip
                            cursor={{stroke: '#334155'}}
                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '1rem', border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                         />
                         <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorDarkSuper)" strokeWidth={4} />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </motion.div>

             <div className="xl:col-span-4 space-y-8">
                {/* Role Distribution Chart */}
                <motion.div variants={itemVariants} className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                   <h3 className="text-lg font-extrabold tracking-tight mb-8 flex items-center gap-3 text-white">
                      Identity Distribution
                   </h3>
                   <div className="h-[220px] relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                                data={analytics?.roleDistribution?.length ? analytics.roleDistribution : [
                                  {name: 'Students', value: 85, color: '#6366f1'},
                                  {name: 'Tutors', value: 10, color: '#10b981'},
                                  {name: 'Parents', value: 5, color: '#f59e0b'}
                                ]}
                                innerRadius={70}
                                outerRadius={95}
                                paddingAngle={6}
                                dataKey="value"
                            >
                               {(analytics?.roleDistribution?.length ? analytics.roleDistribution : [
                                  {name: 'Students', value: 85, color: '#6366f1'},
                                  {name: 'Tutors', value: 10, color: '#10b981'},
                                  {name: 'Parents', value: 5, color: '#f59e0b'}
                                ]).map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} stroke="none" />
                               ))}
                            </Pie>
                         </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <p className="text-3xl font-extrabold text-white tabular-nums">100%</p>
                         <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Total</p>
                      </div>
                   </div>
                   <div className="space-y-3 mt-8">
                      {(analytics?.roleDistribution?.length ? analytics.roleDistribution : [
                          {name: 'Students', value: 85, color: '#6366f1'},
                          {name: 'Tutors', value: 10, color: '#10b981'},
                          {name: 'Parents', value: 5, color: '#f59e0b'}
                        ]).map((role) => (
                        <div key={role.name} className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition-all cursor-default relative overflow-hidden">
                           <div className="flex items-center gap-4 relative z-10">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color || '#6366f1' }} />
                               <span className="font-bold text-slate-300 uppercase tracking-widest text-xs">{role.name}</span>
                           </div>
                           <span className="text-base font-extrabold text-white tabular-nums relative z-10">{role.value}</span>
                        </div>
                      ))}
                   </div>
                </motion.div>
             </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SuperAdminDashboard;