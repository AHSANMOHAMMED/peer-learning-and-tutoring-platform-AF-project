import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Zap, TrendingUp, Award,
  Medal, Crown, Flame, ChevronRight,
  Target, Rocket, Sparkles, User, 
  BrainCircuit, LayoutDashboard, ShieldCheck, Activity,
  Binary,
  Cpu,
  Signal,
  Layers,
  Globe2,
  GraduationCap,
  Terminal,
  Database,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';

const GamificationDashboard = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState('global');
  const [latency, setLatency] = useState(14);
  const [syncStatus, setSyncStatus] = useState('PEAK');

  const fetchPulse = async () => {
    try {
      const { data } = await api.get('/system/pulse');
      if (data.success) {
        setLatency(data.data.global.latency || 14);
        setSyncStatus(data.data.global.syncStatus || 'PEAK');
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchData();
    fetchPulse();
    const pulseInterval = setInterval(fetchPulse, 30000);
    return () => clearInterval(pulseInterval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, badgesRes] = await Promise.all([
        api.get('/gamification/profile'),
        api.get('/gamification/badges/my')
      ]);

      if (profileRes.data.success) {
        setProfile(profileRes.data.data);
      }
      if (badgesRes.data.success) {
        setBadges(badgesRes.data.data.badges);
      }
      await fetchLeaderboard('global');
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (type) => {
    try {
      const res = await api.get(`/gamification/leaderboard?type=${type}&limit=20`);
      if (res.data.success) {
        setLeaderboard(res.data.data.leaderboard);
        setLeaderboardType(type);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-12 text-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-center">
           <BrainCircuit className="text-indigo-600 animate-pulse filter drop-shadow-glow" size={60} />
        </motion.div>
        <p className="text-sm font-medium uppercase tracking-normal text-slate-400 animate-pulse">SYNCING_MERIT...</p>
      </div>
    );
  }

  if (!profile) return null;

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
          <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-2.5 bg-white/60 backdrop-blur-3xl rounded-xl border border-blue-50 shadow-sm text-left">
             <div className="flex items-center gap-6 text-left">
                <div className="flex items-center gap-2.5 text-left text-left">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.4)] text-left" />
                   <span className="text-xs font-medium uppercase tracking-widest text-slate-950 leading-none text-left">Aura Learning Global Dashboard</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400 text-left">
                   <Signal size={12} className="text-indigo-500 text-left" />
                   <span className="text-xs font-medium uppercase tracking-widest tabular-nums leading-none text-left">{latency}MS_DELAY :: </span>
                </div>
                <div className="hidden lg:flex items-center gap-2.5 text-slate-400 text-left">
                   <Activity size={12} className="text-emerald-500 text-left" />
                   <span className="text-xs font-medium uppercase tracking-widest leading-none text-left">Flux_Capacity::OK</span>
                </div>
             </div>
             <div className="flex items-center gap-4 text-left">
                <div className="px-3.5 py-1.5 bg-slate-950 text-white rounded-lg text-xs font-medium uppercase tracking-widest shadow-lg text-center border border-white/5">
                   Profile Stats
                </div>
             </div>
          </div>

          {/* Performance Matrix Hero HUB Protocol Architecture Central Matrix Protocol Display Architecture */}
          <motion.div 
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl bg-indigo-600 p-6 md:p-12 text-white shadow-4xl text-left group"
          >
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none text-right" />
            
            <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12 text-left">
              <div className="flex-1 max-w-4xl space-y-8 text-left">
                <div className="flex items-center gap-5 text-left">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-4xl text-center shrink-0 group-hover:rotate-6 transition-all duration-1000">
                    <Trophy size={28} className="text-white filter drop-shadow-glow text-left" />
                  </div>
                  <div className="text-left text-left">
                     <span className="text-xs font-medium tracking-widest uppercase text-indigo-100 leading-none text-left">Academic Achievement & Recognition Dashboard</span>
                     <div className="flex items-center gap-3 mt-2 text-left">
                        <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse text-left shadow-glow" />
                        <span className="text-xs font-medium uppercase text-white/50 tracking-widest text-left">Activity Synchronized</span>
                     </div>
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-medium tracking-tighter leading-none uppercase text-white text-left px-0">
                   Progress & <br />
                   <span className="text-blue-200">Achievement.</span>
                </h1>
                <p className="text-indigo-100 text-base font-medium leading-relaxed max-w-lg px-0 text-left underline decoration-white/10 underline-offset-8">
                   Track your academic milestones, participation streaks, and global standing across the Aura network.
                </p>
              </div>

              {/* Global Rank Node Terminal Interface Design Logic architecture Display protocol */}
              <div className="text-center bg-white/10 backdrop-blur-3xl p-10 rounded-3xl border border-white/20 shadow-4xl relative overflow-hidden group/rank shrink-0 w-80 text-center cursor-default transition-all duration-1000 hover:bg-white/15">
                 <div className="absolute top-0 right-0 p-6 opacity-10 group-hover/rank:rotate-12 transition-transform duration-1000 text-right"><Crown size={140} /></div>
                 <div className="relative z-10 space-y-6 text-center">
                    <p className="text-sm font-medium uppercase text-indigo-100 tracking-normal mb-4 leading-none text-center">Global Rank</p>
                    <p className="text-7xl font-medium tabular-nums tracking-tighter leading-none text-white text-center">
                      #{profile.ranking.global}
                    </p>
                    <p className="text-base font-medium text-blue-200 uppercase tracking-widest leading-none text-center mt-3">Overall Standing</p>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Core Stats Matrix Tier Architecture Node Grid display logic terminal interface display protocol */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
             {[
               { label: 'Total Points', value: profile.points.lifetime.toLocaleString(), icon: Star, color: 'text-amber-500', bg: 'bg-amber-50/20' },
               { label: 'Scholastic Level', value: profile.level.current, sub: profile.level.title.toUpperCase(), icon: Crown, color: 'text-white', bg: 'bg-indigo-600' },
               { label: 'Current Streak', value: profile.streaks.current, sub: `Best: ${profile.streaks.longest} Days`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50/20' },
               { label: 'My Badges', value: badges.length, sub: 'Earned Recognition', icon: Award, color: 'text-blue-600', bg: 'bg-blue-50/20' }
             ].map((stat, i) => (
               <div key={i} className="group bg-white border border-blue-50 p-8 rounded-2xl shadow-xl hover:shadow-4xl transition-all duration-1000 relative overflow-hidden text-center cursor-pointer active:scale-95 border border-slate-100">
                  <div className={cn("inline-flex p-4 rounded-xl mb-6 shadow-inner border border-slate-50 text-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000", stat.bg)}>
                    <stat.icon className={cn("text-left", stat.color)} size={24} />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-widest text-slate-300 mb-2 leading-none text-center">{stat.label}</p>
                  <p className="text-4xl font-medium tracking-tighter text-slate-950 leading-none text-center">{stat.value}</p>
                  {stat.sub && <p className="text-xs font-medium text-slate-200 mt-4 uppercase tracking-widest leading-none text-center underline decoration-slate-100 underline-offset-4">{stat.sub}</p>}
               </div>
             ))}
          </motion.div>

          {/* Navigation Hub Strip UI Architecture Protocol Display terminal logic interface */}
          <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-100 max-w-fit mx-auto shadow-inner text-center">
             {['Overview', 'Badges', 'Leaderboard'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab.toLowerCase())}
                 className={cn(
                   "px-10 py-3 rounded-xl text-sm font-medium uppercase tracking-normal transition-all duration-1000 text-center active:scale-95",
                   activeTab === tab.toLowerCase() 
                     ? "bg-slate-950 text-white shadow-4xl scale-105 border border-white/10" 
                     : "text-slate-300 hover:text-slate-950"
                 )}
               >
                 {tab.toUpperCase()}
               </button>
             ))}
          </div>

          {/* Tab Repository Area Terminal Architecture UI Display Matrix protocol Architecture */}
          <div className="min-h-[600px] text-left pb-20">
             <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, scale: 0.98, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -15 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-left"
                  >
                        {/* Progression Hub Terminal Primary UI Protocol architecture logic display interface */}
                        <div className="lg:col-span-12 xl:col-span-7 space-y-10 text-left">
                           <h3 className="text-xl font-medium tracking-tighter flex items-center gap-5 uppercase text-slate-950 leading-none text-left px-0">
                              <Target className="text-indigo-600 text-left" size={24} /> Learning Growth
                           </h3>
                           <div className="bg-white border border-blue-50 p-10 md:p-14 rounded-3xl relative overflow-hidden group shadow-4xl text-left border border-slate-100">
                              <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-transform duration-[3000ms] text-right"><Binary size={180} /></div>
                              <div className="relative z-10 text-left">
                                 <div className="flex flex-col sm:flex-row justify-between items-end gap-12 mb-12 text-left">
                                    <div className="text-left text-left">
                                       <p className="text-8xl font-medium tracking-tighter tabular-nums text-slate-950 leading-none text-left">
                                          {profile.progress.progressPercentage.toFixed(0)}<span className="text-3xl text-indigo-600 ml-3">%</span>
                                       </p>
                                       <p className="text-sm font-medium uppercase text-slate-300 tracking-normal mt-10 leading-none text-left">Level {profile.level.current} → {profile.level.current + 1}</p>
                                    </div>
                                    <div className="text-right text-right">
                                       <p className="text-4xl font-medium text-slate-950 tabular-nums leading-none tracking-tighter text-right">{profile.points.total.toLocaleString()}</p>
                                       <p className="text-sm font-medium text-slate-200 uppercase tracking-normal mt-4 leading-none text-right">/ {profile.progress.pointsForNextLevel.toLocaleString()} Points Required</p>
                                    </div>
                                 </div>
                                 <div className="h-3 bg-slate-50 border border-slate-100 rounded-full overflow-hidden shadow-inner relative text-left p-0.5">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${profile.progress.progressPercentage}%` }}
                                      transition={{ duration: 2, ease: "easeOut" }}
                                      className="h-full rounded-full bg-indigo-600 shadow-glow text-left" 
                                    />
                                 </div>
                                 <div className="flex items-center gap-4 mt-12 text-left">
                                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-glow-emerald text-left" />
                                    <p className="text-sm font-medium uppercase tracking-normal text-slate-400 text-left">Syncing your latest achievements...</p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Operational Metrics Secondary Grid UI Architecture Display Logic terminal architecture protocol */}
                        <div className="lg:col-span-12 xl:col-span-5 space-y-10 text-left">
                           <h3 className="text-xl font-medium tracking-tighter flex items-center gap-5 uppercase text-slate-950 leading-none text-left px-0">
                              <Activity className="text-indigo-600 text-left" size={24} /> Dashboard Statistics
                           </h3>
                           <div className="grid grid-cols-2 gap-6 text-left">
                              {[
                                { label: 'Sync Sessions', val: profile.stats.totalSessions, color: 'text-indigo-600', icon: GraduationCap },
                                { label: 'Unit Mastery', val: profile.stats.coursesCompleted, color: 'text-blue-600', icon: ShieldCheck },
                                { label: 'Global Rank', val: `#${profile.ranking.global}`, color: 'text-slate-950', icon: Crown },
                                { label: 'Weekly Delta_Flux', val: `+${profile.points.earnedThisWeek}`, color: 'text-rose-600', icon: Zap }
                              ].map((s, i) => (
                                <div key={i} className="bg-white border border-blue-50 p-8 rounded-3xl hover:shadow-4xl transition-all duration-1000 text-left group cursor-pointer shadow-xl border border-slate-100 hover:border-indigo-100 active:scale-95 relative overflow-hidden">
                                   <div className="flex justify-between items-start mb-8 text-left">
                                      <p className={cn("text-4xl font-medium leading-none tracking-tighter text-left", s.color)}>{s.val}</p>
                                      <s.icon className={cn("opacity-10 text-left group-hover:opacity-100 transition-opacity duration-1000", s.color)} size={24} />
                                   </div>
                                    <p className="text-xs font-medium uppercase tracking-normal text-slate-300 text-left leading-none">{s.label.toUpperCase()}</p>
                                </div>
                              ))}
                           </div>
                        </div>
                  </motion.div>
                )}

                {activeTab === 'badges' && (
                  <motion.div
                    key="badges"
                    initial={{ opacity: 0, scale: 0.98, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -15 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 text-left"
                  >
                     {badges.map((b, i) => (
                        <div key={i} className="group bg-white border border-blue-50 rounded-3xl p-8 text-center hover:shadow-4xl transition-all duration-[1500ms] relative overflow-hidden shadow-xl text-center cursor-pointer border border-slate-100 active:scale-95">
                           <div className="flex flex-col items-center relative z-10 text-center">
                              <div className="w-20 h-20 rounded-2xl mb-8 flex items-center justify-center relative shadow-4xl overflow-hidden border border-white/20 text-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000" style={{ background: b.badge?.color || '#4f46e5' }}>
                                 {b.badge?.icon ? (
                                    <img src={b.badge.icon} alt={b.badge.name} className="w-12 h-12 object-contain filter drop-shadow-glow text-center" />
                                 ) : (
                                    <Medal className="w-12 h-12 text-white/40 text-center" />
                                 )}
                                 <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                              </div>
                              <h4 className="text-[12px] font-medium text-slate-950 uppercase tracking-tight mb-4 leading-[1.1] text-center line-clamp-2 h-8">{b.badge?.name?.toUpperCase()?.replace(/ /g, '_')}</h4>
                               <span className="px-4 py-2 bg-slate-50 border border-slate-50 rounded-xl text-xs font-medium uppercase tracking-normal text-slate-300 text-center group-hover:bg-slate-950 group-hover:text-white transition-all duration-1000 overflow-hidden shadow-inner">
                                 {b.badge?.tier?.toUpperCase() || 'ARCHIVE'}
                              </span>
                           </div>
                        </div>
                     ))}
                     {badges.length === 0 && (
                        <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem] opacity-30 flex flex-col items-center gap-8 bg-slate-50/50 text-center shadow-inner">
                           <Award className="w-20 h-20 text-slate-200 text-center filter drop-shadow-glow" />
                           <p className="text-base font-medium uppercase tracking-normal text-slate-300 text-center">NO_HONORS_DETECTED_SECTOR</p>
                        </div>
                     )}
                  </motion.div>
                )}

                {activeTab === 'leaderboard' && (
                  <motion.div
                    key="leaderboard"
                    initial={{ opacity: 0, scale: 0.98, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -15 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-12 text-left"
                  >
                     <div className="flex bg-slate-50 p-2 rounded-[2rem] border border-slate-100 max-w-2xl mx-auto shadow-inner text-center">
                        {[
                          { id: 'global', icon: Crown, label: 'Global' },
                          { id: 'weekly', icon: Zap, label: 'Weekly' },
                          { id: 'streaks', icon: Flame, label: 'Streaks' }
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => fetchLeaderboard(t.id)}
                            className={cn(
                               "flex items-center justify-center gap-4 px-8 py-3.5 rounded-full text-sm font-medium uppercase tracking-normal transition-all duration-1000 text-center flex-1 active:scale-95",
                               leaderboardType === t.id 
                                 ? "bg-slate-950 text-white shadow-4xl scale-105 border border-white/10" 
                                 : "text-slate-300 hover:text-slate-950"
                            )}
                          >
                            <t.icon size={16} className="text-center" />
                            {t.label}
                          </button>
                        ))}
                     </div>

                     <div className="space-y-4 max-w-6xl mx-auto text-left">
                        {leaderboard.map((u, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -25 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={cn(
                              "flex items-center justify-between px-10 py-6 rounded-3xl border transition-all duration-1000 text-left relative overflow-hidden group/row shadow-xl text-left cursor-default",
                              i < 3 ? 'bg-white border-indigo-100 shadow-4xl scale-[1.01]' : 'bg-white border-slate-50 hover:bg-slate-50 hover:border-indigo-50'
                            )}
                          >
                             <div className="flex items-center gap-10 text-left text-left">
                                <div className={cn(
                                  "w-14 h-14 rounded-2xl flex items-center justify-center font-medium text-2xl shadow-4xl transition-all duration-1000 text-center shrink-0 border border-white/20 group-hover/row:rotate-12",
                                  i === 0 ? 'bg-amber-500 text-white shadow-glow-amber' :
                                  i === 1 ? 'bg-slate-300 text-slate-950 shadow-glow' :
                                  i === 2 ? 'bg-amber-700 text-white shadow-glow' :
                                  'bg-slate-50 text-slate-200 border border-slate-100 shadow-inner'
                                )}>
                                  {i + 1}
                                </div>
                                <div className="flex items-center gap-8 text-left text-left">
                                   <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center relative shadow-inner text-left shrink-0 group-hover/row:bg-white transition-all duration-1000">
                                      <User size={24} className="text-slate-300 group-hover/row:text-indigo-600 transition-all duration-1000 text-center" />
                                   </div>
                                   <div className="text-left text-left">
                                      <p className="text-xl font-medium text-slate-950 tracking-tighter leading-none mb-2 text-left line-clamp-1">{u.user?.name || 'CANDIDATE'}</p>
                                      <p className="text-sm font-medium uppercase text-slate-300 tracking-normal leading-none text-left underline decoration-indigo-50 underline-offset-4">Level {u.level?.current || 1}</p>
                                   </div>
                                </div>
                             </div>
                             <div className="text-right text-right">
                                <p className={cn("text-4xl font-medium tabular-nums tracking-tighter leading-none text-right", i < 3 ? 'text-indigo-600' : 'text-slate-950')}>
                                   {(leaderboardType === 'streaks' ? u.currentStreak : (u.points?.lifetime || 0)).toLocaleString()}
                                </p>
                                <p className="text-sm font-medium uppercase text-slate-200 tracking-normal mt-3.5 leading-none text-right">
                                   {leaderboardType === 'streaks' ? 'Day Streak' : 'Total Points'}
                                </p>
                             </div>
                          </motion.div>
                        ))}
                     </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </motion.div>

        {/* Global Hub Authority terminal indicator UI Architecture Display Logic terminal architecture protocol interface display */}
        <div className="fixed bottom-8 right-8 group z-50 opacity-40 hover:opacity-100 transition-all duration-1000 text-left">
           <div className="flex items-center gap-10 py-5 px-10 bg-white/60 backdrop-blur-3xl rounded-full border border-blue-50 shadow-4xl cursor-default text-left">
              <div className="relative text-left">
                 <Terminal size={24} className="text-indigo-600 animate-pulse text-left shadow-glow" />
                 <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 text-left" />
              </div>
              <div className="flex flex-col text-left text-left">
                 <p className="text-sm font-medium uppercase tracking-widest text-slate-950 leading-none text-left h-3">Aura Progress</p>
                 <div className="flex items-center gap-5 mt-2.5 text-xs font-medium uppercase text-indigo-600 tracking-widest leading-none text-left h-4">
                    <Database size={14} className="text-left" /> Ranking: #{profile.ranking.global} Global
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default GamificationDashboard;