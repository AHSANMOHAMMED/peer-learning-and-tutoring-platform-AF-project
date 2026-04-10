import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  UserCheck, 
  TrendingUp, 
  Activity, 
  Search,
  CheckCircle,
  XCircle,
  MoreVertical,
  Flag,
  Globe,
  Settings,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { useTutors } from '../controllers/useTutors';
import { useReports } from '../controllers/useReports';
import { useAnalytics } from '../controllers/useAnalytics';
import { cn } from '../utils/cn';

const AdminDashboard: React.FC = () => {
  const { tutors, fetchTutors, moderateTutor, loading: tutorLoading } = useTutors();
  const { reports, fetchReports, moderateReport } = useReports();
  const { analytics, fetchAnalytics } = useAnalytics();
  
  useEffect(() => {
    fetchTutors();
    fetchReports();
    fetchAnalytics();
  }, [fetchTutors, fetchReports, fetchAnalytics]);

  const pendingTutors = tutors.filter(t => t.verificationStatus === 'pending');
  const pendingReports = reports.filter(r => r.status === 'pending');

  return (
    <Layout userRole="admin">
      <div className="min-h-screen space-y-8 p-4 md:p-8 bg-gray-50/50 dark:bg-gray-950/50">
        {/* Governance Command Center Hero */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12 text-white shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                  <Globe className="text-blue-400" size={24} />
                </div>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400">Platform Governance Hub</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2">
                System <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Oversight</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-lg">
                Monitoring 2,543 active students across 25 Sri Lankan districts. 
                System performance is <span className="text-green-400 font-bold">Stable</span>.
              </p>
            </div>
            <div className="flex gap-4">
               <button className="p-4 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 transition-all font-bold flex items-center gap-2">
                 <Settings size={20} />
                 Config
               </button>
               <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20">
                 Global Broadcast
               </button>
            </div>
          </div>
        </div>

        {/* Real-time Stats Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={analytics?.summary.totalUsers.toLocaleString() || '0'} icon={Activity} color="primary" />
          <StatCard title="Tutor Queue" value={pendingTutors.length.toString()} icon={UserCheck} color="secondary" trend="Verification Pending" />
          <StatCard title="Reports Active" value={pendingReports.length.toString()} icon={ShieldAlert} color="accent" />
          <StatCard title="Daily LKR" value={`Rs. ${analytics?.summary.totalRevenue.toLocaleString() || '0'}`} icon={TrendingUp} color="primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Analytics Engine */}
          <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Platform Velocity</h3>
                <p className="text-gray-500 text-sm">Real-time session volume and revenue mapping</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Live Updates</span>
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.timeSeriesData || []}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorSessions)" 
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Critical Moderation Sidebar */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative">
            <h3 className="text-2xl font-black tracking-tight mb-8 flex items-center gap-2">
              <AlertTriangle className="text-accent" /> Flagged Content
            </h3>
            <div className="space-y-4">
              {pendingReports.map((report, i) => (
                <div key={i} className="p-6 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-3xl group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                      Risk: {report.suspicionScore > 75 ? 'High' : report.suspicionScore > 40 ? 'Medium' : 'Low'}
                    </span>
                    <button className="text-gray-400 hover:text-gray-900 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{report.reason}</h4>
                  <p className="text-xs text-gray-500 mb-6">{report.description}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => moderateReport(report._id, 'dismissed')}
                      className="flex-1 py-3 bg-white dark:bg-gray-800 text-green-600 font-bold text-xs rounded-xl border border-green-100 hover:bg-green-600 hover:text-white transition-all shadow-sm">
                      Dismiss
                    </button>
                    <button 
                      onClick={() => moderateReport(report._id, 'resolved', 'Account Restricted')}
                      className="flex-1 py-3 bg-accent text-white font-bold text-xs rounded-xl hover:bg-accent-dark transition-all shadow-lg shadow-accent/20">
                      Revoke Access
                    </button>
                  </div>
                </div>
              ))}
              {pendingReports.length === 0 && (
                <div className="p-8 mt-4 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
                   <ShieldAlert className="text-gray-300 mb-2" size={32} />
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">All other nodes within safety limits</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Tutor Verification Center */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h3 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                <UserCheck className="text-blue-500" size={32} />
                Tutor Verification Pipeline
              </h3>
              <p className="text-gray-500 mt-1 uppercase text-xs font-black tracking-widest">Reviewing credentials from UoM, UoC & UoP</p>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                className="pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl w-full md:w-80 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
                placeholder="Search candidates..."
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-800 pb-6">
                  <th className="px-6 py-4">Tutor Profile</th>
                  <th className="px-6 py-4">Credential Level</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-4 py-4 text-right">Primary Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {pendingTutors.map((tutor, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-400">
                          {(tutor.userId as any)?.username?.[0] || 'T'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">{(tutor.userId as any)?.username}</p>
                          <p className="text-sm text-gray-500">{(tutor.education?.[0] as any)?.institution || 'University Graduate'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-bold text-gray-900 dark:text-gray-100">
                      Premium Educator
                    </td>
                    <td className="px-6 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        tutor.verificationStatus === 'approved' ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                      )}>
                        {tutor.verificationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-6 text-right">
                      <div className="flex justify-end gap-2">
                         <button 
                           onClick={() => moderateTutor(tutor._id, 'rejected')}
                           className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-red-500 hover:text-white transition-all text-gray-400 border border-transparent"
                         >
                            <XCircle size={18} />
                         </button>
                         <button 
                           onClick={() => moderateTutor(tutor._id, 'approved')}
                           className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-green-500 hover:text-white transition-all text-gray-400 border border-transparent"
                         >
                            <CheckCircle size={18} />
                         </button>
                         <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2">
                           Review <ArrowRight size={14} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingTutors.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      No tutors pending verification in the pipeline.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
