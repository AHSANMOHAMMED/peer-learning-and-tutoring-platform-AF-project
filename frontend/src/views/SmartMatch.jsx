import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, PlayCircle, Trophy, Sparkles, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';

import Layout from '../components/Layout';
import { useAI } from '../controllers/useAI';

const MathPracticeCards = [
  { title: "Combined Mathematics", questions: 120, time: "40 min", color: "bg-[#00a8cc]" },
  { title: "Biological Sciences", questions: 85, time: "60 min", color: "bg-[#f57c00]" },
  { title: "Physics Mastery", questions: 150, time: "45 min", color: "bg-[#e53935]" },
  { title: "ICT Fundamentals", questions: 60, time: "50 min", color: "bg-[#43a047]" }
];

const LeaderboardData = [
  { name: "Eleanor Pena", score: 98, avatar: "EP" },
  { name: "Jerome Bell", score: 95, avatar: "JB" },
  { name: "Jacob Jones", score: 92, avatar: "JJ" },
  { name: "Bessie Cooper", score: 89, avatar: "BC" },
  { name: "Ronald Richards", score: 85, avatar: "RR" }
];

const SmartMatch = () => {
  const { matchTutor, loading: aiLoading } = useAI();
  const [matches, setMatches] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [stream, setStream] = useState('');

  const handleMatch = async (subject = stream) => {
    setHasSearched(true);
    setStream(subject);
    try {
      const results = await matchTutor({ stream: subject });
      setMatches(results || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout userRole="student">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col lg:flex-row gap-8 font-sans">
        
        {/* Left Content */}
        <div className="flex-1 space-y-6">
           <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">AI Skill Practices</h1>
              <p className="text-slate-500 mt-1 text-sm font-medium">Find expert mentors and generate targeted exercises.</p>
           </div>

           {/* Search Bar */}
           <div className="relative">
              <input
                 type="text"
                 placeholder="Search subjects to match tutors or practice..."
                 value={stream}
                 onChange={(e) => setStream(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleMatch()}
                 className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-16 text-slate-700 shadow-soft focus:outline-none focus:border-[#00a8cc] transition-colors"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <button 
                 onClick={() => handleMatch()}
                 disabled={aiLoading}
                 className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#00a8cc] hover:bg-[#008ba8] text-white p-2 rounded-xl transition-colors disabled:opacity-50"
              >
                 {aiLoading ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
              </button>
           </div>

           {/* Results / Default State */}
           <AnimatePresence mode="wait">
              {hasSearched ? (
                 <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 mt-6">Results for "{stream}"</h2>
                    {matches.length > 0 ? (
                       matches.map((match, idx) => (
                          <div key={idx} className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex items-center justify-between hover:border-[#00a8cc] transition-colors cursor-pointer">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#e8f6fa] text-[#00a8cc] flex items-center justify-center font-bold text-xl">
                                   {match.name?.[0] || 'M'}
                                </div>
                                <div>
                                   <h4 className="text-lg font-bold text-slate-800">{match.name || 'Expert Tutor'}</h4>
                                   <p className="text-sm font-medium text-slate-500">{match.univ || 'Certified Professional'}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <span className="bg-orange-50 text-orange-500 text-xs font-bold px-3 py-1 rounded-full">{match.rating || 4.9} ★</span>
                                <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
                                   Match <ChevronRight size={16} />
                                </button>
                             </div>
                          </div>
                       ))
                    ) : (
                       <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                          <AlertCircle size={40} className="mx-auto text-slate-300 mb-4" />
                          <h3 className="text-lg font-bold text-slate-600 mb-2">No Mentors Found</h3>
                          <p className="text-slate-400 text-sm max-w-md mx-auto">Try searching for a different subject or broad keywords like "Maths" or "Physics".</p>
                       </div>
                    )}
                 </motion.div>
              ) : (
                 <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 mt-6">Recommended Practices</h2>
                    <div className="space-y-4">
                       {MathPracticeCards.map((card, i) => (
                          <div key={i} className="bg-white p-6 rounded-2xl shadow-soft border border-transparent hover:border-slate-200 transition-colors flex items-center justify-between group">
                             <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl ${card.color} flex items-center justify-center text-white shadow-md`}>
                                   <Trophy size={24} />
                                </div>
                                <div>
                                   <h4 className="text-lg font-bold text-slate-800 mb-1">{card.title}</h4>
                                   <p className="text-sm font-medium text-slate-500">{card.questions} Questions • {card.time}</p>
                                </div>
                             </div>
                             <button onClick={() => handleMatch(card.title)} className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-[#00a8cc] group-hover:text-white group-hover:border-[#00a8cc] transition-all">
                                <PlayCircle size={24} />
                             </button>
                          </div>
                       ))}
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>

        {/* Right Sidebar - Leaderboards */}
        <div className="w-full lg:w-[350px] space-y-6 shrink-0 mt-20">
           <div className="bg-white rounded-3xl p-6 shadow-soft">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-between">
                 Leaderboards <Trophy className="text-[#f57c00]" size={20} />
              </h3>
              <div className="space-y-5">
                 {LeaderboardData.map((user, i) => (
                    <div key={i} className="flex items-center gap-4">
                       <span className="text-sm font-bold text-slate-400 w-4 text-right">{i+1}.</span>
                       <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                          {user.avatar}
                       </div>
                       <div className="flex-1">
                          <h5 className="text-[15px] font-bold text-slate-800 leading-tight">{user.name}</h5>
                          <p className="text-xs font-semibold text-[#f57c00] mt-0.5">{user.score} points</p>
                       </div>
                    </div>
                 ))}
                 <button className="w-full mt-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors">
                    View Complete List
                 </button>
              </div>
           </div>
        </div>

      </div>
    </Layout>
  );
};

export default SmartMatch;