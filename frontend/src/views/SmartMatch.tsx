import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Sparkles, 
  Search, 
  ChevronRight, 
  ArrowRight,
  GraduationCap,
  Star,
  MapPin,
  ShieldCheck,
  Target
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAI } from '../controllers/useAI';
import { useTutors } from '../controllers/useTutors';
import { cn } from '../utils/cn';

const SmartMatch: React.FC = () => {
  const { matchTutor, loading: aiLoading } = useAI();
  const [matches, setMatches] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [stream, setStream] = useState('Combined Maths');

  const handleMatch = async () => {
    setHasSearched(true);
    try {
      const results = await matchTutor({ stream });
      setMatches(results || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout userRole="student">
      <div className="min-h-screen space-y-8 p-4 md:p-8 bg-gray-50/50 dark:bg-gray-950/50">
        {/* AI Hero Banner */}
        <div className="relative overflow-hidden rounded-[3rem] bg-indigo-600 p-8 md:p-12 text-white shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <img 
            src="/images/analytics-3d.png" 
            className="absolute -right-20 -bottom-20 w-[400px] opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-1000" 
            alt="AI Analytics 3D" 
          />
          <div className="relative z-10 max-w-3xl">
             <div className="flex items-center gap-3 mb-8">
               <div className="p-3 rounded-2xl bg-indigo-500/20 backdrop-blur-xl border border-indigo-500/30">
                 <Zap className="text-indigo-400" size={32} />
               </div>
               <span className="text-sm font-bold tracking-[0.4em] uppercase text-indigo-100">AI Tutor Matching Engine</span>
             </div>
             <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-8 leading-[0.95]">
               Smart Match <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400 underline decoration-indigo-500/30 underline-offset-[12px]">Your Future.</span>
             </h1>
             <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-12">
               Our proprietary algorithm analyzes thousands of data points to find you the <span className="text-white font-bold">perfect mentor</span> based on your goals, location, and learning style.
             </p>

             <div className="flex flex-col md:flex-row gap-6 p-4 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl">
                <div className="flex-1 px-4 py-2">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Academic Stream</p>
                   <select 
                     value={stream}
                     onChange={(e) => setStream(e.target.value)}
                     className="bg-transparent border-none text-xl font-bold text-white outline-none w-full appearance-none cursor-pointer"
                   >
                     <option className="bg-slate-900">Combined Maths</option>
                     <option className="bg-slate-900">A/L Biology</option>
                     <option className="bg-slate-900">Commerce Stream</option>
                     <option className="bg-slate-900">A/L Physics</option>
                   </select>
                </div>
                <button 
                  onClick={handleMatch}
                  disabled={aiLoading}
                  className="px-12 py-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-wait text-white rounded-[2rem] font-bold text-lg transition-all shadow-2xl shadow-indigo-500/40 flex items-center gap-3 group"
                >
                  {aiLoading ? 'Synchronizing...' : 'Calibrate Match'}
                  <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
                </button>
             </div>
          </div>
        </div>

        {/* Results Visualizer */}
        <div className="space-y-12">
          <AnimatePresence mode='wait'>
            {!hasSearched ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-32 rounded-[3.5rem] bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800"
              >
                <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                  <Target size={64} className="text-indigo-400/50" />
                </div>
                <h3 className="text-4xl font-bold text-gray-300 dark:text-gray-700 tracking-tight">Ready to Find Your Match?</h3>
                <p className="text-gray-400 max-w-sm mx-auto text-lg mt-4">Select your academic stream above and let our A.I. do the heavy lifting.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 pb-32"
              >
                <div className="flex items-center justify-between px-6">
                  <h3 className="text-3xl font-bold tracking-tight flex items-center gap-4 text-gray-900 dark:text-white">
                    High Probability Mentors
                    <span className="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-1 rounded-2xl text-base font-bold">{matches.length} matches</span>
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 tracking-widest uppercase">
                    AI Accuracy <ChevronRight size={14} /> <span className="text-indigo-600">98.4%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   {matches.length > 0 ? matches.map((match, i) => (
                     <motion.div 
                       initial={{ opacity: 0, x: -50 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.1 }}
                       key={i}
                       className="group bg-white dark:bg-gray-900 rounded-[3.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-4 transition-all duration-700 relative overflow-hidden"
                     >
                       <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
                       
                       <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                          <div className="relative">
                            <div className="w-40 h-40 rounded-[3rem] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-6xl font-bold text-indigo-400">
                               {match.name?.[0] || 'T'}
                            </div>
                            <div className="absolute -bottom-4 -right-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                               <ShieldCheck className="text-indigo-500" size={32} />
                            </div>
                          </div>

                          <div className="flex-1 text-center md:text-left">
                             <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                                <h4 className="text-3xl font-bold text-gray-900 dark:text-white">{match.name || 'Saritha Munasinghe'}</h4>
                                <span className="px-4 py-1 bg-teal-500/10 text-teal-600 text-xs font-bold uppercase tracking-[0.2em] rounded-full">Best Match</span>
                             </div>
                             <p className="text-indigo-500 font-bold text-lg mb-4 flex items-center justify-center md:justify-start gap-2">
                                <GraduationCap size={20} /> {match.univ || 'University of Moratuwa'}
                             </p>
                             <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                {['Combined Maths', 'Pure Maths', 'Theory'].map(t => (
                                  <span key={t} className="px-5 py-2 bg-gray-50 dark:bg-gray-800 text-gray-400 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-gray-100 dark:border-gray-700">
                                    {t}
                                  </span>
                                ))}
                             </div>
                          </div>
                       </div>

                       <div className="mt-12 pt-12 border-t border-gray-50 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                          <div className="text-center md:text-left">
                             <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Expertise</p>
                             <div className="flex items-center justify-center md:justify-start gap-2 font-bold text-gray-900 dark:text-white">
                                <Star className="text-yellow-400" size={16} fill="currentColor" /> 4.98/5.0
                             </div>
                          </div>
                          <div className="text-center md:text-left">
                             <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Distance</p>
                             <div className="flex items-center justify-center md:justify-start gap-2 font-bold text-gray-900 dark:text-white">
                                <MapPin className="text-red-400" size={16} /> Colombo, SL
                             </div>
                          </div>
                          <button className="md:col-span-1 py-5 bg-gray-950 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-bold text-sm hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 group">
                             Secure Session <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                       </div>
                     </motion.div>
                   )) : (
                     <div className="col-span-full py-20 text-center">
                        <p className="text-gray-400 font-bold">No AI matches found for this stream yet.</p>
                     </div>
                   )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default SmartMatch;
