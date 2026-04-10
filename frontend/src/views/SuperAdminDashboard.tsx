import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  BarChart3, 
  Activity, 
  Terminal, 
  Database, 
  Server,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  LayoutDashboard,
  DollarSign
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { useAnalytics } from '../controllers/useAnalytics';
import { cn } from '../utils/cn';

const SuperAdminDashboard: React.FC = () => {
  const { analytics, fetchAnalytics, loading } = useAnalytics();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);


  return (
    <Layout userRole="superadmin">
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50 p-4 md:p-8 space-y-8">
        {/* God Mode Header */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-950 p-8 md:p-12 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                  <ShieldCheck className="text-indigo-400" size={24} />
                </div>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-indigo-300">System Overlord Status</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2">
                Platform Observer <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">God Mode</span>
              </h1>
              <p className="text-gray-400 max-w-lg text-lg">
                Comprehensive real-time oversight of the Sri Lankan PeerLearn ecosystem. 
                Monitoring users, revenue, and system health in one unified view.
              </p>
            </div>
            <button onClick={fetchAnalytics} className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl font-bold transition-all border border-white/10 flex items-center gap-2 group">
              <RefreshCw className={cn("group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} size={20} />
              Re-sync Global Metrics
            </button>
          </div>
        </div>

        {/* Global Stats Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Global Users" value={analytics?.summary.totalUsers.toLocaleString() || '0'} icon={Users} color="primary" trend="Registered" />
          <StatCard title="Total Revenue" value={`Rs. ${analytics?.summary.totalRevenue.toLocaleString() || '0'}`} icon={DollarSign} color="secondary" trend={`Avg session: Rs. ${Math.floor(analytics?.summary.avgSessionPrice || 0)}`} />
          <StatCard title="Active Materials" value={analytics?.summary.totalMaterials.toLocaleString() || '0'} icon={BookOpen} color="accent" />
          <StatCard title="Total Bookings" value={analytics?.summary.totalBookings.toLocaleString() || '0'} icon={Activity} color="primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Financial Oversight */}
          <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <BarChart3 size={200} />
            </div>
            <div className="flex justify-between items-end mb-12">
              <div>
                <h3 className="text-2xl font-black mb-1">Financial Intelligence</h3>
                <p className="text-gray-500 text-sm">Platform revenue trends in LKR</p>
              </div>
              <div className="flex gap-2">
                {['Day', 'Week', 'Month', 'Year'].map(t => (
                  <button key={t} className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    t === 'Month' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200"
                  )}>{t}</button>
                ))}
              </div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.timeSeriesData || []}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Distribution Hub */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative">
            <h3 className="text-2xl font-black mb-8">User Demographics</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.roleDistribution || []}
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {(analytics?.roleDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-8">
              {(analytics?.roleDistribution || []).map(role => (
                <div key={role.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color || '#6366f1' }} />
                    <span className="font-bold text-gray-700 dark:text-gray-300 capitalize">{role.name}</span>
                  </div>
                  <span className="text-gray-500 font-bold">{role.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Real-time System Logs */}
          <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white border border-gray-800 shadow-2xl col-span-1 lg:col-span-1">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Terminal className="text-green-400" /> Live System Logs
              </h3>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
            </div>
            <div className="font-mono text-xs space-y-3 opacity-80 h-[400px] overflow-y-auto no-scrollbar">
              <p className="text-blue-400">[SYSTEM] :: Authenticating superadmin_observer...</p>
              <p className="text-gray-500">[DB] :: 25 active district queries completed.</p>
              <p className="text-green-400">[API] :: GET /api/system/analytics - 200 OK (12ms)</p>
              <p className="text-orange-400">[SOCKET] :: New session started: Combined Maths Unit 1</p>
              <p className="text-gray-500">[CACHE] :: Flush completed successfully.</p>
              <p className="text-red-400">[AUTH] :: Blocked attempt on /api/admin from 192.168.1.5</p>
              <p className="text-gray-500">[STORAGE] :: Backup dump scheduled in 14 mins.</p>
              <p className="text-blue-400">[SYSTEM] :: Hardware usage - CPU: 12%, RAM: 2.1GB</p>
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm col-span-1 lg:col-span-2">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-2">
              <Server className="text-indigo-500" /> Infrastructure Node Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Primary DB Node', status: 'Operational', icon: Database, color: 'text-green-500' },
                { label: 'Socket Cluster SL-West', status: 'Online', icon: RefreshCw, color: 'text-blue-500' },
                { label: 'Vite Production Build', status: 'Stable', icon: LayoutDashboard, color: 'text-indigo-500' },
                { label: 'AI Inference Node', status: 'High Load', icon: TrendingUp, color: 'text-orange-500' },
              ].map((node, i) => (
                <div key={i} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-white dark:bg-gray-700 shadow-sm">
                      <node.icon className={node.color} size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{node.label}</p>
                      <p className="text-xs text-gray-500">Last heartbeat: 2s ago</p>
                    </div>
                  </div>
                  <span className={cn("text-xs font-black uppercase tracking-widest", node.color)}>{node.status}</span>
                </div>
              ))}
            </div>
            
            {/* Global Traffic Heatmap Overlay Mock */}
            <div className="mt-12 p-8 bg-indigo-50 dark:bg-indigo-950/20 rounded-3xl border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center gap-4 mb-6">
                <AlertTriangle className="text-indigo-500" />
                <div>
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-100 text-lg">Real-World Logic Verification</h4>
                  <p className="text-indigo-600 dark:text-indigo-400 text-sm">All 25 districts are reporting active sessions. High traffic identified in Colombo & Gampaha.</p>
                </div>
              </div>
              <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                <div className="h-full bg-indigo-500" style={{ width: '45%' }} />
                <div className="h-full bg-teal-400" style={{ width: '30%' }} />
                <div className="h-full bg-accent" style={{ width: '25%' }} />
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                <span>Colombo (45%)</span>
                <span>Kandy & Galle (30%)</span>
                <span>Other Districts (25%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SuperAdminDashboard;
