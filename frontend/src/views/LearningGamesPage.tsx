import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Trophy, 
  Gamepad2, 
  Search, 
  Filter, 
  Play, 
  Clock, 
  BarChart3, 
  Flame, 
  BadgeCheck, 
  RotateCcw, 
  ArrowLeft,
  Timer,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Brain,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Medal,
  Users,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { learningGamesApi } from '../services/api';
import { useAuth } from '../controllers/useAuth';
import Layout from '../components/Layout';

const topicMeta: any = {
  math: { label: 'Mathematics', accent: 'bg-emerald-100 text-emerald-800' },
  science: { label: 'Science', accent: 'bg-blue-100 text-blue-800' },
  history: { label: 'History', accent: 'bg-amber-100 text-amber-800' },
  'general-knowledge': { label: 'General Knowledge', accent: 'bg-rose-100 text-rose-800' }
};

const levelMeta: any = {
  easy: { label: 'Easy', accent: 'bg-emerald-100 text-emerald-800' },
  medium: { label: 'Medium', accent: 'bg-amber-100 text-amber-800' },
  hard: { label: 'Hard', accent: 'bg-rose-100 text-rose-800' }
};

const shuffle = (items: any[]) => [...items].sort(() => Math.random() - 0.5);

const createMemoryDeck = (game: any) => {
  if (!game?.pairs || !Array.isArray(game.pairs)) {
    return [];
  }

  return shuffle(
    game.pairs.flatMap((pair: any) => ([
      { id: `${pair.id}-left`, pairId: pair.id, label: pair.left, side: 'left' },
      { id: `${pair.id}-right`, pairId: pair.id, label: pair.right, side: 'right' }
    ]))
  );
};

const createQuizSessionQuestions = (game: any) => {
  if (!game?.questions || !Array.isArray(game.questions)) {
    return [];
  }

  return shuffle(game.questions).map((question: any, index: number) => ({
    ...question,
    sessionId: `${index}-${question.prompt}`,
    options: shuffle(question.options || [])
  }));
};

const formatPercent = (value: any) => `${Math.max(0, Math.min(100, Number(value) || 0)).toFixed(0)}%`;

const LearningGamesPage: React.FC = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { user } = useAuth();
  const [games, setGames] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [error, setError] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<any>({});
  const [quizSessionQuestions, setQuizSessionQuestions] = useState<any[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<any>(null);
  const [quizLocked, setQuizLocked] = useState(false);
  const [puzzleOrder, setPuzzleOrder] = useState<any[]>([]);
  const [memoryDeck, setMemoryDeck] = useState<any[]>([]);
  const [memorySelected, setMemorySelected] = useState<any[]>([]);
  const [memoryMatched, setMemoryMatched] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
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
      setLoadingBoard(true);
      const params = game
        ? {
            limit: 8,
            gameId: game.gameId,
            gameType: game.gameType,
            topic: game.topic,
            level: game.level
          }
        : { limit: 8 };

      const leaderboardRes = await learningGamesApi.getLeaderboard(params);
      if (leaderboardRes.success) {
        setLeaderboard(leaderboardRes.data.leaderboard || []);
      }
    } catch (err) {
      console.error('Error refreshing leaderboard:', err);
    } finally {
      setLoadingBoard(false);
    }
  };

  const loadData = async (preferredGameId: string | null = null) => {
    try {
      setLoading(true);
      const catalogRes = await learningGamesApi.getCatalog();

      if (!catalogRes.success) {
        throw new Error(catalogRes.message || 'Failed to load games');
      }

      const catalog = catalogRes.data.catalog || [];
      setGames(catalog);
      setSummary(catalogRes.data.summary || null);

      const targetGameId = preferredGameId || gameId || null;
      const initialGame = catalog.find((game: any) => game.gameId === targetGameId) || catalog[0] || null;
      if (initialGame) {
        setSelectedGameId(initialGame.gameId);
      }

      await refreshLeaderboard(initialGame);
    } catch (fetchError: any) {
      console.error('Error loading learning games:', fetchError);
      setError(fetchError.message || 'Unable to load learning games');
    } finally {
      setLoading(false);
    }
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
    setPuzzleOrder([]);
    setMemoryDeck(game.gameType === 'memory' ? createMemoryDeck(game) : []);
    setMemorySelected([]);
    setMemoryMatched([]);
  };

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      loadData(gameId || null);
      return;
    }

    if (selectedGame) {
      resetSession(selectedGame);
      refreshLeaderboard(selectedGame);
    }
  }, [selectedGameId]);

  useEffect(() => {
    if (gameId && gameId !== selectedGameId) {
      setSelectedGameId(gameId);
    }
  }, [gameId, selectedGameId]);

  useEffect(() => {
    if (!isRunning || !hasTimer || result || !selectedGame) return;

    const intervalId = setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, hasTimer, result, selectedGame]);

  useEffect(() => {
    if (!selectedGame || !hasTimer || result) return;

    if (elapsedSeconds >= timeLimit && !submitting) {
      handleFinishGame(true);
    }
  }, [elapsedSeconds, selectedGame, hasTimer, result, submitting]);

  useEffect(() => {
    if (selectedGame?.gameType !== 'memory') return;

    if (memoryMatched.length === selectedGame.pairs.length && !result) {
      handleFinishGame();
    }
  }, [memoryMatched, selectedGame, result]);

  const currentQuestion = selectedGame?.gameType === 'quiz'
    ? quizSessionQuestions?.[quizIndex]
    : null;

  const handleFinishGame = async (isTimeOut = false) => {
    if (!selectedGame || submitting) return;

    setSubmitting(true);
    setIsRunning(false);

    let score = 0;
    let accuracy = 0;
    
    if (selectedGame.gameType === 'quiz') {
      const correctCount = Object.values(quizAnswers).filter((v, i) => v === quizSessionQuestions[i].correctAnswer).length;
      accuracy = (correctCount / quizSessionQuestions.length) * 100;
      score = Math.round((correctCount / quizSessionQuestions.length) * selectedGame.maxScore);
    } else if (selectedGame.gameType === 'memory') {
      accuracy = 100; // Found all pairs
      score = Math.round(Math.max(selectedGame.maxScore - (elapsedSeconds * 2), selectedGame.maxScore * 0.5));
    }

    try {
      const payload = {
        gameId: selectedGame.gameId,
        score,
        accuracy,
        timeSpent: elapsedSeconds,
        isTimeOut
      };

      const res = await learningGamesApi.submitAttempt(payload);
      if (res.success) {
        setResult({
          ...res.data,
          score,
          accuracy,
          isTimeOut
        });
        toast.success(`Game finished! Score: ${score}`);
        await refreshLeaderboard();
      }
    } catch (err) {
      console.error('Error submitting attempt:', err);
      toast.error('Failed to save game result');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuizAnswer = (answer: string) => {
    if (!selectedGame || !currentQuestion || quizLocked) return;

    const correct = answer === currentQuestion.correctAnswer;
    setQuizLocked(true);
    setQuizAnswers((currentAnswers: any) => ({
      ...currentAnswers,
      [currentQuestion.prompt]: answer
    }));
    setQuizFeedback({
      prompt: currentQuestion.prompt,
      userAnswer: answer,
      correctAnswer: currentQuestion.correctAnswer,
      correct,
      explanation: currentQuestion.explanation
    });
  };

  const handleQuizNext = () => {
    if (!selectedGame) return;

    if (quizIndex < quizSessionQuestions.length - 1) {
      setQuizIndex((currentIndex) => currentIndex + 1);
      setQuizLocked(false);
      setQuizFeedback(null);
    } else {
      handleFinishGame();
    }
  };

  const handleMemorySelect = (card: any) => {
    if (memoryLocked || memoryMatched.includes(card.pairId) || memorySelected.find(c => c.id === card.id)) return;

    const newSelected = [...memorySelected, card];
    setMemorySelected(newSelected);

    if (newSelected.length === 2) {
      if (newSelected[0].pairId === newSelected[1].pairId) {
        setMemoryMatched(prev => [...prev, card.pairId]);
        setMemorySelected([]);
        toast.success('Match found!');
      } else {
        setQuizLocked(true); // Lock input during flip
        setTimeout(() => {
          setMemorySelected([]);
          setQuizLocked(false);
        }, 1000);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Initializing Neural Link...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
                <Brain size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Learning Games</h1>
                <p className="text-slate-500 dark:text-slate-400">Master subjects through interactive challenges.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/qa')}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft size={18} />
                Return to Forum
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Main Game Interface */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-12 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex justify-center mb-6">
                      <div className="flex h-24 w-24 items-center justify-center rounded-[3rem] bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10">
                        <Trophy size={48} />
                      </div>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white">Challenge Complete!</h2>
                    <p className="mt-4 text-xl text-slate-500">You earned <span className="font-bold text-indigo-500">{result.score} XP</span> from this session.</p>
                    
                    <div className="mt-10 grid grid-cols-3 gap-6">
                      <div className="rounded-3xl bg-slate-50 p-6 dark:bg-slate-800/50">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Accuracy</p>
                        <p className="text-2xl font-black text-emerald-500">{formatPercent(result.accuracy)}</p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-6 dark:bg-slate-800/50">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Time</p>
                        <p className="text-2xl font-black text-indigo-500">{elapsedSeconds}s</p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-6 dark:bg-slate-800/50">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Multiplier</p>
                        <p className="text-2xl font-black text-purple-500">x1.2</p>
                      </div>
                    </div>

                    <button
                      onClick={() => resetSession()}
                      className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-indigo-600 px-10 py-5 text-lg font-bold text-white shadow-xl shadow-indigo-500/30 transition hover:-translate-y-1 hover:bg-indigo-700"
                    >
                      <RotateCcw size={22} />
                      Challenge Again
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="game"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6 dark:border-slate-800 dark:bg-slate-800/50">
                      <div className="flex items-center gap-4">
                         <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                           <Play size={24} />
                         </div>
                         <div>
                           <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{selectedGame?.title}</h2>
                           <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">{selectedGame?.topic} • {selectedGame?.level}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {hasTimer && (
                          <div className={`flex items-center gap-2 text-lg font-black ${remainingTime! < 10 ? 'text-rose-500 animate-pulse' : 'text-slate-700 dark:text-white'}`}>
                            <Timer size={20} />
                            {remainingTime}s
                          </div>
                        )}
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                          {selectedGame?.gameType === 'quiz' ? `Step ${quizIndex + 1} of ${quizSessionQuestions.length}` : 'Neural Link Active'}
                        </div>
                      </div>
                    </div>

                    <div className="p-8 md:p-12">
                      {selectedGame?.gameType === 'quiz' && (
                        <div className="space-y-10">
                           <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                             {currentQuestion?.prompt}
                           </h3>
                           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                             {currentQuestion?.options.map((option: string) => (
                               <button
                                 key={option}
                                 disabled={quizLocked}
                                 onClick={() => handleQuizAnswer(option)}
                                 className={`
                                   flex items-center justify-center rounded-3xl border-2 px-8 py-5 text-lg font-bold transition-all
                                   ${quizLocked && option === currentQuestion.correctAnswer ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''}
                                   ${quizLocked && option === quizFeedback?.userAnswer && !quizFeedback?.correct ? 'border-rose-500 bg-rose-50 text-rose-700' : ''}
                                   ${!quizLocked ? 'border-slate-100 bg-white hover:border-indigo-500 hover:bg-indigo-50 text-slate-700' : 'cursor-default'}
                                 `}
                               >
                                 {option}
                               </button>
                             ))}
                           </div>

                           {quizFeedback && (
                             <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`rounded-3xl p-8 border-2 ${quizFeedback.correct ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
                               <div className="flex items-center gap-3 mb-2">
                                 {quizFeedback.correct ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-rose-500" />}
                                 <h4 className={`text-lg font-bold ${quizFeedback.correct ? 'text-emerald-700' : 'text-rose-700'}`}>
                                   {quizFeedback.correct ? 'Brilliant Integration!' : 'Neural Dissonance Detected'}
                                 </h4>
                               </div>
                               <p className="text-slate-600 italic mb-6">"{quizFeedback.explanation}"</p>
                               <button
                                 onClick={handleQuizNext}
                                 className="flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
                               >
                                 Continue Neural Sync <ChevronRight size={18} />
                               </button>
                             </motion.div>
                           )}
                        </div>
                      )}

                      {selectedGame?.gameType === 'memory' && (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
                           {memoryDeck.map((card) => (
                             <button
                               key={card.id}
                               onClick={() => handleMemorySelect(card)}
                               className={`
                                 aspect-square rounded-3xl border-2 flex items-center justify-center p-4 transition-all duration-500 transform
                                 ${memoryMatched.includes(card.pairId) ? 'bg-emerald-100 border-emerald-200 text-emerald-700 opacity-50' : ''}
                                 ${memorySelected.find(c => c.id === card.id) ? 'bg-white border-indigo-500 rotate-y-180 scale-105' : 'bg-slate-100 border-slate-200'}
                                 ${!memoryMatched.includes(card.pairId) && !memorySelected.find(c => c.id === card.id) ? 'hover:scale-105 hover:shadow-lg' : ''}
                               `}
                             >
                                <span className="text-xs font-black uppercase text-center leading-tight">
                                  {memorySelected.find(c => c.id === card.id) || memoryMatched.includes(card.pairId) ? card.label : '?'}
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

            {/* Sidebar Stats & Leaderboard */}
            <div className="lg:col-span-4 space-y-8">
               <div className="rounded-[2.5rem] bg-indigo-600 p-8 text-white shadow-2xl shadow-indigo-500/20">
                 <h3 className="flex items-center gap-3 text-xl font-bold mb-6 italic uppercase tracking-tighter">
                   <Sparkles /> Session Stats
                 </h3>
                 <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Accuracy Level</p>
                      <div className="h-4 w-full bg-indigo-400/30 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedGame?.gameType === 'quiz' ? (Object.values(quizAnswers).length / selectedGame.questions.length) * 100 : (memoryMatched.length / selectedGame?.pairs?.length) * 100}%` }}
                          className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-white/10 rounded-3xl">
                         <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Attempts</p>
                         <p className="text-2xl font-black">12</p>
                       </div>
                       <div className="p-4 bg-white/10 rounded-3xl">
                         <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Avg. Score</p>
                         <p className="text-2xl font-black">840</p>
                       </div>
                    </div>
                 </div>
               </div>

               <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="flex items-center justify-between text-xl font-bold mb-6 uppercase tracking-tight">
                    <Medal size={24} className="text-amber-400" /> TOP LEARNERS
                  </h3>
                  <div className="space-y-4">
                    {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                          <span className={`text-lg font-black ${i < 3 ? 'text-amber-500' : 'text-slate-400'}`}>#{entry.rank}</span>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white uppercase">{entry.user?.username || 'Learner'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatPercent(entry.accuracy)} Accuracy</p>
                          </div>
                        </div>
                        <p className="text-lg font-black text-indigo-500">{entry.bestScore}</p>
                      </div>
                    )) : (
                      <p className="text-center py-8 text-xs font-bold text-slate-400 uppercase tracking-widest">No neural footprints detected yet.</p>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LearningGamesPage;
