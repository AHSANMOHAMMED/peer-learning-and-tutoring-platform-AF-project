import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  ShieldCheck,
  Globe,
  Bell,
  Lock,
  Database,
  Terminal,
  Server,
  Activity,
  Zap,
  Cpu,
  RefreshCw,
  Save,
  AlertTriangle,
  History,
  Signal,
  LayoutDashboard,
  Binary,
  ArrowRight,
  ChevronRight,
  Shield,
  ArrowUpRight,
  Fingerprint,
  Layers,
  Sparkles,
  Globe2,
  BadgeCheck,
  Users,
  GraduationCap
} from 'lucide-react';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';

const AdminSettings = () => {
  const [activeCategory, setActiveCategory] = useState('platform');
  const [cpuLoad, setCpuLoad] = useState(12.4);
  const [ramSync, setRamSync] = useState(2.8);
  const [latency, setLatency] = useState(14);
  const [telemetryLogs, setTelemetryLogs] = useState([
    "[SYSTEM] :: Syncing Sri Lankan District Nodes...",
    "[DB] :: Query Optimization Phase 4 Complete.",
    "[API] :: GET /admin/dashboard - 200 OK (8ms)",
    "[AUTH] :: JWT Manifest Updated for Tutor_ID: 9942."
  ]);
  const logEndRef = useRef(null);

  useEffect(() => {
    const statsInterval = setInterval(() => {
      setCpuLoad(prev => Math.max(5, Math.min(85, prev + (Math.random() > 0.5 ? 1.2 : -1.2))));
      setRamSync(prev => Math.max(1.2, Math.min(16, prev + (Math.random() > 0.5 ? 0.1 : -0.1))));
      setLatency(prev => Math.max(5, Math.min(150, prev + (Math.random() > 0.5 ? 5 : -5))));
    }, 3000);

    const logInterval = setInterval(() => {
      const events = [
        `[SYNC] :: District ${['Colombo', 'Kandy', 'Galle', 'Jaffna'][Math.floor(Math.random() * 4)]} Online.`,
        `[AUDIT] :: UID:${Math.floor(Math.random() * 9000) + 1000} Verified.`,
        `[CORE] :: Re-balancing ecosystem peak load.`,
        `[SECURITY] :: IP:${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.X.X Blocked.`,
        `[DB] :: Snapshot stored successfully.`
      ];
      setTelemetryLogs(prev => [...prev.slice(-15), events[Math.floor(Math.random() * events.length)]]);
    }, 5000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(logInterval);
    };
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [telemetryLogs]);

  const categories = [
    { id: 'platform', label: 'OMNI', icon: Globe },
    { id: 'security', label: 'PROTOCOLS', icon: Shield },
    { id: 'notifications', label: 'BROADCAST', icon: Signal },
    { id: 'system', label: 'INFRANET_CORE', icon: Cpu }
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
      <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-500/10 overflow-x-hidden relative text-left p-6 md:p-8">
        {/* Dashboard Background */}
        <div className="fixed inset-0 pointer-events-none z-[1001] text-left">
           <div className="absolute inset-0 bg-gradient-to-tr from-white/90 via-transparent to-white/90 pointer-events-none" />
        </div>

        <motion.div 
          className="relative z-10 max-w-[1440px] mx-auto space-y-8 text-left"
          variants={containerVariants}
          initial="hidden" animate="visible"
        >
          {/* Command Bar */}
          <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-2.5 bg-white/60 backdrop-blur-3xl rounded-xl border border-blue-50 shadow-sm text-left">
             <div className="flex items-center gap-6 text-left">
                <div className="flex items-center gap-2.5 text-left text-left">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.4)] text-left" />
                   <span className="text-sm font-medium uppercase tracking-widest text-slate-950 leading-none text-left">Omni-System Governance Hub α-ACTIVE </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400 text-left">
                   <Settings size={12} className="text-indigo-500 text-left" />
                   <span className="text-sm font-medium uppercase tracking-widest leading-none text-left">Core_Config</span>
                </div>
                <div className="hidden lg:flex items-center gap-2.5 text-slate-400 text-left">
                   <Activity size={12} className="text-emerald-500 text-left" />
                   <span className="text-sm font-medium uppercase tracking-widest leading-none text-left">Flux_Capacity::OK</span>
                </div>
             </div>
              <div className="flex items-center gap-4 text-left">
                 <div className="px-3.5 py-1.5 bg-slate-950 text-white rounded-lg text-xs font-medium uppercase tracking-widest shadow-lg text-center border border-white/5">
                    ADMIN_ROOT::
                 </div>
              </div>
          </div>

          {/* Configuration Master Hero HUB Architecture Display Matrix architecture Display central matrix protocol display */}
          <motion.div 
            variants={itemVariants} 
            className="relative overflow-hidden rounded-2xl bg-indigo-600 p-6 md:p-12 text-white shadow-4xl text-left group"
          >
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none text-right" />
            
            <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12 text-left">
              <div className="flex-1 max-w-4xl space-y-8 text-left">
                <div className="flex items-center gap-5 text-left">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-4xl transition-all duration-1000 group-hover:rotate-6 text-center shrink-0">
                    <Settings className="text-white filter drop-shadow-glow text-left" size={28} />
                  </div>
                  <div className="text-left text-left">
                     <span className="text-xs font-medium tracking-widest uppercase text-indigo-100 leading-none text-left">Master Control Matrix Terminal α Sector Hub</span>
                     <div className="flex items-center gap-3 mt-2 text-left">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-glow text-left" />
                        <span className="text-xs font-medium uppercase text-white/40 tracking-widest text-left">AUTH_LEVEL::GLOBAL_OVERRIDE</span>
                     </div>
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-medium tracking-tighter leading-none uppercase px-0 text-white text-left">
                   System <br />
                   <span className="text-blue-200">Engine Hub.</span>
                </h1>
                <p className="text-indigo-100 text-base font-bold leading-relaxed max-w-lg px-0 text-left underline decoration-white/10 underline-offset-8">
                   Dynamic recalibration of the <span className="text-white border-b border-white/20">Aura ecosystem</span>. Orchestrate parameters, broadcast alerts, and monitor <span className="text-white border-b border-white/20">infranet telemetry</span> island-wide in real-time.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-left pt-2">
                   <div className="px-5 py-2.5 bg-white/10 backdrop-blur-3xl rounded-xl border border-white/10 text-xs font-medium uppercase tracking-normal flex items-center gap-3 shadow-4xl text-left">
                      <Cpu size={14} className="text-amber-300 text-left shadow-glow-amber" /> KERNEL_
                   </div>
                   <div className="px-5 py-2.5 bg-white/5 backdrop-blur-3xl rounded-xl border border-white/5 text-xs font-medium uppercase tracking-normal text-indigo-200 flex items-center gap-3 shadow-inner text-left border-white/5">
                      <RefreshCw size={14} className="text-left" /> AUTO_RECALIB
                   </div>
                </div>
              </div>

              {/* District Node Telemetry Matrix Card architecture */}
              <div className="hidden xl:block p-8 bg-white/10 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-4xl space-y-6 shrink-0 w-72 text-left cursor-default group/telemetry hover:bg-white/15 transition-all duration-700">
                 <div className="flex items-center gap-4 text-left">
                    <Globe2 size={16} className="text-indigo-200 text-left" />
                    <span className="text-xs font-medium uppercase tracking-widest text-indigo-100 text-left">Sector Synchronization IX</span>
                 </div>
                 <div className="relative z-10 space-y-3 text-left">
                    <p className="text-6xl font-medium tabular-nums tracking-tighter leading-none text-white px-0 text-left group-hover/telemetry:scale-110 transition-transform duration-700 filter drop-shadow-glow">25</p>
                    <p className="text-sm font-medium text-blue-200 uppercase tracking-widest leading-none text-left pt-3 underline decoration-blue-200/20 underline-offset-4">ISLANDS</p>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Configuration Matrix Grid Architecture UI display area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-start pb-20">
            {/* Category Sidebar Navigation rail architecture Display Matrix */}
            <motion.div variants={containerVariants} className="lg:col-span-3 space-y-4 sticky top-8 text-left">
               {categories.map((cat) => (
                 <motion.button
                   key={cat.id}
                   variants={itemVariants}
                   onClick={() => setActiveCategory(cat.id)}
                   className={cn(
                      "w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-1000 font-medium text-xs uppercase tracking-widest relative group text-left shadow-4xl active:scale-95",
                     activeCategory === cat.id 
                       ? "bg-slate-950 text-white border-slate-950 shadow-indigo-100/20 scale-[1.05]" 
                       : "bg-white text-slate-300 border-blue-50 hover:bg-slate-50 hover:border-indigo-100 border border-slate-50"
                   )}
                 >
                    <div className="flex items-center gap-4 text-left">
                       <cat.icon size={18} className={cn("transition-colors duration-1000", activeCategory === cat.id ? "text-indigo-400 shadow-glow" : "text-slate-100")} />
                       {cat.label}
                    </div>
                    {activeCategory === cat.id && (
                       <Zap size={14} className="text-amber-300 animate-pulse text-right shadow-glow-amber" />
                    )}
                 </motion.button>
               ))}
            </motion.div>

            {/* Config Engine Terminal Activity Area UI Display Matrix Architecture */}
            <motion.div 
               key={activeCategory}
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="lg:col-span-9 bg-white border border-blue-50 rounded-3xl p-8 md:p-14 shadow-4xl relative overflow-hidden text-left min-h-[600px] border border-slate-50"
            >
               <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-500/[0.03] blur-[150px] rounded-full -mr-40 -mt-40 pointer-events-none text-right" />
               
               <AnimatePresence mode="wait">
                 {activeCategory === 'platform' && (
                   <motion.div key="platform" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12 relative z-10 text-left">
                     <div className="flex flex-col md:flex-row justify-between items-center gap-10 px-2 text-left">
                          <h3 className="text-xl font-medium uppercase tracking-tighter flex items-center gap-5 px-0 leading-none text-slate-950 text-left underline decoration-indigo-50/20 underline-offset-8">
                            <Globe className="text-indigo-600 text-left shadow-glow" size={28} /> OMNI_PLATFORM_CORE
                          </h3>
                          <button className="px-8 py-4 bg-indigo-600 hover:bg-slate-950 text-white rounded-2xl font-medium text-sm uppercase tracking-widest shadow-4xl active:scale-95 transition-all duration-700 flex items-center gap-3.5 group text-center border border-white/5">
                            <Save size={18} className="group-hover:rotate-12 transition-transform text-center" /> SAVE_PROTOCOL
                          </button>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                         <div className="p-8 bg-slate-50 border border-slate-50 rounded-3xl space-y-6 shadow-inner hover:bg-white hover:border-indigo-100 transition-all duration-1000 text-left group cursor-pointer border border-slate-50 active:scale-[0.98]">
                             <p className="text-sm font-medium uppercase tracking-widest text-slate-300 leading-none text-left">INTEGRITY</p>
                            <div className="flex items-center justify-between text-left">
                                <div className="text-left">
                                  <h4 className="font-black uppercase text-base tracking-tight text-slate-950 leading-none px-0 text-left underline underline-offset-4 decoration-current/10 group-hover:text-indigo-600 transition-colors">MAINTENANCE_GATE</h4>
                                  <p className="text-xs text-slate-400 font-medium uppercase tracking-widest leading-none text-left mt-3">Freeze all platform nodes strictly</p>
                                </div>
                                <div className="w-12 h-6 bg-slate-100 rounded-full p-1.5 relative flex items-center cursor-pointer transition-all duration-700 group-hover:bg-rose-50 border border-slate-50 text-center">
                                  <div className="w-4 h-4 bg-white rounded-full shadow-4xl border border-slate-50" />
                                </div>
                            </div>
                         </div>
                         <div className="p-8 bg-slate-50 border border-slate-50 rounded-3xl space-y-6 shadow-inner hover:bg-white hover:border-emerald-100 transition-all duration-1000 text-left group cursor-pointer border border-slate-50 active:scale-[0.98]">
                             <p className="text-sm font-medium uppercase tracking-widest text-slate-300 leading-none text-left">INTELLIGENCE_SPECTRUM_API</p>
                            <div className="flex items-center justify-between text-left">
                                <div className="text-left">
                                  <h4 className="font-black uppercase text-base tracking-tight text-slate-950 leading-none px-0 text-left underline underline-offset-4 decoration-current/10 group-hover:text-emerald-600 transition-colors">LIVE_TELEMETRY_STREAM</h4>
                                  <p className="text-xs text-slate-400 font-medium uppercase tracking-widest leading-none text-left mt-3">Real-time analytical mapping active</p>
                                </div>
                                <div className="w-12 h-6 bg-emerald-50 rounded-full p-1.5 relative flex items-center justify-end cursor-pointer border border-emerald-100 text-center shadow-inner">
                                  <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-emerald-200 shadow-4xl animate-pulse filter drop-shadow-glow-emerald" />
                                </div>
                            </div>
                         </div>
                     </div>

                     <div className="space-y-5 text-left">
                          <label className="text-sm font-medium uppercase tracking-widest text-slate-300 px-3 leading-none text-left">ECOSYSTEMRIPTOR_v1.0</label>
                          <div className="relative group text-left">
                             <input 
                               type="text" 
                               defaultValue="AURA_SRI_LANKA_GLOBAL_EDITION"
                               className="w-full bg-slate-50 border border-slate-50 rounded-2xl px-8 py-5 text-[14px] font-medium text-slate-950 outline-none focus:bg-white focus:border-indigo-100 transition-all duration-700 shadow-inner uppercase tracking-normal text-left border border-slate-50" 
                             />
                             <Cpu size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-100 group-focus-within:text-indigo-600 transition-colors" />
                          </div>
                     </div>

                     <div className="grid grid-cols-3 gap-6 pt-6 text-center">
                        {[
                          { val: '1.2M', lbl: 'STUDENTS_ROOT', color: 'text-indigo-600', icon: Users },
                          { val: '45K', lbl: 'MENTORS_', color: 'text-indigo-600', icon: GraduationCap },
                          { val: '25', lbl: 'DISTRICTS_SAFE', color: 'text-emerald-500', icon: Globe2 }
                        ].map((s, i) => (
                           <div key={i} className="text-center p-8 bg-slate-50 border border-slate-50 rounded-3xl shadow-inner hover:bg-white hover:border-indigo-100 transition-all duration-1000 cursor-pointer border border-slate-50 active:scale-[0.98] group/stat">
                              <div className="mb-6 flex justify-center text-center">
                                 <s.icon size={28} className={cn("transition-all duration-700 group-hover/stat:rotate-12", activeCategory === 'platform' ? 'text-slate-100 group-hover/stat:text-indigo-600' : 'text-slate-100')} />
                              </div>
                              <p className={cn("text-4xl font-medium tracking-tighter mb-2 px-0 text-center filter drop-shadow-glow", s.color)}>{s.val}</p>
                              <p className="text-sm font-medium uppercase tracking-widest text-slate-300 text-center">{s.lbl}</p>
                           </div>
                        ))}
                     </div>
                   </motion.div>
                 )}

                 {activeCategory === 'notifications' && (
                   <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12 relative z-10 text-left">
                     <div className="flex flex-col md:flex-row justify-between items-center gap-10 px-2 text-left">
                          <h3 className="text-xl font-medium uppercase tracking-tighter flex items-center gap-5 px-0 leading-none text-slate-950 text-left underline decoration-amber-50/20 underline-offset-8">
                            <Signal className="text-amber-500 text-left shadow-glow-amber" size={28} /> BROADCAST_API
                          </h3>
                          <button className="px-8 py-4 bg-amber-500 hover:bg-slate-950 text-white rounded-2xl font-medium text-sm uppercase tracking-widest shadow-4xl active:scale-95 transition-all duration-700 flex items-center gap-3.5 group text-center border border-white/5">
                            <Zap size={18} className="group-hover:scale-110 text-center filter drop-shadow-glow" /> DEPLOY_MANIFEST_V1
                          </button>
                     </div>
                     
                     <div className="p-10 bg-slate-50 border border-slate-50 rounded-3xl space-y-8 shadow-inner text-left border border-slate-50">
                          <div className="space-y-5 text-left">
                             <label className="text-sm font-medium uppercase tracking-widest text-slate-300 px-3 leading-none text-left">GLOBAL_ALERT_PAYLOAD</label>
                             <div className="relative text-left">
                                <textarea 
                                  className="w-full h-40 bg-white border border-slate-50 rounded-2xl p-8 text-[13px] font-medium text-slate-950 outline-none focus:border-amber-500/20 transition-all duration-700 shadow-4xl resize-none uppercase tracking-widest"
                                  placeholder="Enter global notification encrypted payload matrix..."
                                />
                                <Database size={20} className="absolute right-6 bottom-6 text-slate-100" />
                             </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                             <div className="flex items-center justify-between p-6 bg-white border border-slate-50 rounded-2xl shadow-4xl group/toggle cursor-pointer hover:border-amber-100 transition-all duration-700 text-left border border-slate-50 active:scale-[0.98]">
                                 <span className="text-sm font-medium uppercase tracking-widest text-slate-400 group-hover/toggle:text-slate-950 transition-colors text-left underline underline-offset-4 decoration-current/10">Student_Nodes_Sync</span>
                                 <div className="w-12 h-6 bg-amber-500 rounded-full flex items-center justify-end p-1.5 shadow-inner text-right border border-white/5 shadow-glow-amber">
                                   <div className="w-4 h-4 bg-white rounded-full shadow-4xl" />
                                 </div>
                             </div>
                             <div className="flex items-center justify-between p-6 bg-white border border-slate-50 rounded-2xl shadow-4xl group/toggle cursor-pointer hover:border-amber-100 transition-all duration-700 text-left border border-slate-50 active:scale-[0.98]">
                                 <span className="text-sm font-medium uppercase tracking-widest text-slate-400 group-hover/toggle:text-slate-950 transition-colors text-left underline underline-offset-4 decoration-current/10">Mentor_Nodes_Sync</span>
                                 <div className="w-12 h-6 bg-amber-500 rounded-full flex items-center justify-end p-1.5 shadow-inner text-right border border-white/5 shadow-glow-amber">
                                   <div className="w-4 h-4 bg-white rounded-full shadow-4xl" />
                                 </div>
                             </div>
                          </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                         <div className="p-8 bg-indigo-600 rounded-3xl text-white shadow-4xl group cursor-pointer hover:scale-[1.03] transition-all duration-1000 relative overflow-hidden active:scale-95 text-left border border-white/10">
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 text-right pointer-events-none" />
                            <div className="flex items-center gap-5 mb-5 text-left">
                                <div className="p-4 bg-white/10 rounded-xl shadow-inner text-center border border-white/10 group-hover:rotate-12 transition-transform duration-700"><RefreshCw size={24} className="text-center shadow-glow" /></div>
                                <h4 className="text-xl font-medium uppercase tracking-tighter leading-none px-0 text-left">Syllabus_Sync_Node</h4>
                            </div>
                            <p className="text-sm font-medium uppercase tracking-normal opacity-80 leading-relaxed px-0 text-left">Recalibrate exam milestones island-wide strictly for Cycle   nodes  sector root.</p>
                         </div>
                         <div className="p-8 bg-slate-950 border border-slate-900 rounded-3xl text-white space-y-6 group cursor-pointer hover:border-indigo-500/30 transition-all duration-1000 shadow-4xl text-left border border-white/5">
                            <div className="flex items-center justify-between text-left">
                                <h4 className="text-base font-medium uppercase tracking-tight leading-none px-0 text-white text-left underline decoration-indigo-500/10 underline-offset-4">Manifest_Log_Archive</h4>
                                <History size={20} className="text-slate-600 group-hover:rotate-180 transition-transform duration-[2000ms] text-right" />
                            </div>
                            <div className="space-y-4 text-left">
                                <div className="flex items-center justify-between text-sm font-medium text-slate-500 uppercase tracking-widest leading-none group/item hover:text-indigo-400 transition-all duration-700 text-left">
                                  <div className="flex items-center gap-3 text-left">
                                     <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full text-left shadow-glow" /> AUG_2026_CYCLE_INIT
                                  </div>
                                  <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-all translate-x-1 duration-700 text-right" />
                                </div>
                                <div className="flex items-center justify-between text-sm font-medium text-slate-500 uppercase tracking-widest leading-none group/item hover:text-emerald-400 transition-all duration-700 text-left">
                                  <div className="flex items-center gap-3 text-left">
                                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full text-left shadow-glow-emerald" /> SECURITY_PATCH.1
                                  </div>
                                  <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-all translate-x-1 duration-700 text-right" />
                                </div>
                            </div>
                         </div>
                     </div>
                   </motion.div>
                 )}

                 {activeCategory === 'security' && (
                   <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12 relative z-10 text-left">
                     <h3 className="text-xl font-medium uppercase tracking-tighter flex items-center gap-5 px-0 leading-none text-slate-950 text-left underline decoration-rose-50/20 underline-offset-8">
                        <Shield className="text-rose-500 text-left shadow-glow-rose" size={28} /> SECURITY_PROTOCOLS
                     </h3>
                     <div className="p-8 bg-rose-50/50 border border-rose-100 rounded-3xl flex items-center gap-8 group overflow-hidden relative shadow-inner text-left border border-rose-100">
                        <div className="absolute inset-0 bg-rose-500/[0.04] animate-pulse text-right pointer-events-none" />
                        <AlertTriangle className="text-rose-500 shrink-0 relative z-10 group-hover:scale-110 transition-transform duration-700 text-center shadow-glow-rose" size={40} />
                        <div className="relative z-10 space-y-3 text-left">
                           <p className="text-xl font-medium text-rose-950 uppercase tracking-tighter leading-none px-0 text-left">HIGH_ENTROPY_ROTATION</p>
                           <p className="text-sm font-medium text-rose-300 uppercase leading-relaxed tracking-widest px-0 text-left">
                             Encryption keys rotating strictly across National Node . Unauthorized identity node requests will initiate GLOBAL_IP_LOCK_PROTOCOL_v1.0 strictly.
                           </p>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 text-left">
                         {[
                           { label: '2FA_Enforcement', desc: 'Secure Mentor Gateways  ', active: true, icon: Fingerprint, color: 'text-rose-500' },
                           { label: 'JWT_Auto_Rotation', desc: 'Recalibrate every 6h nominal ', active: true, icon: RefreshCw, color: 'text-rose-500' },
                           { label: 'Audit_Matrix_Manifest', desc: 'Persistent ecological auditing active', active: false, icon: Database, color: 'text-slate-200' },
                           { label: 'Biometric_Pulse_Scan', desc: 'Experimental HUD scan node active', active: false, icon: Activity, color: 'text-slate-200' }
                         ].map((item, i) => (
                           <div key={i} className="p-8 bg-slate-50 border border-slate-50 rounded-3xl flex items-center justify-between group hover:bg-white hover:border-rose-100 transition-all duration-1000 shadow-4xl text-left cursor-pointer border border-slate-50 active:scale-[0.98]">
                              <div className="flex items-center gap-6 text-left">
                                 <div className="p-4 bg-white border border-slate-50 rounded-xl group-hover:bg-rose-50 transition-all duration-700 shadow-inner text-center shrink-0 border border-slate-50">
                                    <item.icon size={24} className={cn("transition-all duration-700 group-hover:rotate-12", item.active ? item.color : "text-slate-100 opacity-20")} />
                                 </div>
                                 <div className="text-left">
                                    <h4 className="font-black uppercase text-base mb-2 tracking-tight text-slate-950 leading-none px-0 text-left underline underline-offset-4 decoration-rose-500/10 transition-all duration-700 group-hover:text-rose-600">{item.label}</h4>
                                    <p className="text-xs text-slate-300 font-medium uppercase tracking-widest leading-none px-0 text-left">{item.desc}</p>
                                 </div>
                              </div>
                              <div className={cn(
                                "w-12 h-6 rounded-full p-1.5 flex items-center transition-all duration-1000 cursor-pointer text-right shrink-0 border border-transparent shadow-inner",
                                item.active ? "bg-rose-500 justify-end shadow-glow-rose" : "bg-slate-200 justify-start"
                              )}>
                                 <div className="w-4 h-4 bg-white rounded-full shadow-4xl" />
                              </div>
                           </div>
                         ))}
                     </div>
                   </motion.div>
                 )}

                 {activeCategory === 'system' && (
                   <motion.div key="system" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12 relative z-10 text-left">
                     <div className="flex flex-col md:flex-row justify-between items-center gap-10 px-2 text-left">
                          <h3 className="text-xl font-medium uppercase tracking-tighter flex items-center gap-5 px-0 leading-none text-slate-950 text-left underline decoration-emerald-50/20 underline-offset-8">
                            <Terminal className="text-emerald-500 text-left shadow-glow-emerald" size={28} /> INFRANET_MANIFEST_v1.0
                          </h3>
                          <div className="flex items-center gap-3.5 bg-emerald-50/50 px-5 py-2.5 rounded-xl border border-emerald-100 shadow-inner text-center border border-emerald-100">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-glow-emerald text-left" />
                            <span className="text-sm uppercase font-medium tracking-widest text-emerald-600 tabular-nums leading-none pt-0.5 text-right underline underline-offset-4 decoration-emerald-500/20">OPTIMAL</span>
                          </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                         {[
                           { label: 'CPU_LOAD', value: `${cpuLoad.toFixed(1)}%`, icon: Cpu, color: 'text-indigo-600', bg: 'bg-indigo-50/50', shadow: 'shadow-glow' },
                           { label: 'RAM_STATUS', value: `${ramSync.toFixed(1)}GB`, icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50/50', shadow: 'shadow-none' },
                           { label: 'LATENCY_MAP_SAFE', value: `${latency.toFixed(0)}MS`, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50/50', shadow: 'shadow-glow-emerald' }
                         ].map((stat, i) => (
                           <div key={i} className="p-8 bg-slate-50 border border-slate-50 rounded-3xl flex flex-col items-center text-center space-y-6 shadow-inner hover:bg-white hover:border-indigo-100 transition-all duration-1000 cursor-pointer border border-slate-50 active:scale-[0.98] group/stat">
                              <div className={cn("p-5 rounded-2xl shadow-4xl text-center border border-white/5", stat.bg)}>
                                 <stat.icon className={cn(stat.color, stat.shadow, "animate-pulse text-center")} size={28} />
                              </div>
                              <div className="space-y-2 text-center">
                                 <p className="text-xs font-medium text-slate-300 uppercase tracking-widest leading-none mb-1 shadow-none text-center">{stat.label}</p>
                                 <h4 className="text-4xl font-medium tracking-tighter text-slate-950 tabular-nums px-0 text-center decoration-current/10 underline underline-offset-4">{stat.value}</h4>
                              </div>
                           </div>
                         ))}
                     </div>

                     <div className="relative group text-left">
                        <div className="absolute top-6 right-6 z-10 flex items-center gap-3 text-sm font-medium uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-all duration-1000 bg-white/90 backdrop-blur-3xl px-5 py-2.5 rounded-xl border border-blue-50 shadow-4xl text-right cursor-default border border-slate-50">
                           <History size={14} className="text-center" /> INFRANET_TELEMETRY_LOG_ROOT
                        </div>
                        <div className="p-8 bg-slate-950 border border-slate-900 rounded-3xl font-mono text-base text-slate-500 space-y-3 h-[300px] overflow-y-auto no-scrollbar shadow-4xl select-none text-left border border-white/5">
                           {telemetryLogs.map((log, i) => (
                             <p key={i} className={cn(
                               "transition-all duration-1000 px-5 py-3 rounded-xl flex items-center gap-6 text-left border border-transparent",
                               log.includes('[SYNC]') ? 'text-emerald-400 bg-emerald-400/5 shadow-inner' : 
                               log.includes('[SECURITY]') ? 'text-rose-400 bg-rose-400/5 shadow-inner' : 
                               log.includes('[API]') ? 'text-blue-400 bg-blue-400/5 shadow-inner' : 'hover:bg-white/5 hover:border-white/5'
                             )}>
                                <span className="opacity-20 font-medium tracking-normal text-xs text-left">[{new Date().toLocaleTimeString()}]</span> 
                                <span className="font-bold tracking-tight text-left uppercase">{log}</span>
                             </p>
                           ))}
                           <div ref={logEndRef} />
                         </div>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>

        {/* Global Hub Authority terminal indicator UI Matrix Architecture Display */}
        <div className="fixed bottom-10 right-10 group z-50 opacity-40 hover:opacity-100 transition-all duration-1000 text-left">
           <div className="flex items-center gap-10 py-4 px-10 bg-white/60 backdrop-blur-3xl rounded-full border border-blue-50 shadow-4xl cursor-default text-left shadow-glow">
              <div className="relative text-left">
                 <Terminal size={24} className="text-indigo-600 animate-pulse text-left shadow-glow" />
                 <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 text-left" />
              </div>
               <div className="flex flex-col text-left">
                  <p className="text-sm font-medium uppercase tracking-normal text-slate-950 leading-none text-left h-3">ADMIN_SYSTEM</p>
                  <div className="flex items-center gap-4 mt-2.5 text-xs font-medium uppercase text-indigo-600 tracking-widest leading-none text-left h-4">
                     <Database size={14} className="text-left" /> Sync: Sovereign :: Primary Infrastructure Node Master Hub
                  </div>
               </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSettings;
