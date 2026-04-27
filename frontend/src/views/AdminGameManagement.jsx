import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Brain,
  CircleDot,
  Clock,
  Eye,
  Gamepad2,
  Grid3X3,
  MousePointerClick,
  Pencil,
  Power,
  Puzzle,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react';
import Layout from '../components/Layout';
import { adminGamesApi } from '../services/api';
import { cn } from '../utils/cn';

const iconMap = {
  'grid-3x3': Grid3X3,
  brain: Brain,
  'circle-dot': CircleDot,
  'mouse-pointer-click': MousePointerClick,
  puzzle: Puzzle
};

const formatDate = (date) => date ? new Date(date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

const AdminGameManagement = () => {
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState({ totalGames: 0, activeGames: 0, inactiveGames: 0, deletedGames: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [timerGame, setTimerGame] = useState(null);
  const [deleteGame, setDeleteGame] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState('');
  const [saving, setSaving] = useState(false);

  const loadGames = async () => {
    try {
      setLoading(true);
      const res = await adminGamesApi.getAll();
      if (res.success) {
        setGames(res.data.games || []);
        setStats(res.data.stats || stats);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const openTimerModal = (game) => {
    setTimerGame(game);
    setTimerSeconds(String(game.timerSeconds));
  };

  const saveTimer = async () => {
    if (!timerGame) return;
    const nextTimer = Number(timerSeconds);
    if (!Number.isInteger(nextTimer) || nextTimer < 5 || nextTimer > 900) {
      toast.error('Timer must be between 5 and 900 seconds');
      return;
    }

    try {
      setSaving(true);
      const res = await adminGamesApi.updateTimer(timerGame._id, nextTimer);
      if (res.success) {
        toast.success('Timer updated');
        setTimerGame(null);
        await loadGames();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update timer');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (game) => {
    try {
      const nextActive = !game.isActive;
      const res = await adminGamesApi.updateStatus(game._id, nextActive);
      if (res.success) {
        toast.success(nextActive ? 'Game activated' : 'Game deactivated');
        await loadGames();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const confirmDelete = async () => {
    if (!deleteGame) return;
    try {
      setSaving(true);
      const res = await adminGamesApi.delete(deleteGame._id);
      if (res.success) {
        toast.success('Game deleted');
        setDeleteGame(null);
        await loadGames();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete game');
    } finally {
      setSaving(false);
    }
  };

  const statCards = [
    { label: 'Total Games', value: stats.totalGames, tone: 'text-indigo-600 bg-indigo-50', icon: Gamepad2 },
    { label: 'Active Games', value: stats.activeGames, tone: 'text-emerald-600 bg-emerald-50', icon: Power },
    { label: 'Inactive Games', value: stats.inactiveGames, tone: 'text-amber-600 bg-amber-50', icon: Clock },
    { label: 'Deleted Games', value: stats.deletedGames, tone: 'text-rose-600 bg-rose-50', icon: Trash2 }
  ];

  return (
    <Layout userRole="admin">
      <div className="mx-auto w-full max-w-[1400px] pb-12">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
              <Gamepad2 size={14} />
              Break Time Games
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-800">Game Management</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              Manage visibility, timer duration, and availability for Refresh Zone games.
            </p>
          </div>
          <button
            onClick={loadGames}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-95"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
                    <p className="mt-2 text-3xl font-black text-slate-800">{stat.value}</p>
                  </div>
                  <span className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', stat.tone)}>
                    <Icon size={22} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-xl font-bold text-slate-800">All Games</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4">Game</th>
                  <th className="px-5 py-4">Description</th>
                  <th className="px-5 py-4">Timer</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-sm font-medium text-slate-400">Loading games...</td>
                  </tr>
                ) : games.length ? games.map((game) => (
                  <GameRow
                    key={game._id}
                    game={game}
                    onView={() => setSelectedGame(game)}
                    onEditTimer={() => openTimerModal(game)}
                    onToggleStatus={() => toggleStatus(game)}
                    onDelete={() => setDeleteGame(game)}
                  />
                )) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-sm font-medium text-slate-400">No games available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedGame && (
          <Modal title="Game Details" onClose={() => setSelectedGame(null)}>
            <GameDetails game={selectedGame} />
          </Modal>
        )}

        {timerGame && (
          <Modal title="Edit Timer" onClose={() => setTimerGame(null)}>
            <div className="space-y-5">
              <div>
                <p className="text-sm font-bold text-slate-800">{timerGame.name}</p>
                <p className="mt-1 text-sm text-slate-500">Set duration in seconds.</p>
              </div>
              <input
                type="number"
                min="5"
                max="900"
                value={timerSeconds}
                onChange={(event) => setTimerSeconds(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-bold text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              />
              <button
                onClick={saveTimer}
                disabled={saving}
                className="w-full rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4ecdc4] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                Save Timer
              </button>
            </div>
          </Modal>
        )}

        {deleteGame && (
          <Modal title="Delete Game" onClose={() => setDeleteGame(null)}>
            <div className="space-y-5">
              <p className="text-sm font-medium leading-6 text-slate-600">
                Delete <span className="font-bold text-slate-900">{deleteGame.name}</span>? It will be removed from the user Refresh Zone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteGame(null)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={saving}
                  className="flex-1 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

const GameRow = ({ game, onView, onEditTimer, onToggleStatus, onDelete }) => {
  const Icon = iconMap[game.icon] || Gamepad2;
  const isActive = game.status === 'active' && game.isActive;
  const isDeleted = game.status === 'deleted';

  return (
    <tr className="transition hover:bg-slate-50/80">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Icon size={21} />
          </span>
          <div>
            <p className="font-bold text-slate-800">{game.name}</p>
            <p className="text-xs font-medium text-slate-400">/{game.slug}</p>
          </div>
        </div>
      </td>
      <td className="max-w-[320px] px-5 py-4 text-sm font-medium leading-6 text-slate-500">{game.description}</td>
      <td className="px-5 py-4">
        <span className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-black text-slate-700">{game.timerSeconds}s</span>
      </td>
      <td className="px-5 py-4">
        <span className={cn(
          'rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider',
          isDeleted ? 'bg-rose-50 text-rose-700' : isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
        )}>
          {isDeleted ? 'Deleted' : isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-5 py-4 text-sm font-medium text-slate-500">{formatDate(game.createdAt)}</td>
      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          <IconButton title="View" onClick={onView} icon={Eye} />
          <IconButton title="Edit Timer" onClick={onEditTimer} icon={Pencil} disabled={isDeleted} />
          <IconButton title={isActive ? 'Deactivate' : 'Activate'} onClick={onToggleStatus} icon={Power} disabled={isDeleted} tone={isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'} />
          <IconButton title="Delete" onClick={onDelete} icon={Trash2} disabled={isDeleted} tone="text-rose-600 hover:bg-rose-50" />
        </div>
      </td>
    </tr>
  );
};

const IconButton = ({ title, onClick, icon: Icon, tone = 'text-slate-500 hover:bg-slate-100', disabled = false }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={cn('flex h-9 w-9 items-center justify-center rounded-xl transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-35', tone)}
  >
    <Icon size={17} />
  </button>
);

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
    <div className="w-full max-w-lg rounded-3xl border border-white/60 bg-white p-6 shadow-2xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-slate-100">
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const GameDetails = ({ game }) => {
  const Icon = iconMap[game.icon] || Gamepad2;
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-3xl bg-slate-50 p-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Icon size={26} />
        </span>
        <div>
          <h3 className="text-xl font-bold text-slate-800">{game.name}</h3>
          <p className="text-sm font-medium text-slate-400">/{game.slug}</p>
        </div>
      </div>
      <p className="text-sm font-medium leading-6 text-slate-600">{game.description}</p>
      <div className="grid grid-cols-2 gap-3">
        <Detail label="Timer" value={`${game.timerSeconds}s`} />
        <Detail label="Status" value={game.isActive ? 'Active' : 'Inactive'} />
        <Detail label="Created" value={formatDate(game.createdAt)} />
        <Detail label="Updated" value={formatDate(game.updatedAt)} />
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-4">
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
  </div>
);

export default AdminGameManagement;
