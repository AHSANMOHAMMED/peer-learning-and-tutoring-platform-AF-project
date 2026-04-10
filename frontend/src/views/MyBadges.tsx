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
  Sparkles,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../controllers/useAuth';
import { cn } from '../utils/cn';

const MyBadges: React.FC = () => {
  const { user } = useAuth();
  
  const stats = [
    { label: 'Current Level', value: user?.gamification?.level || 4, icon: Star, color: 'text-yellow-400' },
    { label: 'Total Points', value: user?.gamification?.points || 1250, icon: Zap, color: 'text-indigo-400' },
    { label: 'Learning Streak', value: `${user?.gamification?.streak || 7} Days`, icon: Flame, color: 'text-orange-500' },
  ];

  const badges = [
    { id: 1, title: 'Calculus Conqueror', desc: 'Completed 10 Combined Maths sessions.', earned: true, icon: Target, date: 'Oct 12' },
    { id: 2, title: 'Biology Ace', desc: 'Earned 100% on 3 practice quizzes.', earned: true, icon: ShieldCheck, date: 'Oct 08' },
    { id: 3, title: 'Early Bird', desc: 'Attended a 6:00 AM session.', earned: true, icon: TrendingUp, date: 'Sep 24' },
    { id: 4, title: 'Collaborator', desc: 'Participated in 5 group study sessions.', earned: false, icon: Award, date: 'Locked' },
    { id: 5, title: 'Top Scholar', desc: 'Reached Level 10.', earned: false, icon: Trophy, date: 'Locked' },
    { id: 6, title: 'Physics Legend', desc: 'Completed the Masterclass Series.', earned: false, icon: GraduationCap, date: 'Locked' },
  ];

  return (
    <Layout userRole="student">
      <div className="min-h-screen space-y-8 p-4 md:p-8 bg-gray-50/50 dark:bg-gray-950/50">
        {/* Gamification Hero */}
        <div className="relative overflow-hidden rounded-[3.5rem] bg-gradient-to-br from-indigo-900 to-slate-900 p-8 md:p-16 text-white shadow-2xl border border-white/5">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="max-w-2xl">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                       <Trophy className="text-yellow-400" size={32} />
                    </div>
                    <span className="text-sm font-bold tracking-[0.4em] uppercase text-indigo-300">Scholastic Mastery Tracker</span>
                 </div>
                 <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6 leading-[0.95]">
                    Rewards <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-indigo-300 to-white underline decoration-white/20 underline-offset-8">Academy.</span>
                 </h1>
                 <p className="text-slate-400 text-lg font-medium leading-relaxed mb-8">
                    Your academic influence is growing. Collect badges, increase your rank, and unlock <span className="text-white font-bold">Elite Scholar Status</span>.
                 </p>
                 <div className="flex flex-wrap gap-4">
                    {stats.map((stat, i) => (
                      <div key={i} className="px-6 py-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-4 group hover:bg-white/10 transition-all cursor-default">
                         <stat.icon className={stat.color} size={24} />
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
                            <p className="text-lg font-bold">{stat.value}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Progress Ring */}
              <div className="relative w-64 h-64 flex items-center justify-center p-8 bg-white/5 rounded-full border border-white/10 shadow-2xl backdrop-blur-md">
                 <div className="absolute inset-0 border-8 border-white/5 rounded-full" />
                 <div className="absolute inset-0 border-8 border-indigo-500 border-t-transparent border-l-transparent rounded-full rotate-45" />
                 <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 mb-1">To Next Level</p>
                    <p className="text-5xl font-bold">78%</p>
                    <p className="text-xs font-bold text-slate-400 mt-2">250 pts remaining</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Gallery Grid */}
        <div className="space-y-12">
           <div className="flex items-center justify-between px-6">
              <h3 className="text-3xl font-bold tracking-tight text-gray-950 dark:text-white uppercase flex items-center gap-3">
                 <Award size={32} className="text-indigo-600" />
                 Achievement Vault
              </h3>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 tracking-widest uppercase">
                 Rank: <span className="text-indigo-600">Grandmaster Scholar</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-32">
              {badges.map((badge, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  key={badge.id}
                  className={cn(
                    "group relative p-10 rounded-[3.5rem] border transition-all duration-700",
                    badge.earned 
                      ? "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-4" 
                      : "bg-gray-50/50 dark:bg-transparent border-dashed border-gray-200 dark:border-gray-800 grayscale hover:grayscale-0"
                  )}
                >
                   <div className="flex flex-col items-center text-center">
                      <div className={cn(
                        "w-32 h-32 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl transition-transform duration-700 group-hover:rotate-12",
                        badge.earned ? "bg-indigo-600 text-white shadow-indigo-500/30" : "bg-gray-200 dark:bg-gray-800 text-gray-400"
                      )}>
                        {badge.earned ? <badge.icon size={48} /> : <Lock size={48} />}
                      </div>

                      <h4 className="text-2xl font-bold mb-3 text-gray-950 dark:text-white">{badge.title}</h4>
                      <p className="text-gray-400 font-medium text-sm mb-8 px-4">{badge.desc}</p>

                      <div className="w-full pt-8 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                         <span className={cn(
                           "text-[10px] font-bold uppercase tracking-widest",
                           badge.earned ? "text-indigo-500" : "text-gray-400"
                         )}>
                           {badge.date}
                         </span>
                         {badge.earned && (
                           <button className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                              <ArrowUpRight size={16} />
                           </button>
                         )}
                      </div>
                   </div>

                   {/* Background Glow */}
                   {badge.earned && (
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                   )}
                </motion.div>
              ))}
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyBadges;
