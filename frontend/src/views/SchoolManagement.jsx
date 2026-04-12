import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  CreditCard,
  FileUp,
  BarChart3,
  Settings,
  ShieldCheck,
  Plus,
  ChevronRight,
  Sparkles,
  Zap,
  Globe,
  Database,
  ArrowUpRight,
  Activity,
  Award,
  Terminal,
  Binary,
  Layers,
  Fingerprint,
  Globe2,
  Signal,
  Cpu
} from 'lucide-react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { cn } from '../utils/cn';

const SchoolManagement = () => {
  const schoolData = {
    name: 'Royal College Colombo',
    subscription: 'Enterprise Cluster',
    members: 1240,
    activeTeachers: 45,
    upcomingBills: 'Rs. 25,000',
    district: 'Colombo'
  };

  const recentMembers = [
    { name: 'Arjun Kumar', role: 'Student', date: 'Today', level: 12 },
    { name: 'Nimali Siri', role: 'Teacher', date: 'Yesterday', expertise: 'Physics' },
    { name: 'Sunil Perera', role: 'Student', date: '2 days ago', level: 8 }
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
    <Layout userRole="schoolAdmin">
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
                   <span className="text-xs font-medium uppercase tracking-widest text-slate-950 leading-none text-left">Institutional Command Unit α </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400 text-left">
                   <Building2 size={12} className="text-indigo-500 text-left" />
                   <span className="text-xs font-medium uppercase tracking-widest leading-none text-left">Governance_Matrix</span>
                </div>
                <div className="hidden lg:flex items-center gap-2.5 text-slate-400 text-left">
                   <Activity size={12} className="text-emerald-500 text-left" />
                   <span className="text-xs font-medium uppercase tracking-widest leading-none text-left">Flow_Status::OK</span>
                </div>
             </div>
              <div className="flex items-center gap-4 text-left">
                 <div className="px-3.5 py-1.5 bg-slate-950 text-white rounded-lg text-xs font-medium uppercase tracking-widest shadow-lg text-center border border-white/5">
                    INSTITUTIONAL_TERMINAL::
                 </div>
              </div>
          </div>

          {/* Institutional Command HUB Hero HUB Architecture Display Matrix display logic protocol  display */}
          <motion.div 
            variants={itemVariants} 
            className="relative overflow-hidden rounded-2xl bg-indigo-600 p-6 md:p-12 text-white shadow-4xl text-left group"
          >
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none text-right" />
            
            <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12 text-left">
              <div className="flex-1 max-w-4xl space-y-8 text-left">
                <div className="flex items-center gap-5 text-left">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-4xl transition-all duration-1000 group-hover:rotate-6 text-center shrink-0">
                    <Building2 className="text-white filter drop-shadow-glow text-left" size={28} />
                  </div>
                  <div className="text-left text-left">
                     <span className="text-xs font-medium tracking-widest uppercase text-indigo-100 leading-none text-left">Sovereign Institutional Governance Station Hub α Sector Primary</span>
                     <div className="flex items-center gap-3 mt-2 text-left">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white] text-left" />
                        <span className="text-xs font-medium uppercase text-white/40 tracking-widest text-left">ADMIN_ACCESS::CLUSTER_PRIMARY</span>
                     </div>
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-medium tracking-tighter leading-none uppercase px-0 text-white text-left">
                   {schoolData.name.split(' ')[0]} <br />
                   <span className="text-blue-200">{schoolData.name.split(' ').slice(1).join(' ')}</span>
                </h1>
                <p className="text-indigo-100 text-base font-bold leading-relaxed max-w-lg px-0 text-left underline decoration-white/10 underline-offset-8">
                   Orchestrating institutional identity nodes, scholastic evidence protocols, and tier-based authority matrix with hyper-density overseen by the   Sentinel.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-left pt-2">
                   <div className="px-5 py-2.5 bg-white/10 backdrop-blur-3xl rounded-xl border border-white/10 text-xs font-medium uppercase tracking-normal flex items-center gap-3 shadow-4xl text-left outline-none">
                      <Zap size={14} className="text-amber-300 text-left shadow-glow-amber" /> {schoolData.subscription?.toUpperCase()} :: CLUSTER
                   </div>
                   <div className="flex items-center gap-3 text-indigo-100 font-medium text-xs uppercase tracking-normal text-left">
                      <Globe2 size={16} className="text-blue-300 text-left" /> NATIONAL_SECTOR :: GRADES_6-13
                   </div>
                </div>
              </div>

              {/* Action Node Hub Terminal Interface architecture display logic terminal display */}
              <div className="flex flex-col md:flex-row xl:flex-col gap-4 w-full xl:w-72 shrink-0 text-center justify-center pt-4">
                 <button className="w-full py-5.5 bg-white/10 backdrop-blur-3xl border border-white/10 text-white rounded-2xl font-medium text-sm uppercase tracking-widest shadow-4xl hover:bg-white/20 transition-all duration-700 flex items-center justify-center gap-4 group text-center active:scale-95 border border-white/10">
                    <Settings className="group-hover:rotate-90 transition-transform duration-[2000ms] text-center" size={18} /> GRID_SETUP_CFG
                 </button>
                 <button className="w-full py-5.5 bg-white text-slate-950 rounded-2xl font-medium text-sm uppercase tracking-widest shadow-4xl hover:bg-slate-950 hover:text-white transition-all duration-700 flex items-center justify-center gap-4 group active:scale-95 border border-white/10 text-center">
                    <Plus size={18} className="group-hover:rotate-12 transition-transform text-center" /> ADD_CANDIDATE
                 </button>
              </div>
            </div>
          </motion.div>

          {/* Neural Metrics HUD Grid Architecture UI Display Matrix section display logic protocol */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
             {[
               { icon: Users, label: 'Population_Mapping', val: schoolData.members, desc: 'Total_Institutional_Nodes', color: 'indigo' },
               { icon: ShieldCheck, label: 'Faculty_Verified_SAFE', val: schoolData.activeTeachers, desc: 'Authorized_Scholastic_Nodes', color: 'emerald' },
               { icon: Activity, label: 'Network_Velocity', val: '98.4%', desc: 'Infrastructure_Fidelity', color: 'blue' },
               { icon: CreditCard, label: 'Fiscal_Artifact', val: schoolData.upcomingBills, desc: 'Provisioning_Pending_LKR', color: 'rose' }
             ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  variants={itemVariants} 
                  className={cn(
                    "bg-white border border-blue-50 p-7 rounded-2xl shadow-4xl text-left group transition-all duration-[1000ms] border border-slate-50 active:scale-[0.98] cursor-pointer",
                    stat.color === 'indigo' && "hover:border-indigo-100",
                    stat.color === 'emerald' && "hover:border-emerald-100",
                    stat.color === 'blue' && "hover:border-blue-100",
                    stat.color === 'rose' && "hover:border-rose-100"
                  )}
                >
                  <div className="flex justify-between items-start mb-6 text-left">
                     <div className={cn(
                       "p-3 rounded-xl shadow-inner group-hover:bg-slate-950 group-hover:text-white transition-all duration-1000 text-center border border-slate-100",
                       stat.color === 'indigo' && "bg-indigo-50 text-indigo-600",
                       stat.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                       stat.color === 'blue' && "bg-blue-50 text-blue-600",
                       stat.color === 'rose' && "bg-rose-50 text-rose-600"
                     )}>
                        <stat.icon size={20} className="text-center" />
                     </div>
                     <span className="text-xs font-medium text-slate-300 uppercase tracking-widest leading-none group-hover:text-slate-950 transition-colors pt-2">{stat.label}</span>
                  </div>
                  <h4 className="text-4xl font-medium text-slate-950 tracking-tighter mb-2 tabular-nums px-0 filter drop-shadow-glow">{stat.val}</h4>
                  <p className="text-xs font-medium text-slate-300 uppercase tracking-widest leading-none px-0 border-l-2 border-slate-50 pl-4 mt-4">{stat.desc}</p>
                </motion.div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left pb-20">
             {/* Member Pipeline Terminal Matrix Architecture UI display logic protocol display */}
             <motion.div 
               variants={itemVariants}
               className="lg:col-span-8 bg-white border border-blue-50 rounded-3xl p-8 md:p-14 shadow-4xl relative overflow-hidden group/card text-left border border-slate-50"
             >
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/[0.03] blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none text-right" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-12 relative z-10 text-left">
                   <div className="text-left">
                      <h3 className="text-2xl font-medium tracking-tighter text-slate-950 uppercase flex items-center gap-5 px-0 leading-none">
                         <Database className="text-indigo-600 text-left shadow-glow" size={28} /> MEMBER_PIPELINE_API
                      </h3>
                       <p className="text-slate-300 mt-4 uppercase text-xs font-medium tracking-normal leading-none px-1 text-left underline decoration-slate-100 underline-offset-8">Analyzing institutional educational credentials stream  Sector IX   OK</p>
                   </div>
                   <button className="px-6 py-4 bg-slate-50 border border-slate-50 rounded-xl text-sm font-medium uppercase tracking-widest text-indigo-600 hover:bg-slate-950 hover:text-white transition-all duration-700 flex items-center gap-4 shadow-inner active:scale-95 text-center border border-slate-100">
                      BULK_PROFILE <FileUp size={18} className="text-center" />
                   </button>
                </div>

                <div className="space-y-4 relative z-10 text-left">
                   {recentMembers.map((member, i) => (
                      <div key={i} className="p-7 bg-white border border-slate-50 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-indigo-100 hover:bg-slate-50/50 transition-all duration-[1000ms] shadow-xl active:scale-[0.99]">
                         <div className="flex items-center gap-6 text-left">
                            <div className={cn(
                               "w-14 h-14 rounded-xl flex items-center justify-center font-medium text-white text-xl shadow-4xl transition-all duration-[1000ms] group-hover:rotate-12 text-center shrink-0 border border-white/10",
                               member.role === 'Teacher' ? "bg-emerald-600 shadow-glow-emerald" : "bg-indigo-600 shadow-glow"
                            )}>
                               {member.name[0]}
                            </div>
                            <div className="text-left">
                               <h4 className="font-black text-slate-950 text-xl uppercase tracking-tighter mb-2 group-hover:text-indigo-600 transition-colors duration-700 leading-none px-0 text-left line-clamp-1 underline underline-offset-4 decoration-current/10">{member.name}</h4>
                               <div className="flex items-center gap-4 text-xs text-slate-300 font-medium tracking-widest uppercase leading-none text-left">
                                  <span className={cn(member.role === 'Teacher' ? "text-emerald-500 shadow-glow-emerald" : "text-indigo-500 shadow-glow")}>{member.role?.toUpperCase()}</span>
                                  <div className="w-1.5 h-1.5 bg-slate-100 rounded-full" />
                                  <span className="underline underline-offset-2 decoration-current/10">SYNCED_{member.date?.toUpperCase()}</span>
                                </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-8 text-right font-medium">
                            {member.role === 'Student' && (
                               <div className="text-right">
                                  <p className="text-xs font-medium text-slate-100 uppercase tracking-widest mb-1 text-right font-medium">NODE_LVL</p>
                                  <p className="text-2xl font-medium text-slate-950 tracking-tighter leading-none text-right tabular-nums underline decoration-slate-100 underline-offset-4 font-medium">{member.level}</p>
                               </div>
                            )}
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-950 group-hover:text-white transition-all duration-[1000ms] text-center active:scale-90 shadow-inner">
                               <ChevronRight size={22} className="group-hover:translate-x-1.5 transition-transform duration-700 text-center" />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>

                <button className="w-full mt-12 py-5.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium uppercase tracking-normal text-slate-300 hover:text-slate-950 hover:bg-white hover:border-indigo-100 transition-all duration-[1000ms] shadow-inner text-center group active:scale-[0.98]">
                   VIEW_GLOBAL_INSTITUTIONAL_DIRECTORY_MANIFEST <ChevronRight size={14} className="inline ml-3 group-hover:translate-x-2 transition-transform duration-700" />
                </button>
             </motion.div>

             {/* Institutional Intelligence Sidebar Command HUB UI architecture display area protocol */}
             <motion.div 
               variants={itemVariants}
               className="lg:col-span-4 space-y-8 text-left"
             >
                <div className="bg-slate-950 rounded-3xl p-8 md:p-12 text-white shadow-4xl relative overflow-hidden group border border-white/5 text-left cursor-default hover:border-indigo-500/30 transition-all duration-[1000ms]">
                   <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-[2000ms] pointer-events-none text-right">
                      <CreditCard size={120} />
                   </div>
                   <h3 className="text-xl font-medium tracking-tighter mb-10 flex items-center gap-4 uppercase leading-none px-0 text-left underline decoration-indigo-500/20 underline-offset-8">
                      <CreditCard className="text-indigo-400 text-left shadow-glow" size={24} /> FISCAL_API
                   </h3>
                   <div className="space-y-8 mb-10 relative z-10 text-left">
                      <div className="flex justify-between items-end border-b border-white/5 pb-6 text-left group/item hover:border-white/10 transition-colors">
                         <div className="text-left">
                               <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-3 text-left leading-none underline decoration-current/10 underline-offset-2">ENTERPRISE_CONSUMPTION</p>
                              <p className="text-4xl font-medium tabular-nums tracking-tighter leading-none px-0 text-left filter drop-shadow-glow">92.4%</p>
                         </div>
                         <Sparkles size={20} className="text-indigo-500/30 text-left animate-pulse" />
                      </div>
                      <div className="flex justify-between items-end border-b border-white/5 pb-6 text-left group/item hover:border-white/10 transition-colors">
                         <div className="text-left">
                               <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-3 text-left leading-none underline decoration-current/10 underline-offset-2">ACTIVE_SEATS</p>
                              <p className="text-4xl font-medium tabular-nums tracking-tighter leading-none px-0 text-left filter drop-shadow-glow">{schoolData.members}<span className="text-slate-700 text-lg ml-2">/ 1.5K</span></p>
                         </div>
                         <Zap size={20} className="text-indigo-500/30 animate-pulse text-left shadow-glow-amber" />
                      </div>
                   </div>
                   <button className="w-full py-5.5 bg-indigo-600 hover:bg-white hover:text-slate-950 rounded-2xl font-medium text-sm uppercase tracking-widest transition-all duration-700 shadow-4xl group border border-white/10 active:scale-95 text-center">
                      OPTIMIZE_INFRASTRUCTURES <ArrowUpRight className="inline ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-right" size={18} />
                   </button>
                </div>

                <div className="bg-white border border-blue-50 rounded-3xl p-8 md:p-12 shadow-4xl group text-left relative overflow-hidden border border-slate-50 hover:border-indigo-100 transition-all duration-1000">
                   <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-125 transition-transform duration-[2000ms] text-right font-medium"><ShieldCheck size={140} /></div>
                   <h3 className="text-base font-medium tracking-normal mb-10 flex items-center gap-4 uppercase text-slate-200 group-hover:text-slate-950 leading-none text-left transition-colors">
                      <Terminal className="text-emerald-500 animate-pulse text-left shadow-glow-emerald" size={18} /> GOVERNANCE_PROTOCOL_LOG
                   </h3>
                   <div className="space-y-6 text-left relative z-10">
                      {[
                        { action: 'Bulk import successful', time: '14:20' },
                        { action: 'Faculty node verified_APPROVED_MASTER', time: '12:05' },
                        { action: 'Security scan complete', time: '09:12' }
                      ].map((log, i) => (
                        <div key={i} className="flex items-start gap-5 border-l-2 border-slate-50 pl-6 py-1 group/log hover:border-indigo-600 transition-all duration-700 text-left">
                           <div className="shrink-0 text-left font-medium">
                              <span className="text-xs font-medium text-slate-200 uppercase group-hover/log:text-emerald-500 transition-colors tabular-nums text-left underline underline-offset-2 decoration-current/10">{log.time}</span>
                           </div>
                           <p className="text-xs font-medium text-slate-300 group-hover/log:text-slate-950 transition-colors uppercase tracking-normal leading-tight text-left underline underline-offset-2 decoration-current/5">{log.action}</p>
                        </div>
                      ))}
                   </div>
                </div>
             </motion.div>
          </div>
        </motion.div>

        {/* Global Hub Authority terminal indicator UI Matrix Architecture Display Logic protocol  display protocol */}
        <div className="fixed bottom-10 right-10 group z-50 opacity-40 hover:opacity-100 transition-all duration-1000 text-left">
           <div className="flex items-center gap-10 py-4 px-10 bg-white/60 backdrop-blur-3xl rounded-full border border-blue-50 shadow-4xl cursor-default text-left shadow-glow">
              <div className="relative text-left">
                 <Terminal size={24} className="text-indigo-600 animate-pulse text-left shadow-glow" />
                 <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 text-left" />
              </div>
               <div className="flex flex-col text-left">
                  <p className="text-sm font-medium uppercase tracking-normal text-slate-950 leading-none text-left h-3">SCHOOL_MANAGEMENT</p>
                  <div className="flex items-center gap-4 mt-2.5 text-xs font-medium uppercase text-indigo-600 tracking-widest leading-none text-left h-4">
                     <Database size={14} className="text-left" /> Matrix: Sovereign :: Institutional master node 
                  </div>
               </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default SchoolManagement;