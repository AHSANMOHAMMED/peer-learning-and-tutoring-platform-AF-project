import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  BadgeCheck,
  Globe2,
  Star,
  MessageSquare,
  Clock,
  RefreshCw,
  Send
} from 'lucide-react';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';
import { useSocial } from '../controllers/useSocial';
import { useAuth } from '../controllers/useAuth';

const SocialFeed = () => {
  const { user: currentUser } = useAuth();
  const { 
    feed, recommendations, loading, fetchFeed, 
    fetchRecommendations, handlePost, handleFollow, 
    handleUnfollow, handleToggleLike 
  } = useSocial();

  const [filter, setFilter] = useState('all');
  const [postInput, setPostInput] = useState('');

  useEffect(() => {
    fetchFeed(filter);
    fetchRecommendations();
  }, [fetchFeed, fetchRecommendations, filter]);

  const onPostSubmit = async (e) => {
    e.preventDefault();
    if (!postInput.trim()) return;
    await handlePost(postInput);
    setPostInput('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <Layout userRole={currentUser?.role || 'student'}>
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
                   <span className="text-xs font-bold uppercase tracking-widest text-slate-800">Student Community Network</span>
                </div>
                <div className="hidden md:flex items-center gap-3 text-slate-400">
                   <Activity size={14} className="text-indigo-500" />
                   <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Status: High Capacity</span>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="px-5 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md hover:bg-slate-900 transition-all cursor-pointer">
                   Community Feed
                </div>
             </div>
          </div>

          {/* Hero Section */}
          <motion.div 
            variants={itemVariants} 
            className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-8 md:p-14 text-white shadow-xl text-left group"
          >
             <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
             
             <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-14 text-left">
                <div className="flex-1 max-w-4xl space-y-10 text-left">
                   <div className="flex items-center gap-6 text-left">
                      <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-lg shrink-0 group-hover:rotate-6 transition-transform">
                         <Globe2 size={28} className="text-white" />
                      </div>
                      <div className="text-left">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100 mb-1 block">Platform Social Nexus</span>
                         <div className="flex items-center gap-3 mt-1">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Community Active</span>
                         </div>
                      </div>
                   </div>
                   <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase text-white text-left">
                      Student <br />
                      <span className="text-blue-200">Peer Network.</span>
                   </h1>
                   <p className="text-indigo-100 text-base font-bold leading-relaxed max-w-lg px-0 text-left font-sans">
                      Connect with scholars across the platform. Share your achievements, track academic updates, and expand your community.
                   </p>

                   {/* Post Input */}
                   <div className="relative group/search max-w-2xl w-full text-left pt-6">
                      <form onSubmit={onPostSubmit} className="relative">
                        <input 
                          type="text" 
                          value={postInput}
                          onChange={(e) => setPostInput(e.target.value)}
                          placeholder="Share an academic update..."
                          className="w-full pl-8 pr-20 py-6 bg-white/10 border border-white/20 rounded-3xl text-xl font-bold placeholder:text-indigo-200/40 outline-none focus:bg-white/20 transition-all shadow-xl text-left text-white"
                        />
                        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white text-indigo-600 rounded-2xl shadow-lg hover:scale-105 transition-transform active:scale-95">
                           <Send size={24} />
                        </button>
                      </form>
                   </div>
                </div>

                <div className="hidden xl:flex flex-col gap-10 shrink-0 text-left">
                   <div className="p-12 bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-xl text-center flex flex-col items-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100 mb-6">Active Community</p>
                      <p className="text-7xl font-black mb-3 tabular-nums tracking-tighter text-white leading-none">42.4K</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Global Members</p>
                   </div>
                </div>
             </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 text-left items-start pb-20">
             {/* Left Sidebar */}
             <div className="xl:col-span-4 space-y-10 text-left order-2 xl:order-1">
                <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-lg text-left relative overflow-hidden group active:scale-[0.99] transition-all">
                   <h3 className="text-xl font-black uppercase text-slate-800 tracking-tight mb-12 flex items-center justify-between">
                      Recommended Peers <Users className="text-indigo-500" size={20} />
                   </h3>
                   <div className="space-y-8 relative z-10 text-left">
                      {recommendations.length > 0 ? recommendations.map((rec) => (
                        <div key={rec._id} className="flex items-center justify-between group/user text-left">
                           <div className="flex items-center gap-6">
                              <div className="relative shrink-0">
                                 <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center font-black text-slate-400 text-2xl group-hover/user:bg-indigo-600 group-hover/user:text-white transition-all shadow-inner">
                                    {rec.profile?.avatar || rec.username[0].toUpperCase()}
                                 </div>
                                 <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                              </div>
                              <div className="text-left py-1">
                                 <h4 className="font-black text-slate-800 uppercase text-sm tracking-tight flex items-center gap-2 mb-1 leading-none">
                                    {rec.username} 
                                 </h4>
                                 <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest leading-none mt-1">{rec.district} • {rec.stream}</p>
                              </div>
                           </div>
                           <button 
                             onClick={() => handleFollow(rec._id)}
                             className="w-12 h-12 rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-800 hover:text-white transition-all active:scale-95 shadow-sm flex items-center justify-center"
                           >
                              <UserPlus size={20} />
                           </button>
                        </div>
                      )) : (
                        <div className="text-center py-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Finding scholars...</div>
                      )}
                   </div>
                   <button className="w-full mt-12 py-5 bg-slate-50 hover:bg-slate-800 hover:text-white border border-slate-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-all flex items-center justify-center gap-4">
                      Browse Full Directory <ArrowRight size={18} />
                   </button>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-indigo-600 rounded-[2.5rem] p-10 md:p-12 text-white shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-all cursor-pointer">
                   {/* Trends... remains similar but could be dynamic later */}
                   <div className="relative z-10 space-y-10 text-left">
                      <div className="flex items-center gap-6">
                         <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-3xl shadow-lg shrink-0">
                            <TrendingUp size={24} className="text-white" />
                         </div>
                         <div className="text-left">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100 mb-1">Trending Topics</p>
                            <p className="text-lg font-black uppercase text-white leading-none">Community Feed</p>
                         </div>
                      </div>
                      <div className="space-y-4 text-left">
                         {['#PhysicsMastery', '#CalculusHelp', '#AuraGlobal', '#Exams2026'].map((tag) => (
                           <div key={tag} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/20 transition-all active:scale-95">
                              <span className="text-xs font-bold tracking-widest uppercase">{tag}</span>
                              <ArrowUpRight size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                           </div>
                         ))}
                      </div>
                   </div>
                </motion.div>
             </div>

             {/* Activity Feed */}
             <div className="xl:col-span-8 space-y-10 text-left order-1 xl:order-2">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 px-8 text-left">
                   <h3 className="text-2xl font-black tracking-tight uppercase flex items-center gap-4 text-slate-800 leading-none">
                      <Activity className="text-indigo-600" size={24} /> Academic Activity
                   </h3>
                   <div className="flex gap-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-sm shrink-0">
                      {['All', 'Follows', 'Global'].map((t) => (
                        <button key={t} onClick={() => setFilter(t.toLowerCase())} className={cn(
                          "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          filter === t.toLowerCase() ? "bg-slate-800 text-white shadow-md" : "text-slate-400 hover:text-slate-800"
                        )}>{t}</button>
                      ))}
                   </div>
                </div>

                <AnimatePresence mode="popLayout text-left">
                   {loading ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-300">
                         <RefreshCw size={40} className="animate-spin" />
                         <p className="text-xs font-black uppercase tracking-widest">Syncing Feed...</p>
                      </div>
                   ) : feed.length > 0 ? (
                      feed.map((act) => (
                        <motion.div
                          key={act._id}
                          layout
                          initial={{ opacity: 0, scale: 0.98, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98, y: -15 }}
                          className="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 shadow-lg relative group/post transition-all active:scale-[0.99] overflow-hidden"
                        >
                           <div className="relative z-10 text-left">
                              <div className="flex items-start justify-between mb-12">
                                  <div className="flex items-center gap-8">
                                     <div className="relative shrink-0">
                                        <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-center font-black text-slate-400 text-3xl transition-all group-hover/post:bg-indigo-600 group-hover/post:text-white shadow-inner overflow-hidden">
                                           {act.author?.profile?.avatar || act.author?.username?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white">
                                           <BadgeCheck size={16} />
                                        </div>
                                     </div>
                                     <div className="text-left space-y-3">
                                        <h4 className="font-black text-slate-800 uppercase text-xl tracking-tight mb-0 leading-none">
                                          {act.author?.username || 'System Admin'}
                                        </h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-4 leading-none h-3">
                                           <Clock size={14} className="text-indigo-500" /> {new Date(act.createdAt).toLocaleDateString()}
                                        </p>
                                     </div>
                                  </div>
                                  <button className="p-4 text-slate-300 hover:text-slate-800 transition-all rounded-xl hover:bg-slate-50">
                                     <MoreHorizontal size={24} />
                                   </button>
                               </div>

                              <p className="text-2xl md:text-3xl font-black text-slate-800 mb-12 leading-tight tracking-tight uppercase border-l-8 border-slate-100 pl-10 group-hover:border-indigo-500 transition-all">
                                  {act.content}
                              </p>

                              <div className="flex flex-wrap items-center gap-10 pt-10 border-t border-slate-100">
                                  <button 
                                    onClick={() => handleToggleLike(act._id)}
                                    className={cn(
                                       "flex items-center gap-4 font-bold text-sm uppercase tracking-widest transition-all group/btn active:scale-95",
                                       act.likes?.includes('currentUser') ? "text-rose-500" : "text-slate-400 hover:text-rose-500"
                                    )}
                                  >
                                     <div className={cn(
                                       "p-4 rounded-2xl border shadow-inner transition-all text-center shrink-0 group-hover/btn:scale-110",
                                       act.likes?.includes('currentUser') ? "bg-rose-50 border-rose-100" : "bg-slate-50 border-slate-200"
                                     )}>
                                        <Heart size={20} className={cn(act.likes?.includes('currentUser') && "fill-rose-500")} />
                                     </div>
                                     {act.likes?.length || 0} Cheers
                                   </button>
                                  <button className="flex items-center gap-4 font-bold text-sm uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all group/btn active:scale-95">
                                     <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 group-hover/btn:bg-indigo-50 group-hover/btn:border-indigo-100 shadow-inner group-hover/btn:shadow-sm transition-all text-center shrink-0 group-hover/btn:scale-110">
                                        <MessageSquare size={20} />
                                     </div>
                                     {act.comments?.length || 0} Threads
                                   </button>
                                  <button className="ml-auto flex items-center gap-4 font-bold text-sm uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-all group/share active:scale-95">
                                     <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 group-hover/share:bg-slate-800 group-hover/share:text-white shadow-inner transition-all text-center shrink-0 group-hover/share:scale-110">
                                        <Share2 size={20} />
                                     </div>
                                     Share Action
                                   </button>
                              </div>
                           </div>
                        </motion.div>
                      ))
                   ) : (
                      <div className="py-20 text-center bg-white border border-slate-200 border-dashed rounded-[2.5rem] text-slate-400 space-y-4">
                         <Globe size={48} className="mx-auto opacity-20" />
                         <p className="font-black uppercase tracking-widest text-xs">No activity yet. Start following peers to build your network.</p>
                      </div>
                   )}
                </AnimatePresence>
             </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SocialFeed;