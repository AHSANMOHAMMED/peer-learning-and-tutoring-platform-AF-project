import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Trophy, Play, RotateCcw, ArrowLeft, Timer,
  CheckCircle2, XCircle, Brain, Sparkles,
  ChevronRight, Medal, Zap, Target, Rocket,
  Cpu, Binary, Signal, ArrowUpRight, BadgeCheck,
  Terminal, Fingerprint, Layers, Globe2, Activity,
  RefreshCw,
  ArrowRight,
  Database,
  Search
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
        toast.success(`Node Synchronization Authorized `);
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
        toast.success('Neural Match Detected');
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
               <Brain className="text-indigo-600 filter drop-shadow-glow" size={60} />
               <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse text-center" />
            </div>
          </motion.div>
          <p className="text-sm font-medium uppercase tracking-normal text-slate-400 animate-pulse text-center">INITIALIZING_ARENA...</p>
       </div>
    );
  }

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
             <div className="flex items-center gap-8 text-left">
                <div className="flex items-center gap-2.5 text-left text-left">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-glow text-left" />
                   <span className="text-xs font-medium uppercase tracking-widest text-slate-950 leading-none text-left">Cognitive Mastery Arena Hub Operational  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400 text-left">
                   <Signal size={12} className="text-indigo-500 text-left h-3" />
                   <span className="text-xs font-medium uppercase tracking-widest tabular-nums leading-none text-left">SECTOR::ARENA_ELITEI</span>
                </div>
             </div>
              <div className="px-5 py-2 bg-slate-950 text-white rounded-lg text-xs font-medium uppercase tracking-widest shadow-lg text-center border border-white/5 active:scale-95 transition-all">
                 IDENT_ARENA::
              </div>
          </div>

          {/* Cognitive Mastery Hero HUB Protocol Architecture display logic protocol  display */}
          <motion.div 
            variants={itemVariants} 
            className="relative overflow-hidden rounded-2xl bg-indigo-600 p-6 md:p-12 text-white shadow-4xl text-left group"
          >
             <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none text-right" />
             
             <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12 text-left">
                <div className="flex-1 max-w-4xl space-y-10 text-left">
                   <div className="flex items-center gap-5 text-left">
                      <div className="p-4 rounded-xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-4xl transition-all duration-1000 text-center shrink-0 group-hover:rotate-6">
                         <Brain size={28} className="text-white filter drop-shadow-glow text-left" />
                      </div>
                      <div className="text-left text-left">
                         <span className="text-xs font-medium tracking-widest uppercase text-indigo-100 leading-none text-left">Sovereign Engagement Matrix Authority HUB Node  </span>
                         <div className="flex items-center gap-3 mt-2 text-left">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-glow text-left" />
                            <span className="text-xs font-medium uppercase text-white/40 tracking-widest text-left">ARENA_SECTOR</span>
                         </div>
                      </div>
                   </div>
                   <h1 className="text-4xl md:text-6xl font-medium tracking-tighter leading-none uppercase text-white text-left">
                      Mastery <br />
                      <span className="text-blue-200">Engagement Arena.</span>
                   </h1>
                   <p className="text-indigo-100 text-base font-bold leading-relaxed max-w-lg px-0 text-left underline decoration-white/10 underline-offset-8">
                      Battle through advanced adaptive challenges to solidify scholastic transcendence and verify high-fidelity cognitive resonance across the national grid  .
                   </p>
                </div>

                {/* Global Tier Sync Terminal Interface Design Logic protocol  display */}
                <div className="hidden xl:flex flex-col gap-8 shrink-0 text-left">
                   <div className="p-10 bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-4xl transition-all duration-1000 hover:bg-white/15 text-center shrink-0 cursor-default border-white/10">
                      <p className="text-sm font-medium uppercase tracking-normal text-indigo-200 mb-5 leading-none text-center">GLOBAL_TIER_COEFF</p>
                      <p className="text-6xl font-medium mb-3 tabular-nums tracking-tighter text-white leading-none text-center drop-shadow-glow-blue">ELITE-XII</p>
                      <p className="text-xs font-medium uppercase text-white/30 tracking-widest text-center leading-none h-3">NODE_AUTH__ROOT</p>
                   </div>
                </div>
             </div>
          </motion.div>

          {/* Arena Engagement Area Terminal Architecture UI Display Matrix display logic protocol area */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 text-left items-start pb-20">
             {/* Primary Engagement Zone Hub Architecture UI Protocol display logic display */}
             <div className="xl:col-span-8 text-left space-y-10">
                <AnimatePresence mode="wait">
                   {result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.98, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, y: -15 }}
                      className="bg-white border border-blue-50 rounded-3xl p-8 md:p-14 text-center shadow-4xl relative overflow-hidden group text-left border border-slate-100"
                    >
                      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-100 to-emerald-500 shadow-xl text-left" />
                      <div className="flex justify-center mb-12">
                        <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-all duration-1000 text-center shrink-0">
                          <Trophy className="w-12 h-12 text-emerald-500 text-left filter drop-shadow-glow" />
                        </div>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-medium text-slate-950 mb-4 uppercase tracking-tighter leading-none px-0 text-center">SEQUENCE_ACCOMPLISHED</h2>
                      <p className="text-slate-400 text-sm font-medium uppercase tracking-normal mb-14 px-0 leading-none text-center">Authorized <span className="text-emerald-500 underline decoration-indigo-200/20 underline-offset-4">{result.score} MERITS</span> linked to identification  buffer. </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14 text-left">
                        {[
                          { label: 'FIDELITY_COEFFICIENT', val: `${result.accuracy}%`, color: 'text-emerald-600' },
                          { label: 'CYCLE_DURATION', val: `${elapsedSeconds}S`, color: 'text-indigo-600' },
                          { label: 'MULTIPLIER__ROOT', val: 'x1.2_MASTER', color: 'text-blue-600' }
                        ].map((s, i) => (
                          <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center shadow-md hover:bg-white hover:shadow-4xl transition-all duration-700 border hover:border-indigo-100 active:scale-95">
                             <p className="text-xs font-medium text-slate-300 uppercase tracking-normal mb-4 leading-none text-center h-3">{s.label}</p>
                             <p className={cn("text-3xl font-medium leading-none tracking-tighter text-center tabular-nums", s.color)}>{s.val}</p>
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={() => resetSession()}
                        className="group h-16 px-14 bg-slate-950 text-white hover:bg-indigo-600 rounded-2xl flex items-center justify-center gap-5 transition-all duration-700 mx-auto shadow-4xl active:scale-95 text-sm font-medium uppercase tracking-normal text-center border border-white/10"
                      >
                        <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-[1500ms] text-left h-5" />
                        RE-INITIALIZE_SESSION_CYCLE
                      </button>
                      <div className="absolute bottom-6 right-6 p-14 opacity-[0.01] pointer-events-none group-hover:rotate-12 transition-all duration-[2000ms] text-right font-medium"><BadgeCheck size={180} /></div>
                    </motion.div>
                   ) : (
                    <motion.div
                      key="game-arena"
                      initial={{ opacity: 0, scale: 0.98, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="bg-white border border-blue-50 rounded-3xl overflow-hidden shadow-4xl text-left border border-slate-100"
                    >
                      {/* Arena Header Terminal UI Strip Architecture display protocol  display */}
                      <div className="bg-slate-50 border-b border-slate-100 p-8 flex flex-wrap items-center justify-between gap-10 text-left">
                         <div className="flex items-center gap-6 text-left">
                            <div className="w-13 h-13 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-inner text-left shrink-0">
                               <Zap size={24} className="text-indigo-600 animate-pulse text-left filter drop-shadow-glow" />
                            </div>
                            <div className="text-left space-y-2 text-left text-left">
                               <h3 className="text-xl font-medium text-slate-950 tracking-tighter leading-none uppercase px-0 text-left underline underline-offset-4 decoration-indigo-50">{selectedGame?.title?.toUpperCase()?.replace(/ /g, '_')}</h3>
                               <p className="text-xs font-medium text-slate-300 uppercase tracking-normal leading-none text-left">{selectedGame?.topic?.toUpperCase()} • TIER_{selectedGame?.level?.toUpperCase()}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-12 text-left text-left">
                            {hasTimer && (
                              <div className={cn("flex items-center gap-5 font-medium transition-all duration-700 text-left", remainingTime < 10 ? 'text-rose-600 animate-pulse' : 'text-indigo-600')}>
                                 <Timer size={22} className="text-left" />
                                 <span className="text-3xl tabular-nums tracking-tighter leading-none text-left">{remainingTime}S_LEFT</span>
                              </div>
                            )}
                            <div className="text-xs font-medium text-slate-400 bg-white px-8 py-3 rounded-xl border border-slate-100 uppercase tracking-normal shadow-inner leading-none text-center shrink-0 border-l-4 border-indigo-500">
                               {selectedGame?.gameType === 'quiz' ? `PHASE: ${quizIndex + 1}/${quizSessionQuestions.length}` : 'NEURAL_MATCH_LIVE'}
                            </div>
                         </div>
                      </div>

                      <div className="p-10 md:p-14 text-left">
                        {selectedGame?.gameType === 'quiz' && (
                          <div className="space-y-14 text-left">
                             <h2 className="text-2xl md:text-3xl font-medium text-slate-950 leading-tight tracking-tighter uppercase px-0 text-left underline decoration-indigo-50/20 underline-offset-10 font-medium">
                                {quizSessionQuestions[quizIndex]?.prompt}
                             </h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                                {quizSessionQuestions[quizIndex]?.options.map((opt, i) => (
                                  <button
                                    key={i}
                                    disabled={quizLocked}
                                    onClick={() => handleQuizAnswer(opt)}
                                    className={cn(
                                      "h-18 rounded-2xl border font-medium transition-all duration-700 flex items-center justify-center relative shadow-md active:scale-95 group/opt overflow-hidden px-10 text-center",
                                      quizLocked && opt === quizSessionQuestions[quizIndex].correctAnswer ? 'bg-emerald-600 text-white border-emerald-500 scale-[1.03] shadow-4xl' :
                                      quizLocked && opt === quizFeedback?.userAnswer && !quizFeedback?.correct ? 'bg-rose-600 text-white border-rose-500 scale-95 opacity-80' :
                                      !quizLocked ? 'bg-slate-50 border-slate-50 text-slate-300 hover:bg-white hover:text-slate-950 hover:border-indigo-100 hover:shadow-4xl' : 'opacity-20 grayscale border-slate-100'
                                    )}
                                  >
                                     <span className="text-[15px] uppercase tracking-tight leading-none text-center line-clamp-2">{opt}</span>
                                     <div className="absolute top-0 right-0 p-5 opacity-0 group-hover/opt:opacity-10 transition-all duration-700 text-right pointer-events-none"><Fingerprint size={32} /></div>
                                  </button>
                                ))}
                             </div>

                             <AnimatePresence>
                                {quizFeedback && (
                                  <motion.div 
                                     initial={{ opacity: 0, scale: 0.98, y: 30 }} 
                                     animate={{ opacity: 1, scale: 1, y: 0 }} 
                                     className={cn(
                                         "p-10 md:p-12 rounded-3xl border flex flex-col md:flex-row items-center gap-10 text-left relative overflow-hidden shadow-4xl transition-all duration-1000",
                                        quizFeedback.correct ? 'bg-emerald-50 border-emerald-100 shadow-emerald-100/20' : 'bg-rose-50 border-rose-100 shadow-rose-100/20'
                                     )}
                                  >
                                     <div className={cn("p-6 rounded-2xl shadow-4xl shrink-0 text-center transition-all duration-1000 hover:rotate-12", quizFeedback.correct ? 'bg-emerald-600 text-white shadow-glow-emerald' : 'bg-rose-600 text-white shadow-glow-rose')}>
                                        {quizFeedback.correct ? <Rocket className="w-8 h-8 text-left filter drop-shadow-glow" /> : <XCircle className="w-8 h-8 text-left filter drop-shadow-glow" />}
                                     </div>
                                     <div className="flex-1 text-left space-y-7">
                                        <div className="text-left">
                                           <h4 className={cn("text-xl font-medium uppercase tracking-tighter leading-none mb-4 underline underline-offset-4 decoration-current/10", quizFeedback.correct ? 'text-emerald-800' : 'text-rose-800')}>
                                             {quizFeedback.correct ? 'VERIFIED' : 'DISSONANCE_IN_SECTOR_ROOTC'}
                                           </h4>
                                           <p className="text-base text-slate-400 font-bold uppercase tracking-normal leading-relaxed px-0 border-l-4 border-current pl-5">"{quizFeedback.explanation}"</p>
                                        </div>
                                        <button 
                                          onClick={() => { if (quizIndex < quizSessionQuestions.length - 1) { setQuizIndex(prev => prev + 1); setQuizLocked(false); setQuizFeedback(null); } else { handleFinishGame(); } }}
                                          className="h-14 px-12 bg-slate-950 text-white rounded-xl text-sm font-medium uppercase tracking-normal shadow-4xl hover:bg-indigo-600 transition-all duration-1000 active:scale-95 group/next flex items-center justify-center gap-5 border border-white/10"
                                        >
                                          Advance_Neural_Sync_Flow <ArrowRight size={20} className="group-hover:translate-x-3 transition-all duration-700" />
                                        </button>
                                     </div>
                                     <div className="absolute top-0 right-0 p-12 opacity-[0.04] pointer-events-none transition-all duration-[2000ms] group-hover:rotate-12 text-right h-48 w-48"><Signal size={180} /></div>
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
                                    "aspect-square rounded-2xl border flex items-center justify-center p-6 transition-all duration-[1000ms] shadow-xl active:scale-90 group/card text-center overflow-hidden border border-slate-100",
                                    memoryMatched.includes(card.pairId) ? 'bg-emerald-600 text-white border-emerald-500 opacity-20 grayscale shadow-none' :
                                    memorySelected.find(c => c.id === card.id) ? 'bg-indigo-600 text-white border-indigo-500 scale-[1.05] shadow-4xl shadow-indigo-200/40' : 'bg-slate-50 border-slate-50 hover:border-indigo-100 text-slate-100 hover:bg-white hover:shadow-4xl'
                                 )}
                               >
                                  <span className={cn(
                                     "text-sm font-medium uppercase text-center leading-tight tracking-normal transition-all duration-1000",
                                     memorySelected.find(c => c.id === card.id) || memoryMatched.includes(card.pairId) ? 'text-white opacity-100 scale-110 shadow-glow' : 'text-slate-100 opacity-10 blur-[3px] group-hover:blur-0 group-hover:opacity-60'
                                  )}>
                                     {memorySelected.find(c => c.id === card.id) || memoryMatched.includes(card.pairId) ? card.label?.toUpperCase()?.replace(/ /g, '_') : 'NODE'}
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

             {/* Tactical Sidebar  Hub Visualizer UI Architecture Display Matrix display logic protocol logic */}
             <div className="xl:col-span-4 space-y-10 text-left">
                <motion.div variants={itemVariants} className="bg-white border border-blue-50 rounded-3xl p-8 md:p-10 shadow-4xl text-left relative overflow-hidden group border border-slate-100">
                   <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-all duration-[2000ms] text-right font-medium"><Target size={140} className="text-indigo-600" /></div>
                   <h3 className="text-xl font-medium tracking-tighter mb-12 flex items-center gap-5 uppercase text-slate-950 leading-none relative z-10 text-left underline decoration-indigo-50 underline-offset-6">
                      <Terminal className="text-indigo-600 text-left" size={22} /> METRIC_STREAM
                   </h3>
                   <div className="space-y-12 relative z-10 text-left">
                      <div className="space-y-7 text-left">
                         <div className="flex justify-between items-center px-1 text-left">
                            <span className="text-sm font-medium uppercase tracking-normal text-slate-300 leading-none px-0 h-3">INTEGRITY_COEFF</span>
                            <span className="text-indigo-600 text-sm font-medium uppercase tracking-normal animate-pulse leading-none text-right px-0 shadow-glow h-3">PHASE_{quizIndex + 1}_LIVE</span>
                         </div>
                         <div className="h-2.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden shadow-inner relative text-left">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${selectedGame?.gameType === 'quiz' ? (quizIndex / (quizSessionQuestions.length || 1)) * 100 : (memoryMatched.length / (selectedGame?.pairs?.length || 1)) * 100}%` }}
                               className="h-full bg-indigo-600 rounded-full shadow-glow text-left" 
                            />
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6 text-left">
                         <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl shadow-md hover:bg-white hover:shadow-4xl hover:border-indigo-100 transition-all duration-[1000ms] text-center cursor-default active:scale-95 group/stat">
                            <p className="text-xs font-medium text-slate-300 uppercase tracking-normal mb-4 leading-none text-center h-3 group-hover/stat:text-indigo-600">CYCLE_INDEX</p>
                            <p className="text-3xl font-medium tabular-nums tracking-tighter leading-none text-slate-950 text-center group-hover/stat:scale-110 transition-all">42</p>
                         </div>
                         <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl shadow-md hover:bg-white hover:shadow-4xl hover:border-indigo-100 transition-all duration-[1000ms] text-center cursor-default active:scale-95 group/stat">
                            <p className="text-xs font-medium text-slate-300 uppercase tracking-normal mb-4 leading-none text-center h-3 group-hover/stat:text-emerald-600">FIDELITY_CO</p>
                            <p className="text-3xl font-medium tabular-nums tracking-tighter leading-none text-slate-950 text-center group-hover/stat:scale-110 transition-all">92%</p>
                         </div>
                      </div>
                   </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white border border-blue-50 rounded-3xl p-8 md:p-10 shadow-4xl text-left relative overflow-hidden group cursor-pointer hover:border-indigo-100 transition-all duration-1000 border border-slate-100">
                   <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-all duration-[2000ms] text-right h-40 w-40 font-medium"><Medal size={160} className="text-amber-500" /></div>
                   <h3 className="text-xl font-medium tracking-tighter mb-12 flex items-center gap-5 uppercase text-slate-950 leading-none relative z-10 text-left underline decoration-amber-50 underline-offset-6">
                      <Signal className="text-amber-600 text-left h-5" size={24} /> SECTOR_DOMINION_LOGS_ROOT
                   </h3>
                   <div className="space-y-5 relative z-10 text-left">
                      {leaderboard.slice(0, 5).map((e, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-4xl hover:border-indigo-100 transition-all duration-700 group/rank shadow-md text-left active:scale-[0.98]">
                           <div className="flex items-center gap-6 text-left text-left">
                               <span className={cn("text-2xl font-medium tabular-nums tracking-tighter text-left shrink-0 transition-all duration-1000 group-hover/rank:scale-125", i === 0 ? 'text-amber-600 drop-shadow-glow' : 'text-slate-200 group-hover/rank:text-indigo-600')}>#{i + 1}</span>
                               <div className="text-left space-y-2 text-left overflow-hidden">
                                  <p className="text-[12px] font-medium uppercase tracking-tight leading-none px-0 text-slate-950 text-left line-clamp-1">{e.user?.username?.toUpperCase() || 'NODE_CANDIDATE_ROOT'}</p>
                                  <p className="text-xs font-medium text-slate-300 uppercase tracking-normal leading-none pt-0.5 text-left underline decoration-indigo-50 underline-offset-2 h-3">{e.accuracy}% FIDELITY</p>
                               </div>
                           </div>
                           <span className="text-2xl font-medium text-indigo-600 tabular-nums tracking-tighter text-right shrink-0 shadow-glow">{e.bestScore}</span>
                        </div>
                      ))}
                   </div>
                </motion.div>
             </div>
          </div>
        </motion.div>

        {/* Global Hub Authority terminal indicator UI Matrix Architecture Display Logic protocol  display */}
        <div className="fixed bottom-10 left-10 z-50 pointer-events-none text-left group/fixed opacity-30 hover:opacity-100 transition-all duration-[1000ms]">
           <div className="flex items-center gap-8 py-5 px-10 bg-white/60 backdrop-blur-3xl rounded-full border border-blue-50 shadow-4xl cursor-default text-left shadow-glow">
              <div className="relative text-left">
                 <Binary size={26} className="text-indigo-600 animate-[spin_20s_linear_infinite] text-left shadow-glow" />
                 <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 text-left" />
              </div>
              <div className="flex flex-col text-left text-left">
                 <p className="text-sm font-medium uppercase tracking-normal text-slate-950 leading-none text-left">Arena Sector Prime HUB  ACTIVE</p>
                 <div className="flex items-center gap-5 mt-2.5 text-xs font-medium uppercase text-indigo-600 tracking-widest leading-none text-left h-4">
                    <Database size={16} className="text-left" /> Integrity: GRID::ARENA_ELITEI :: national_sync_repos_ sector_
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default LearningGamesPage;