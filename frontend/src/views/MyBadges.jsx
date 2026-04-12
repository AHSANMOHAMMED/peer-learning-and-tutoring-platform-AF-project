import React from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Award,
  Zap,
  Star,
  TrendingUp,
  Target,
  Flame,
  ShieldCheck,
  GraduationCap,
  Lock,
  ArrowUpRight,
  Cpu,
  Binary,
  Signal,
  BadgeCheck,
  Terminal,
  Fingerprint,
  Layers,
  Sparkles,
  Globe2,
  Activity,
  RefreshCw,
  Database,
  Info
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../controllers/useAuth';
import { cn } from '../utils/cn';

const MyBadges = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Current Level', value: user?.gamification?.level || 12, icon: Star, color: 'text-amber-500', glow: 'shadow-amber-500/20' },
    { label: 'Total Points', value: user?.gamification?.points || 8420, icon: Zap, color: 'text-indigo-600', glow: 'shadow-indigo-500/20' },
    { label: 'Learning Streak', value: `${user?.gamification?.streak || 22} Days`, icon: Flame, color: 'text-rose-500', glow: 'shadow-rose-500/20' }
  ];

  const badges = [
    { id: 1, title: 'Calculus Conquerors α', desc: 'Authorized 10 Combined Mathematics synchronizations node matrix sector.', earned: true, icon: Target, date: 'Oct 12' },
    { id: 2, title: 'Biological Ace IX', desc: 'Achieved 100% fidelity on 3 Biological Sciences practice nodes strictly across national hub.', earned: true, icon: ShieldCheck, date: 'Oct 08' },
    { id: 3, title: 'Early Bird TX', desc: 'Engaged a session during 06:00 Hub synchronization window .', earned: true, icon: TrendingUp, date: 'Sep 24' },
    { id: 4, title: 'Collaborator β', desc: 'Participated in 5 group study missions legacy sync nominal.', earned: false, icon: Award, date: 'LOCKED' },
    { id: 5, title: 'Top Scholar SAFE', desc: 'Reached Mastery Level 50 nominal threshold strictly.', earned: false, icon: Trophy, date: 'LOCKED' },
    { id: 6, title: 'Physics Legend Σ', desc: 'Completed the Masterclass node provision  sector.', earned: false, icon: GraduationCap, date: 'LOCKED' }
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
    <Layout userRole="student">
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
          <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-2 bg-white/60 backdrop-blur-3xl rounded-xl border border-blue-50 shadow-sm text-left">
             <div className="flex items-center gap-6 text-left">
                <div className="flex items-center gap-2.5 text-left text-left">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.4)] text-left" />
                   <span className="text-xs font-medium uppercase tracking-widest text-slate-950 leading-none text-left">Merit Rewards Hub α-</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400 text-left">
                   <Trophy size={12} className="text-indigo-600 text-left" />
                   <span className="text-xs font-medium uppercase tracking-widest leading-none text-left">Scholastic_Achievement</span>
                </div>
             </div>
             <div className="px-3.5 py-1.5 bg-slate-950 text-white rounded-lg text-xs font-medium uppercase tracking-widest shadow-lg text-center border border-white/5">
                MASTERY_TRACKER :: 
             </div>
          </div>

          {/* Rewards Academy Hero HUB Architecture Display Matrix */}
          <motion.div 
            variants={itemVariants} 
            className="relative overflow-hidden rounded-2xl bg-indigo-600 p-6 md:p-10 text-white shadow-4xl text-left group"
          >
            <div className="absolute top-0 right-0 w-[6000px] h-[600px] bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none text-right" />
            
            <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12 text-left">
              <div className="flex-1 max-w-4xl space-y-8 text-left">
                <div className="flex items-center gap-5 text-left">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-4xl transition-all duration-1000 group-hover:rotate-12 text-center shrink-0">
                    <Trophy className="text-amber-400 filter drop-shadow-glow text-left" size={28} />
                  </div>
                  <div className="text-left text-left">
                     <span className="text-xs font-medium tracking-widest uppercase text-indigo-100 leading-none text-left">Sovereign Mastery Tracker Hub Matrix α Sector</span>
                     <div className="flex items-center gap-3 mt-2 text-left">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-glow text-left" />
                        <span className="text-xs font-medium uppercase text-white/40 tracking-widest text-left">PROTOCOL_VAULT::GLOBAL</span>
                     </div>
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-medium tracking-tighter leading-none uppercase px-0 text-white text-left">
                   Rewards <br />
                   <span className="text-blue-200">Academy Hub.</span>
                </h1>
                <p className="text-indigo-100 text-base font-bold leading-relaxed max-w-lg px-0 text-left underline decoration-white/10 underline-offset-8">
                   Your academic influence node is expanding across the global grid. Increase rank tiers and provision elite credits to unlock <span className="text-white border-b border-white/20">sovereign governance</span> protocols. Protocol <span className="text-white border-b border-white/20"> </span> .
                </p>
                <div className="flex flex-wrap gap-4 text-left pt-2">
                   {stats.map((stat, i) =>
                     <div key={i} className="px-5 py-3 bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/10 flex items-center gap-4 group/stat hover:bg-white/20 transition-all duration-700 shadow-4xl text-left cursor-default">
                        <stat.icon className={cn(stat.color, "group-hover/stat:scale-110 group-hover/stat:rotate-12 transition-all duration-700 text-center shadow-glow")} size={18} />
                        <div className="text-left">
                            <p className="text-xs font-medium uppercase tracking-normal text-indigo-100 leading-none mb-1 text-left">{stat.label?.toUpperCase()}</p>
                           <p className="text-xl font-medium text-white leading-none tracking-tighter tabular-nums text-left underline underline-offset-4 decoration-white/10">{stat.value}</p>
                        </div>
                     </div>
                   )}
                </div>
              </div>

              {/* Progress Hub Terminal Node UI display Architecture Display Matrix */}
              <div className="relative w-56 h-56 flex items-center justify-center p-8 bg-white/10 backdrop-blur-3xl rounded-full border border-white/10 shadow-4xl group hover:scale-105 transition-all duration-1000 shrink-0 text-center cursor-default">
                 <div className="absolute inset-2 border-[4px] border-white/5 rounded-full text-center" />
                 <div className="absolute inset-2 border-[4px] border-blue-400 border-t-transparent border-l-transparent rounded-full rotate-45 group-hover:rotate-[405deg] transition-transform duration-[4000ms] text-center shadow-glow filter drop-shadow-glow" />
                 <div className="text-center space-y-2 text-center relative z-10">
                    <p className="text-sm font-medium uppercase tracking-normal text-indigo-100 leading-none text-center">TIER_LEVEL</p>
                    <p className="text-5xl font-medium text-white tracking-tighter leading-none text-center tabular-nums filter drop-shadow-glow">78<span className="text-2xl ml-1 text-center">%</span></p>
                    <p className="text-xs font-medium text-indigo-200 uppercase tracking-widest leading-none pt-2 text-center opacity-60">NODEI_VERIFY</p>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Achievement Vault Matrix Section Architecture UI Display Matrix area */}
          <div className="space-y-10 text-left pb-20">
             <div className="flex flex-col md:flex-row items-center justify-between gap-10 px-2 text-left">
                <div className="space-y-3 text-left">
                   <h3 className="text-xl font-medium tracking-tighter uppercase flex items-center gap-5 px-0 text-slate-950 leading-none text-left underline decoration-indigo-50/20 underline-offset-8">
                      <Award size={28} className="text-indigo-600 text-left shadow-glow" /> ACHIEVEMENT_VAULT
                   </h3>
                   <p className="text-sm font-medium text-slate-200 uppercase tracking-widest leading-none px-1 text-left border-l-2 border-slate-50 pl-5">Inventory of verified credentials and scholarly peer-sync protocols    sector</p>
                </div>
                <div className="flex items-center gap-5 px-6 py-3.5 bg-white border border-blue-50 rounded-2xl shadow-4xl shrink-0 group hover:border-indigo-100 transition-all duration-700 cursor-default border border-slate-50 active:scale-[0.98]">
                    <span className="text-xs font-medium text-slate-300 tracking-normal uppercase text-center">GLOBAL_RANKI::</span>
                   <span className="text-indigo-600 font-medium text-sm tracking-widest uppercase group-hover:scale-105 transition-transform text-center shadow-none filter drop-shadow-glow underline underline-offset-4 decoration-indigo-600/10">GRANDMASTER_TIER</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                {badges.map((badge, i) =>
                  <motion.div
                    key={badge.id}
                    variants={itemVariants}
                    className={cn(
                      "group relative p-8 rounded-3xl border transition-all duration-[1000ms] shadow-4xl text-left overflow-hidden cursor-default border border-slate-50",
                      badge.earned ?
                      "bg-white border-blue-50 hover:bg-slate-50/50 hover:border-indigo-100 hover:shadow-4xl active:scale-[0.99] cursor-pointer" :
                      "bg-slate-50 border-dashed border-slate-50 grayscale pointer-events-none opacity-20 shadow-inner"
                    )}
                  >
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:rotate-12 group-hover:scale-125 transition-transform duration-[2000ms] text-right pointer-events-none"><BadgeCheck size={120} /></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                       <div className={cn(
                         "w-20 h-20 rounded-2xl flex items-center justify-center shadow-4xl transition-all duration-1000 border group-hover:scale-110 group-hover:rotate-12 text-center shrink-0 border-white/20",
                         badge.earned ? "bg-slate-950 text-white shadow-indigo-100/20 border-white/5" : "bg-white text-slate-100 border-slate-50"
                       )}>
                         {badge.earned ? <badge.icon size={32} className="group-hover:scale-110 transition-transform text-center shadow-glow" /> : <Lock size={32} className="text-center opacity-20" />}
                       </div>

                       <div className="space-y-3 text-center">
                          <h4 className="text-xl font-medium text-slate-950 uppercase tracking-tighter leading-none px-0 text-center group-hover:text-indigo-600 transition-colors duration-700 underline underline-offset-8 decoration-indigo-50/20">{badge.title?.toUpperCase()}</h4>
                          <p className="text-slate-300 font-medium text-sm uppercase tracking-normal leading-relaxed px-4 group-hover:text-slate-950 transition-colors duration-1000 text-center border-t border-slate-50 pt-4 mt-4">
                             {badge.desc}
                          </p>
                       </div>

                       <div className="w-full pt-6 border-t border-slate-50 flex items-center justify-between text-left border border-slate-50">
                          <div className="flex items-center gap-4 text-left">
                             <Activity size={12} className={cn("text-left transition-colors duration-700", badge.earned ? "text-indigo-600 shadow-glow" : "text-slate-100")} />
                             <span className={cn(
                                "text-xs font-medium uppercase tracking-widest leading-none text-left pt-1 transition-colors duration-700",
                               badge.earned ? "text-indigo-500" : "text-slate-100"
                             )}>
                                SYNC: {badge.date?.toUpperCase()}
                             </span>
                          </div>
                          {badge.earned &&
                            <button className="p-3 bg-slate-50 border border-slate-50 rounded-xl hover:bg-slate-950 hover:text-white transition-all duration-700 shadow-inner active:scale-95 group/btn text-center border border-slate-50">
                               <ArrowUpRight size={18} className="group-hover/btn:translate-x-1.5 group-hover/btn:-translate-y-1.5 transition-transform duration-[1000ms] text-center shadow-glow" />
                            </button>
                          }
                       </div>
                    </div>
                  </motion.div>
                )}
             </div>
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
                 <p className="text-sm font-medium uppercase tracking-normal text-slate-950 leading-none text-left">ACHIEVEMENT_VAULT</p>
                 <div className="flex items-center gap-4 mt-2.5 text-xs font-medium uppercase text-indigo-600 tracking-widest leading-none text-left h-4">
                    <Database size={14} className="text-left" /> Sync: GLOBAL :: Merit_Synchronized_Nominal
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyBadges;