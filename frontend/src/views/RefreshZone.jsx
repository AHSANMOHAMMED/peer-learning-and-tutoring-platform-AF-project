import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, NavLink, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Brain, CircleDot, Gamepad2, Grid3X3, MousePointerClick, Puzzle, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import { breakTimeGamesApi } from '../services/api';
import { cn } from '../utils/cn';
import {
  BubblePopGame,
  MemoryCardGame,
  PuzzleGame,
  TapSpeedChallenge,
  TicTacToeGame
} from '../components/refresh-games/RefreshGameComponents';

const gameDefinitions = {
  'tic-tac-toe': {
    path: '/refresh-zone/tic-tac-toe',
    title: 'Tic Tac Toe',
    icon: Grid3X3,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'hover:border-cyan-200 hover:ring-cyan-100',
    component: TicTacToeGame
  },
  'memory-card': {
    path: '/refresh-zone/memory-card',
    title: 'Memory Card Game',
    icon: Brain,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'hover:border-indigo-200 hover:ring-indigo-100',
    component: MemoryCardGame
  },
  'bubble-pop': {
    path: '/refresh-zone/bubble-pop',
    title: 'Bubble Pop',
    icon: CircleDot,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'hover:border-sky-200 hover:ring-sky-100',
    component: BubblePopGame
  },
  'tap-speed': {
    path: '/refresh-zone/tap-speed',
    title: 'Tap Speed Challenge',
    icon: MousePointerClick,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'hover:border-amber-200 hover:ring-amber-100',
    component: TapSpeedChallenge
  },
  'puzzle-game': {
    path: '/refresh-zone/puzzle-game',
    title: 'Puzzle Game',
    icon: Puzzle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'hover:border-emerald-200 hover:ring-emerald-100',
    component: PuzzleGame
  }
};

const fallbackGames = [
  {
    id: 'tic-tac-toe',
    slug: 'tic-tac-toe',
    path: '/refresh-zone/tic-tac-toe',
    title: 'Tic Tac Toe',
    description: 'A quick three-in-a-row round against Aura.',
    timerSeconds: 60,
    icon: Grid3X3,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'hover:border-cyan-200 hover:ring-cyan-100',
    component: TicTacToeGame
  },
  {
    id: 'memory-card',
    slug: 'memory-card',
    path: '/refresh-zone/memory-card',
    title: 'Memory Card Game',
    description: 'Flip cards and match the pairs with fewer moves.',
    timerSeconds: 120,
    icon: Brain,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'hover:border-indigo-200 hover:ring-indigo-100',
    component: MemoryCardGame
  },
  {
    id: 'bubble-pop',
    slug: 'bubble-pop',
    path: '/refresh-zone/bubble-pop',
    title: 'Bubble Pop',
    description: 'Pop as many bubbles as possible before time runs out.',
    timerSeconds: 30,
    icon: CircleDot,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'hover:border-sky-200 hover:ring-sky-100',
    component: BubblePopGame
  },
  {
    id: 'tap-speed',
    slug: 'tap-speed',
    path: '/refresh-zone/tap-speed',
    title: 'Tap Speed Challenge',
    description: 'Tap fast, loosen up, and beat your own count.',
    timerSeconds: 15,
    icon: MousePointerClick,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'hover:border-amber-200 hover:ring-amber-100',
    component: TapSpeedChallenge
  },
  {
    id: 'puzzle-game',
    slug: 'puzzle-game',
    path: '/refresh-zone/puzzle-game',
    title: 'Puzzle Game',
    description: 'Slide the tiles back into order with calm focus.',
    timerSeconds: 180,
    icon: Puzzle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'hover:border-emerald-200 hover:ring-emerald-100',
    component: PuzzleGame
  }
];

const formatDuration = (seconds) => {
  if (!seconds) return 'Quick';
  if (seconds < 60) return `${seconds} sec`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return remaining ? `${minutes}m ${remaining}s` : `${minutes} min`;
};

const mapApiGame = (game) => {
  const slug = game.slug;
  const definition = gameDefinitions[slug];
  if (!definition) return null;
  return {
    ...definition,
    id: slug,
    dbId: game.id || game._id,
    slug,
    title: game.name || definition.title,
    description: game.description,
    timerSeconds: game.timerSeconds
  };
};

const RefreshZone = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [games, setGames] = useState(fallbackGames);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const res = await breakTimeGamesApi.getActiveGames();
        if (res.success) {
          const activeGames = (res.data?.games || []).map(mapApiGame).filter(Boolean);
          setGames(activeGames);
          if (gameId && !activeGames.some((game) => game.id === gameId)) {
            navigate('/refresh-zone', { replace: true });
          }
        }
      } catch (error) {
        console.error('Refresh games fetch error:', error);
      }
    };
    loadGames();
  }, [gameId, navigate]);

  const selectedGame = useMemo(
    () => games.find((game) => game.id === gameId) || null,
    [games, gameId]
  );

  const handleComplete = useCallback(() => {}, []);

  if (gameId && !selectedGame) {
    return <Navigate to="/refresh-zone" replace />;
  }

  return (
    <Layout userRole="student">
      <div className="mx-auto w-full max-w-[1200px] pb-10">
        {selectedGame ? (
          <GamePage
            game={selectedGame}
            resetKey={resetKey}
            onNewRound={() => setResetKey((value) => value + 1)}
            onComplete={handleComplete}
            onBack={() => navigate('/refresh-zone')}
          />
        ) : (
          <RefreshZoneHome games={games} />
        )}
      </div>
    </Layout>
  );
};

const RefreshZoneHome = ({ games }) => (
  <>
    <section className="mb-6 rounded-3xl bg-white p-6 shadow-soft md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-700">
            <Sparkles size={14} />
            Break Time Games
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-800">Refresh Zone</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
            Pick a quick, low-pressure game for a short reset between lessons.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4 text-center">
          <div>
            <p className="text-2xl font-black text-slate-800">{games.length}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Games</p>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">1-3</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Minutes</p>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">0</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">API Calls</p>
          </div>
        </div>
      </div>
    </section>

    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </section>
  </>
);

const GameCard = ({ game }) => {
  const Icon = game.icon;

  return (
    <NavLink
      to={game.path}
      className={({ isActive }) => cn(
        'group flex min-h-[190px] flex-col justify-between rounded-3xl border bg-white p-6 shadow-soft outline-none transition hover:-translate-y-1 hover:shadow-soft-hover hover:ring-4 focus-visible:ring-4',
        isActive ? 'border-cyan-300 ring-4 ring-cyan-100' : 'border-slate-100',
        game.border
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className={cn('flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-105', game.bg, game.color)}>
          <Icon size={26} />
        </span>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
          {formatDuration(game.timerSeconds)}
        </span>
      </div>
      <div>
        <h2 className="mt-6 text-2xl font-bold text-slate-800">{game.title}</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{game.description}</p>
      </div>
      <div className="mt-6 flex items-center gap-2 text-sm font-bold text-cyan-700">
        Play now
        <ArrowRight size={16} className="transition group-hover:translate-x-1" />
      </div>
    </NavLink>
  );
};

const GamePage = ({ game, resetKey, onNewRound, onComplete, onBack }) => {
  const SelectedGameComponent = game.component;
  const SelectedGameIcon = game.icon;
  const isTicTacToe = game.id === 'tic-tac-toe';
  const isMemoryGame = game.id === 'memory-card';
  const isBubbleGame = game.id === 'bubble-pop';
  const isTapSpeed = game.id === 'tap-speed';
  const isPuzzleGame = game.id === 'puzzle-game';
  const [memoryStats, setMemoryStats] = useState({ moves: 0, seconds: 0 });
  const [bubbleStats, setBubbleStats] = useState({ timeLeft: 30, score: 0, popped: 0, combo: 1 });
  const [tapStats, setTapStats] = useState({ timeLeft: 15, taps: 0, score: 0, combo: 1, progress: 0 });
  const [puzzleStats, setPuzzleStats] = useState({ moves: 0, seconds: 0 });

  if (isTicTacToe) {
    return (
      <div className="-m-4 min-h-[calc(100vh-120px)] rounded-[32px] bg-gradient-to-br from-[#eef2ff] to-[#f8faff] p-4 md:-m-8 md:p-8">
        <div className="mx-auto flex min-h-[calc(100vh-180px)] max-w-[980px] flex-col">
          <button
            onClick={onBack}
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-2xl border border-white/50 bg-white/60 px-4 py-2.5 text-sm font-bold text-slate-600 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-[15px] transition hover:-translate-y-0.5 hover:bg-white/80 hover:text-slate-900 active:scale-95"
          >
            <ArrowLeft size={17} />
            Back to Refresh Zone
          </button>

          <section className="mb-8 rounded-[24px] border border-white/30 bg-white/60 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-[15px] md:p-7">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/90 to-indigo-100/80 text-[#6c63ff] shadow-sm">
                  <SelectedGameIcon size={28} />
                </span>
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <Gamepad2 size={13} />
                    {formatDuration(game.timerSeconds)}
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{game.title}</h1>
                  <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">{game.description}</p>
                </div>
              </div>
              <button
                onClick={onNewRound}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4ecdc4] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
              >
                <Gamepad2 size={17} />
                New Round
              </button>
            </div>
          </section>

          <div className="flex flex-1 items-center justify-center">
            <SelectedGameComponent
              key={game.id}
              resetKey={resetKey}
              onComplete={onComplete}
              timerSeconds={game.timerSeconds}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isMemoryGame) {
    return (
      <div className="-m-4 min-h-[calc(100vh-120px)] rounded-[32px] bg-gradient-to-br from-[#eef2ff] to-[#f8faff] p-4 md:-m-8 md:p-8">
        <div className="mx-auto flex min-h-[calc(100vh-180px)] max-w-[1080px] flex-col">
          <button
            onClick={onBack}
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-2xl border border-white/50 bg-white/60 px-4 py-2.5 text-sm font-bold text-slate-600 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-[15px] transition hover:-translate-y-0.5 hover:bg-white/80 hover:text-slate-900 active:scale-95"
          >
            <ArrowLeft size={17} />
            Back to Refresh Zone
          </button>

          <section className="mb-8 rounded-[24px] border border-white/30 bg-white/60 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-[15px] md:p-7">
            <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-[1fr_auto_1fr]">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/90 to-indigo-100/80 text-[#6c63ff] shadow-sm">
                  <SelectedGameIcon size={28} />
                </span>
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <Gamepad2 size={13} />
                    {formatDuration(game.timerSeconds)}
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{game.title}</h1>
                  <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-500">{game.description}</p>
                </div>
              </div>

              <div className="flex justify-start gap-3 rounded-2xl border border-white/40 bg-white/50 p-2 shadow-sm backdrop-blur-[10px] lg:justify-center">
                <div className="min-w-[96px] rounded-xl bg-white/70 px-4 py-3 text-center shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Moves</p>
                  <p className="mt-1 text-2xl font-black text-[#6c63ff]">{memoryStats.moves}</p>
                </div>
                <div className="min-w-[96px] rounded-xl bg-white/70 px-4 py-3 text-center shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</p>
                  <p className="mt-1 text-2xl font-black text-[#4ecdc4]">{memoryStats.seconds}s</p>
                </div>
              </div>

              <div className="flex justify-start lg:justify-end">
                <button
                  onClick={onNewRound}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4ecdc4] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                >
                  <Gamepad2 size={17} />
                  New Round
                </button>
              </div>
            </div>
          </section>

          <div className="flex flex-1 items-center justify-center">
            <SelectedGameComponent
              key={game.id}
              resetKey={resetKey}
              onComplete={onComplete}
              onStatsChange={setMemoryStats}
              timerSeconds={game.timerSeconds}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isBubbleGame) {
    return (
      <div className="-m-4 min-h-[calc(100vh-120px)] rounded-[32px] bg-gradient-to-br from-[#dbeafe] to-[#f0f9ff] p-4 md:-m-8 md:p-8">
        <div className="mx-auto flex min-h-[calc(100vh-180px)] max-w-[1120px] flex-col">
          <button
            onClick={onBack}
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-2xl border border-white/50 bg-white/60 px-4 py-2.5 text-sm font-bold text-slate-600 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-[15px] transition hover:-translate-y-0.5 hover:bg-white/80 hover:text-slate-900 active:scale-95"
          >
            <ArrowLeft size={17} />
            Back to Refresh Zone
          </button>

          <section className="mb-8 rounded-[24px] border border-white/30 bg-white/60 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-[15px] md:p-7">
            <div className="grid grid-cols-1 items-center gap-5 xl:grid-cols-[1fr_auto_1fr]">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/95 to-sky-100/90 text-sky-600 shadow-sm">
                  <SelectedGameIcon size={28} />
                </span>
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <Gamepad2 size={13} />
                    Arcade Mode
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{game.title}</h1>
                  <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-500">{game.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-start gap-3 rounded-2xl border border-white/40 bg-white/50 p-2 shadow-sm backdrop-blur-[10px] xl:justify-center">
                <div className={cn('min-w-[96px] rounded-xl px-4 py-3 text-center shadow-sm transition', bubbleStats.timeLeft <= 8 ? 'animate-pulse bg-rose-50 text-rose-600' : 'bg-white/75 text-sky-700')}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</p>
                  <p className="mt-1 text-2xl font-black tabular-nums">{bubbleStats.timeLeft}s</p>
                </div>
                <div className="min-w-[96px] rounded-xl bg-white/75 px-4 py-3 text-center text-[#6c63ff] shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</p>
                  <p className="mt-1 text-2xl font-black tabular-nums">{bubbleStats.score}</p>
                </div>
                <div className="min-w-[96px] rounded-xl bg-white/75 px-4 py-3 text-center text-[#4ecdc4] shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Combo</p>
                  <p className="mt-1 text-2xl font-black tabular-nums">{bubbleStats.combo}x</p>
                </div>
              </div>

              <div className="flex justify-start xl:justify-end">
                <button
                  onClick={onNewRound}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6c63ff] via-sky-500 to-[#4ecdc4] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                >
                  <Gamepad2 size={17} />
                  New Round
                </button>
              </div>
            </div>
          </section>

          <div className="flex flex-1 items-center justify-center">
            <SelectedGameComponent
              key={game.id}
              resetKey={resetKey}
              onComplete={onComplete}
              onStatsChange={setBubbleStats}
              timerSeconds={game.timerSeconds}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isTapSpeed) {
    return (
      <div className="-m-4 min-h-[calc(100vh-120px)] rounded-[32px] bg-gradient-to-br from-[#eef2ff] to-[#f8faff] p-4 md:-m-8 md:p-8">
        <div className="mx-auto flex min-h-[calc(100vh-180px)] max-w-[1080px] flex-col">
          <button
            onClick={onBack}
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-2xl border border-white/50 bg-white/60 px-4 py-2.5 text-sm font-bold text-slate-600 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-[15px] transition hover:-translate-y-0.5 hover:bg-white/80 hover:text-slate-900 active:scale-95"
          >
            <ArrowLeft size={17} />
            Back to Refresh Zone
          </button>

          <section className="mb-8 rounded-[24px] border border-white/30 bg-white/60 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-[15px] md:p-7">
            <div className="grid grid-cols-1 items-center gap-5 xl:grid-cols-[1fr_auto_1fr]">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/95 to-pink-100/90 text-pink-500 shadow-sm">
                  <SelectedGameIcon size={28} />
                </span>
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <Gamepad2 size={13} />
                    Speed Round
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{game.title}</h1>
                  <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-500">{game.description}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/40 bg-white/50 p-2 shadow-sm backdrop-blur-[10px]">
                <div className="mb-2 flex flex-wrap justify-start gap-3 xl:justify-center">
                  <div className={cn('min-w-[88px] rounded-xl px-4 py-3 text-center shadow-sm transition', tapStats.timeLeft <= 5 ? 'animate-pulse bg-rose-50 text-rose-600' : 'bg-white/75 text-[#6c63ff]')}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</p>
                    <p className="mt-1 text-2xl font-black tabular-nums">{tapStats.timeLeft}s</p>
                  </div>
                  <div className="min-w-[88px] rounded-xl bg-white/75 px-4 py-3 text-center text-[#4ecdc4] shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Taps</p>
                    <p className="mt-1 text-2xl font-black tabular-nums">{tapStats.taps}</p>
                  </div>
                  <div className="min-w-[88px] rounded-xl bg-white/75 px-4 py-3 text-center text-pink-500 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Combo</p>
                    <p className="mt-1 text-2xl font-black tabular-nums">{tapStats.combo}x</p>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/70 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] via-pink-500 to-orange-400 transition-all duration-500"
                    style={{ width: `${Math.max(0, 100 - tapStats.progress)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-start xl:justify-end">
                <button
                  onClick={onNewRound}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6c63ff] via-pink-500 to-orange-400 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                >
                  <Gamepad2 size={17} />
                  New Round
                </button>
              </div>
            </div>
          </section>

          <div className="flex flex-1 items-center justify-center">
            <SelectedGameComponent
              key={game.id}
              resetKey={resetKey}
              onComplete={onComplete}
              onStatsChange={setTapStats}
              timerSeconds={game.timerSeconds}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isPuzzleGame) {
    return (
      <div className="-m-4 min-h-[calc(100vh-120px)] rounded-[32px] bg-gradient-to-br from-[#eef2ff] to-[#f8faff] p-4 md:-m-8 md:p-8">
        <div className="mx-auto flex min-h-[calc(100vh-180px)] max-w-[1080px] flex-col">
          <button
            onClick={onBack}
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-2xl border border-white/50 bg-white/60 px-4 py-2.5 text-sm font-bold text-slate-600 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-[15px] transition hover:-translate-y-0.5 hover:bg-white/80 hover:text-slate-900 active:scale-95"
          >
            <ArrowLeft size={17} />
            Back to Refresh Zone
          </button>

          <section className="mb-8 rounded-[24px] border border-white/30 bg-white/60 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-[15px] md:p-7">
            <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-[1fr_auto_1fr]">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/95 to-indigo-100/90 text-[#6c63ff] shadow-sm">
                  <SelectedGameIcon size={28} />
                </span>
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <Gamepad2 size={13} />
                    Slide Puzzle
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{game.title}</h1>
                  <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-500">{game.description}</p>
                </div>
              </div>

              <div className="flex justify-start gap-3 rounded-2xl border border-white/40 bg-white/50 p-2 shadow-sm backdrop-blur-[10px] lg:justify-center">
                <div className="min-w-[96px] rounded-xl bg-white/75 px-4 py-3 text-center text-[#6c63ff] shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Moves</p>
                  <p className="mt-1 text-2xl font-black tabular-nums">{puzzleStats.moves}</p>
                </div>
                <div className="min-w-[96px] rounded-xl bg-white/75 px-4 py-3 text-center text-[#4ecdc4] shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</p>
                  <p className="mt-1 text-2xl font-black tabular-nums">{puzzleStats.seconds}s</p>
                </div>
              </div>

              <div className="flex justify-start lg:justify-end">
                <button
                  onClick={onNewRound}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4ecdc4] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                >
                  <Gamepad2 size={17} />
                  New Round
                </button>
              </div>
            </div>
          </section>

          <div className="flex flex-1 items-center justify-center">
            <SelectedGameComponent
              key={game.id}
              resetKey={resetKey}
              onComplete={onComplete}
              onStatsChange={setPuzzleStats}
              timerSeconds={game.timerSeconds}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-soft transition hover:bg-slate-50 hover:text-slate-900 active:scale-95"
      >
        <ArrowLeft size={17} />
        Back to Refresh Zone
      </button>

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-soft md:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', game.bg, game.color)}>
              <SelectedGameIcon size={28} />
            </span>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <Gamepad2 size={13} />
                {formatDuration(game.timerSeconds)}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800">{game.title}</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">{game.description}</p>
            </div>
          </div>
          <button
            onClick={onNewRound}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-95"
          >
            <Gamepad2 size={17} />
            New Round
          </button>
        </div>
      </section>

      <SelectedGameComponent
        key={game.id}
        resetKey={resetKey}
        onComplete={onComplete}
        timerSeconds={game.timerSeconds}
      />
    </div>
  );
};

export default RefreshZone;
