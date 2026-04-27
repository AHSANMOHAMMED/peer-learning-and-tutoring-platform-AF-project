import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { cn } from '../../utils/cn';

const ResultPanel = ({ result, onPlayAgain }) => (
  <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-center">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-soft">
      <Trophy size={28} />
    </div>
    <h3 className="text-2xl font-bold text-slate-800">Score: {result.score}</h3>
    <p className="mt-2 text-sm font-medium text-slate-500">{result.message}</p>
    <button
      onClick={onPlayAgain}
      className="mx-auto mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-95"
    >
      <RotateCcw size={16} />
      Play Again
    </button>
  </div>
);

const GameShell = ({ result, onPlayAgain, children }) => (
  <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-soft md:p-8">
    {result ? <ResultPanel result={result} onPlayAgain={onPlayAgain} /> : children}
  </div>
);

export const TicTacToeGame = ({ onComplete, resetKey }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState('X');
  const [result, setResult] = useState(null);

  useEffect(() => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setResult(null);
  }, [resetKey]);

  const winner = getWinner(board);
  const winningLine = getWinningLine(board);
  const isDraw = board.every(Boolean) && !winner;
  const reset = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setResult(null);
  };

  useEffect(() => {
    if (!result && (winner || isDraw)) {
      const score = winner === 'X' ? 100 : winner === 'O' ? 30 : 60;
      const message = winner === 'X' ? 'Nice win. Clean little brain reset.' : winner === 'O' ? 'Close round. Take the rematch.' : 'Balanced board. Draw secured.';
      const nextResult = { score, message };
      setResult(nextResult);
      onComplete(nextResult);
    }
  }, [winner, isDraw, result, onComplete]);

  useEffect(() => {
    if (turn !== 'O' || winner || isDraw) return;
    const open = board.map((cell, index) => cell ? null : index).filter((index) => index !== null);
    const timerId = setTimeout(() => {
      const move = pickTicTacToeMove(board, open);
      setBoard((current) => current.map((cell, index) => index === move ? 'O' : cell));
      setTurn('X');
    }, 350);
    return () => clearTimeout(timerId);
  }, [board, turn, winner, isDraw]);

  const play = (index) => {
    if (board[index] || turn !== 'X' || result) return;
    setBoard((current) => current.map((cell, cellIndex) => cellIndex === index ? 'X' : cell));
    setTurn('O');
  };

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col items-center rounded-[24px] border border-white/30 bg-white/60 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-[15px] sm:p-8">
      <div className="mb-6 flex w-full items-center justify-between rounded-2xl border border-white/40 bg-white/45 px-4 py-3 shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Turn</p>
          <p className="mt-1 text-lg font-black text-slate-800">{turn === 'X' ? 'Your move' : 'Aura is thinking'}</p>
        </div>
        <div className="rounded-full bg-white/70 px-4 py-2 text-sm font-black text-slate-700 shadow-sm">
          {result ? `Score ${result.score}` : '3 x 3'}
        </div>
      </div>

      <div className="grid w-full max-w-[420px] grid-cols-3 gap-4">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => play(index)}
            className={cn(
              'group aspect-square rounded-[22px] border border-white/60 bg-gradient-to-br from-white/80 via-indigo-50/70 to-sky-50/80 text-4xl font-black shadow-[0_12px_28px_rgba(108,99,255,0.10)] transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:border-white hover:shadow-[0_18px_40px_rgba(108,99,255,0.22)] active:scale-95 sm:text-5xl',
              !cell && !result && 'hover:bg-gradient-to-br hover:from-white hover:via-violet-50 hover:to-cyan-50',
              winningLine.includes(index) && 'animate-pulse ring-4 ring-violet-200/80 shadow-[0_18px_45px_rgba(108,99,255,0.30)]'
            )}
          >
            {cell && (
              <span
                className={cn(
                  'flex h-full w-full items-center justify-center leading-none transition duration-300 group-active:scale-90',
                  cell === 'X'
                    ? 'bg-gradient-to-br from-[#6c63ff] to-[#8b5cf6] bg-clip-text text-transparent'
                    : 'text-[#4ecdc4]'
                )}
              >
                {cell}
              </span>
            )}
          </button>
        ))}
      </div>

      {result && (
        <div className="mt-7 w-full rounded-3xl border border-white/50 bg-white/65 p-5 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Round Complete</p>
          <h3 className="mt-2 text-3xl font-black text-slate-800">Score: {result.score}</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">{result.message}</p>
          <button
            onClick={reset}
            className="mx-auto mt-5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4ecdc4] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
          >
            <RotateCcw size={16} />
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export const MemoryCardGame = ({ onComplete, onStatsChange, resetKey }) => {
  const symbols = [
    { key: 'apple', fruit: '🍎' },
    { key: 'banana', fruit: '🍌' },
    { key: 'grapes', fruit: '🍇' },
    { key: 'strawberry', fruit: '🍓' },
    { key: 'pineapple', fruit: '🍍' },
    { key: 'watermelon', fruit: '🍉' },
    { key: 'cherries', fruit: '🍒' },
    { key: 'peach', fruit: '🍑' }
  ];
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState(null);

  const reset = () => {
    setCards(shuffle(symbols.flatMap((symbol) => [{ ...symbol, id: `${symbol.key}-1` }, { ...symbol, id: `${symbol.key}-2` }])));
    setSelected([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setResult(null);
  };

  useEffect(reset, [resetKey]);

  useEffect(() => {
    onStatsChange?.({ moves, seconds });
  }, [moves, seconds, onStatsChange]);

  useEffect(() => {
    if (result) return;
    const timerId = setTimeout(() => setSeconds((value) => value + 1), 1000);
    return () => clearTimeout(timerId);
  }, [seconds, result]);

  useEffect(() => {
    if (!result && matched.length === symbols.length && cards.length) {
      const score = Math.max(40, 180 - moves * 5 - seconds);
      const nextResult = { score, message: `All pairs matched in ${moves} moves and ${seconds}s.` };
      setResult(nextResult);
      onComplete(nextResult);
    }
  }, [matched, moves, seconds, cards.length, result, onComplete]);

  const select = (card) => {
    if (selected.length === 2 || selected.some((item) => item.id === card.id) || matched.includes(card.key) || result) return;
    const next = [...selected, card];
    setSelected(next);
    if (next.length === 2) {
      setMoves((value) => value + 1);
      if (next[0].key === next[1].key) {
        setMatched((value) => [...value, card.key]);
        setSelected([]);
      } else {
        setTimeout(() => setSelected([]), 700);
      }
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col items-center rounded-[24px] border border-white/30 bg-white/60 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-[15px] sm:p-8">
      <div className="mb-6 flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/40 bg-white/45 px-4 py-3 shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Match Progress</p>
          <p className="mt-1 text-lg font-black text-slate-800">{matched.length} of {symbols.length} pairs</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/70 px-4 py-2 text-sm font-black text-slate-700 shadow-sm">Moves {moves}</span>
          <span className="rounded-full bg-white/70 px-4 py-2 text-sm font-black text-slate-700 shadow-sm">Time {seconds}s</span>
        </div>
      </div>

      <div className="grid w-full max-w-[680px] grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => {
          const visible = selected.some((item) => item.id === card.id) || matched.includes(card.key);
          const isMatched = matched.includes(card.key);
          return (
            <button
              key={card.id}
              onClick={() => select(card)}
              className="group aspect-square rounded-[22px] outline-none transition duration-300 hover:scale-[1.05] focus-visible:ring-4 focus-visible:ring-violet-200 active:scale-95"
              style={{ perspective: '1000px' }}
            >
              <span
                className={cn(
                  'relative block h-full w-full rounded-[22px] transition-transform duration-500 ease-out',
                  visible && '[transform:rotateY(180deg)]',
                  isMatched && 'animate-bounce'
                )}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <span
                  className="absolute inset-0 flex items-center justify-center rounded-[22px] border border-white/30 bg-gradient-to-br from-[#6c63ff] via-[#7c8cff] to-[#4ecdc4] shadow-[0_16px_34px_rgba(108,99,255,0.22)] transition group-hover:shadow-[0_20px_44px_rgba(108,99,255,0.32)]"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <Sparkles className="text-white/85" size={30} />
                </span>
                <span
                  className={cn(
                    'absolute inset-0 flex items-center justify-center rounded-[22px] border border-white/50 bg-white/70 text-4xl shadow-[0_14px_34px_rgba(78,205,196,0.18)] backdrop-blur-[10px] sm:text-5xl',
                    isMatched && 'ring-4 ring-[#4ecdc4]/30 shadow-[0_18px_46px_rgba(78,205,196,0.34)]'
                  )}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className={cn('leading-none', isMatched && 'animate-bounce')}>
                    {card.fruit}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {result && (
        <div className="mt-7 w-full rounded-3xl border border-white/50 bg-white/70 p-5 text-center shadow-[0_18px_46px_rgba(78,205,196,0.18)]">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#4ecdc4] text-white shadow-lg shadow-indigo-200">
            <Trophy size={28} />
          </div>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Perfect Match</p>
          <h3 className="mt-2 text-3xl font-black text-slate-800">Score: {result.score}</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">{result.message}</p>
          <button
            onClick={reset}
            className="mx-auto mt-5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4ecdc4] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
          >
            <RotateCcw size={16} />
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export const BubblePopGame = ({ onComplete, onStatsChange, resetKey, timerSeconds = 30 }) => {
  const [bubbles, setBubbles] = useState([]);
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [popped, setPopped] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [bursts, setBursts] = useState([]);
  const [result, setResult] = useState(null);
  const lastPopAtRef = useRef(0);

  const reset = () => {
    setTimeLeft(timerSeconds);
    setPopped(0);
    setScore(0);
    setCombo(1);
    setBursts([]);
    setResult(null);
    setBubbles(createBubbles());
    lastPopAtRef.current = 0;
  };

  useEffect(reset, [resetKey, timerSeconds]);

  useEffect(() => {
    onStatsChange?.({ timeLeft, score, popped, combo });
  }, [timeLeft, score, popped, combo, onStatsChange]);

  useEffect(() => {
    if (result) return;
    if (timeLeft <= 0) {
      const nextResult = { score, message: `${popped} bubbles popped in ${timerSeconds} seconds with a ${combo}x final combo.` };
      setResult(nextResult);
      onComplete(nextResult);
      return;
    }
    const timerId = setTimeout(() => setTimeLeft((value) => value - 1), 1000);
    return () => clearTimeout(timerId);
  }, [timeLeft, popped, score, combo, timerSeconds, result, onComplete]);

  const pop = (bubble) => {
    if (result || bubble.popping) return;
    const now = Date.now();
    const nextCombo = now - lastPopAtRef.current < 750 ? Math.min(combo + 1, 3) : 1;
    const points = bubble.value * nextCombo;
    lastPopAtRef.current = now;

    setPopped((value) => value + 1);
    setScore((value) => value + points);
    setCombo(nextCombo);
    setBubbles((current) => current.map((item) => item.id === bubble.id ? { ...item, popping: true } : item));
    setBursts((current) => [
      ...current,
      ...createBurst(bubble, points)
    ]);

    setTimeout(() => {
      setBubbles((current) => current.map((item) => item.id === bubble.id ? createBubble(bubble.id) : item));
    }, 240);

    setTimeout(() => {
      setBursts((current) => current.filter((burst) => burst.sourceId !== bubble.id));
    }, 820);
  };

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col items-center rounded-[28px] border border-white/35 bg-white/55 p-5 shadow-[0_18px_50px_rgba(14,165,233,0.16)] backdrop-blur-[15px] sm:p-8">
      <div className="mb-5 flex w-full flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/40 bg-white/50 px-4 py-3 shadow-sm">
        <div className={cn('rounded-2xl px-5 py-3 text-center shadow-sm transition', timeLeft <= 8 ? 'animate-pulse bg-rose-50 text-rose-600' : 'bg-white/75 text-sky-700')}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time Left</p>
          <p className="mt-1 text-3xl font-black tabular-nums">{timeLeft}s</p>
        </div>
        <div className="rounded-2xl bg-white/75 px-5 py-3 text-center text-[#6c63ff] shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</p>
          <p className="mt-1 text-3xl font-black tabular-nums">{score}</p>
        </div>
        <div className="rounded-2xl bg-white/75 px-5 py-3 text-center text-[#4ecdc4] shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Combo</p>
          <p className="mt-1 text-3xl font-black tabular-nums">{combo}x</p>
        </div>
      </div>

      <div className="relative h-[420px] w-full overflow-hidden rounded-[28px] border border-white/40 bg-gradient-to-br from-[#dbeafe] via-[#f0f9ff] to-[#fdf2f8] shadow-inner">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.82),transparent_25%),radial-gradient(circle_at_82%_18%,rgba(196,181,253,0.28),transparent_28%),radial-gradient(circle_at_55%_86%,rgba(78,205,196,0.22),transparent_30%)]" />
        {bubbles.map((bubble) => (
          <button
            key={bubble.id}
            onClick={() => pop(bubble)}
            className={cn(
              'absolute rounded-full border border-white/50 opacity-90 shadow-lg transition duration-200 hover:scale-110 active:scale-75',
              bubble.popping && 'pointer-events-none',
              bubble.value >= 3 && 'hover:shadow-[0_24px_54px_rgba(108,99,255,0.36)]',
              bubble.value >= 5 && 'ring-4 ring-pink-200/60 hover:shadow-[0_28px_64px_rgba(236,72,153,0.42)]'
            )}
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: bubble.size,
              height: bubble.size,
              background: bubble.gradient,
              boxShadow: bubble.shadow,
              animation: bubble.popping
                ? 'bubble-pop 240ms ease-out forwards'
                : `bubble-float ${bubble.floatDuration}s ease-in-out ${bubble.floatDelay}s infinite`
            }}
            aria-label={`Pop ${bubble.type} bubble worth ${bubble.value} points`}
          >
            <span className="absolute left-[18%] top-[16%] h-[26%] w-[26%] rounded-full bg-white/70 blur-[1px]" />
            <span className="absolute bottom-[16%] right-[16%] rounded-full bg-white/55 px-1.5 py-0.5 text-[10px] font-black text-slate-700 shadow-sm">
              +{bubble.value}
            </span>
          </button>
        ))}

        {bursts.map((burst) => (
          <span
            key={burst.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: `${burst.x}%`,
              top: `${burst.y}%`,
              width: burst.isScore ? 42 : 8,
              height: burst.isScore ? 24 : 8,
              color: burst.isScore ? burst.color : undefined,
              background: burst.isScore ? 'transparent' : burst.color,
              fontSize: burst.isScore && burst.isBonus ? 22 : undefined,
              fontWeight: 900,
              animation: burst.isScore ? 'score-rise 760ms ease-out forwards' : 'bubble-burst 760ms ease-out forwards',
              '--burst-x': burst.dx,
              '--burst-y': burst.dy
            }}
          >
            {burst.isScore ? `+${burst.points}` : ''}
          </span>
        ))}

        {result && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/45 p-6 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-[28px] border border-white/50 bg-white/75 p-7 text-center shadow-[0_24px_70px_rgba(108,99,255,0.22)]">
              <div className="mx-auto mb-4 flex h-16 w-16 animate-bounce items-center justify-center rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#4ecdc4] text-3xl shadow-lg shadow-indigo-200">
                pop
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Game Over</p>
              <h3 className="mt-2 text-4xl font-black text-slate-800">{result.score}</h3>
              <p className="mt-2 text-sm font-medium text-slate-500">{result.message}</p>
              <button
                onClick={reset}
                className="mx-auto mt-6 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4ecdc4] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
              >
                <RotateCcw size={16} />
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const TapSpeedChallenge = ({ onComplete, onStatsChange, resetKey, timerSeconds = 15 }) => {
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [taps, setTaps] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [tapEffects, setTapEffects] = useState([]);
  const [result, setResult] = useState(null);
  const lastTapAtRef = useRef(0);
  const finalStatsRef = useRef({ taps: 0, score: 0, combo: 1 });

  const reset = () => {
    setTimeLeft(timerSeconds);
    setTaps(0);
    setScore(0);
    setCombo(1);
    setIsRunning(false);
    setTapEffects([]);
    setResult(null);
    lastTapAtRef.current = 0;
    finalStatsRef.current = { taps: 0, score: 0, combo: 1 };
  };

  useEffect(reset, [resetKey, timerSeconds]);

  useEffect(() => {
    onStatsChange?.({ timeLeft, taps, score, combo, progress: ((timerSeconds - timeLeft) / timerSeconds) * 100 });
  }, [timeLeft, taps, score, combo, timerSeconds, onStatsChange]);

  useEffect(() => {
    finalStatsRef.current = { taps, score, combo };
  }, [taps, score, combo]);

  useEffect(() => {
    if (!isRunning || result) return undefined;
    const intervalId = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(intervalId);
          setIsRunning(false);
          const finalStats = finalStatsRef.current;
          const nextResult = {
            score: finalStats.score,
            message: `${finalStats.taps} taps in ${timerSeconds} seconds with a ${finalStats.combo}x final combo.`
          };
          setResult(nextResult);
          onComplete(nextResult);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, result, timerSeconds, onComplete]);

  const tap = (event) => {
    if (result || timeLeft <= 0) return;
    const now = Date.now();
    const nextCombo = now - lastTapAtRef.current < 420 ? Math.min(combo + 1, 5) : 1;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = `${now}-${Math.random()}`;
    const points = nextCombo;
    lastTapAtRef.current = now;
    setIsRunning(true);
    setTaps((value) => value + 1);
    setScore((value) => value + points);
    setCombo(nextCombo);
    setTapEffects((current) => [...current, { id, x, y, points }]);
    setTimeout(() => {
      setTapEffects((current) => current.filter((effect) => effect.id !== id));
    }, 760);
  };

  const progress = Math.max(0, Math.min(100, (timeLeft / timerSeconds) * 100));

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col items-center rounded-[28px] border border-white/35 bg-white/55 p-5 shadow-[0_18px_50px_rgba(108,99,255,0.16)] backdrop-blur-[15px] sm:p-8">
      <div className="mb-8 w-full rounded-3xl border border-white/40 bg-white/50 p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className={cn('rounded-2xl px-5 py-3 text-center shadow-sm transition', timeLeft <= 5 ? 'bg-rose-50 text-rose-600 [animation:urgency-shake_360ms_ease-in-out_infinite]' : 'bg-white/75 text-[#6c63ff]')}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</p>
            <p className="mt-1 text-3xl font-black tabular-nums">{timeLeft}s</p>
          </div>
          <div className="rounded-2xl bg-white/75 px-5 py-3 text-center text-[#4ecdc4] shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Taps</p>
            <p className="mt-1 text-3xl font-black tabular-nums">{taps}</p>
          </div>
          <div className="rounded-2xl bg-white/75 px-5 py-3 text-center text-pink-500 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Combo</p>
            <p className="mt-1 text-3xl font-black tabular-nums">{combo}x</p>
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/70 shadow-inner">
          <div
            className={cn('h-full rounded-full bg-gradient-to-r from-[#6c63ff] via-pink-500 to-orange-400 transition-all duration-500', timeLeft <= 5 && 'animate-pulse')}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="relative flex min-h-[360px] w-full items-center justify-center overflow-hidden rounded-[32px] bg-gradient-to-br from-[#eef2ff] via-[#f8faff] to-[#fff7ed]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(255,255,255,0.86),transparent_24%),radial-gradient(circle_at_78%_72%,rgba(236,72,153,0.16),transparent_30%),radial-gradient(circle_at_45%_86%,rgba(78,205,196,0.18),transparent_30%)]" />
        <button
          onClick={tap}
          disabled={Boolean(result) || timeLeft <= 0}
          className={cn(
            'relative flex h-60 w-60 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#6c63ff] via-pink-500 to-orange-400 text-white shadow-[0_24px_70px_rgba(236,72,153,0.28)] transition duration-200 hover:scale-[1.04] active:scale-90 disabled:cursor-not-allowed disabled:opacity-70 sm:h-72 sm:w-72',
            !isRunning && !result && timeLeft > 0 && '[animation:tap-pulse_1.8s_ease-in-out_infinite]',
            timeLeft <= 5 && 'ring-8 ring-rose-200/70'
          )}
        >
          <span className="absolute left-[18%] top-[14%] h-16 w-16 rounded-full bg-white/30 blur-md" />
          <span className="relative z-10 flex flex-col items-center justify-center">
            <span className="text-5xl font-black tracking-wide sm:text-6xl">TAP</span>
            <span className="mt-2 text-3xl">⚡</span>
          </span>
          {tapEffects.map((effect) => (
            <span key={`${effect.id}-ripple`} className="pointer-events-none absolute rounded-full border-4 border-white/70" style={{ left: effect.x, top: effect.y, width: 80, height: 80, animation: 'tap-ripple 620ms ease-out forwards' }} />
          ))}
        </button>

        {tapEffects.map((effect) => (
          <span
            key={`${effect.id}-score`}
            className="pointer-events-none absolute text-2xl font-black text-[#6c63ff] drop-shadow-sm"
            style={{ left: `calc(50% + ${effect.x - 130}px)`, top: `calc(50% + ${effect.y - 160}px)`, animation: 'tap-pop 720ms ease-out forwards' }}
          >
            +{effect.points}
          </span>
        ))}

        {result && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/45 p-6 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-[28px] border border-white/50 bg-white/80 p-7 text-center shadow-[0_24px_70px_rgba(108,99,255,0.22)]">
              <div className="mx-auto mb-4 flex h-16 w-16 animate-bounce items-center justify-center rounded-2xl bg-gradient-to-br from-[#6c63ff] to-orange-400 text-3xl shadow-lg shadow-indigo-200">
                ⚡
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Time Up</p>
              <h3 className="mt-2 text-4xl font-black text-slate-800">{result.score}</h3>
              <p className="mt-2 text-sm font-medium text-slate-500">{result.message}</p>
              <button
                onClick={reset}
                className="mx-auto mt-6 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6c63ff] via-pink-500 to-orange-400 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
              >
                <RotateCcw size={16} />
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const PuzzleGame = ({ onComplete, onStatsChange, resetKey }) => {
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState(null);

  const reset = () => {
    setTiles(createPuzzle());
    setMoves(0);
    setSeconds(0);
    setResult(null);
  };

  useEffect(reset, [resetKey]);

  useEffect(() => {
    onStatsChange?.({ moves, seconds });
  }, [moves, seconds, onStatsChange]);

  useEffect(() => {
    if (result) return;
    const timerId = setTimeout(() => setSeconds((value) => value + 1), 1000);
    return () => clearTimeout(timerId);
  }, [seconds, result]);

  useEffect(() => {
    if (!result && moves > 0 && tiles.length && tiles.every((tile, index) => tile === index + 1 || (index === 8 && tile === null))) {
      const score = Math.max(40, 180 - moves * 4 - seconds);
      const nextResult = { score, message: `Solved in ${moves} moves and ${seconds}s.` };
      setResult(nextResult);
      onComplete(nextResult);
    }
  }, [tiles, moves, seconds, result, onComplete]);

  const move = (index) => {
    if (result) return;
    const empty = tiles.indexOf(null);
    const canMove = [index - 3, index + 3, index - 1, index + 1].includes(empty) && Math.abs((index % 3) - (empty % 3)) <= 1;
    if (!canMove) return;
    setTiles((current) => {
      const next = [...current];
      next[empty] = next[index];
      next[index] = null;
      return next;
    });
    setMoves((value) => value + 1);
  };

  return (
    <div className="mx-auto flex w-full max-w-[620px] flex-col items-center rounded-[28px] border border-white/35 bg-white/55 p-5 shadow-[0_18px_50px_rgba(108,99,255,0.14)] backdrop-blur-[15px] sm:p-8">
      <div className="mb-6 flex w-full flex-wrap items-center justify-center gap-3">
        <div className="min-w-[120px] rounded-2xl border border-white/50 bg-white/70 px-5 py-3 text-center shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Moves</p>
          <p className="mt-1 text-3xl font-black text-[#6c63ff] tabular-nums">{moves}</p>
        </div>
        <div className="min-w-[120px] rounded-2xl border border-white/50 bg-white/70 px-5 py-3 text-center shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</p>
          <p className="mt-1 text-3xl font-black text-[#4ecdc4] tabular-nums">{seconds}s</p>
        </div>
      </div>

      <div className="grid aspect-square w-full max-w-[520px] grid-cols-3 gap-3 rounded-[28px] border border-white/45 bg-white/45 p-3 shadow-inner backdrop-blur-[10px] sm:gap-4 sm:p-4">
        {tiles.map((tile, index) => (
          <button
            key={`${tile}-${index}`}
            onClick={() => move(index)}
            className={cn(
              'aspect-square rounded-[20px] text-3xl font-black transition-all duration-300 ease-out active:scale-95 sm:text-4xl',
              tile
                ? 'border border-white/50 bg-gradient-to-br from-[#6c63ff] via-blue-500 to-[#4ecdc4] text-white shadow-[0_16px_34px_rgba(108,99,255,0.22)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_22px_48px_rgba(108,99,255,0.30)]'
                : 'border-2 border-dashed border-slate-300/80 bg-white/45 shadow-inner'
            )}
            disabled={!tile}
          >
            {tile}
          </button>
        ))}
      </div>

      {result && (
        <div className="mt-7 w-full rounded-3xl border border-white/50 bg-white/75 p-5 text-center shadow-[0_18px_46px_rgba(78,205,196,0.18)]">
          <div className="mx-auto mb-3 flex h-14 w-14 animate-bounce items-center justify-center rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#4ecdc4] text-white shadow-lg shadow-indigo-200">
            <Trophy size={28} />
          </div>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Puzzle Solved</p>
          <h3 className="mt-2 text-3xl font-black text-slate-800">Score: {result.score}</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">{result.message}</p>
          <button
            onClick={reset}
            className="mx-auto mt-5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4ecdc4] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
          >
            <RotateCcw size={16} />
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

const getWinner = (board) => {
  const line = getWinningLine(board);
  return line.length ? board[line[0]] : null;
};

const getWinningLine = (board) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  const line = lines.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
  return line || [];
};

const pickTicTacToeMove = (board, open) => {
  const winningMove = open.find((index) => getWinner(board.map((cell, cellIndex) => cellIndex === index ? 'O' : cell)) === 'O');
  if (winningMove !== undefined) return winningMove;
  const blockingMove = open.find((index) => getWinner(board.map((cell, cellIndex) => cellIndex === index ? 'X' : cell)) === 'X');
  if (blockingMove !== undefined) return blockingMove;
  if (open.includes(4)) return 4;
  return open[Math.floor(Math.random() * open.length)];
};

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const bubbleStyles = [
  {
    type: 'pink',
    value: 5,
    weight: 1,
    gradient: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95), rgba(244,114,182,0.72) 28%, rgba(236,72,153,0.88) 72%)',
    shadow: '0 18px 36px rgba(236,72,153,0.34)'
  },
  {
    type: 'blue',
    value: 2,
    weight: 4,
    gradient: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95), rgba(96,165,250,0.72) 28%, rgba(37,99,235,0.84) 72%)',
    shadow: '0 18px 36px rgba(59,130,246,0.28)'
  },
  {
    type: 'purple',
    value: 3,
    weight: 3,
    gradient: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95), rgba(167,139,250,0.72) 28%, rgba(108,99,255,0.86) 72%)',
    shadow: '0 18px 36px rgba(108,99,255,0.28)'
  },
  {
    type: 'green',
    value: 1,
    weight: 5,
    gradient: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95), rgba(78,205,196,0.68) 28%, rgba(16,185,129,0.84) 72%)',
    shadow: '0 18px 36px rgba(16,185,129,0.24)'
  }
];

const createBubble = (id) => {
  const style = pickWeightedBubbleStyle();
  return {
    id,
    x: Math.random() * 82 + 3,
    y: Math.random() * 72 + 6,
    size: Math.floor(Math.random() * 30) + 44,
    floatDuration: Math.random() * 1.8 + 2.6,
    floatDelay: Math.random() * 1.2,
    popping: false,
    ...style
  };
};

const createBubbles = () => Array.from({ length: 10 }, (_, index) => createBubble(index));

const pickWeightedBubbleStyle = () => {
  const totalWeight = bubbleStyles.reduce((sum, style) => sum + style.weight, 0);
  let target = Math.random() * totalWeight;
  return bubbleStyles.find((style) => {
    target -= style.weight;
    return target <= 0;
  }) || bubbleStyles[bubbleStyles.length - 1];
};

const createBurst = (bubble, points) => {
  const particleColors = ['#f472b6', '#60a5fa', '#a78bfa', '#4ecdc4', '#facc15'];
  const particleCount = bubble.value >= 5 ? 16 : bubble.value >= 3 ? 12 : 9;
  const particles = Array.from({ length: particleCount }, (_, index) => {
    const angle = (Math.PI * 2 * index) / particleCount;
    const distance = Math.floor(Math.random() * 28) + 26 + bubble.value * 3;
    return {
      id: `${bubble.id}-${Date.now()}-${index}`,
      sourceId: bubble.id,
      x: bubble.x + 2.5,
      y: bubble.y + 2.5,
      dx: `${Math.cos(angle) * distance}px`,
      dy: `${Math.sin(angle) * distance}px`,
      color: particleColors[index % particleColors.length]
    };
  });

  return [
    ...particles,
    {
      id: `${bubble.id}-${Date.now()}-score`,
      sourceId: bubble.id,
      x: bubble.x + 2,
      y: bubble.y,
      isScore: true,
      isBonus: bubble.value >= 5,
      color: bubble.value >= 5 ? '#ec4899' : bubble.value >= 3 ? '#6c63ff' : bubble.value === 2 ? '#2563eb' : '#059669',
      points
    }
  ];
};

const createPuzzle = () => {
  let puzzle = [1, 2, 3, 4, 5, 6, 7, 8, null];
  for (let i = 0; i < 80; i += 1) {
    const empty = puzzle.indexOf(null);
    const candidates = [empty - 3, empty + 3, empty - 1, empty + 1].filter((index) => (
      index >= 0 && index < 9 && Math.abs((index % 3) - (empty % 3)) <= 1
    ));
    const nextIndex = candidates[Math.floor(Math.random() * candidates.length)];
    puzzle = puzzle.map((tile, index) => {
      if (index === empty) return puzzle[nextIndex];
      if (index === nextIndex) return null;
      return tile;
    });
  }
  return puzzle;
};
