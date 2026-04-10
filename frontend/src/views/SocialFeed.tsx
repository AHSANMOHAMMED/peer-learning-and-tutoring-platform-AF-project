import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  MoreHorizontal
} from 'lucide-react';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';

interface SocialUser {
  id: number;
  name: string;
  role: 'Student' | 'Tutor';
  level: number;
  streak: number;
  follows: boolean;
  avatar: string;
}

interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
  likes: number;
  comments: number;
}

const SocialFeed: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const users: SocialUser[] = [
    { id: 1, name: 'Amara de Silva', role: 'Student', level: 14, streak: 22, follows: true, avatar: 'A' },
    { id: 2, name: 'Kasun Perera', role: 'Tutor', level: 45, streak: 120, follows: false, avatar: 'K' },
    { id: 3, name: 'Deepika Jaya', role: 'Student', level: 8, streak: 5, follows: false, avatar: 'D' },
    { id: 4, name: 'Tharindu Raj', role: 'Tutor', level: 32, streak: 88, follows: true, avatar: 'T' }
  ];

  const activities: Activity[] = [
    { id: 1, user: 'Amara de Silva', action: 'completed a Advanced Physics session', time: '2 hours ago', likes: 24, comments: 5 },
    { id: 2, user: 'Tharindu Raj', action: 'earned the "Master Mentor" badge', time: '5 hours ago', likes: 120, comments: 18 },
    { id: 3, user: 'Kasun Perera', action: 'published a new Calculus module', time: '1 day ago', likes: 56, comments: 12 }
  ];

  return (
    <Layout userRole="student">
      <div className="min-h-screen p-4 md:p-8 space-y-8 bg-gray-50/50 dark:bg-gray-950/50">
        {/* Community Discovery Hero */}
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-10 md:p-14 text-white shadow-2xl border border-white/5">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="max-w-2xl">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
                       <Users className="text-teal-400" size={32} />
                    </div>
                    <span className="text-xs font-black tracking-[0.4em] uppercase text-slate-400">Phase 6 • Social Core</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
                    Peer <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-white">Discovery</span> Hub
                 </h1>
                 <p className="text-slate-400 text-xl font-medium leading-relaxed">
                    Connect with fellow learners and top tutors. Build your study circle across Sri Lanka.
                 </p>
              </div>
              <div className="w-full md:w-auto flex flex-col gap-4">
                 <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
                    <input 
                       className="pl-16 pr-8 py-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] w-full md:w-[400px] focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-600 font-bold"
                       placeholder="Find peers by subject or district..."
                    />
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Sidebar Discovery */}
           <div className="lg:col-span-4 space-y-8">
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                 <h3 className="text-2xl font-black tracking-tight mb-8">Suggested Peers</h3>
                 <div className="space-y-6">
                    {users.map((user) => (
                       <div key={user.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                             <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xl group-hover:from-teal-500 group-hover:to-teal-600 group-hover:text-white transition-all shadow-sm">
                                {user.avatar}
                             </div>
                             <div>
                                <h4 className="font-bold text-gray-950 dark:text-white flex items-center gap-2">
                                   {user.name} 
                                   {user.role === 'Tutor' && <ShieldCheck size={14} className="text-teal-500" />}
                                </h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Level {user.level} • {user.role}</p>
                             </div>
                          </div>
                          <button className={cn(
                             "p-3 rounded-xl transition-all",
                             user.follows ? "text-red-500 bg-red-50 dark:bg-red-500/10" : "text-teal-600 bg-teal-50 dark:bg-teal-500/10"
                          )}>
                             {user.follows ? <UserMinus size={20} /> : <UserPlus size={20} />}
                          </button>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-teal-500/20">
                 <TrendingUp className="mb-4 text-teal-200" size={32} />
                 <h3 className="text-2xl font-black tracking-tight mb-4 uppercase text-xs">Trending Topics</h3>
                 <div className="space-y-3">
                    {['#CombinedMaths', '#OLevel2024', '#PhysicsMastery'].map(tag => (
                       <p key={tag} className="text-teal-100 font-bold hover:underline cursor-pointer flex items-center justify-between">
                          {tag} <Zap size={14} />
                       </p>
                    ))}
                 </div>
              </div>
           </div>

           {/* Activity Feed */}
           <div className="lg:col-span-8 space-y-8">
              {activities.map((act) => (
                 <motion.div 
                    key={act.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm"
                 >
                    <div className="flex items-start justify-between mb-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center font-bold text-gray-400">
                             {act.user[0]}
                          </div>
                          <div>
                             <h4 className="font-bold text-gray-950 dark:text-white uppercase text-xs tracking-widest">{act.user}</h4>
                             <p className="text-[10px] text-gray-400 font-bold">{act.time}</p>
                          </div>
                       </div>
                       <button className="text-gray-300 hover:text-gray-950 transition-colors">
                          <MoreHorizontal size={20} />
                       </button>
                    </div>

                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-8 leading-relaxed">
                       {act.action.split(' ').map((word, i) => (
                          word.startsWith('"') || word.includes('Physics') || word.includes('Calculus')
                           ? <span key={i} className="text-teal-600 font-black"> {word} </span>
                           : <span key={i}> {word} </span>
                       ))}
                    </p>

                    <div className="flex items-center gap-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                       <button className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors">
                          <Heart size={20} /> {act.likes} Cheers
                       </button>
                       <button className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-teal-500 transition-colors">
                          <MessageCircle size={20} /> {act.comments} Threads
                       </button>
                       <button className="ml-auto flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-500 transition-colors">
                          <Share2 size={20} /> Export
                       </button>
                    </div>
                 </motion.div>
              ))}
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default SocialFeed;
