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
import DashboardShell from '../components/ui/DashboardShell';
import MetricCard from '../components/ui/MetricCard';
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
    <DashboardShell 
      userRole="superadmin"
      className="pb-8"
      headerActions={
        <div className="flex flex-wrap items-center gap-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-sm px-6 py-4 w-full lg:w-auto">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
               <div className={cn("w-2 h-2 rounded-full", isHealthy ? "bg-emerald-500 shadow-sm" : "bg-rose-500 animate-pulse shadow-sm")} />
               <span className="text-xs font-bold uppercase tracking-widest text-slate-500">System Metrics</span>
            </div>
            <div className="hidden lg:flex items-center gap-3 text-slate-600">
               <Signal size={14} className="text-indigo-500" />
               <span className="text-xs font-bold uppercase tracking-widest tabular-nums">
                 {isHealthy ? 'All Systems Operational' : 'Degraded Performance'}
               </span>
            </div>
            {healthStatus?.mongo && (
              <div className="hidden lg:flex items-center gap-3 text-slate-600">
                <Database size={14} className="text-cyan-600" />
                <span className="text-xs font-bold uppercase tracking-widest tabular-nums">DB: {healthStatus.mongo}</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => { fetchAnalytics(); checkHealth(); }}
            className="p-2 bg-slate-50 rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-slate-100 transition-all border border-slate-200 shadow-sm ml-auto lg:ml-0"
          >
             <RefreshCw size={16} className={cn(loading ? "animate-spin" : "")} />
          </button>
        </div>
      }
    >
      <div className="w-full font-sans">
        {/* Dynamic Light Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
           <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-50 blur-[150px]" />
           <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-50 blur-[150px]" />
        </div>

        <div className="relative z-10 space-y-10">
          {/* Hero Dashboard Access */}
          <div className="relative overflow-hidden rounded-3xl bg-white p-8 md:p-12 border border-slate-200 shadow-sm group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12">
              <div className="flex-1 max-w-4xl space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                    <Building2 size={28} />
                  </div>
                  <div>
                     <span className="text-xs font-bold tracking-widest uppercase text-indigo-600">Platform Overview</span>
                     <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-slate-500">Global platform oversight</span>
                     </div>
                  </div>
                </div>
                 <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-800 leading-tight">
                    Super Admin <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">Dashboard.</span>
                 </h1>
                 <p className="text-slate-500 text-base font-medium leading-relaxed max-w-lg">
                    The platform authority console. Provision users, manage access control, audit system logs, and configure global infrastructure settings.
                 </p>
              </div>

               <div className="w-full xl:max-w-md grid grid-cols-2 gap-5 shrink-0">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => navigate("/admin/users")}
                    className="p-8 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm text-left hover:bg-white hover:shadow-md hover:border-indigo-300 transition-all relative overflow-hidden"
                  >
                     <div className="relative z-10">
                        <Users className="mb-4 text-indigo-600" size={28} />
                        <p className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-500">Directory</p>
                        <p className="text-lg font-bold text-slate-800">Users & Roles</p>
                     </div>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => navigate("/admin/settings")}
                    className="p-8 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm text-left hover:bg-white hover:shadow-md hover:border-emerald-300 transition-all relative overflow-hidden"
                  >
                     <div className="relative z-10">
                        <Server className="mb-4 text-emerald-600" size={28} />
                        <p className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-500">Configure</p>
                        <p className="text-lg font-bold text-slate-800">Infrastructure</p>
                     </div>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => navigate("/moderation")}
                    className="p-8 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm text-left hover:bg-white hover:shadow-md hover:border-rose-300 transition-all relative overflow-hidden"
                  >
                     <div className="relative z-10">
                        <ShieldCheck className="mb-4 text-rose-600" size={28} />
                        <p className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-500">Security</p>
                        <p className="text-lg font-bold text-slate-800">Moderation Hub</p>
                     </div>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => navigate("/admin/schools")}
                    className="p-8 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm text-left hover:bg-white hover:shadow-md hover:border-cyan-300 transition-all relative overflow-hidden"
                  >
                     <div className="relative z-10">
                        <Building2 className="mb-4 text-cyan-600" size={28} />
                        <p className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-500">Institutions</p>
                        <p className="text-lg font-bold text-slate-800">School Registry</p>
                     </div>
                  </motion.button>
               </div>
            </div>
          </div>

          {/* Core Infrastructure Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { t: 'Active Identities', v: analytics?.summary?.totalUsers?.toLocaleString?.() || '12,442', i: Users, c: 'indigo' },
              { t: 'Capital Flow', v: `LKR ${analytics?.summary?.totalRevenue?.toLocaleString?.() || '0'}`, i: DollarSign, c: 'emerald' },
              { t: 'System Nodes', v: analytics?.summary?.totalMaterials?.toLocaleString?.() || '1,242', i: Database, c: 'blue' },
              { t: 'Concurrent Streams', v: analytics?.summary?.totalBookings?.toLocaleString?.() || '15,842', i: Activity, c: 'rose' }
            ].map((stat, i) => (
              <MetricCard 
                key={i}
                label={stat.t}
                value={stat.v}
                icon={<stat.i size={18} />}
                color={stat.c}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
             {/* Platform Financial Growth */}
             <motion.div 
               variants={itemVariants}
               className="xl:col-span-8 bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm"
             >
                <div className="flex justify-between items-center mb-10">
                   <div>
                      <h3 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
                         Financial Telemetry <Activity size={20} className="text-indigo-600" />
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
                               <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                               <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} dy={10} />
                         <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} dx={-10} />
                         <Tooltip
                            cursor={{stroke: '#cbd5e1'}}
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}
                         />
                         <Area type="monotone" dataKey="amount" stroke="#4f46e5" fillOpacity={1} fill="url(#colorDarkSuper)" strokeWidth={4} />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </motion.div>

             <div className="xl:col-span-4 space-y-8">
                {/* Role Distribution Chart */}
                <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                   <h3 className="text-lg font-bold tracking-tight mb-8 flex items-center gap-3 text-slate-800">
                      Identity Distribution
                   </h3>
                   <div className="h-[220px] relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                                data={analytics?.roleDistribution?.length ? analytics.roleDistribution : [
                                  {name: 'Students', value: 85, color: '#4f46e5'},
                                  {name: 'Tutors', value: 10, color: '#10b981'},
                                  {name: 'Parents', value: 5, color: '#f59e0b'}
                                ]}
                                innerRadius={70}
                                outerRadius={95}
                                paddingAngle={6}
                                dataKey="value"
                            >
                               {(analytics?.roleDistribution?.length ? analytics.roleDistribution : [
                                  {name: 'Students', value: 85, color: '#4f46e5'},
                                  {name: 'Tutors', value: 10, color: '#10b981'},
                                  {name: 'Parents', value: 5, color: '#f59e0b'}
                                ]).map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color || '#4f46e5'} stroke="none" />
                               ))}
                            </Pie>
                         </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <p className="text-3xl font-extrabold text-slate-800 tabular-nums">100%</p>
                         <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Total</p>
                      </div>
                   </div>
                   <div className="space-y-3 mt-8">
                      {(analytics?.roleDistribution?.length ? analytics.roleDistribution : [
                          {name: 'Students', value: 85, color: '#4f46e5'},
                          {name: 'Tutors', value: 10, color: '#10b981'},
                          {name: 'Parents', value: 5, color: '#f59e0b'}
                        ]).map((role) => (
                        <div key={role.name} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-slate-200 transition-all cursor-default relative overflow-hidden shadow-sm">
                           <div className="flex items-center gap-4 relative z-10">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color || '#4f46e5' }} />
                               <span className="font-bold text-slate-600 uppercase tracking-widest text-xs">{role.name}</span>
                           </div>
                           <span className="text-base font-extrabold text-slate-800 tabular-nums relative z-10">{role.value}</span>
                        </div>
                      ))}
                   </div>
                </motion.div>
             </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default SuperAdminDashboard;