import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  ChevronRight, 
  Target, 
  BookOpen, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';

interface CurriculumWeek {
  week: number;
  title: string;
  status: 'completed' | 'active' | 'locked';
  topics: string[];
}

const StudyPlanner: React.FC = () => {
  const [activeWeek, setActiveWeek] = useState(1);

  const curriculum: CurriculumWeek[] = [
    { week: 1, title: 'Foundation: Core Concepts', status: 'completed', topics: ['Basic Principles', 'Historical Context'] },
    { week: 2, title: 'Intermediate: Application', status: 'active', topics: ['Problem Solving', 'Data Analysis'] },
    { week: 3, title: 'Advanced: Synthesis', status: 'locked', topics: ['Complex Systems', 'Future Trends'] },
    { week: 4, title: 'Mastery: Project Work', status: 'locked', topics: ['Case Studies', 'Peer Review'] },
    { week: 5, title: 'Strategic Planning', status: 'locked', topics: ['Resource Allocation', 'Risk Management'] },
    { week: 6, title: 'Integration', status: 'locked', topics: ['Cross-functional Synergy', 'Final Review'] },
    { week: 7, title: 'Certification Prep', status: 'locked', topics: ['Exam Simulation', 'Final Assessment'] }
  ];

  return (
    <Layout userRole="student">
      <div className="min-h-screen p-4 md:p-8 space-y-8 bg-gray-50/50 dark:bg-gray-950/50">
        {/* Planner Hero */}
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-900 to-violet-900 p-8 md:p-12 text-white shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
                <Target className="text-indigo-400" size={24} />
              </div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-indigo-300">Phase 6 • Adaptive Curriculum</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Your Personalized <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">7-Week Mastery Path</span>
            </h1>
            <p className="text-indigo-200/80 text-lg max-w-2xl font-medium">
              We've analyzed your performance to generate an optimized journey from <span className="text-white">Foundation</span> to <span className="text-white">Professional Mastery</span>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Week Overview */}
          <div className="lg:col-span-4 space-y-4">
             {curriculum.map((week) => (
               <button
                 key={week.week}
                 onClick={() => week.status !== 'locked' && setActiveWeek(week.week)}
                 className={cn(
                   "w-full p-6 rounded-[2rem] border transition-all duration-500 flex items-center justify-between group",
                   activeWeek === week.week 
                     ? "bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/20" 
                     : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-indigo-400/50",
                   week.status === 'locked' && "opacity-50 cursor-not-allowed grayscale"
                 )}
               >
                 <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm",
                     activeWeek === week.week ? "bg-white/20" : "bg-gray-100 dark:bg-gray-800"
                   )}>
                     W{week.week}
                   </div>
                   <div className="text-left">
                     <p className={cn("text-xs font-black uppercase tracking-widest", activeWeek === week.week ? "text-indigo-200" : "text-gray-500")}>
                       {week.status}
                     </p>
                     <p className="font-bold text-sm truncate max-w-[150px]">{week.title}</p>
                   </div>
                 </div>
                 {week.status === 'locked' ? <Lock size={16} /> : <ChevronRight size={16} />}
               </button>
             ))}
          </div>

          {/* Detailed Week View */}
          <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8">
                <Sparkles className="text-indigo-500/20" size={120} />
             </div>
             
             <div className="relative z-10">
                <h2 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white mb-2">
                   Week {activeWeek}: {curriculum[activeWeek-1].title}
                </h2>
                <div className="flex items-center gap-4 mb-10">
                   <span className="flex items-center gap-1 text-xs font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-full uppercase tracking-widest">
                      <TrendingUp size={14} /> Recommended Focus
                   </span>
                   <span className="text-gray-400 text-sm font-medium">Est. 12 Hours Study Time</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                   {curriculum[activeWeek-1].topics.map((topic, i) => (
                     <div key={i} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700/50 group hover:border-indigo-500 transition-all">
                        <div className="p-3 w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl shadow-sm mb-4 flex items-center justify-center text-indigo-500">
                           <BookOpen size={20} />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">{topic}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">Dive deep into the core mechanics of {topic.toLowerCase()} with curated resources and practice tests.</p>
                     </div>
                   ))}
                </div>

                <div className="p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-3xl shadow-lg flex items-center justify-center text-teal-500">
                         <CheckCircle2 size={32} />
                      </div>
                      <div>
                         <h4 className="text-xl font-black text-gray-950 dark:text-white">Week Milestone</h4>
                         <p className="text-sm font-medium text-gray-500">Complete the assessment to unlock Week {activeWeek + 1}</p>
                      </div>
                   </div>
                   <button className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-500/30">
                      Start Test <ArrowRight size={18} />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudyPlanner;
