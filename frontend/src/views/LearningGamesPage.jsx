import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Trophy, Play, RotateCcw, ArrowLeft, Timer,
  CheckCircle2, XCircle, Brain, Sparkles,
  ChevronRight, Medal, Zap, Target, Rocket,
  Activity, ArrowRight, Database, Search,
  LayoutGrid, Star, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { learningGamesApi } from '../services/api';
import { useAuth } from '../controllers/useAuth';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';

const LearningGamesPage = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [loading, setLoading] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSessionQuestions, setQuizSessionQuestions] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [quizLocked, setQuizLocked] = useState(false);
  const [memoryDeck, setMemoryDeck] = useState([]);
  const [memorySelected, setMemorySelected] = useState([]);
  const [memoryMatched, setMemoryMatched] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const mountedRef = useRef(false);

  const selectedGame = useMemo(
    () => games.find((game) => game.gameId === selectedGameId) || games[0] || null,
    [games, selectedGameId]
  );

  const hasTimer = Boolean(selectedGame?.timerEnabled);
  const timeLimit = selectedGame?.timeLimit || 0;
  const remainingTime = hasTimer ? Math.max(timeLimit - elapsedSeconds, 0) : null;

  const refreshLeaderboard = async (game = selectedGame) => {
    try {
      const params = game ? { gameId: game.gameId, limit: 8 } : { limit: 8 };
      const res = await learningGamesApi.getLeaderboard(params);
      if (res.success) setLeaderboard(res.data.leaderboard || []);
    } catch (err) { console.error(err); }
  };

  const loadData = async (preferredGameId = null) => {
    try {
      const catalogRes = await learningGamesApi.getCatalog();
      if (!catalogRes.success) throw new Error('Failed to load games');
      const catalog = catalogRes.data.catalog || [];
      setGames(catalog);
      const targetGameId = preferredGameId || gameId || null;
      const initialGame = catalog.find((g) => g.gameId === targetGameId) || catalog[0] || null;
      if (initialGame) setSelectedGameId(initialGame.gameId);
      await refreshLeaderboard(initialGame);
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

  const createMemoryDeck = (game) => {
    if (!game?.pairs || !Array.isArray(game.pairs)) return [];
    return shuffle(
      game.pairs.flatMap((pair) => [
        { id: `${pair.id}-left`, pairId: pair.id, label: pair.left, side: 'left' },
        { id: `${pair.id}-right`, pairId: pair.id, label: pair.right, side: 'right' }
      ])
    );
  };

  const createQuizSessionQuestions = (game) => {
    if (!game?.questions || !Array.isArray(game.questions)) return [];
    return shuffle(game.questions).map((question, index) => ({
      ...question,
      sessionId: `${index}-${question.prompt}`,
      options: shuffle(question.options || [])
    }));
  };

  const resetSession = (game = selectedGame) => {
    if (!game) return;
    setElapsedSeconds(0);
    setIsRunning(true);
    setResult(null);
    setQuizIndex(0);
    setQuizAnswers({});
    setQuizSessionQuestions(game.gameType === 'quiz' ? createQuizSessionQuestions(game) : []);
    setQuizFeedback(null);
    setQuizLocked(false);
    setMemoryDeck(game.gameType === 'memory' ? createMemoryDeck(game) : []);
    setMemorySelected([]);
    setMemoryMatched([]);
  };

  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; loadData(gameId || null); return; }
    if (selectedGame) { resetSession(selectedGame); refreshLeaderboard(selectedGame); }
  }, [selectedGameId]);

  useEffect(() => {
    if (!isRunning || !hasTimer || result || !selectedGame) return;
    const intervalId = setInterval(() => setElapsedSeconds((c) => c + 1), 1000);
    return () => clearInterval(intervalId);
  }, [isRunning, hasTimer, result, selectedGame]);

  useEffect(() => {
    if (selectedGame?.gameType !== 'memory') return;
    if (memoryMatched.length === selectedGame.pairs.length && !result) handleFinishGame();
  }, [memoryMatched, selectedGame]);

  const handleFinishGame = async (isTimeOut = false) => {
    if (!selectedGame || submitting) return;
    setSubmitting(true);
    setIsRunning(false);
    let score = 0, accuracy = 0;
    if (selectedGame.gameType === 'quiz') {
      const correct = Object.values(quizAnswers).filter((v, i) => v === quizSessionQuestions[i].correctAnswer).length;
      accuracy = (correct / quizSessionQuestions.length) * 100;
      score = Math.round((correct / quizSessionQuestions.length) * selectedGame.maxScore);
    } else if (selectedGame.gameType === 'memory') {
      accuracy = 100;
      score = Math.round(Math.max(selectedGame.maxScore - elapsedSeconds * 2, selectedGame.maxScore * 0.5));
    }
    try {
      const res = await learningGamesApi.submitAttempt({ gameId: selectedGame.gameId, score, accuracy, timeSpent: elapsedSeconds, isTimeOut });
      if (res.success) {
        setResult({ ...res.data, score, accuracy, isTimeOut });
        toast.success(`Module Completion Verified`);
        await refreshLeaderboard();
      }
    } catch (err) { toast.error('Failed to save result'); } finally { setSubmitting(false); }
  };

  const handleQuizAnswer = (answer) => {
    const current = quizSessionQuestions[quizIndex];
    if (!current || quizLocked) return;
    const correct = answer === current.correctAnswer;
    setQuizLocked(true);
    setQuizAnswers(prev => ({ ...prev, [current.prompt]: answer }));
    setQuizFeedback({ prompt: current.prompt, userAnswer: answer, correctAnswer: current.correctAnswer, correct, explanation: current.explanation });
  };

  const handleMemorySelect = (card) => {
    if (memorySelected.length === 2 || memoryMatched.includes(card.pairId) || memorySelected.find(c => c.id === card.id)) return;
    const newSelected = [...memorySelected, card];
    setMemorySelected(newSelected);
    if (newSelected.length === 2) {
      if (newSelected[0].pairId === newSelected[1].pairId) {
        setMemoryMatched([...memoryMatched, newSelected[0].pairId]);
        setMemorySelected([]);
        toast.success('Professional Match Detected');
      } else {
        setTimeout(() => setMemorySelected([]), 1000);
      }
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
       <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-12 text-center">
          <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="text-center">
            <div className="relative text-center">
               <Brain className="text-indigo-600" size={60} />
               <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse text-center" />
            </div>
          </motion.div>
          <p className="text-sm font-medium uppercase tracking-widest text-slate-400 animate-pulse text-center">Preparing Learning Arena...</p>
       </div>
    );
  }

  return (
    <Layout userRole="student">
      <div className="min-h-screen bg-[#fafafc] text-slate-900 selection:bg-indigo-500/10 overflow-x-hidden relative text-left p-6 md:p-8">
        <motion.div 
          className="relative z-10 max-w-[1440px] mx-auto space-y-8 text-left"
          variants={containerVariants}
          initial="hidden" animate="visible"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-slate-200 pb-8">
             <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-100 mb-4">
                  <Play size={14} /> Academic Mastery
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none mb-2">
                   Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-600">Arena</span>
                </h1>
                <p className="text-slate-500 font-medium font-sans">Sharpen your knowledge through adaptive challenges and interactive exercises.</p>
             </div>
             
             <div className="flex items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm gap-6">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-100">
                   <Medal size={32} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rank Progress</p>
                   <p className="text-3xl font-black text-slate-800 tracking-tight">Level 12</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 text-left items-start pb-20">
             {/* Primary Engagement Zone */}
             <div className="xl:col-span-8 text-left space-y-10">
                <AnimatePresence mode="wait">
                   {result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.98, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, y: -15 }}
                      className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-14 text-center shadow-lg relative overflow-hidden group text-left"
                    >
                      <div className="flex justify-center mb-12">
                        <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-all duration-1000 text-center shrink-0">
                          <Trophy className="w-12 h-12 text-emerald-500" />
                        </div>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 uppercase tracking-tight leading-none text-center">Challenge Completed</h2>
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-14 leading-none text-center">You have earned <span className="text-emerald-500">{result.score} Points</span> for your performance.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14 text-left">
                        {[
                          { label: 'Accuracy', val: `${result.accuracy}%`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                          { label: 'Time Spent', val: `${elapsedSeconds}s`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                          { label: 'Bonus Multiplier', val: '1.2x', color: 'text-blue-600', bg: 'bg-blue-50' }
                        ].map((s, i) => (
                          <div key={i} className={cn("rounded-3xl p-8 text-center border border-transparent hover:border-slate-200 transition-all duration-500", s.bg)}>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 leading-none text-center h-3">{s.label}</p>
                             <p className={cn("text-3xl font-black leading-none tracking-tight text-center tabular-nums", s.color)}>{s.val}</p>
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={() => resetSession()}
                        className="group h-16 px-14 bg-slate-800 hover:bg-slate-900 text-white rounded-[2rem] flex items-center justify-center gap-5 transition-all mx-auto shadow-xl active:scale-95 text-sm font-bold uppercase tracking-widest text-center"
                      >
                        <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                        Restart Session
                      </button>
                    </motion.div>
                   ) : (
                    <motion.div
                      key="game-arena"
                      initial={{ opacity: 0, scale: 0.98, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl text-left"
                    >
                      {/* Arena Header */}
                      <div className="bg-slate-50 border-b border-slate-100 p-8 flex flex-wrap items-center justify-between gap-10 text-left">
                         <div className="flex items-center gap-6 text-left">
                            <div className="w-13 h-13 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm text-left shrink-0 p-3">
                               <Sparkles size={24} className="text-indigo-500" />
                            </div>
                            <div className="text-left space-y-2">
                               <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase">{selectedGame?.title || 'Learning Module'}</h3>
                               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">{selectedGame?.topic} • {selectedGame?.level} Difficulty</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-12 text-left">
                            {hasTimer && (
                              <div className={cn("flex items-center gap-4 font-bold transition-all duration-500 text-left", remainingTime < 10 ? 'text-rose-600 animate-pulse' : 'text-indigo-600')}>
                                 <Timer size={22} />
                                 <span className="text-3xl tabular-nums tracking-tight leading-none">{remainingTime}s Remaining</span>
                              </div>
                            )}
                            <div className="text-xs font-black text-slate-400 bg-white px-8 py-3 rounded-2xl border border-slate-100 uppercase tracking-widest shadow-inner leading-none text-center shrink-0 border-l-4 border-indigo-500">
                               {selectedGame?.gameType === 'quiz' ? `Question ${quizIndex + 1} of ${quizSessionQuestions.length}` : 'Pair Matching'}
                            </div>
                         </div>
                      </div>

                      <div className="p-10 md:p-14 text-left">
                        {selectedGame?.gameType === 'quiz' && (
                          <div className="space-y-14 text-left">
                             <h2 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight tracking-tight uppercase">
                                {quizSessionQuestions[quizIndex]?.prompt}
                             </h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                                {quizSessionQuestions[quizIndex]?.options.map((opt, i) => (
                                  <button
                                    key={i}
                                    disabled={quizLocked}
                                    onClick={() => handleQuizAnswer(opt)}
                                    className={cn(
                                      "h-20 rounded-3xl border font-bold transition-all flex items-center justify-center relative shadow-sm active:scale-95 group/opt overflow-hidden px-10 text-center",
                                      quizLocked && opt === quizSessionQuestions[quizIndex].correctAnswer ? 'bg-emerald-600 text-white border-emerald-500 scale-[1.03] shadow-lg' :
                                      quizLocked && opt === quizFeedback?.userAnswer && !quizFeedback?.correct ? 'bg-rose-600 text-white border-rose-500 scale-95 opacity-80' :
                                      !quizLocked ? 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md' : 'opacity-20 grayscale'
                                    )}
                                  >
                                     <span className="text-[15px] uppercase tracking-widest leading-none text-center line-clamp-2">{opt}</span>
                                  </button>
                                ))}
                             </div>

                             <AnimatePresence>
                                {quizFeedback && (
                                  <motion.div 
                                     initial={{ opacity: 0, scale: 0.98, y: 30 }} 
                                     animate={{ opacity: 1, scale: 1, y: 0 }} 
                                     className={cn(
                                         "p-10 md:p-12 rounded-[2.5rem] border flex flex-col md:flex-row items-center gap-10 text-left relative overflow-hidden shadow-lg",
                                        quizFeedback.correct ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
                                     )}
                                  >
                                     <div className={cn("p-6 rounded-3xl shadow-md shrink-0 text-center", quizFeedback.correct ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')}>
                                        {quizFeedback.correct ? <Rocket className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                                     </div>
                                     <div className="flex-1 text-left space-y-7">
                                        <div className="text-left">
                                           <h4 className={cn("text-xl font-black uppercase tracking-tight leading-none mb-4", quizFeedback.correct ? 'text-emerald-800' : 'text-rose-800')}>
                                             {quizFeedback.correct ? 'Perfectly Correct' : 'Incorrect Response'}
                                           </h4>
                                           <p className="text-base text-slate-600 font-bold uppercase tracking-widest leading-relaxed border-l-4 border-current pl-5">"{quizFeedback.explanation}"</p>
                                        </div>
                                        <button 
                                          onClick={() => { if (quizIndex < quizSessionQuestions.length - 1) { setQuizIndex(prev => prev + 1); setQuizLocked(false); setQuizFeedback(null); } else { handleFinishGame(); } }}
                                          className="h-14 px-12 bg-slate-800 text-white rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg hover:bg-slate-900 transition-all active:scale-95 group/next flex items-center justify-center gap-5"
                                        >
                                          Continue Challenge <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                        </button>
                                     </div>
                                  </motion.div>
                                )}
                             </AnimatePresence>
                          </div>
                        )}

                        {selectedGame?.gameType === 'memory' && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6 text-left">
                             {memoryDeck.map((card, idx) => (
                               <button
                                 key={idx}
                                 onClick={() => handleMemorySelect(card)}
                                 className={cn(
                                    "aspect-square rounded-3xl border flex items-center justify-center p-6 transition-all shadow-md active:scale-90 group/card text-center overflow-hidden",
                                    memoryMatched.includes(card.pairId) ? 'bg-emerald-600 text-white border-emerald-500 opacity-20 grayscale shadow-none' :
                                    memorySelected.find(c => c.id === card.id) ? 'bg-indigo-600 text-white border-indigo-500 scale-[1.05] shadow-lg' : 'bg-slate-50 border-slate-100 hover:border-indigo-100 text-slate-300 hover:bg-white hover:text-indigo-600'
                                 )}
                               >
                                  <span className={cn(
                                     "text-sm font-black uppercase text-center leading-tight tracking-widest transition-all",
                                     memorySelected.find(c => c.id === card.id) || memoryMatched.includes(card.pairId) ? 'text-white opacity-100 scale-110' : 'text-slate-300 opacity-20 group-hover:opacity-100'
                                  )}>
                                     {memorySelected.find(c => c.id === card.id) || memoryMatched.includes(card.pairId) ? card.label?.toUpperCase() : 'Aura'}
                                  </span>
                               </button>
                             ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                   )}
                </AnimatePresence>
             </div>

             {/* Sidebar Info */}
             <div className="xl:col-span-4 space-y-10 text-left">
                <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-lg text-left relative overflow-hidden group">
                   <h3 className="text-xl font-black text-slate-800 mb-12 flex items-center gap-4 uppercase leading-none relative z-10 text-left">
                      <TrendingUp size={22} className="text-indigo-500" /> Platform Insights
                   </h3>
                   <div className="space-y-12 relative z-10 text-left">
                      <div className="space-y-7 text-left">
                         <div className="flex justify-between items-center px-1 text-left">
                            <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Completion</span>
                            <span className="text-indigo-600 text-[10px] font-black uppercase tracking-widest animate-pulse h-3">Live Progress</span>
                         </div>
                         <div className="h-3 bg-slate-100 rounded-full overflow-hidden w-full shadow-inner">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${selectedGame?.gameType === 'quiz' ? (quizIndex / (quizSessionQuestions.length || 1)) * 100 : (memoryMatched.length / (selectedGame?.pairs?.length || 1)) * 100}%` }}
                               className="h-full bg-indigo-500 rounded-full" 
                            />
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6 text-left">
                         <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 leading-none">Experience</p>
                            <p className="text-3xl font-black text-slate-800 tracking-tight">420</p>
                         </div>
                         <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 leading-none">Accuracy</p>
                            <p className="text-3xl font-black text-slate-800 tracking-tight">92%</p>
                         </div>
                      </div>
                   </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-lg text-left relative overflow-hidden group">
                   <h3 className="text-xl font-black text-slate-800 mb-12 flex items-center gap-4 uppercase leading-none relative z-10 text-left">
                      <Star size={22} className="text-amber-500" /> Top Performers
                   </h3>
                   <div className="space-y-5 relative z-10 text-left">
                      {leaderboard.slice(0, 5).map((e, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md transition-all group/rank text-left">
                           <div className="flex items-center gap-6 text-left">
                               <span className={cn("text-2xl font-black tracking-tighter shrink-0 transition-all", i === 0 ? 'text-amber-600' : 'text-slate-300 group-hover/rank:text-indigo-600')}>#{i + 1}</span>
                               <div className="text-left space-y-1">
                                  <p className="text-sm font-black uppercase text-slate-800 leading-none">{e.user?.username || 'Student'}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{e.accuracy}% Correct</p>
                               </div>
                           </div>
                           <span className="text-2xl font-black text-indigo-600 tabular-nums tracking-tighter">{e.bestScore}</span>
                        </div>
                      ))}
                   </div>
                </motion.div>
             </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default LearningGamesPage;