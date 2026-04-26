import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Zap, Crown, Flame,
  Award, Medal, User, BrainCircuit,
  ShieldCheck, ArrowUpRight, GraduationCap
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

  useEffect(() => {
    fetchData();
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
      <div className="min-h-screen bg-[#fafafc] flex flex-col items-center justify-center space-y-4">
         <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}>
            <BrainCircuit className="text-indigo-500" size={48} />
         </motion.div>
         <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Gamification...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <Layout userRole="student">
      <div className="min-h-screen bg-[#fafafc] p-6 md:p-8 font-sans pb-20">
        <motion.div 
          className="max-w-[1400px] mx-auto space-y-8"
          variants={containerVariants}
          initial="hidden" animate="visible"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-10 border-b border-slate-200 pb-8">
             <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-100 mb-4">
                  <Trophy size={14} /> Learning Leaderboard
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none mb-2">
                   Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Progress</span>
                </h1>
                <p className="text-slate-500 font-medium">Track your academic milestones, participation streaks, and global standing across the platform.</p>
             </div>
             
             <div className="flex items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm gap-6">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100">
                   <Crown size={32} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Global Standing</p>
                   <p className="text-3xl font-black text-slate-800 tracking-tight">#{profile.ranking.global}</p>
                </div>
             </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { label: 'Total Points', value: profile.points.lifetime.toLocaleString(), icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
               { label: 'Level', value: profile.level.current, sub: profile.level.title, icon: Crown, color: 'text-indigo-600', bg: 'bg-indigo-50' },
               { label: 'Current Streak', value: profile.streaks.current, sub: `Best: ${profile.streaks.longest} Days`, icon: Flame, color: 'text-rose-500', bg: 'bg-rose-50' },
               { label: 'Total Badges', value: badges.length, icon: Award, color: 'text-blue-600', bg: 'bg-blue-50' }
             ].map((stat, i) => (
               <div key={i} className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                     <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                       <stat.icon size={28} />
                     </div>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                  {stat.sub && <p className="text-xs font-bold text-slate-400 mt-2">{stat.sub}</p>}
               </div>
             ))}
          </motion.div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 pt-6">
             {['Overview', 'Badges', 'Leaderboard'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab.toLowerCase())}
                 className={cn(
                   "px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                   activeTab === tab.toLowerCase() 
                     ? "bg-slate-800 text-white shadow-md" 
                     : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                 )}
               >
                 {tab}
               </button>
             ))}
          </div>

          {/* Tab Content */}
          <div className="mt-8">
             <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                  >
                        {/* Progress */}
                        <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-sm">
                           <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                              <Target className="text-indigo-500" /> Current Progress
                           </h3>
                           
                           <div className="flex justify-between items-end mb-6">
                              <div>
                                 <p className="text-6xl font-black text-slate-800 tracking-tight">
                                    {profile.progress.progressPercentage.toFixed(0)}<span className="text-2xl text-indigo-500 ml-1">%</span>
                                 </p>
                                 <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Level {profile.level.current} → {profile.level.current + 1}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-xl font-black text-slate-800">{profile.points.total.toLocaleString()}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ {profile.progress.pointsForNextLevel.toLocaleString()} PTS</p>
                              </div>
                           </div>
                           
                           <div className="h-4 bg-slate-100 rounded-full overflow-hidden w-full mb-8">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${profile.progress.progressPercentage}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500" 
                              />
                           </div>
                        </div>

                        {/* Recent Activity Mini-Stats */}
                        <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-sm">
                           <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                              <Activity className="text-emerald-500" /> Platform Statistics
                           </h3>
                           <div className="grid grid-cols-2 gap-6">
                              {[
                                { label: 'Study Sessions', val: profile.stats.totalSessions, color: 'text-indigo-600', icon: GraduationCap, bg: 'bg-indigo-50' },
                                { label: 'Modules Passed', val: profile.stats.coursesCompleted, color: 'text-emerald-600', icon: ShieldCheck, bg: 'bg-emerald-50' },
                                { label: 'Current Rank', val: `#${profile.ranking.global}`, color: 'text-amber-600', icon: Crown, bg: 'bg-amber-50' },
                                { label: 'Weekly Change', val: `+${profile.points.earnedThisWeek || 0}`, color: 'text-blue-600', icon: Zap, bg: 'bg-blue-50' }
                              ].map((s, i) => (
                                <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
                                   <s.icon className={cn("mb-4", s.color)} size={24} />
                                   <p className="text-xl font-black text-slate-800 tracking-tight">{s.val}</p>
                                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
                                </div>
                              ))}
                           </div>
                        </div>
                  </motion.div>
                )}

                {activeTab === 'badges' && (
                  <motion.div
                    key="badges"
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
                  >
                     {badges.map((b, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
                           <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 text-white hover:scale-110 transition-transform" style={{ background: b.badge?.color || '#6366f1' }}>
                              {b.badge?.icon ? (
                                 <img src={b.badge.icon} alt={b.badge.name} className="w-10 h-10 object-contain filter drop-shadow-md" />
                              ) : (
                                 <Medal className="w-8 h-8" />
                              )}
                           </div>
                           <h4 className="text-sm font-bold text-slate-800 leading-tight mb-2">{b.badge?.name || 'Trophy'}</h4>
                           <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-md text-[10px] font-bold uppercase tracking-widest text-slate-500">
                             {b.badge?.tier || 'Standard'}
                           </span>
                        </div>
                     ))}
                     {badges.length === 0 && (
                        <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50 flex flex-col items-center gap-4">
                           <Award className="w-16 h-16 text-slate-300" />
                           <p className="text-sm font-bold text-slate-500">No badges earned yet. Keep learning!</p>
                        </div>
                     )}
                  </motion.div>
                )}

                {activeTab === 'leaderboard' && (
                  <motion.div
                    key="leaderboard"
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                  >
                     <div className="flex bg-white p-2 rounded-2xl border border-slate-200 max-w-xl mx-auto shadow-sm mb-8">
                        {[
                          { id: 'global', icon: Crown, label: 'Global' },
                          { id: 'weekly', icon: Zap, label: 'Weekly' },
                          { id: 'streaks', icon: Flame, label: 'Streaks' }
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => fetchLeaderboard(t.id)}
                            className={cn(
                               "flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex-1",
                               leaderboardType === t.id 
                                 ? "bg-indigo-50 text-indigo-700" 
                                 : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                            )}
                          >
                            <t.icon size={16} />
                            {t.label}
                          </button>
                        ))}
                     </div>

                     <div className="space-y-4 max-w-4xl mx-auto">
                        {leaderboard.map((u, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={cn(
                              "flex items-center justify-between px-8 py-5 rounded-[2rem] border transition-all text-left",
                              i < 3 ? 'bg-white border-slate-200 shadow-md scale-[1.02] z-10' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-sm'
                            )}
                          >
                             <div className="flex items-center gap-6">
                                <div className={cn(
                                  "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border",
                                  i === 0 ? 'bg-amber-100 text-amber-600 border-amber-200' :
                                  i === 1 ? 'bg-slate-200 text-slate-700 border-slate-300' :
                                  i === 2 ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                  'bg-white text-slate-500 border-slate-200'
                                )}>
                                  {i + 1}
                                </div>
                                <div className="flex items-center gap-6">
                                   <div className="w-12 h-12 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-sm">
                                      <User size={20} className="text-slate-400" />
                                   </div>
                                   <div>
                                      <p className="text-lg font-black text-slate-800 tracking-tight">{u.user?.name || 'Student'}</p>
                                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Level {u.level?.current || 1}</p>
                                   </div>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className={cn("text-3xl font-black tracking-tight", i < 3 ? 'text-indigo-600' : 'text-slate-800')}>
                                   {(leaderboardType === 'streaks' ? u.currentStreak : (u.points?.lifetime || 0)).toLocaleString()}
                                </p>
                                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-1">
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
      </div>
    </Layout>
  );
};

export default GamificationDashboard;