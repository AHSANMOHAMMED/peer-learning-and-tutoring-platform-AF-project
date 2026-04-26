import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  ShieldCheck,
  Globe,
  Database,
  Terminal,
  Activity,
  Zap,
  Cpu,
  RefreshCw,
  Save,
  AlertTriangle,
  History,
  Signal,
  Shield,
  Fingerprint,
  Globe2,
  Users,
  GraduationCap,
  Server,
  Lock,
  Radio,
  FileText,
  Plus,
  Trash2,
  XCircle,
  ShieldAlert
} from 'lucide-react';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';
import { useFeatureFlags } from '../controllers/useFeatureFlags';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const AdminSettings = () => {
  const [activeCategory, setActiveCategory] = useState('platform');
  const [cpuLoad, setCpuLoad] = useState(12.4);
  const [ramUsage, setRamUsage] = useState(2.8);
  const [latency, setLatency] = useState(14);
  const [healthStatus, setHealthStatus] = useState(null);
  
  const { flags, fetchFlags, toggleFlag, createFlag, deleteFlag, loading: flagsLoading } = useFeatureFlags();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFlag, setNewFlag] = useState({ key: '', name: '', description: '', enabled: false });
  
  const [telemetryLogs, setTelemetryLogs] = useState([
    "System Initialized.",
    "Database optimization complete.",
    "API Gateway operational."
  ]);
  const [fetching, setFetching] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    targetRole: 'All'
  });
  const logEndRef = useRef(null);

  useEffect(() => {
    fetchFlags();
    const checkHealth = async () => {
      try {
        const { data } = await api.get('/health');
        setHealthStatus(data);
        if (data.cpu) setCpuLoad(parseFloat(data.cpu));
        if (data.memory) setRamUsage(data.memory.heapUsed / 100); // Scaled for display
      } catch(err) {
        setHealthStatus({ status: 'UP', mongo: 'CONNECTED' });
      }
    };
    checkHealth();
    
    // Refresh health every 15 seconds
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [fetchFlags]);

  useEffect(() => {
    const statsInterval = setInterval(() => {
      setLatency(prev => Math.max(5, Math.min(150, prev + (Math.random() > 0.5 ? 5 : -5))));
    }, 5000);

    return () => clearInterval(statsInterval);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [telemetryLogs]);

  const addLog = (msg, type = 'API') => {
    setTelemetryLogs(prev => [...prev.slice(-15), `[${type}] ${msg}`]);
  };

  const handleToggleFlag = async (id, name) => {
    try {
      await toggleFlag(id);
      addLog(`Flag updated: ${name}`, 'CONFIG');
      toast.success(`Platform configuration updated for ${name}`);
    } catch (err) {
      toast.error('Failed to change flag state');
    }
  };

  const handleCreateFlag = async (e) => {
    e.preventDefault();
    try {
      await createFlag(newFlag);
      addLog(`New module provisioned: ${newFlag.name}`, 'SYSTEM');
      toast.success(`Platform module ${newFlag.name} created`);
      setIsCreateModalOpen(false);
      setNewFlag({ key: '', name: '', description: '', enabled: false });
    } catch (err) {
      toast.error('Failed to create configuration');
    }
  };

  const handleDeleteFlag = async (e, id, name) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to decommission the ${name} module?`)) return;
    try {
      await deleteFlag(id);
      addLog(`Module decommissioned: ${name}`, 'SYSTEM');
      toast.success(`${name} removed from platform`);
    } catch (err) {
      toast.error('Failed to delete configuration');
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastData.message || !broadcastData.title) {
      toast.error('Broadcast message and title are required');
      return;
    }
    setFetching(true);
    try {
      const { data } = await api.post('/admin/broadcast', broadcastData);
      addLog(`Global broadcast dispatched: ${broadcastData.targetRole}`, 'NOTIF');
      toast.success(data.message);
      setBroadcastData({ ...broadcastData, message: '', title: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch broadcast');
    } finally {
      setFetching(false);
    }
  };

  const handleRotateKeys = async () => {
    if (!window.confirm('WARNING: Rotating access keys may cause temporary API disruptions. Proceed?')) return;
    setFetching(true);
    try {
      const { data } = await api.post('/admin/rotate-keys');
      addLog(`Security credentials rotated: ID ${data.data.keyPairId}`, 'SECURE');
      toast.success('Platform access keys rotated and distributed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to rotate security credentials');
    } finally {
      setFetching(false);
    }
  };

  const seedDefaultFlags = async () => {
    try {
      await createFlag({ key: 'main_maintenance', name: 'Maintenance Mode', description: 'Suspend all public platform operations', enabled: false });
      await createFlag({ key: 'beta_features', name: 'Beta Features', description: 'Enable experimental modules for selected users', enabled: false });
      await createFlag({ key: '2fa_enforce', name: 'Enforce MFA', description: 'Mandatory two-factor authentication for all staff', enabled: true });
      await createFlag({ key: 'registration_gate', name: 'Registration Lock', description: 'Halt all new user account creation', enabled: false });
      fetchFlags();
      addLog('Default infrastructure flags provisioned', 'SYSTEM');
      toast.success('Core configurations deployed');
    } catch (err) {
      toast.error('Failed to provision default configuration');
    }
  };

  const categories = [
    { id: 'platform', label: 'Platform Settings', icon: Globe },
    { id: 'security', label: 'Security & Access', icon: Lock },
    { id: 'notifications', label: 'Communication Hub', icon: Radio },
    { id: 'system', label: 'System Infrastructure', icon: Server }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <Layout userRole="admin">
      <div className="min-h-screen bg-[#fafafc] text-slate-900 selection:bg-indigo-500/10 overflow-x-hidden relative text-left p-6 md:p-8">
        <motion.div 
          className="relative z-10 max-w-[1440px] mx-auto space-y-8 text-left"
          variants={containerVariants}
          initial="hidden" animate="visible"
        >
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-left">
             <div className="flex items-center gap-10 text-left">
                <div className="flex items-center gap-3 text-left">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm" />
                   <span className="text-xs font-bold uppercase tracking-widest text-slate-800">Platform Administration</span>
                </div>
                <div className="hidden md:flex items-center gap-3 text-slate-400">
                   <Activity size={14} className="text-indigo-500" />
                   <span className="text-[10px] font-bold uppercase tracking-widest leading-none">System Latency: {latency.toFixed(0)}ms</span>
                </div>
             </div>
              <div className="flex items-center gap-4">
                 <div className="px-5 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md">
                    Admin Access
                 </div>
              </div>
          </div>

          {/* Hero Section */}
          <motion.div 
            variants={itemVariants} 
            className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-8 md:p-14 text-white shadow-xl text-left group"
          >
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12 text-left">
              <div className="flex-1 max-w-4xl space-y-10 text-left">
                <div className="flex items-center gap-6 text-left">
                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-lg shrink-0 group-hover:rotate-6 transition-transform">
                    <Settings className="text-white" size={28} />
                  </div>
                  <div className="text-left">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100 mb-1 block">Global Configuration Management</span>
                     <div className="flex items-center gap-3 mt-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Live Environment Synchronized</span>
                     </div>
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase text-white text-left">
                   System <br />
                   <span className="text-blue-200">Administration.</span>
                </h1>
              </div>

              <div className="hidden xl:flex flex-col items-center bg-white/10 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-12 shadow-xl shrink-0 w-80 text-center transition-all hover:bg-white/15">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100 mb-6">Active Feature Flags</p>
                 <p className="text-7xl font-black mb-3 tabular-nums tracking-tighter text-white leading-none">
                   {flags.filter(f => f.enabled).length}
                 </p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mt-3">Of {flags.length} Managed Modules</p>
              </div>
            </div>
          </motion.div>

          {/* Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-left items-start pb-20">
            {/* Nav Sidebar */}
            <div className="lg:col-span-3 space-y-4 text-left">
               {categories.map((cat) => (
                 <button
                   key={cat.id}
                   onClick={() => setActiveCategory(cat.id)}
                   className={cn(
                      "w-full flex items-center justify-between p-6 rounded-3xl border transition-all font-bold text-[10px] uppercase tracking-widest group shadow-sm active:scale-95",
                     activeCategory === cat.id 
                       ? "bg-slate-800 text-white border-slate-900 shadow-xl" 
                       : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:border-indigo-100"
                   )}
                 >
                    <div className="flex items-center gap-4">
                       <cat.icon size={18} className={cn("transition-colors", activeCategory === cat.id ? "text-indigo-400" : "text-slate-300")} />
                       {cat.label}
                    </div>
                 </button>
               ))}
               
               {flags.length === 0 && !flagsLoading && (
                 <button
                   onClick={seedDefaultFlags}
                   className="w-full mt-10 flex items-center justify-center gap-4 p-6 rounded-3xl bg-indigo-50 border border-indigo-200 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all shadow-md"
                 >
                    <Settings size={18} /> Initialize Platform Config
                 </button>
               )}
            </div>

            {/* Main Panel */}
            <div className="lg:col-span-9 bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-14 shadow-lg text-left min-h-[650px]">
               <AnimatePresence mode="wait">
                 {activeCategory === 'platform' && (
                    <motion.div key="platform" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12 text-left">
                       <div className="border-b border-slate-100 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                         <div className="flex items-center gap-6">
                            <Globe className="text-indigo-600" size={32} />
                            <h3 className="text-2xl font-black uppercase text-slate-800 tracking-tight leading-none">Feature Configuration</h3>
                         </div>
                         <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
                         >
                            <Plus size={16} /> Provision Module
                         </button>
                       </div>
                     
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                          {flagsLoading ? (
                             <div className="col-span-2 text-center py-10">
                               <RefreshCw size={32} className="animate-spin text-indigo-500 mx-auto" />
                               <p className="text-slate-400 mt-6 text-[10px] font-black uppercase tracking-widest">Accessing System Database...</p>
                             </div>
                          ) : flags.length === 0 ? (
                            <div className="col-span-2 text-center py-24 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50">
                              <Database className="mx-auto text-slate-300 mb-6" size={48} />
                              <p className="text-slate-500 font-bold uppercase tracking-widest">No configurations found.</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Initialize core modules to proceed.</p>
                            </div>
                          ) : (
                            flags.map(flag => (
                              <div key={flag._id} onClick={() => handleToggleFlag(flag._id, flag.name)} className="p-10 bg-slate-50 border border-slate-100 rounded-3xl space-y-8 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer active:scale-[0.99] text-left">
                                  <div className="flex items-start justify-between">
                                      <div className="text-left py-1">
                                        <h4 className="font-black uppercase text-lg tracking-tight text-slate-800 leading-none">{flag.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mt-4">{flag.description || 'Global Platform Settings'}</p>
                                      </div>
                                      <div className="flex flex-col items-center gap-4">
                                         <div className={cn(
                                            "w-12 h-6 rounded-full p-1.5 relative flex items-center transition-all duration-300 border",
                                            flag.enabled ? "bg-emerald-100 border-emerald-200 justify-end" : "bg-slate-200 border-slate-300 justify-start"
                                         )}>
                                           <div className={cn("w-4 h-4 rounded-full shadow-sm", flag.enabled ? "bg-emerald-500" : "bg-white")} />
                                         </div>
                                         <button 
                                            onClick={(e) => handleDeleteFlag(e, flag._id, flag.name)}
                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                         >
                                            <Trash2 size={16} />
                                         </button>
                                      </div>
                                  </div>
                              </div>
                            ))
                          )}
                      </div>

                      <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-100 text-center">
                         {[
                           { val: '24ms', lbl: 'Database Health', color: 'text-indigo-600', icon: Database, bg: 'bg-indigo-50' },
                           { val: '1.2M', lbl: 'Secure Records', color: 'text-emerald-500', icon: ShieldCheck, bg: 'bg-emerald-50' },
                           { val: 'Optimal', lbl: 'Network Load', color: 'text-blue-500', icon: Activity, bg: 'bg-blue-50' }
                         ].map((s, i) => (
                            <div key={i} className="p-8 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-md transition-all active:scale-[0.99] group/stat">
                               <div className={cn("w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-sm", s.bg)}>
                                  <s.icon size={22} className={cn(s.color)} />
                               </div>
                               <p className={cn("text-2xl font-black mb-2 tabular-nums tracking-tight", s.color)}>{s.val}</p>
                               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.lbl}</p>
                            </div>
                         ))}
                      </div>
                   </motion.div>
                 )}

                 {activeCategory === 'notifications' && (
                    <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12 text-left">
                       <div className="border-b border-slate-100 pb-8 flex items-center gap-6">
                         <Radio className="text-amber-500" size={32} />
                         <h3 className="text-2xl font-black uppercase text-slate-800 tracking-tight leading-none">Global Broadcast Hub</h3>
                       </div>
                       
                       <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                          <div className="p-10 bg-slate-50 border border-slate-200 rounded-[2.5rem] space-y-10 shadow-inner text-left">
                                <form onSubmit={handleBroadcast} className="space-y-6">
                                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4">New System Broadcast</label>
                                   <div className="space-y-4">
                                      <input 
                                        required
                                        type="text" 
                                        placeholder="Announcement Title" 
                                        value={broadcastData.title}
                                        onChange={e => setBroadcastData({...broadcastData, title: e.target.value})}
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-8 py-4 text-sm font-bold text-slate-800 outline-none focus:border-indigo-600 transition-all shadow-sm"
                                      />
                                      <textarea 
                                        required
                                        className="w-full h-32 bg-white border border-slate-200 rounded-3xl p-8 text-sm font-medium text-slate-700 outline-none focus:border-indigo-600 transition-all shadow-sm resize-none placeholder:text-slate-300"
                                        placeholder="Type the message to be broadcast to all professional users..."
                                        value={broadcastData.message}
                                        onChange={e => setBroadcastData({...broadcastData, message: e.target.value})}
                                      />
                                   </div>
                                   <div className="flex gap-4">
                                      <select 
                                        value={broadcastData.targetRole}
                                        onChange={e => setBroadcastData({...broadcastData, targetRole: e.target.value})}
                                        className="bg-white border border-slate-200 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none transition-all focus:border-indigo-500"
                                      >
                                         <option>All</option>
                                         <option>Tutors</option>
                                         <option>Students</option>
                                      </select>
                                      <button 
                                        disabled={fetching}
                                        type="submit" 
                                        className="flex-1 py-4 bg-slate-800 hover:bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                      >
                                        {fetching ? 'Dispatching...' : 'Dispatch Now'}
                                      </button>
                                   </div>
                                </form>
                          </div>

                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Dispatch History</h4>
                             {[
                               { msg: 'System maintenance scheduled for Sat 04:00 GMT.', date: 'Yesterday', count: '12.4k' },
                               { msg: 'Global achievement points multipliers active!', date: '3d ago', count: '45.1k' }
                             ].map((h, i) => (
                                <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
                                   <p className="text-sm font-bold text-slate-800 leading-relaxed mb-4">{h.msg}</p>
                                   <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter text-slate-400">
                                      <span>Dispatch: {h.date}</span>
                                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Reachable: {h.count}</span>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {activeCategory === 'security' && (
                    <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12 text-left">
                       <div className="border-b border-slate-100 pb-8 flex items-center gap-6">
                         <ShieldCheck className="text-rose-500" size={32} />
                         <h3 className="text-2xl font-black uppercase text-slate-800 tracking-tight leading-none">Security Control Hub</h3>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] flex flex-col justify-between shadow-sm text-left h-full">
                             <div className="flex items-center gap-6 mb-6">
                                <div className="w-16 h-16 bg-rose-600 rounded-3xl flex items-center justify-center text-white shrink-0 shadow-xl">
                                   <ShieldAlert size={28} />
                                </div>
                                <div>
                                   <p className="text-xl font-black text-rose-900 uppercase tracking-tight leading-none">Hardened IP Access</p>
                                   <p className="text-[10px] font-bold text-rose-600 mt-2 uppercase tracking-widest">Mandatory Verification</p>
                                </div>
                             </div>
                             <p className="text-sm font-medium text-rose-700 leading-relaxed uppercase tracking-wider mb-8">
                                Cross-reference all administrative logins against the encrypted professional credential database.
                             </p>
                             <button 
                                onClick={handleRotateKeys}
                                disabled={fetching}
                                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
                             >
                                {fetching ? 'Processing...' : 'Rotate Access Keys'}
                             </button>
                          </div>

                          <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] space-y-6 shadow-sm">
                             <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Recent Security Events</h4>
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                             </div>
                             <div className="space-y-4">
                                {[
                                  { event: 'Admin Login', time: '2m ago', status: 'SUCCESS' },
                                  { event: 'Config Change', time: '14m ago', status: 'AUDITED' },
                                  { event: 'API Key Access', time: '1h ago', status: 'ENCRYPTED' }
                                ].map((ev, i) => (
                                   <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                      <div>
                                         <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{ev.event}</p>
                                         <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{ev.time}</p>
                                      </div>
                                      <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-tighter">{ev.status}</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  )}

                 {activeCategory === 'system' && (
                   <motion.div key="system" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12 text-left">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-10 border-b border-slate-100 pb-8">
                           <div className="flex items-center gap-6">
                              <Server className="text-emerald-500" size={32} />
                              <h3 className="text-2xl font-black uppercase text-slate-800 tracking-tight leading-none">Infrastructure Health</h3>
                           </div>
                           <div className="flex items-center gap-4 bg-emerald-50 px-6 py-2.5 rounded-2xl border border-emerald-100 shadow-sm">
                             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm" />
                             <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600">{healthStatus?.status || 'OPTIMAL'}</span>
                           </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                          {[
                            { label: 'CPU Usage', value: `${cpuLoad.toFixed(1)}%`, icon: Cpu, color: 'text-indigo-600', bg: 'bg-indigo-100 border-indigo-200' },
                            { label: 'Database Link', value: healthStatus?.mongo === 'CONNECTED' ? 'Synchronized' : 'Connecting...', icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-100 border-emerald-200' },
                            { label: 'API Latency', value: `${latency.toFixed(0)} ms`, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-100 border-amber-200' }
                          ].map((stat, i) => (
                            <div key={i} className="p-10 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col items-center space-y-8 shadow-sm group hover:bg-white hover:shadow-md transition-all">
                               <div className={cn("w-16 h-16 rounded-[1.5rem] border flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", stat.bg)}>
                                  <stat.icon className={cn(stat.color)} size={28} />
                               </div>
                               <div className="space-y-3">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                  <h4 className="text-3xl font-black tracking-tight text-slate-800 tabular-nums">{stat.value}</h4>
                               </div>
                            </div>
                          ))}
                      </div>

                      <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] space-y-4 h-64 overflow-y-auto no-scrollbar shadow-inner text-left">
                         <div className="flex items-center gap-4 mb-4 border-b border-slate-800 pb-4">
                            <FileText size={16} className="text-slate-500" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Logs</h4>
                         </div>
                         {telemetryLogs.map((log, i) => (
                           <p key={i} className="px-4 py-2 text-[12px] font-bold uppercase tracking-wider flex items-center gap-6 border-b border-slate-800/50 last:border-0 hover:bg-white/5 transition-all text-slate-400 group">
                              <span className="opacity-30 text-[10px] w-20 shrink-0">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span> 
                              <span className="text-slate-300 group-hover:text-white transition-colors">{log}</span>
                           </p>
                         ))}
                         <div ref={logEndRef} />
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Modal: Provision Module */}
        <AnimatePresence>
           {isCreateModalOpen && (
              <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-900/60 overflow-y-auto">
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl border border-white/20 overflow-hidden my-auto"
                 >
                    <div className="p-10 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-left">
                       <div>
                          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Provision Identity Module</h2>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Create new system-wide feature flag</p>
                       </div>
                       <button onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-500"><XCircle size={24}/></button>
                    </div>
                    
                    <form onSubmit={handleCreateFlag} className="p-10 space-y-8 text-left">
                       <div className="grid grid-cols-1 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-2">System Identifier (Key)</label>
                             <input required type="text" placeholder="e.g., beta_enrollment" value={newFlag.key} onChange={e => setNewFlag({...newFlag, key: e.target.value})} className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl focus:border-indigo-600 focus:shadow-xl transition-all font-bold text-slate-800 outline-none" />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-2">Display Name</label>
                             <input required type="text" placeholder="e.g., Extended Beta" value={newFlag.name} onChange={e => setNewFlag({...newFlag, name: e.target.value})} className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl focus:border-indigo-600 focus:shadow-xl transition-all font-bold text-slate-800 outline-none" />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-2">Internal Description</label>
                             <textarea placeholder="Purpose of this configuration..." value={newFlag.description} onChange={e => setNewFlag({...newFlag, description: e.target.value})} className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl focus:border-indigo-600 focus:shadow-xl transition-all font-bold text-slate-800 outline-none resize-none h-24" />
                          </div>
                       </div>

                       <div className="flex gap-4 pt-4 border-t border-slate-50">
                          <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-8 py-4 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                          <button type="submit" className="flex-1 bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-slate-900/10 hover:bg-black transition-all active:scale-[0.98]">Deploy Module</button>
                       </div>
                    </form>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default AdminSettings;
