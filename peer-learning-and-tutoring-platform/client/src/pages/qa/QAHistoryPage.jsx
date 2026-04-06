import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { loadPreferredMedium, loadQAHistory, getQAUiText } from '../../data/qaData';

const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };

const QAHistoryPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({ search: '', difficulty: 'all', type: 'all', sortBy: 'newest' });

  const userId = user?.id || user?._id || user?.userId || 'unknown';
  const preferredMedium = loadPreferredMedium();
  const uiText = getQAUiText(preferredMedium).history;

  useEffect(() => {
    if (isAuthenticated) {
      setHistory(loadQAHistory(userId));
    }
  }, [isAuthenticated, userId]);

  const filteredHistory = useMemo(() => {
    return history
      .filter((entry) => {
        if (filters.difficulty !== 'all' && entry.difficulty !== filters.difficulty) {
          return false;
        }
        if (filters.type !== 'all' && entry.type !== filters.type) {
          return false;
        }
        if (filters.search) {
          const query = filters.search.toLowerCase();
          return (
            entry.subject.toLowerCase().includes(query) ||
            entry.questionTitle.toLowerCase().includes(query) ||
            entry.outcome.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'points') {
          return (b.points || 0) - (a.points || 0);
        }
        if (filters.sortBy === 'difficulty') {
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        }
        return new Date(b.completedAt) - new Date(a.completedAt);
      });
  }, [history, filters]);

  const totalAttempts = history.length;
  const correctAttempts = history.filter((entry) => entry.outcome === 'Correct').length;

  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">{uiText.pleaseLogin}</h1>
          <p className="text-slate-700">{uiText.loginRequired}</p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            {uiText.login}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600 font-semibold">{uiText.activityHistoryTag}</p>
            <h1 className="text-4xl font-bold text-slate-900">{uiText.yourPracticeHistory}</h1>
            <p className="text-slate-600 mt-2">{uiText.historyDescription}</p>
          </div>
          <div className="space-y-2 text-right">
            <div className="text-sm text-slate-700">{uiText.preferredMedium}: <strong>{preferredMedium}</strong></div>
            <Link
              to="/qa/medium"
              className="inline-flex rounded-2xl border border-blue-600 px-4 py-2 text-blue-700 hover:bg-blue-50 transition-colors"
            >
              {uiText.changeMedium}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] mb-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">{uiText.stats}</h2>
          <div className="space-y-3 text-slate-700">
            <p>{uiText.totalAttempts}: <strong>{totalAttempts}</strong></p>
            <p>{uiText.correctAttempts}: <strong>{correctAttempts}</strong></p>
            <p>{uiText.mostRecent}: <strong>{history[0] ? new Date(history[0].completedAt).toLocaleString() : uiText.noActivityYet}</strong></p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">{uiText.quickActions}</h2>
          <Link
            to="/qa/grades"
            className="inline-flex w-full justify-center rounded-2xl bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            {uiText.continuePractice}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <input
          type="text"
          value={filters.search}
          placeholder={uiText.searchPlaceholder}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-blue-400 focus:outline-none"
        />
        <select
          value={filters.difficulty}
          onChange={(e) => setFilters((prev) => ({ ...prev, difficulty: e.target.value }))}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-blue-400 focus:outline-none"
        >
          <option value="all">{uiText.allDifficulties}</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select
          value={filters.type}
          onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-blue-400 focus:outline-none"
        >
          <option value="all">{uiText.allQuestionTypes}</option>
          <option value="mcq">{uiText.mcq}</option>
          <option value="structured">{uiText.structuredEssay}</option>
        </select>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-blue-400 focus:outline-none"
        >
          <option value="newest">{uiText.sortByNewest}</option>
          <option value="difficulty">{uiText.sortByDifficulty}</option>
          <option value="points">{uiText.sortByPoints}</option>
        </select>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-slate-700 text-lg font-medium mb-3">{uiText.noActivityFound}</p>
          <p className="text-slate-500">{uiText.noActivityHint}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((entry) => (
            <div key={entry.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{entry.questionTitle}</h3>
                  <p className="text-slate-500 mt-1">{entry.subject} · {uiText.grade} {entry.grade}</p>
                </div>
                <div className="space-y-2 text-right">
                  <div className="text-sm text-slate-700">{new Date(entry.completedAt).toLocaleString()}</div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">{entry.outcome}</div>
                </div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-4 text-sm text-slate-600">
                <div>{uiText.difficulty}: <strong>{entry.difficulty}</strong></div>
                <div>{uiText.type}: <strong>{entry.type === 'structured' ? uiText.structured : uiText.mcq}</strong></div>
                <div>{uiText.points}: <strong>{entry.points}</strong></div>
                <div>{uiText.score}: <strong>{entry.earned}/{entry.points}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QAHistoryPage;
