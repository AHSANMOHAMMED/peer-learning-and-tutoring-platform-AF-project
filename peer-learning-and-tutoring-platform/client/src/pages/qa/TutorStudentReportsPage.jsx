import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { gradeLabels, subjectsByGrade } from '../../data/qaData';
import { qaForumService } from '../../services/qaForumService';
import {
  FiChevronRight, FiUser, FiAward, FiBarChart2,
  FiCheckCircle, FiClock, FiSearch,
} from 'react-icons/fi';

const TutorStudentReportsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const isTutor = user?.role === 'tutor';
  const assignedGrade = Number(user?.profile?.grade);

  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [studentFilter, setStudentFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('answers'); // 'answers' | 'performance'
  const [allReports, setAllReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  useEffect(() => {
    let active = true;
    const loadReports = async () => {
      if (!isAuthenticated || !isTutor) {
        setIsLoadingReports(false);
        return;
      }
      setIsLoadingReports(true);
      const result = await qaForumService.fetchTutorReports(assignedGrade);
      if (!active) return;
      if (result.success) {
        setAllReports(result.data || []);
      }
      setIsLoadingReports(false);
    };

    loadReports();
    return () => {
      active = false;
    };
  }, [isAuthenticated, isTutor, assignedGrade]);
  const subjects = ['All', ...(subjectsByGrade[assignedGrade] || [])];
  const students = ['All', ...new Set(allReports.map((r) => r.student))];

  const filtered = useMemo(() => {
    return allReports.filter((r) => {
      const matchSubject = subjectFilter === 'All' || r.subject === subjectFilter;
      const matchStudent = studentFilter === 'All' || r.student === studentFilter;
      const matchSearch = !search || r.questionTitle.toLowerCase().includes(search.toLowerCase()) || r.student.toLowerCase().includes(search.toLowerCase());
      return matchSubject && matchStudent && matchSearch;
    });
  }, [allReports, subjectFilter, studentFilter, search]);

  const performance = useMemo(() => {
    const studentNames = [...new Set(allReports.map((r) => r.student))];
    return studentNames.map((student) => {
      const rows = allReports.filter((r) => r.student === student);
      const totalMarks = rows.reduce((s, r) => s + (r.marks || 0), 0);
      const maxMarks = rows.reduce((s, r) => s + r.points, 0);
      const pct = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;
      const bySubject = {};
      rows.forEach((r) => {
        if (!bySubject[r.subject]) bySubject[r.subject] = { marks: 0, max: 0 };
        bySubject[r.subject].marks += r.marks || 0;
        bySubject[r.subject].max += r.points;
      });
      return { student, totalMarks, maxMarks, pct, answered: rows.length, bySubject };
    }).sort((a, b) => b.pct - a.pct);
  }, [allReports]);

  if (!isAuthenticated || !isTutor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-10 text-center">
          <p className="text-lg font-semibold text-slate-900 mb-4">Tutor access only.</p>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors">Log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
        <FiChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <Link to="/dashboard/tutor/qa/overview" className="hover:text-blue-600 transition-colors">Q&A Forum</Link>
        <FiChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-800 font-medium">Student Reports</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Student Reports</h1>
          <p className="text-slate-500 mt-1">{gradeLabels[assignedGrade] || `Grade ${assignedGrade}`} · Answers, marks &amp; performance</p>
        </div>
        <Link
          to="/dashboard/tutor/qa/overview"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2.5 text-slate-700 hover:bg-slate-100 transition-colors text-sm font-medium"
        >
          ← Back to Overview
        </Link>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { icon: <FiUser className="h-5 w-5" />, label: 'Students', value: students.length - 1, bg: 'bg-blue-50', text: 'text-blue-600' },
          { icon: <FiCheckCircle className="h-5 w-5" />, label: 'Total Submissions', value: allReports.length, bg: 'bg-emerald-50', text: 'text-emerald-600' },
          { icon: <FiAward className="h-5 w-5" />, label: 'Avg Score', value: `${performance.length ? Math.round(performance.reduce((s, p) => s + p.pct, 0) / performance.length) : 0}%`, bg: 'bg-indigo-50', text: 'text-indigo-600' },
          { icon: <FiClock className="h-5 w-5" />, label: 'Subjects Covered', value: new Set(allReports.map((r) => r.subject)).size, bg: 'bg-violet-50', text: 'text-violet-600' },
        ].map(({ icon, label, value, bg, text }) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`h-10 w-10 rounded-2xl ${bg} ${text} flex items-center justify-center mb-3`}>{icon}</div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {[
          { key: 'answers', label: 'Student Answers', icon: <FiCheckCircle className="h-4 w-4" /> },
          { key: 'performance', label: 'Performance Report', icon: <FiBarChart2 className="h-4 w-4" /> },
        ].map(({ key, label, icon }) => (
          <button key={key} type="button" onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ── ANSWERS TAB ── */}
      {activeTab === 'answers' && (
        <div className="space-y-5">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student or question..."
                className="w-full rounded-2xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <select value={studentFilter} onChange={(e) => setStudentFilter(e.target.value)}
              className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none bg-white">
              {students.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}
              className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none bg-white">
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <p className="text-sm text-slate-500">{filtered.length} submission{filtered.length !== 1 ? 's' : ''}</p>

          {isLoadingReports && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500">
              Loading submissions...
            </div>
          )}

          {/* Answer rows */}
          <div className="space-y-3">
            {filtered.map((r, i) => (
              <div key={i} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                      {r.student[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900 text-sm">{r.student}</span>
                        <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-xs">{r.subject}</span>
                        <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs">{r.type === 'mcq' ? 'MCQ' : 'Structured'}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 truncate">{r.questionTitle}</p>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        <span className="font-medium text-slate-600">Answer: </span>{r.answer}
                      </p>
                      {r.feedback && (
                        <p className="text-xs text-slate-400 mt-1 italic">Feedback: {r.feedback}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">{new Date(r.submittedAt).toLocaleString()}</p>
                      <span className={`inline-block mt-1 rounded-full px-3 py-0.5 text-xs font-bold ${
                        r.marks >= r.points * 0.8 ? 'bg-emerald-100 text-emerald-700' :
                        r.marks >= r.points * 0.5 ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {r.marks} / {r.points} pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PERFORMANCE TAB ── */}
      {activeTab === 'performance' && (
        <div className="space-y-5">
          {performance.map((p) => (
            <div key={p.student} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {p.student[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{p.student}</p>
                    <p className="text-sm text-slate-500">{p.answered} questions answered</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{p.totalMarks}<span className="text-sm font-normal text-slate-400"> / {p.maxMarks}</span></p>
                    <p className="text-xs text-slate-500">Total marks</p>
                  </div>
                  <div className={`h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold border-4 ${
                    p.pct >= 80 ? 'border-emerald-400 text-emerald-600 bg-emerald-50' :
                    p.pct >= 50 ? 'border-orange-400 text-orange-600 bg-orange-50' :
                    'border-red-400 text-red-600 bg-red-50'
                  }`}>
                    {p.pct}%
                  </div>
                </div>
              </div>

              {/* Overall progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Overall score</span><span>{p.pct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${p.pct >= 80 ? 'bg-emerald-500' : p.pct >= 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </div>

              {/* Per-subject breakdown */}
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(p.bySubject).map(([subj, data]) => {
                  const subPct = data.max > 0 ? Math.round((data.marks / data.max) * 100) : 0;
                  return (
                    <div key={subj} className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-700 truncate">{subj}</span>
                        <span className="text-xs font-bold text-slate-900 ml-2">{data.marks}/{data.max}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${subPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorStudentReportsPage;
