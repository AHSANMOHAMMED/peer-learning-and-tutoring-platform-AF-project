import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronRight, CheckCircle2, Clock, Flame, Percent, Sparkles, BookOpen, Users, Zap, ArrowRight, ShieldCheck, Gamepad2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

import Layout from '../components/Layout';
import { useAuth } from '../controllers/useAuth';
import { useTutors } from '../controllers/useTutors';
import { useBookings } from '../controllers/useBookings';
import api from '../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fetchTutors } = useTutors();
  const { bookings, fetchBookings } = useBookings();
  const [myGroups, setMyGroups] = useState([]);
  const [gamificationProfile, setGamificationProfile] = useState(null);
  const [loadingGamification, setLoadingGamification] = useState(true);

  const [gameCatalog, setGameCatalog] = useState([]);

  useEffect(() => {
    fetchTutors();
    fetchBookings();
    fetchMyGroups();
    fetchGamification();
    fetchGameCatalog();
  }, [fetchTutors, fetchBookings]);

  const fetchGameCatalog = async () => {
    try {
      const res = await api.get('/gamification/catalog');
      if (res.data.success) {
        setGameCatalog(res.data.data.catalog || []);
      }
    } catch (err) {
      console.error('Game catalog fetch error:', err);
    }
  };

  const activeChallenge = gameCatalog[0] || { title: 'No active challenge', difficulty: 'N/A' };

  const fetchGamification = async () => {
    try {
      setLoadingGamification(true);
      const res = await api.get('/gamification/profile');
      if (res.data.success) {
        setGamificationProfile(res.data.data);
      }
    } catch (err) {
      console.error('Gamification fetch error:', err);
    } finally {
      setLoadingGamification(false);
    }
  };

  const fetchMyGroups = async () => {
    try {
      const res = await api.get('/groups/my-rooms');
      if (res.data.success) {
        setMyGroups(res.data.data?.groupRooms || res.data.data || []);
      }
    } catch (err) {
      console.error('Groups fetch error:', err);
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'scheduled').slice(0, 3);
  
  const stats = {
    streakDays: gamificationProfile?.streaks?.current || 0,
    lessonDone: gamificationProfile?.stats?.totalSessions || 0,
    studyTime: user?.totalLearningHours ? `${Math.floor(user.totalLearningHours)}h ${Math.round((user.totalLearningHours % 1) * 60)}m` : "0h 0m",
    points: gamificationProfile?.points?.lifetime || 0,
    level: gamificationProfile?.level?.current || 1,
    levelTitle: gamificationProfile?.level?.title || 'Novice'
  };

  const performanceData = [
    { name: 'Mastery', val: Math.min(100, (gamificationProfile?.stats?.coursesCompleted || 0) * 20), fill: '#60a5fa' },
    { name: 'Progress', val: Math.round(gamificationProfile?.level?.progress || 0), fill: '#4f46e5' },
    { name: 'Goals', val: Math.min(100, (gamificationProfile?.stats?.totalSessions || 0) * 5), fill: '#10b981' },
    { name: 'Effort', val: Math.min(100, (gamificationProfile?.stats?.totalHours || 0) * 2), fill: '#f59e0b' },
    { name: 'Milestone', val: Math.min(100, (gamificationProfile?.badges?.length || 0) * 10), fill: '#8b5cf6' },
    { name: 'Global', val: Math.max(5, 100 - (gamificationProfile?.ranking?.global || 100)), fill: '#334155' },
  ];

  const gaugeData = [
    { name: 'Done', value: Math.round(gamificationProfile?.level?.progress || 0) },
    { name: 'Remain', value: 100 - Math.round(gamificationProfile?.level?.progress || 0) }
  ];

  return (
    <Layout userRole="student">
      <div className="max-w-[1400px] mx-auto w-full font-sans">
        
        {/* Header Region */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
           <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-tight mb-2">
                Welcome {user?.profile?.firstName || user?.username || 'Learner'}!
              </h1>
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white rounded-full text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-100">
                    <Sparkles size={12} /> Level {stats.level}: {stats.levelTitle}
                 </div>
                 <p className="text-slate-500 text-[14px] font-medium border-l border-slate-200 pl-3">
                    Start your next step toward success.
                 </p>
              </div>
           </div>
           
           <div className="flex flex-wrap items-center gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-soft min-w-[150px] border-b-4 border-orange-400">
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Current Streak</p>
                    <div className="p-1.5 bg-orange-50 text-orange-500 rounded-lg"><Flame size={14} /></div>
                 </div>
                 <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-black text-slate-800">{stats.streakDays}</h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Day Streak</span>
                 </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-soft min-w-[150px] border-b-4 border-indigo-500">
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Merit Points</p>
                    <div className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg"><Sparkles size={14} /></div>
                 </div>
                 <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-black text-slate-800">{stats.points.toLocaleString()}</h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Lifetime</span>
                 </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-soft min-w-[150px] border-b-4 border-emerald-500">
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Global Rank</p>
                    <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg"><Users size={14} /></div>
                 </div>
                 <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-black text-slate-800">#{gamificationProfile?.ranking?.global || '--'}</h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Overall</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Charts Region */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
           
           <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-soft">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-bold text-slate-800">Performance Overview</h2>
                 <span className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">+15% from last week</span>
              </div>
              <div className="h-60">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData} maxBarSize={60}>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 13, fill: '#64748b', fontWeight: 500}} dy={15} />
                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)'}} />
                       {/* Background Bar */}
                       <Bar dataKey="val" fill="#f1f5f9" radius={[12, 12, 12, 12]} barSize={50} />
                       {/* Foreground Bar mapped through data */}
                       <Bar dataKey="val" radius={[12, 12, 12, 12]} barSize={50}>
                         {performanceData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} />
                         ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white rounded-3xl p-8 shadow-soft flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-slate-800">Daily Study Progress</h2>
                 <span className="font-bold text-slate-400">...</span>
              </div>
              <div className="flex-1 relative flex items-center justify-center h-48">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={gaugeData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={80} outerRadius={120} paddingAngle={0} dataKey="value" stroke="none">
                          <Cell key="cell-0" fill="#a08b7d" />
                          <Cell key="cell-1" fill="#f1f5f9" />
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute bottom-4 text-center">
                    <h3 className="text-4xl font-black text-slate-800">
                       {Math.round(gamificationProfile?.progress?.progressPercentage || 0)}%
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">Goal Progress</p>
                 </div>
              </div>
           </div>

        </div>

        <div className="mb-6 rounded-3xl bg-white p-6 shadow-soft border border-cyan-100">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                <Gamepad2 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Refresh Zone</h2>
                <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
                  Take a short reset with Tic Tac Toe, Memory Cards, Bubble Pop, Tap Speed, or a quick puzzle.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/refresh-zone')}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#00a8cc] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#008ba8] active:scale-95"
            >
              Start Break <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           <div className="bg-white rounded-3xl p-8 shadow-soft">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-slate-800">Next Lessons</h2>
                 <Link to="/bookings" className="text-xs font-bold text-[#00a8cc] hover:underline">Schedule</Link>
              </div>
              <div className="space-y-4">
                 {upcomingBookings.length > 0 ? upcomingBookings.map((b, i) => (
                    <div key={i} className="flex items-center gap-4 bg-[#fcfcfc] border border-slate-100 p-4 rounded-2xl hover:border-[#00a8cc] transition-colors cursor-pointer" onClick={() => navigate(`/session/${b._id}`)}>
                       <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold">
                          {b.subject?.[0]}
                       </div>
                       <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{b.subject}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">{new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {b.tutorId?.name || 'Tutor'}</p>
                       </div>
                       <ChevronRight size={16} className="text-slate-300" />
                    </div>
                 )) : (
                    <div className="p-10 text-center text-sm text-slate-400 border border-dashed rounded-2xl border-slate-200">
                       No lessons scheduled.
                       <button onClick={() => navigate('/tutors')} className="mt-4 block w-full py-2 bg-slate-50 rounded-xl text-xs font-bold text-[#00a8cc]">Find Tutors</button>
                    </div>
                 )}
              </div>
           </div>

            {/* Learning Arena */}
            <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-1000"><Zap size={140} /></div>
               <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                     <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <Zap className="text-amber-400" size={24} />
                        Learning Arena
                     </h2>
                     <p className="text-slate-400 text-sm mb-6">Level up your mastery through interactive academic challenges.</p>
                     
                     <div className="space-y-4 mb-8">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Active Challenge</span>
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                                 {activeChallenge.difficulty || 'NEW'}
                              </span>
                           </div>
                           <h4 className="font-bold">{activeChallenge.title || 'Academic Speed Challenge'}</h4>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => navigate(activeChallenge.gameId ? `/games/${activeChallenge.gameId}` : '/games')} className="w-full bg-amber-400 text-slate-900 font-bold py-3.5 rounded-xl hover:bg-amber-300 transition-all active:scale-95 flex items-center justify-center gap-2">
                     Enter Arena <ArrowRight size={18} />
                  </button>
               </div>
            </div>

            {/* Badge Collection */}
            <div className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 flex flex-col">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Badge Collection</h2>
                  <Link to="/gamification" className="text-xs font-bold text-indigo-600 hover:underline">All Badges</Link>
               </div>
               
               <div className="flex-1">
                  {gamificationProfile?.badges?.length > 0 ? (
                     <div className="grid grid-cols-4 gap-3">
                        {gamificationProfile.badges.slice(0, 8).map((b, i) => (
                           <div key={i} className="aspect-square rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group/badge relative cursor-pointer" title={b.badge?.name}>
                              {b.badge?.icon ? (
                                 <img src={b.badge.icon} className="w-8 h-8 object-contain filter grayscale group-hover/badge:grayscale-0 transition-all" alt={b.badge.name} />
                              ) : (
                                 <ShieldCheck size={20} className="text-slate-300 group-hover/badge:text-indigo-500 transition-all" />
                              )}
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                           <Sparkles size={24} className="text-slate-200" />
                        </div>
                        <p className="text-sm font-medium text-slate-400">Collaborate and compete to earn your first badge!</p>
                     </div>
                  )}
               </div>
              
              <div className="mt-8 pt-6 border-t border-slate-50">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next Milestone</span>
                    <span className="text-xs font-bold text-indigo-600">{gamificationProfile?.progress?.pointsToNextLevel} PTs left</span>
                 </div>
                 <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                    <div 
                       className="h-full bg-indigo-600 rounded-full" 
                       style={{ width: `${gamificationProfile?.progress?.progressPercentage || 0}%` }}
                    />
                 </div>
              </div>
           </div>

        </div>

        {/* My Learning Groups */}
        <div className="mt-6">
          <div className="bg-white rounded-3xl p-8 shadow-soft">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-[#00a8cc]" />
                <h2 className="text-xl font-bold text-slate-800">My Learning Groups</h2>
              </div>
              <button onClick={() => navigate('/groups')} className="text-sm font-bold text-[#00a8cc] hover:underline">View All</button>
            </div>
            {myGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myGroups.slice(0, 6).map((group, i) => (
                  <div key={group._id || i} className="p-4 bg-[#f8f9fc] rounded-2xl border border-slate-100 hover:border-[#00a8cc] transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00a8cc]/10 text-[#00a8cc] flex items-center justify-center font-bold text-sm">
                        {group.title?.[0] || 'G'}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{group.title || 'Study Group'}</h4>
                        <p className="text-xs text-slate-400 capitalize">{group.subject} &bull; {group.grade}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        <Users size={12} className="inline mr-1" />
                        {group.participants?.length || 0} members
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${group.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {group.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                <Users size={40} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">No groups joined yet. Browse available groups to connect with peers.</p>
                <button onClick={() => navigate('/groups')} className="mt-4 px-6 py-2.5 bg-[#00a8cc] text-white font-bold text-sm rounded-xl hover:bg-[#008ba8] transition-colors">Browse Groups</button>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default StudentDashboard;
