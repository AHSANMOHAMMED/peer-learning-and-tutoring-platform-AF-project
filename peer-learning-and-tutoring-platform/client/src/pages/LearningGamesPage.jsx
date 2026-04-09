import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  BrainCircuit,
  Puzzle,
  Gamepad2,
  Timer,
  Sparkles,
  Target,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Flame,
  Crown,
  BadgeCheck,
  Shuffle,
  Lightbulb,
  BarChart3,
  Users,
  Medal,
  Star,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { learningGamesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const typeMeta = {
  quiz: {
    label: 'Quiz',
    icon: BrainCircuit,
    gradient: 'from-sky-500 to-indigo-600'
  },
  puzzle: {
    label: 'Puzzle',
    icon: Puzzle,
    gradient: 'from-amber-500 to-orange-600'
  },
  memory: {
    label: 'Memory',
    icon: Gamepad2,
    gradient: 'from-emerald-500 to-teal-600'
  }
};

const topicMeta = {
  math: { label: 'Math', accent: 'bg-blue-100 text-blue-800' },
  programming: { label: 'Programming', accent: 'bg-violet-100 text-violet-800' },
  'general-knowledge': { label: 'General Knowledge', accent: 'bg-rose-100 text-rose-800' }
};

const levelMeta = {
  easy: { label: 'Easy', accent: 'bg-emerald-100 text-emerald-800' },
  medium: { label: 'Medium', accent: 'bg-amber-100 text-amber-800' },
  hard: { label: 'Hard', accent: 'bg-rose-100 text-rose-800' }
};

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const createMemoryDeck = (game) => {
  if (!game?.pairs || !Array.isArray(game.pairs)) {
    return [];
  }

  return shuffle(
    game.pairs.flatMap((pair) => ([
      { id: `${pair.id}-left`, pairId: pair.id, label: pair.left, side: 'left' },
      { id: `${pair.id}-right`, pairId: pair.id, label: pair.right, side: 'right' }
    ]))
  );
};

const createQuizSessionQuestions = (game) => {
  if (!game?.questions || !Array.isArray(game.questions)) {
    return [];
  }

  return shuffle(game.questions).map((question, index) => ({
    ...question,
    sessionId: `${index}-${question.prompt}`,
    options: shuffle(question.options || [])
  }));
};

const formatPercent = (value) => `${Math.max(0, Math.min(100, Number(value) || 0)).toFixed(0)}%`;

const LearningGamesPage = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [summary, setSummary] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [error, setError] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSessionQuestions, setQuizSessionQuestions] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [quizLocked, setQuizLocked] = useState(false);
  const [puzzleOrder, setPuzzleOrder] = useState([]);
  const [memoryDeck, setMemoryDeck] = useState([]);
  const [memorySelected, setMemorySelected] = useState([]);
  const [memoryMatched, setMemoryMatched] = useState([]);
  const [memoryAttempts, setMemoryAttempts] = useState([]);
  const [memoryFeedback, setMemoryFeedback] = useState(null);
  const [memoryLocked, setMemoryLocked] = useState(false);
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
      setLoadingBoard(true);
      const params = game
        ? {
            limit: 8,
            gameType: game.gameType,
            topic: game.topic,
            level: game.level
          }
        : { limit: 8 };

      const leaderboardRes = await learningGamesApi.getLeaderboard(params);
      if (leaderboardRes.success) {
        setLeaderboard(leaderboardRes.data.leaderboard || []);
      }
    } finally {
      setLoadingBoard(false);
    }
  };

  const loadData = async (preferredGameId = null) => {
    try {
      setLoading(true);
      const [catalogRes] = await Promise.all([
        learningGamesApi.getCatalog()
      ]);

      if (!catalogRes.success) {
        throw new Error(catalogRes.message || 'Failed to load games');
      }

      const catalog = catalogRes.data.catalog || [];
      setGames(catalog);
      setSummary(catalogRes.data.summary || null);

      const targetGameId = preferredGameId || gameId || null;
      const initialGame = catalog.find((game) => game.gameId === targetGameId) || catalog[0] || null;
      if (initialGame) {
        setSelectedGameId(initialGame.gameId);
      }

      await refreshLeaderboard(initialGame);
    } catch (fetchError) {
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
    setMemoryAttempts([]);
    setMemoryFeedback(null);
    setMemoryLocked(false);
  };

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      loadData(gameId || null);
      return undefined;
    }

    if (selectedGame) {
      resetSession(selectedGame);
      refreshLeaderboard(selectedGame);
    }
    return undefined;
  }, [selectedGameId]);

  useEffect(() => {
    if (gameId && gameId !== selectedGameId) {
      setSelectedGameId(gameId);
    }
  }, [gameId, selectedGameId]);

  useEffect(() => {
    if (!isRunning || !hasTimer || result || !selectedGame) return undefined;

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

  const hasPlayableContent = useMemo(() => {
    if (!selectedGame) return false;
    if (selectedGame.gameType === 'quiz') return (selectedGame.questions || []).length > 0;
    if (selectedGame.gameType === 'puzzle') return (selectedGame.puzzleSteps || []).length > 0;
    if (selectedGame.gameType === 'memory') return (selectedGame.pairs || []).length > 0;
    return true;
  }, [selectedGame]);

  const startGame = (game) => {
    setSelectedGameId(game.gameId);
    resetSession(game);
    toast.success(`Started ${game.title}`);
  };

  const handleQuizAnswer = (answer) => {
    if (!selectedGame || !currentQuestion || quizLocked) return;

    const correct = answer === currentQuestion.correctAnswer;
    setQuizLocked(true);
    setQuizAnswers((currentAnswers) => ({
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

  const addPuzzleStep = (stepId) => {
    if (!selectedGame || puzzleOrder.includes(stepId)) return;
    setPuzzleOrder((currentOrder) => [...currentOrder, stepId]);
  };

  const removePuzzleStep = (stepId) => {
    setPuzzleOrder((currentOrder) => currentOrder.filter((item) => item !== stepId));
  };

  const clearPuzzleOrder = () => setPuzzleOrder([]);

  const handleMemoryCardClick = (card) => {
    if (!selectedGame || memoryLocked || memoryMatched.includes(card.pairId)) return;
    if (memorySelected.some((selectedCard) => selectedCard.id === card.id)) return;

    const nextSelected = [...memorySelected, card];
    setMemorySelected(nextSelected);

    if (nextSelected.length < 2) return;

    setMemoryLocked(true);
    const [firstCard, secondCard] = nextSelected;
    const correct = firstCard.pairId === secondCard.pairId;
    const pairData = selectedGame.pairs.find((pair) => pair.id === firstCard.pairId);

    setMemoryAttempts((currentAttempts) => ([
      ...currentAttempts,
      {
        pairId: firstCard.pairId,
        left: firstCard.label,
        right: secondCard.label,
        correct
      }
    ]));

    if (correct) {
      setMemoryMatched((currentMatched) => [...currentMatched, firstCard.pairId]);
      setMemoryFeedback({
        correct: true,
        title: 'Match found',
        explanation: pairData?.explanation || 'Nice memory.'
      });
      setMemorySelected([]);
      setMemoryLocked(false);
      toast.success('Correct match');
      return;
    }

    setMemoryFeedback({
      correct: false,
      title: 'Not quite',
      explanation: pairData?.explanation || 'Try again and focus on the matching concept.'
    });

    window.setTimeout(() => {
      setMemorySelected([]);
      setMemoryLocked(false);
    }, 700);
  };

  const handleFinishGame = async (forced = false) => {
    if (!selectedGame || submitting || result) return;
    if (!hasPlayableContent) {
      toast.error('This game has no playable content. Ask admin to add content.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        gameId: selectedGame.gameId,
        elapsedSeconds,
        attempts: 1
      };

      if (selectedGame.gameType === 'quiz') {
        payload.answers = (selectedGame.questions || []).map(
          (question) => quizAnswers[question.prompt] || ''
        );
      } else if (selectedGame.gameType === 'puzzle') {
        payload.order = puzzleOrder;
      } else {
        payload.matches = memoryAttempts;
      }

      const response = await learningGamesApi.submitAttempt(payload);

      if (!response.success) {
        throw new Error(response.message || 'Unable to submit game attempt');
      }

      setResult(response.data.result);
      setIsRunning(false);

      if (response.data.result.improved) {
        toast.success('New personal best achieved');
      } else if (forced) {
        toast('Time ran out, attempt saved.', { icon: '⏱️' });
      } else {
        toast.success('Game completed');
      }

      try {
        await refreshLeaderboard(selectedGame);
      } catch (refreshError) {
        console.error('Leaderboard refresh failed after successful save:', refreshError);
      }

      try {
        const progressRes = await learningGamesApi.getCatalog();
        if (progressRes.success) {
          setGames(progressRes.data.catalog || []);
          setSummary(progressRes.data.summary || null);
        }
      } catch (progressError) {
        console.error('Progress refresh failed after successful save:', progressError);
      }
    } catch (submitError) {
      console.error('Error submitting game attempt:', submitError);
      toast.error(submitError.message || 'Failed to submit attempt');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full border-4 border-cyan-300 border-t-transparent animate-spin" />
          <p className="text-gray-600">Loading learning games...</p>
        </div>
      </div>
    );
  }

  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-6">
        <div className="max-w-xl w-full rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-2xl">
          <h1 className="text-2xl font-bold">Admin play mode is disabled</h1>
          <p className="mt-2 text-gray-600">Use the Game Management Dashboard to manage questions, levels, and scoring.</p>
          <button
            onClick={() => navigate('/dashboard/admin/learning-games', { replace: true })}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Open Game Management
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-6">
        <div className="max-w-xl w-full rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-2xl shadow-cyan-950/30">
          <XCircle className="mx-auto h-12 w-12 text-rose-300" />
          <h1 className="mt-4 text-2xl font-bold">Learning games unavailable</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={loadData}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Retry
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
                <Sparkles className="h-4 w-4" />
                Interactive learning games
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  Practice, score, retry, and climb the leaderboard.
                </h1>
                <p className="mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
                  Choose a quiz, puzzle, or memory challenge aligned to math, programming, or general knowledge.
                  Every attempt is tracked for points, progress, badges, and personal bests.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2">
                  <Timer className="h-4 w-4 text-cyan-300" /> Timer-based rounds
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2">
                  <BadgeCheck className="h-4 w-4 text-emerald-300" /> Instant feedback
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2">
                  <Target className="h-4 w-4 text-amber-300" /> Retry and improve scores
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[24rem]">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Attempts</p>
                <p className="mt-2 text-2xl font-bold">{summary?.attempts || 0}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Total Score</p>
                <p className="mt-2 text-2xl font-bold">{summary?.totalScore || 0}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Best Score</p>
                <p className="mt-2 text-2xl font-bold">{summary?.bestScore || 0}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Badges</p>
                <p className="mt-2 text-2xl font-bold">{summary?.badges || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-6">
            {!gameId && (
              <div className="grid gap-4 md:grid-cols-3">
              {games.map((game) => {
                const meta = typeMeta[game.gameType];
                const Icon = meta.icon;
                const isActive = game.gameId === selectedGame?.gameId;

                return (
                  <motion.button
                    key={game.gameId}
                    whileHover={{ y: -3 }}
                    onClick={() => startGame(game)}
                    className={`rounded-3xl border p-5 text-left transition ${isActive
                      ? 'border-cyan-300/60 bg-cyan-400/10 shadow-xl shadow-cyan-950/20'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-white/8'
                    }`}
                  >
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-gray-900 shadow-lg`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gray-500">
                      <span>{meta.label}</span>
                      <span>•</span>
                      <span>{topicMeta[game.topic]?.label}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">{game.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{game.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                      <span className={`rounded-full px-3 py-1 ${topicMeta[game.topic]?.accent}`}>{topicMeta[game.topic]?.label}</span>
                      <span className={`rounded-full px-3 py-1 ${levelMeta[game.level]?.accent}`}>{levelMeta[game.level]?.label}</span>
                      {game.timerEnabled && (
                        <span className="rounded-full bg-gray-200 px-3 py-1 text-gray-700">{game.timeLimit}s timer</span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                      <span>Best: {game.progress?.bestScore || 0}</span>
                      <span>{game.progress?.attempts || 0} tries</span>
                    </div>
                  </motion.button>
                );
              })}
              </div>
            )}

            {selectedGame && (
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl shadow-slate-950/20">
                {gameId && (
                  <button
                    onClick={() => navigate('/dashboard/games')}
                    className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Back to all learning games
                  </button>
                )}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${typeMeta[selectedGame.gameType].gradient} text-gray-900`}>
                        {React.createElement(typeMeta[selectedGame.gameType].icon, { className: 'h-6 w-6' })}
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.18em] text-gray-500">Selected game</p>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedGame.title}</h2>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                      <span className={`rounded-full px-3 py-1 ${topicMeta[selectedGame.topic]?.accent}`}>{topicMeta[selectedGame.topic]?.label}</span>
                      <span className={`rounded-full px-3 py-1 ${levelMeta[selectedGame.level]?.accent}`}>{levelMeta[selectedGame.level]?.label}</span>
                      <span className="rounded-full bg-gray-200 px-3 py-1 text-gray-700">{selectedGame.maxScore} max score</span>
                      <span className="rounded-full bg-gray-200 px-3 py-1 text-gray-700">Best {selectedGame.progress?.bestScore || 0}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                      <p className="inline-flex items-center gap-2 text-gray-600"><Timer className="h-4 w-4 text-blue-600" /> Timer</p>
                      <p className="mt-1 text-2xl font-bold text-gray-900">{selectedGame.timerEnabled ? `${remainingTime}s left` : 'Untimed'}</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-cyan-50 to-emerald-50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                      <p className="inline-flex items-center gap-2 text-gray-600"><Target className="h-4 w-4 text-emerald-600" /> Accuracy</p>
                      <p className="mt-1 text-2xl font-bold text-gray-900">{formatPercent(selectedGame.progress?.averageAccuracy || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
                  {selectedGame.gameType === 'quiz' && (
                    <div className="space-y-5">
                      {!hasPlayableContent && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                          This quiz has no questions yet. Please try another game.
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Question {quizIndex + 1} of {quizSessionQuestions.length}</span>
                        <span className="inline-flex items-center gap-2"><Timer className="h-4 w-4" /> {selectedGame.timerEnabled ? `${remainingTime}s` : `${elapsedSeconds}s elapsed`}</span>
                      </div>

                      <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-[0_18px_34px_-24px_rgba(2,132,199,0.4)]">
                        <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 px-6 py-10 text-center shadow-inner">
                          <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-blue-200/40 blur-2xl" />
                          <div className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-cyan-200/40 blur-2xl" />
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Focus Question</p>
                          <p className="mx-auto mt-3 max-w-3xl text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">{currentQuestion?.prompt}</p>
                        </div>

                        <div className="mt-6 grid gap-3 md:grid-cols-2">
                          {currentQuestion?.options.map((option, index) => {
                            const active = quizAnswers[currentQuestion?.prompt] === option;
                            return (
                              <motion.button
                                key={option}
                                whileHover={{ y: -2, scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleQuizAnswer(option)}
                                disabled={quizLocked || !hasPlayableContent}
                                className={`group rounded-2xl border px-4 py-3 text-left shadow-sm transition-all duration-200 ${active ? 'border-cyan-400 bg-cyan-100/70 text-cyan-800 shadow-cyan-200/60' : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/70 hover:shadow-md'} disabled:cursor-not-allowed disabled:opacity-70`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${active ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-700'}`}>
                                    {String.fromCharCode(65 + index)}
                                  </span>
                                  <span className="font-semibold">{option}</span>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {quizFeedback && (
                        <div className={`rounded-2xl border p-4 ${quizFeedback.correct ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-rose-400/40 bg-rose-500/10'}`}>
                          <div className="flex items-center gap-2">
                            {quizFeedback.correct ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <XCircle className="h-5 w-5 text-rose-300" />}
                            <p className="font-semibold text-gray-900">{quizFeedback.correct ? 'Correct' : 'Incorrect'}</p>
                          </div>
                          <p className="mt-2 text-sm text-gray-700"><span className="font-semibold">Answer:</span> {quizFeedback.correctAnswer}</p>
                          <p className="mt-1 text-sm text-gray-600">{quizFeedback.explanation}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <motion.button
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => startGame(selectedGame)}
                          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Retry
                        </motion.button>

                        <motion.button
                          whileHover={{ y: -1, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleQuizNext}
                          disabled={!quizLocked || !hasPlayableContent}
                          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-300/40 transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {quizIndex < quizSessionQuestions.length - 1 ? 'Next question' : 'Finish challenge'}
                          <ArrowRight className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {selectedGame.gameType === 'puzzle' && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Arrange the steps in the correct order</span>
                        <span>{puzzleOrder.length} / {selectedGame.correctOrder.length} placed</span>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="grid gap-3 md:grid-cols-2">
                          {selectedGame.puzzleSteps.map((step) => {
                            const selected = puzzleOrder.includes(step.id);
                            return (
                              <button
                                key={step.id}
                                onClick={() => addPuzzleStep(step.id)}
                                disabled={selected}
                                className={`rounded-2xl border px-4 py-3 text-left transition ${selected ? 'border-emerald-300 bg-emerald-400/10 text-emerald-700' : 'border-gray-200 bg-white text-gray-700 hover:border-amber-300/40 hover:bg-gray-200'}`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span className="font-medium">{step.label}</span>
                                  {selected && <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-600">Your order</p>
                            <div className="flex gap-2">
                              <button onClick={clearPuzzleOrder} className="text-xs text-gray-500 transition hover:text-gray-900">Clear</button>
                              <button onClick={handleFinishGame} className="text-xs text-cyan-300 transition hover:text-cyan-200">Submit</button>
                            </div>
                          </div>

                          <div className="mt-3 grid gap-2">
                            {selectedGame.correctOrder.map((_, index) => {
                              const stepId = puzzleOrder[index];
                              const step = selectedGame.puzzleSteps.find((item) => item.id === stepId);
                              return (
                                <div key={index} className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
                                  <span className="mr-3 text-slate-500">{index + 1}.</span>
                                  {step ? step.label : 'Empty slot'}
                                  {stepId && (
                                    <button onClick={() => removePuzzleStep(stepId)} className="ml-3 text-xs text-rose-300 transition hover:text-rose-200">Remove</button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-cyan-500/10 p-4 text-sm text-cyan-700">
                        <div className="flex items-center gap-2 font-semibold text-gray-900">
                          <Lightbulb className="h-4 w-4" />
                          Instant feedback is shown after submission.
                        </div>
                        <p className="mt-2 text-cyan-700/90">Reorder the steps, submit, and try again to improve your score.</p>
                      </div>

                      <div className="flex justify-between">
                        <button
                          onClick={() => startGame(selectedGame)}
                          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
                        >
                          <Shuffle className="h-4 w-4" />
                          Shuffle again
                        </button>

                        <button
                          onClick={handleFinishGame}
                          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
                        >
                          Finish challenge
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedGame.gameType === 'memory' && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Find the matching pairs before time runs out</span>
                        <span className="inline-flex items-center gap-2"><Timer className="h-4 w-4" /> {remainingTime}s</span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {memoryDeck.map((card) => {
                          const revealed = memorySelected.some((selectedCard) => selectedCard.id === card.id) || memoryMatched.includes(card.pairId);
                          const matched = memoryMatched.includes(card.pairId);
                          return (
                            <button
                              key={card.id}
                              onClick={() => handleMemoryCardClick(card)}
                              disabled={matched || memoryLocked}
                              className={`min-h-28 rounded-2xl border p-4 text-left transition ${revealed ? 'border-emerald-300 bg-emerald-500/10 text-emerald-700' : 'border-gray-200 bg-white text-gray-700 hover:border-cyan-300/40 hover:bg-gray-200'} ${matched ? 'opacity-75' : ''}`}
                            >
                              <div className="flex h-full flex-col justify-between">
                                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{card.side}</p>
                                <p className="mt-3 text-base font-semibold leading-tight">{card.label}</p>
                                <div className="mt-4 flex items-center justify-between">
                                  <span className="text-xs text-slate-500">{matched ? 'Matched' : 'Tap to flip'}</span>
                                  {matched && <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {memoryFeedback && (
                        <div className={`rounded-2xl border p-4 ${memoryFeedback.correct ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-rose-400/40 bg-rose-500/10'}`}>
                          <p className="font-semibold text-gray-900">{memoryFeedback.title}</p>
                          <p className="mt-1 text-sm text-gray-700">{memoryFeedback.explanation}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => startGame(selectedGame)}
                          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Retry memory game
                        </button>

                        <div className="text-sm text-gray-500">
                          {memoryMatched.length} / {selectedGame.pairs.length} pairs matched
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {result && (
                  <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/10 to-violet-400/10 p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-cyan-700">
                          <Trophy className="h-4 w-4" />
                          Result summary
                        </div>
                        <h3 className="mt-4 text-3xl font-bold text-gray-900">{result.score} / {result.maxScore} points</h3>
                        <p className="mt-2 text-gray-600">
                          Accuracy {formatPercent(result.accuracy)} • Personal best {result.personalBest}
                          {result.improved ? ' • improved score!' : ''}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <p className="text-gray-500">Correct</p>
                          <p className="mt-1 text-2xl font-bold text-emerald-300">{result.correctCount}</p>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <p className="text-gray-500">Questions</p>
                          <p className="mt-1 text-2xl font-bold text-gray-900">{result.questionCount}</p>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <p className="text-gray-500">Level</p>
                          <p className="mt-1 text-2xl font-bold text-gray-900">{levelMeta[selectedGame.level]?.label}</p>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <p className="text-gray-500">Badges</p>
                          <p className="mt-1 text-2xl font-bold text-gray-900">{result.newBadges?.length || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <h4 className="font-semibold text-gray-900">Instant feedback</h4>
                      <div className="grid gap-3">
                        {result.feedback?.map((item, index) => (
                          <div key={`${item.prompt}-${index}`} className={`rounded-2xl border p-4 ${item.correct ? 'border-emerald-400/30 bg-emerald-500/10' : 'border-rose-400/30 bg-rose-500/10'}`}>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-medium text-gray-900">{item.prompt}</p>
                                <p className="mt-1 text-sm text-gray-700">
                                  Your answer: {String(item.userAnswer || 'No answer')}
                                </p>
                                <p className="text-sm text-gray-700">Correct answer: {item.correctAnswer}</p>
                                <p className="mt-2 text-sm text-gray-600">{item.explanation}</p>
                              </div>
                              <div className="text-right text-sm">
                                {item.correct ? (
                                  <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-300" />
                                ) : (
                                  <XCircle className="ml-auto h-5 w-5 text-rose-300" />
                                )}
                                <p className="mt-2 font-semibold text-gray-900">+{item.earnedPoints}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => startGame(selectedGame)}
                        className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Retry this game
                      </button>
                      <button
                        onClick={() => refreshLeaderboard(selectedGame)}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                      >
                        <BarChart3 className="h-4 w-4" />
                        Refresh leaderboard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-gray-500">Profile progress</p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-900">Progress and achievements</h3>
                </div>
                <Flame className="h-6 w-6 text-orange-300" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gray-500"><Sparkles className="h-3.5 w-3.5 text-blue-500" /> Level</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{summary?.level?.title || 'Beginner'}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gray-500"><Star className="h-3.5 w-3.5 text-amber-500" /> Lifetime points</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{summary?.points?.lifetime || 0}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="inline-flex items-center gap-2"><BarChart3 className="h-4 w-4 text-cyan-500" /> Best score progression</span>
                  <span>{summary?.bestScore || 0}</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                    style={{ width: `${Math.min(((summary?.bestScore || 0) / (selectedGame?.maxScore || 100)) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                  <p className="inline-flex items-center justify-center gap-1 text-gray-500"><Flame className="h-3.5 w-3.5 text-orange-500" /> Streak</p>
                  <p className="mt-1 text-lg font-bold text-orange-500">{summary?.streaks?.current || 0}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                  <p className="inline-flex items-center justify-center gap-1 text-gray-500"><BadgeCheck className="h-3.5 w-3.5 text-cyan-500" /> Badges</p>
                  <p className="mt-1 text-lg font-bold text-cyan-500">{summary?.badges || 0}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                  <p className="inline-flex items-center justify-center gap-1 text-gray-500"><Trophy className="h-3.5 w-3.5 text-emerald-500" /> Sessions</p>
                  <p className="mt-1 text-lg font-bold text-emerald-500">{summary?.attempts || 0}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Crown className="h-4 w-4 text-yellow-300" />
                  Current game mastery
                </div>
                {selectedGame && (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>{selectedGame.title}</span>
                      <span>{formatPercent(selectedGame.progress?.averageAccuracy || 0)}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                        style={{ width: `${Math.min(((selectedGame.progress?.bestScore || 0) / (selectedGame.maxScore || 100)) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="mt-3 text-gray-500">{selectedGame.progress?.mastered ? 'Mastered' : 'Keep playing to reach mastery.'}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-gray-500">Leaderboard</p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-900">Top learning runs</h3>
                </div>
                <Medal className="h-6 w-6 text-amber-300" />
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                <span>Filtered to the selected game</span>
                <button onClick={() => refreshLeaderboard(selectedGame)} className="inline-flex items-center gap-2 text-cyan-300 transition hover:text-cyan-200">
                  Refresh
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {loadingBoard ? (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">Loading leaderboard...</div>
                ) : leaderboard.length > 0 ? (
                  leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`rounded-2xl border p-4 ${entry.rank <= 3 ? 'border-amber-300/30 bg-amber-400/10' : 'border-gray-200 bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl font-bold ${entry.rank === 1 ? 'bg-yellow-400 text-slate-950' : entry.rank === 2 ? 'bg-slate-300 text-slate-900' : entry.rank === 3 ? 'bg-orange-400 text-slate-950' : 'bg-gray-200 text-gray-900'}`}>
                            {entry.rank}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{entry.user?.name || entry.user?.username || 'Player'}</p>
                            <p className="text-xs text-gray-500">{entry.attempts} attempts • {formatPercent(entry.accuracy)} accuracy</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{entry.bestScore}</p>
                          <p className="text-xs text-gray-500">best score</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">No leaderboard entries yet for this filter.</div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-100 p-6 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Users className="h-4 w-4 text-cyan-300" />
                Why this works
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Each game stores attempts, best scores, accuracy, and feedback. The server updates points and badges,
                so retries immediately feed back into progress tracking instead of living only in the browser.
              </p>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Multiple game types and subjects</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Timer-based quiz and memory challenges</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Leaderboard and personal bests</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Retry flow with immediate feedback</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningGamesPage;
