import React, { useEffect, useMemo, useState } from 'react';
import { apiService, qaApi } from '../../services/api';

const normalizeText = (text = '') =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const looksLikeSpam = (text = '') => {
  if (!text) return false;
  return /(https?:\/\/|www\.)/i.test(text) || /(.)\1{7,}/.test(text);
};

const AdminQAModerationPage = () => {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('questions');

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [reports, setReports] = useState([]);

  const [questionSearch, setQuestionSearch] = useState('');
  const [questionFilter, setQuestionFilter] = useState('all');
  const [answerSearch, setAnswerSearch] = useState('');
  const [reportStatus, setReportStatus] = useState('all');
  const [error, setError] = useState('');
  const [reportActionLoadingId, setReportActionLoadingId] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [qRes, aRes, rRes] = await Promise.allSettled([
        apiService.get('/api/questions?limit=300&sortBy=newest&includeClosed=true'),
        apiService.get('/api/answers/moderation/all?limit=300'),
        apiService.get('/api/moderation/reports?limit=100')
      ]);

      const qData = qRes.status === 'fulfilled' ? qRes.value : { success: false };
      const aData = aRes.status === 'fulfilled' ? aRes.value : { success: false };
      const rData = rRes.status === 'fulfilled' ? rRes.value : { success: false };

      const fetchedQuestions = qData.success ? (qData.data?.questions || qData.data || []) : [];
      const fetchedAnswers = aData.success ? (aData.data?.answers || []) : [];
      const fetchedReports = rData.success ? (rData.data?.reports || rData.data || []) : [];

      setQuestions(Array.isArray(fetchedQuestions) ? fetchedQuestions : []);
      setAnswers(Array.isArray(fetchedAnswers) ? fetchedAnswers : []);
      setReports(Array.isArray(fetchedReports) ? fetchedReports : []);

      const failedSections = [];
      if (!qData.success) failedSections.push('questions');
      if (!aData.success) failedSections.push('answers');
      if (!rData.success) failedSections.push('reports');

      if (failedSections.length > 0) {
        setError(`Some moderation data failed to load: ${failedSections.join(', ')}.`);
      }
    } catch (e) {
      setError('Failed to load moderation data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const duplicateTitleMap = useMemo(() => {
    const map = new Map();
    questions.forEach((q) => {
      const key = normalizeText(q.title || '');
      if (!key) return;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const content = `${q.title || ''} ${q.body || ''}`.toLowerCase();
      const matchesSearch = !questionSearch || content.includes(questionSearch.toLowerCase());

      const isSpam = looksLikeSpam(q.title) || looksLikeSpam(q.body);
      const titleKey = normalizeText(q.title || '');
      const isDuplicate = titleKey && (duplicateTitleMap.get(titleKey) || 0) > 1;

      if (questionFilter === 'spam' && !isSpam) return false;
      if (questionFilter === 'duplicate' && !isDuplicate) return false;
      if (questionFilter === 'normal' && (isSpam || isDuplicate)) return false;

      return matchesSearch;
    });
  }, [questions, questionSearch, questionFilter, duplicateTitleMap]);

  const filteredAnswers = useMemo(() => {
    return answers.filter((a) => {
      const haystack = `${a.body || ''} ${a.question?.title || ''} ${a.author?.username || ''}`.toLowerCase();
      return !answerSearch || haystack.includes(answerSearch.toLowerCase());
    });
  }, [answers, answerSearch]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const qaTypes = ['question', 'answer'];
      if (!qaTypes.includes(r.reportedType)) return false;
      if (reportStatus === 'all') return true;
      return r.status === reportStatus;
    });
  }, [reports, reportStatus]);

  const handleDeleteQuestion = async (questionId) => {
    const confirmed = window.confirm('Delete this question? This action cannot be undone.');
    if (!confirmed) return;

    const res = await qaApi.deleteQuestion(questionId);
    if (res.success) {
      setQuestions((prev) => prev.filter((q) => q._id !== questionId));
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    const confirmed = window.confirm('Delete this answer? This action cannot be undone.');
    if (!confirmed) return;

    const res = await qaApi.deleteAnswer(answerId);
    if (res.success) {
      setAnswers((prev) => prev.filter((a) => a._id !== answerId));
    }
  };

  const handleMarkDuplicate = async (questionId) => {
    const res = await apiService.post(`/api/questions/${questionId}/close`, { reason: 'duplicate' });
    if (res.success) {
      setQuestions((prev) =>
        prev.map((q) => (q._id === questionId ? { ...q, isClosed: true, closeReason: 'duplicate' } : q))
      );
    }
  };

  const handleResolveReport = async (reportId) => {
    const action = window.prompt(
      'Action for resolve: no_action, warning, content_removed, user_suspended, user_banned, content_flagged',
      'content_removed'
    );
    if (!action) return;

    const notes = window.prompt('Resolution notes (optional):', '') || '';

    setReportActionLoadingId(reportId);
    try {
      const res = await apiService.put(`/api/moderation/reports/${reportId}/resolve`, { action, notes });
      if (res.success) {
        setReports((prev) => prev.map((r) => (r._id === reportId ? { ...r, status: 'resolved' } : r)));
      }
    } finally {
      setReportActionLoadingId('');
    }
  };

  const handleDismissReport = async (reportId) => {
    const notes = window.prompt('Dismiss reason (required):', 'No policy violation found.');
    if (!notes || !notes.trim()) return;

    setReportActionLoadingId(reportId);
    try {
      const res = await apiService.put(`/api/moderation/reports/${reportId}/dismiss`, { notes: notes.trim() });
      if (res.success) {
        setReports((prev) => prev.map((r) => (r._id === reportId ? { ...r, status: 'dismissed' } : r)));
      }
    } finally {
      setReportActionLoadingId('');
    }
  };

  const metrics = {
    questions: questions.length,
    answers: answers.length,
    reports: filteredReports.length,
    spamLikeQuestions: questions.filter((q) => looksLikeSpam(q.title) || looksLikeSpam(q.body)).length,
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-blue-900 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">QA Forum Admin Moderation</h1>
        <p className="mt-1 text-slate-200">Question management, answer quality review, and report monitoring.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
          <p className="text-xs uppercase text-slate-500">Questions</p>
          <p className="text-2xl font-bold text-slate-900">{metrics.questions}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
          <p className="text-xs uppercase text-slate-500">Answers</p>
          <p className="text-2xl font-bold text-slate-900">{metrics.answers}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
          <p className="text-xs uppercase text-slate-500">QA Reports</p>
          <p className="text-2xl font-bold text-slate-900">{metrics.reports}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
          <p className="text-xs uppercase text-slate-500">Spam-like Questions</p>
          <p className="text-2xl font-bold text-rose-600">{metrics.spamLikeQuestions}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'questions', label: 'Question Management' },
          { id: 'answers', label: 'Answer Management' },
          { id: 'reports', label: 'Reports & Complaints' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === item.id ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={loadData}
          className="ml-auto rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          Refresh
        </button>
      </div>

      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      {loading && <div className="rounded-lg bg-white p-6 text-slate-500">Loading moderation data...</div>}

      {!loading && tab === 'questions' && (
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={questionSearch}
              onChange={(e) => setQuestionSearch(e.target.value)}
              placeholder="Search title/body..."
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <select
              value={questionFilter}
              onChange={(e) => setQuestionFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="all">All Questions</option>
              <option value="spam">Potential Spam</option>
              <option value="duplicate">Potential Duplicates</option>
              <option value="normal">Normal Only</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b text-left text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Question</th>
                  <th className="py-2 pr-4">Author</th>
                  <th className="py-2 pr-4">Flags</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((q) => {
                  const key = normalizeText(q.title || '');
                  const isDuplicate = key && (duplicateTitleMap.get(key) || 0) > 1;
                  const isSpam = looksLikeSpam(q.title) || looksLikeSpam(q.body);
                  return (
                    <tr key={q._id} className="border-b align-top">
                      <td className="py-2 pr-4">
                        <p className="font-medium text-slate-900">{q.title}</p>
                        <p className="text-slate-500 line-clamp-2">{q.body}</p>
                        <p className="text-xs text-slate-400 mt-1">{q.subject} | Grade {q.grade}</p>
                      </td>
                      <td className="py-2 pr-4 text-slate-700">{q.author?.username || 'Unknown'}</td>
                      <td className="py-2 pr-4">
                        <div className="flex flex-wrap gap-2">
                          {isSpam && <span className="rounded bg-rose-100 px-2 py-1 text-xs text-rose-700">Spam</span>}
                          {isDuplicate && <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-700">Duplicate</span>}
                          {q.isClosed && <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">Closed</span>}
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex flex-wrap gap-2">
                          {!q.isClosed && (
                            <button
                              type="button"
                              onClick={() => handleMarkDuplicate(q._id)}
                              className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700"
                            >
                              Mark Duplicate
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q._id)}
                            className="rounded bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && tab === 'answers' && (
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 space-y-4">
          <input
            value={answerSearch}
            onChange={(e) => setAnswerSearch(e.target.value)}
            placeholder="Search answer text, question, or author..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b text-left text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Answer</th>
                  <th className="py-2 pr-4">Question</th>
                  <th className="py-2 pr-4">Posted By</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnswers.map((a) => (
                  <tr key={a._id} className="border-b align-top">
                    <td className="py-2 pr-4 text-slate-700 line-clamp-2">{a.body}</td>
                    <td className="py-2 pr-4 text-slate-700">{a.question?.title || 'Unknown question'}</td>
                    <td className="py-2 pr-4 text-slate-700">
                      {(a.author?.profile?.firstName || a.author?.username || 'Unknown')}
                      {a.author?.role ? <span className="ml-2 text-xs text-slate-500">({a.author.role})</span> : null}
                    </td>
                    <td className="py-2 pr-4">
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{a.status || 'pending'}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <button
                        type="button"
                        onClick={() => handleDeleteAnswer(a._id)}
                        className="rounded bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && tab === 'reports' && (
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 space-y-4">
          <select
            value={reportStatus}
            onChange={(e) => setReportStatus(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b text-left text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Reason</th>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Priority</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r) => (
                  <tr key={r._id} className="border-b">
                    <td className="py-2 pr-4 text-slate-700 capitalize">{r.reportedType}</td>
                    <td className="py-2 pr-4 text-slate-700 capitalize">{r.reason}</td>
                    <td className="py-2 pr-4 text-slate-600">{r.description}</td>
                    <td className="py-2 pr-4">
                      <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-700 capitalize">{r.priority}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 capitalize">{r.status}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex flex-wrap gap-2">
                        {(r.status === 'pending' || r.status === 'under_review') && (
                          <>
                            <button
                              type="button"
                              disabled={reportActionLoadingId === r._id}
                              onClick={() => handleResolveReport(r._id)}
                              className="rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 disabled:opacity-60"
                            >
                              Resolve
                            </button>
                            <button
                              type="button"
                              disabled={reportActionLoadingId === r._id}
                              onClick={() => handleDismissReport(r._id)}
                              className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-60"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQAModerationPage;