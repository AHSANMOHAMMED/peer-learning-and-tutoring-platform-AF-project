import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { questionBank, gradeLabels, subjectsByGrade } from '../../data/qaData';
import {
  FiMessageSquare, FiCheckCircle, FiClock, FiUsers,
  FiEdit3, FiBarChart2, FiChevronRight, FiBook,
} from 'react-icons/fi';

const TutorQAOverviewPage = () => {
  const { user, isAuthenticated } = useAuth();
  const isTutor = user?.role === 'tutor';
  const assignedGrade = Number(user?.profile?.grade);

  const stats = useMemo(() => {
    const gradeQuestions = questionBank.filter((q) => q.grade === assignedGrade);
    const subjects = subjectsByGrade[assignedGrade] || [];
    return {
      total: gradeQuestions.length,
      answered: gradeQuestions.filter((q) => q.correctAnswer?.trim()).length,
      pending: gradeQuestions.filter((q) => !q.correctAnswer?.trim()).length,
      subjects: subjects.length,
    };
  }, [assignedGrade]);

  if (!isAuthenticated || !isTutor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-10 text-center">
          <p className="text-lg font-semibold text-slate-900 mb-4">Tutor access only.</p>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
        <FiChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-800 font-medium">Q&A Forum</span>
      </nav>

      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <FiMessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-blue-200 text-sm font-medium">Tutor Q&A Forum</p>
              <h1 className="text-2xl font-bold">
                {gradeLabels[assignedGrade] || `Grade ${assignedGrade}`} Overview
              </h1>
            </div>
          </div>
          <p className="text-blue-100 max-w-xl">
            Manage your grade's questions, provide model answers, review student submissions, and track performance — all from here.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { icon: <FiMessageSquare className="h-5 w-5" />, label: 'Total Questions', value: stats.total, bg: 'bg-blue-50', text: 'text-blue-600' },
          { icon: <FiCheckCircle className="h-5 w-5" />, label: 'Answered', value: stats.answered, bg: 'bg-emerald-50', text: 'text-emerald-600' },
          { icon: <FiClock className="h-5 w-5" />, label: 'Pending', value: stats.pending, bg: 'bg-orange-50', text: 'text-orange-600' },
          { icon: <FiBook className="h-5 w-5" />, label: 'Subjects', value: stats.subjects, bg: 'bg-indigo-50', text: 'text-indigo-600' },
        ].map(({ icon, label, value, bg, text }) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className={`h-10 w-10 rounded-2xl ${bg} ${text} flex items-center justify-center mb-3`}>
              {icon}
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Two main action cards */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Manage Questions */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
              <FiEdit3 className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Manage Questions</h2>
            <p className="text-blue-100 text-sm mt-1">Create, edit, update and delete questions for your grade.</p>
          </div>
          <div className="p-6 space-y-3">
            <ul className="space-y-2 text-sm text-slate-600">
              {['Create new questions', 'Edit existing questions', 'Delete questions', 'Add or update model answers'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <FiCheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/dashboard/tutor/qa"
              className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors w-full"
            >
              Manage Questions <FiChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Student Reports */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-6">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
              <FiBarChart2 className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Student Reports</h2>
            <p className="text-indigo-100 text-sm mt-1">View student answers, marks, scores and performance.</p>
          </div>
          <div className="p-6 space-y-3">
            <ul className="space-y-2 text-sm text-slate-600">
              {['View student-submitted answers', 'Assign marks and feedback', 'Track scores per student', 'Monitor overall performance'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <FiCheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/dashboard/tutor/qa/reports"
              className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition-colors w-full"
            >
              View Student Reports <FiChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick subject shortcuts */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-900">Quick Access — Subjects</h2>
          <Link to="/dashboard/tutor/qa" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View all <FiChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(subjectsByGrade[assignedGrade] || []).slice(0, 6).map((subject) => (
            <Link
              key={subject}
              to={`/dashboard/tutor/qa/${assignedGrade}/subjects/${encodeURIComponent(subject)}`}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {subject[0]}
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors truncate">{subject}</span>
              <FiChevronRight className="h-4 w-4 text-slate-400 ml-auto shrink-0 group-hover:text-blue-500" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TutorQAOverviewPage;
