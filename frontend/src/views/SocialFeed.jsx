import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  UserPlus,
  UserMinus,
  Heart,
  MessageCircle,
  Share2,
  ShieldCheck,
  TrendingUp,
  Zap,
  MoreHorizontal,
  LayoutGrid,
  Sparkles,
  ArrowUpRight,
  Globe,
  MapPin,
  Activity,
  Cpu,
  Binary,
  Target,
  Signal,
  BadgeCheck,
  ArrowRight,
  Globe2,
  RefreshCw,
  Terminal,
  Database,
  Fingerprint,
  Layers,
  Clock
} from 'lucide-react';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';

const SocialFeed = () => {
  const [filter, setFilter] = useState('all');

  const users = [
    { id: 1, name: 'Amara de Silva', role: 'Student', level: 14, streak: 22, follows: true, avatar: 'A', district: 'Colombo' },
    { id: 2, name: 'Kasun Perera', role: 'Tutor', level: 45, streak: 120, follows: false, avatar: 'K', district: 'Kandy' },
    { id: 3, name: 'Deepika Jaya', role: 'Student', level: 8, streak: 5, follows: false, avatar: 'D', district: 'Galle' },
    { id: 4, name: 'Tharindu Raj', role: 'Tutor', level: 32, streak: 88, follows: true, avatar: 'T', district: 'Gampaha' }
  ];

  const activities = [
    { id: 1, user: 'Amara de Silva', action: 'completed a Advanced Physics session', time: '2 hours ago', likes: 24, comments: 5, type: 'achievement' },
    { id: 2, user: 'Tharindu Raj', action: 'earned the "Master Mentor" badge', time: '5 hours ago', likes: 120, comments: 18, type: 'badge' },
    { id: 3, user: 'Kasun Perera', action: 'published a new Calculus module', time: '1 day ago', likes: 56, comments: 12, type: 'content' }
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
          <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-2.5 bg-white/60 backdrop-blur-3xl rounded-xl border border-blue-50 shadow-sm text-left">
             <div className="flex items-center gap-10 text-left">
                <div className="flex items-center gap-3 text-left text-left">
                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-glow text-left" />
                   <span className="text-xs font-medium uppercase tracking-widest text-slate-950 leading-none text-left">Student Peer Network - Online</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-left">
                   <Signal size={14} className="text-indigo-500 text-left" />
                   <span className="text-xs font-medium uppercase tracking-widest tabular-nums leading-none text-left">Connectivity: Optimal</span>
                </div>
             </div>
             <div className="flex items-center gap-4 text-left">
                <div className="px-5 py-2 bg-slate-950 text-white rounded-lg text-xs font-medium uppercase tracking-widest shadow-lg text-center border border-white/5 active:scale-95 transition-all outline-none">
                   Network Hub
                </div>
             </div>
          </div>

          {/* Nexus Discovery Hero HUB Protocol Architecture display logic protocol  display */}
          <motion.div 
            variants={itemVariants} 
            className="relative overflow-hidden rounded-2xl bg-indigo-600 p-8 md:p-14 text-white shadow-4xl text-left group"
          >
             <div className="absolute top-0 right-0 w-[6000px] h-[600px] bg-white/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none text-right" />
             
             <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-14 text-left">
                <div className="flex-1 max-w-4xl space-y-10 text-left">
                   <div className="flex items-center gap-6 text-left">
                      <div className="p-4 rounded-xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-4xl text-center shrink-0 group-hover:rotate-6 transition-all duration-1000">
                         <Globe2 size={28} className="text-white filter drop-shadow-glow text-left shadow-glow" />
                      </div>
                      <div className="text-left">
                         <span className="text-xs font-medium tracking-widest uppercase text-indigo-100 leading-none text-left">Global Student Network</span>
                         <div className="flex items-center gap-3 mt-2 text-left">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-glow text-left" />
                            <span className="text-xs font-medium uppercase text-white/40 tracking-widest text-left">Network Explorer Active</span>
                         </div>
                      </div>
                   </div>
                   <h1 className="text-4xl md:text-6xl font-medium tracking-tighter leading-none uppercase text-white text-left">
                      Nexus <br />
                      <span className="text-blue-200">Peer Network.</span>
                   </h1>
                   <p className="text-indigo-100 text-base font-bold leading-relaxed max-w-lg px-0 text-left underline decoration-white/10 underline-offset-8">
                      Synchronizing with elite scholars across the sovereign national grid. Expand your academic perimeter within the high-fidelity Aura social nexus infrastructure  node  nominal.
                   </p>

                   {/* Tactical Search Interface Optimized Design Protocol architecture display logic  sync */}
                   <div className="relative group/search max-w-2xl w-full text-left pt-6">
                      <Search className="absolute left-10 top-1/2 translate-y-[-50%] text-indigo-300 group-focus-within/search:text-white transition-all duration-700 text-left" size={24} />
                      <input 
                        type="text" 
                        placeholder="Search for students or tutors..."
                        className="w-full pl-22 pr-12 py-6 bg-white/10 border border-white/20 rounded-2xl text-xl font-medium placeholder:text-indigo-200/30 outline-none focus:bg-white/20 transition-all duration-700 shadow-4xl uppercase tracking-normal text-left text-white border border-white/10"
                      />
                   </div>
                </div>

                {/* statistical matrix design Sidebar  hub architecture display logic protocol area */}
                <div className="hidden xl:flex flex-col gap-10 shrink-0 text-left">
                   <div className="p-12 bg-white/10 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-4xl text-center cursor-default group/peers transition-all duration-[1500ms] hover:bg-white/20 hover:scale-105 border border-white/5 active:scale-95">
                      <p className="text-sm font-medium uppercase tracking-normal text-indigo-100 mb-6 leading-none text-center h-3">ACTIVE STUDENTS</p>
                      <p className="text-7xl font-medium mb-3 tabular-nums tracking-tighter text-white leading-none text-center drop-shadow-glow-blue">42.4K</p>
                      <p className="text-sm font-medium uppercase tracking-normal text-blue-200 leading-none text-center underline decoration-blue-200/20 underline-offset-8">COMMUNITY_SYNC</p>
                   </div>
                </div>
             </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 text-left items-start pb-20">
             {/* Sidebar: Discovery Modules Terminal Sidebar UI Architecture display protocol logic area */}
             <div className="xl:col-span-4 space-y-10 text-left order-2 xl:order-1">
                <motion.div variants={itemVariants} className="bg-white border border-blue-50 rounded-3xl p-8 md:p-12 shadow-4xl text-left hover:border-indigo-100 transition-all duration-[1000ms] relative overflow-hidden group text-left cursor-pointer border border-slate-100 active:scale-[0.98]">
                   <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:rotate-12 group-hover:scale-110 transition-all duration-[2000ms] text-right font-medium h-48 w-48"><Users size={160} /></div>
                   <h3 className="text-xl font-medium uppercase tracking-tighter mb-12 flex items-center gap-5 text-slate-950 leading-none relative z-10 text-left underline decoration-indigo-50 underline-offset-8">
                      PEERS
                   </h3>
                   <div className="space-y-7 relative z-10 text-left">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between group/user text-left p-1">
                           <div className="flex items-center gap-6 text-left">
                              <div className="relative shrink-0 text-left">
                                 <div className="w-13 h-13 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center font-medium text-slate-200 text-2xl shadow-inner group-hover/user:bg-indigo-600 group-hover/user:text-white transition-all duration-700 text-center border border-slate-100 active:rotate-6">
                                    {user.avatar}
                                 </div>
                                 <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-lg border-2 border-white shadow-glow-emerald text-center animate-pulse" />
                              </div>
                              <div className="text-left space-y-2 text-left">
                                 <h4 className="font-black text-slate-950 uppercase text-[14px] tracking-tight flex items-center gap-2 mb-1 leading-none text-left underline decoration-slate-50 underline-offset-2">
                                    {user.name?.toUpperCase()?.replace(/ /g, '_')} 
                                    {user.role === 'Tutor' && <ShieldCheck size={14} className="text-indigo-600 text-left drop-shadow-glow" />}
                                 </h4>
                                 <p className="text-xs font-medium uppercase text-slate-300 tracking-normal leading-none text-left underline decoration-slate-100 underline-offset-2 h-3">{user.district?.toUpperCase()} • LVL_{user.level} :: </p>
                              </div>
                           </div>
                           <button className={cn(
                             "w-12 h-12 rounded-xl border transition-all duration-700 active:scale-90 shadow-md text-center shrink-0 flex items-center justify-center border border-slate-50",
                             user.follows ? "text-rose-600 bg-rose-50 border-rose-100 shadow-inner" : "text-slate-100 bg-slate-50 border-slate-100 hover:bg-slate-950 hover:text-white hover:border-slate-950"
                           )}>
                              {user.follows ? <UserMinus size={20} className="text-left" /> : <UserPlus size={20} className="text-left" />}
                           </button>
                        </div>
                      ))}
                   </div>
                   <button className="w-full mt-12 py-5 bg-slate-50 hover:bg-slate-950 hover:text-white border border-slate-100 rounded-2xl text-sm font-medium uppercase tracking-normal text-slate-300 transition-all duration-700 shadow-inner active:scale-95 group relative z-10 flex items-center justify-center gap-5 text-center border border-slate-100">
                      Find More Peers <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform duration-[1000ms] text-center h-5" />
                   </button>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-indigo-600 rounded-3xl p-8 md:p-12 text-white shadow-4xl relative overflow-hidden group text-left hover:scale-[1.02] transition-all duration-[1000ms] cursor-pointer border border-white/10 active:scale-[0.98]">
                   <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-125 group-hover:rotate-12 transition-transform duration-[2000ms] text-right font-medium h-48 w-48"><TrendingUp size={160} /></div>
                   <div className="relative z-10 space-y-10 text-left">
                      <div className="flex items-center gap-6 text-left">
                         <div className="p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-3xl shadow-4xl shrink-0 text-center">
                            <Zap size={24} className="text-white animate-pulse text-left filter drop-shadow-glow shadow-glow" />
                         </div>
                         <div className="text-left space-y-3 text-left">
                            <p className="text-sm font-medium uppercase tracking-normal leading-none text-white h-3">Community Discussion Pulse</p>
                              <p className="text-xs font-medium uppercase tracking-normal opacity-40 leading-none underline decoration-white/20 underline-offset-4 h-3">Trending Topics</p>
                         </div>
                      </div>
                      <div className="space-y-4 text-left">
                         {['#Physics_Matrix', '#Maths_Node_', '#Kandy_Pulse', '#Bio_Cycle'].map((tag) => (
                           <div key={tag} className="flex items-center justify-between p-5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/20 transition-all duration-700 group/tag text-left active:scale-95">
                              <span className="text-sm font-medium tracking-normal uppercase text-left h-3">{tag.toUpperCase()}</span>
                              <ArrowUpRight size={18} className="opacity-40 group-hover/tag:opacity-100 group-hover/tag:translate-x-1 group-hover/tag:-translate-y-1 transition-all duration-700 text-right h-5" />
                           </div>
                         ))}
                      </div>
                   </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-slate-950 rounded-3xl p-8 md:p-12 text-white shadow-4xl relative overflow-hidden group text-left border border-white/10 cursor-pointer hover:bg-slate-900 transition-all duration-1000 active:scale-[0.98]">
                   <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-all duration-[2000ms] text-right font-medium h-48 w-48"><Target size={160} /></div>
                   <div className="relative z-10 space-y-10 text-left">
                      <h3 className="text-xl font-medium tracking-tighter uppercase leading-none text-white px-0 text-left underline decoration-white/10 underline-offset-8">Regional Hubs</h3>
                      <div className="grid grid-cols-2 gap-5 text-left">
                         {['Colombo', 'Kandy', 'Galle', 'Jaffna'].map((city) => (
                           <div key={city} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-5 hover:bg-indigo-600 transition-all duration-700 group/city overflow-hidden text-center active:scale-95 shadow-lg border border-white/5">
                              <MapPin size={22} className="text-indigo-400 group-hover/city:text-white group-hover/city:scale-110 transition-all duration-700 text-center shadow-glow" />
                              <span className="text-sm font-medium uppercase tracking-normal text-center h-3">{city.toUpperCase()}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </motion.div>
             </div>

             {/* Activity Feed Hub Terminal Feed UI Architecture Display Matrix display protocol logic protocol  area */}
             <div className="xl:col-span-8 space-y-10 text-left order-1 xl:order-2">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 px-8 text-left">
                   <h3 className="text-2xl font-medium tracking-tighter uppercase flex items-center gap-5 text-slate-950 leading-none text-left underline decoration-indigo-50 underline-offset-8">
                      <Activity className="text-indigo-600 outline-none" size={28} /> Academic Activity Feed
                   </h3>
                   <div className="flex gap-2 p-2 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner shrink-0 text-left border border-slate-50">
                      {['All', 'Peers', 'Mentors'].map((t) => (
                        <button key={t} onClick={() => setFilter(t.toLowerCase())} className={cn(
                          "px-8 py-3 rounded-xl text-sm font-medium uppercase tracking-normal transition-all duration-700 active:scale-95 border border-transparent",
                          filter === t.toLowerCase() ? "bg-slate-950 text-white shadow-4xl border border-white/10" : "text-slate-200 hover:text-slate-950"
                        )}>{t.toUpperCase()}</button>
                      ))}
                   </div>
                </div>

                <AnimatePresence mode="popLayout">
                   {activities.map((act) => (
                     <motion.div
                       key={act.id}
                       layout
                       initial={{ opacity: 0, scale: 0.98, y: 15 }}
                       animate={{ opacity: 1, scale: 1, y: 0 }}
                       exit={{ opacity: 0, scale: 0.98, y: -15 }}
                       transition={{ duration: 0.5 }}
                       className="bg-white border border-blue-50 rounded-3xl p-10 md:p-14 shadow-4xl relative group/post text-left hover:border-indigo-100 transition-all duration-1000 overflow-hidden text-left cursor-pointer border border-slate-100 active:scale-[0.99]"
                     >
                        <div className="absolute inset-0 bg-indigo-500/[0.02] opacity-0 group-hover/post:opacity-100 transition-opacity duration-1000 text-left pointer-events-none" />
                        
                        <div className="relative z-10 text-left">
                           <div className="flex items-start justify-between mb-12 text-left">
                               <div className="flex items-center gap-8 text-left text-left">
                                  <div className="relative shrink-0 text-left">
                                     <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center font-medium text-slate-200 text-3xl shadow-inner group-hover/post:bg-indigo-600 group-hover/post:text-white group-hover/post:rotate-6 transition-all duration-1000 text-center border border-slate-100">
                                        {act.user[0]}
                                     </div>
                                     <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-4xl border-2 border-white text-center">
                                        <BadgeCheck size={16} className="filter drop-shadow-glow shadow-glow" />
                                     </div>
                                  </div>
                                  <div className="text-left space-y-3 text-left text-left">
                                     <h4 className="font-black text-slate-950 uppercase text-xl tracking-tighter mb-0 leading-none text-left underline underline-offset-4 decoration-indigo-50/20">{act.user?.toUpperCase()?.replace(/ /g, '_')}</h4>
                                     <p className="text-sm text-slate-300 font-medium uppercase tracking-normal flex items-center gap-4 leading-none text-left h-3">
                                        <Sparkles size={14} className="text-indigo-600 animate-pulse text-left shadow-glow" /> {act.time.toUpperCase()} :: SYNC
                                     </p>
                                  </div>
                               </div>
                               <button className="p-4 text-slate-100 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-all duration-700 text-right border border-transparent hover:border-blue-50 active:scale-95">
                                  <MoreHorizontal size={24} />
                                </button>
                            </div>

                           <p className="text-2xl md:text-4xl font-medium text-slate-950 mb-12 leading-tight tracking-tighter uppercase px-0 text-left border-l-8 border-slate-50 pl-10 transition-all duration-1000 group-hover:border-indigo-100">
                               {act.action.split(' ').map((word, i) => (
                                  word.toLowerCase().includes('physics') || word.toLowerCase().includes('calculus') || word.toLowerCase().includes('mentor') ? 
                                  <span key={i} className="text-indigo-600 underline underline-offset-8 decoration-indigo-200/40"> {word} </span> : 
                                  <span key={i}> {word} </span>
                               ))}
                           </p>

                           <div className="flex flex-wrap items-center gap-10 pt-10 border-t border-slate-50 px-0 text-left border border-slate-50">
                               <button className="flex items-center gap-4 font-medium text-base uppercase tracking-normal text-slate-400 hover:text-rose-600 transition-all duration-700 group/btn active:scale-95 text-left">
                                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-50 group-hover/btn:bg-rose-50 group-hover/btn:border-rose-100 shadow-inner group-hover/btn:shadow-glow transition-all duration-700 text-center shrink-0 border border-slate-50 group-hover/btn:rotate-12 transition-all">
                                     <Heart size={20} className="group-hover/btn:fill-rose-600 transition-all duration-700 text-left" />
                                  </div>
                                  {act.likes} CHEERS
                               </button>
                               <button className="flex items-center gap-4 font-medium text-base uppercase tracking-normal text-slate-400 hover:text-indigo-600 transition-all duration-700 group/btn active:scale-95 text-left">
                                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-50 group-hover/btn:bg-indigo-50 group-hover/btn:border-indigo-100 shadow-inner group-hover/btn:shadow-glow transition-all duration-700 text-center shrink-0 border border-slate-50 group-hover/btn:rotate-12 transition-all">
                                     <MessageCircle size={20} className="text-left" />
                                  </div>
                                  {act.comments} THREADS
                               </button>
                               <button className="ml-auto flex items-center gap-4 font-medium text-base uppercase tracking-normal text-slate-400 hover:text-slate-950 transition-all duration-700 group/share active:scale-95 text-right">
                                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover/share:bg-slate-950 group-hover/share:text-white shadow-inner transition-all duration-700 text-center shrink-0 border border-slate-100 group-hover/share:rotate-12 transition-all">
                                     <Share2 size={20} className="text-left" />
                                  </div>
                                  BROADCAST
                               </button>
                           </div>
                        </div>
                        <div className="absolute bottom-6 right-6 p-14 opacity-[0.01] pointer-events-none group-hover:rotate-12 transition-all duration-[2000ms] text-right font-medium h-48 w-48"><Layers size={180} /></div>
                     </motion.div>
                   ))}
                </AnimatePresence>
             </div>
          </div>
        </motion.div>

        {/* Global Hub Authority terminal indicator UI Matrix Architecture Display Logic protocol  area */}
        <div className="fixed bottom-10 right-10 group z-50 opacity-40 hover:opacity-100 transition-all duration-1000 text-left">
           <div className="flex items-center gap-10 py-5 px-10 bg-white/60 backdrop-blur-3xl rounded-full border border-blue-50 shadow-4xl cursor-default text-left shadow-glow">
              <div className="relative text-left">
                 <Terminal size={26} className="text-indigo-600 animate-pulse text-left shadow-glow" />
                 <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 text-left" />
              </div>
               <div className="flex flex-col text-left">
                  <p className="text-sm font-medium uppercase tracking-normal text-slate-950 leading-none text-left h-3">Aura Network Status</p>
                  <div className="flex items-center gap-5 mt-2.5 text-xs font-medium uppercase text-indigo-600 tracking-widest leading-none text-left h-4">
                     <Database size={16} className="text-left" /> System Connection: Optimal
                  </div>
               </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default SocialFeed;