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
  BadgeCheck,
  Sparkles,
  Activity
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../controllers/useAuth';
import { cn } from '../utils/cn';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const MyBadges = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Current Level', value: user?.gamification?.level || 12, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Total Points', value: user?.gamification?.points || 8420, icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Learning Streak', value: `${user?.gamification?.streak || 22} Days`, icon: Flame, color: 'text-rose-500', bg: 'bg-rose-50' }
  ];

  const badges = [
    { id: 1, title: 'Calculus Conqueror', desc: 'Successfully mastered 10 Combined Mathematics modules with 90%+ passing rate.', earned: true, icon: Target, date: 'Oct 12' },
    { id: 2, title: 'Biological Ace', desc: 'Achieved 100% accuracy on advanced Biological Sciences practice assessments.', earned: true, icon: ShieldCheck, date: 'Oct 08' },
    { id: 3, title: 'Early Bird', desc: 'Completed consecutive early morning study sessions for one full week.', earned: true, icon: TrendingUp, date: 'Sep 24' },
    { id: 4, title: 'Collaborator', desc: 'Contribute helpful peer answers across 5 group study session threads.', earned: false, icon: Award, date: 'Locked' },
    { id: 5, title: 'Top Scholar', desc: 'Reach Mastery Level 50 by sustaining an unbroken 60-day learning streak.', earned: false, icon: Trophy, date: 'Locked' },
    { id: 6, title: 'Physics Expert', desc: 'Complete the Physics module and pass the final assessment.', earned: false, icon: GraduationCap, date: 'Locked' }
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
      <div className="min-h-screen bg-[#fafafc] pb-16 font-sans">
        
        {/* Header Hero Set */}
        <div className="bg-white border-b border-slate-200 py-12 px-6 shadow-sm">
           <div className="max-w-[1400px] mx-auto">
             <div className="flex flex-col xl:flex-row justify-between items-center gap-12">
               
               <div className="flex-1 space-y-6">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-200">
                   <Trophy size={14} /> Academic Achievements
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none">
                    Achievement <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">& Milestones</span>
                 </h1>
                 <p className="text-slate-500 text-lg font-medium max-w-lg leading-relaxed">
                    Build your academic reputation across the platform. Unlock elite badges, earn points, and climb the leaderboard as you master your curriculum.
                 </p>
                 <div className="flex gap-4 pt-2">
                    {stats.map((stat, i) =>
                      <div key={i} className="px-5 py-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 group shadow-sm transition-all hover:border-slate-300">
                         <div className={cn("p-2 rounded-xl", stat.bg, stat.color)}>
                           <stat.icon size={20} />
                         </div>
                         <div>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
                            <p className="text-xl font-black text-slate-800 leading-none">{stat.value}</p>
                         </div>
                      </div>
                    )}
                 </div>
               </div>

               <div className="w-64 h-64 p-8 bg-white rounded-[3rem] border border-slate-200 shadow-xl flex flex-col items-center justify-center relative shrink-0">
                  <div className="w-40 h-40">
                     <CircularProgressbar 
                       value={78} 
                       text="78%" 
                       styles={buildStyles({
                          pathColor: '#f59e0b',
                          textColor: '#1e293b',
                          trailColor: '#f1f5f9',
                          textSize: '24px'
                       })} 
                     />
                  </div>
                  <div className="absolute bottom-5 text-center px-4 w-full">
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white">Path to Academic Mastery</p>
                  </div>
               </div>
             </div>
           </div>
        </div>

        {/* Badge Grid Area */}
        <motion.div 
          className="max-w-[1400px] mx-auto px-6 pt-16 space-y-8"
          variants={containerVariants}
          initial="hidden" animate="visible"
        >
           <div className="flex justify-between items-end border-b border-slate-200 pb-6">
              <div>
                 <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <Award className="text-amber-500" /> Milestone Badges
                 </h2>
                 <p className="text-slate-500 font-medium text-sm mt-1">Badges earned through platform participation and assessments.</p>
              </div>
              <span className="hidden md:block px-4 py-2 bg-amber-50 text-amber-700 font-bold text-xs uppercase tracking-widest rounded-xl">
                 Rank: Advanced
              </span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) =>
                <motion.div
                  key={badge.id}
                  variants={itemVariants}
                  className={cn(
                    "relative p-8 rounded-[2rem] border transition-all shadow-sm flex flex-col h-full",
                    badge.earned ?
                    "bg-white border-slate-200 hover:border-amber-300 hover:shadow-md cursor-pointer" :
                    "bg-slate-50 border-dashed border-slate-200 grayscale opacity-60"
                  )}
                >
                  <div className="flex-1 space-y-6">
                     <div className="flex justify-between items-start">
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center border",
                          badge.earned ? "bg-amber-100 text-amber-600 border-amber-200" : "bg-white text-slate-300 border-slate-200"
                        )}>
                          {badge.earned ? <badge.icon size={28} /> : <Lock size={28} />}
                        </div>
                        {badge.earned && <BadgeCheck size={32} className="text-emerald-500" />}
                     </div>

                     <div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">{badge.title}</h4>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                           {badge.desc}
                        </p>
                     </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        {badge.earned ? (
                           <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest border border-emerald-100">
                             Earned: {badge.date}
                           </div>
                        ) : (
                           <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                             Locked
                           </div>
                        )}
                     </div>
                  </div>
                </motion.div>
              )}
           </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default MyBadges;