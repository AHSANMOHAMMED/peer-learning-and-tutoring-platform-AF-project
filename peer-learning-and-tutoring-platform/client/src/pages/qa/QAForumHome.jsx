import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { loadPreferredMedium } from '../../data/qaData';

const QAForumHome = () => {
  const { isAuthenticated, user } = useAuth();
  const preferredMedium = loadPreferredMedium();
  const isStudent = user?.role === 'student';

  return (
    <div className="max-w-6xl mx-auto p-4">
      <section className="bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-3xl p-10 shadow-xl mb-10">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-200 mb-3">Student Q&A Forum</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Practice, Learn, and Earn Confidence</h1>
            <p className="text-blue-100 text-lg mb-6">
              Enter a friendly learning space built for Sri Lankan students in Grades 6 to 11. Choose your grade, pick a subject, and answer fun quiz questions with instant feedback.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Link
                to="/qa/medium"
                className="inline-flex items-center justify-center rounded-xl bg-white text-blue-700 px-6 py-3 font-semibold shadow-lg hover:bg-slate-50 transition-colors"
              >
                Enter Q&A Forum
              </Link>
            {isAuthenticated && isStudent && (
              <Link
                to="/qa/history"
                className="inline-flex items-center justify-center rounded-xl border border-white/80 text-white px-6 py-3 font-semibold hover:bg-white/10 transition-colors"
              >
                View practice history
              </Link>
            )}
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-xl border border-white/20">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[140px] rounded-2xl bg-blue-50/80 p-5 text-blue-800 shadow-inner">
                <h2 className="text-xl font-semibold mb-2">Grades 6–11</h2>
                <p className="text-sm">Grade-specific learning paths with fun questions.</p>
              </div>
              <div className="flex-1 min-w-[140px] rounded-2xl bg-white p-5 text-slate-700 shadow-inner">
                <h2 className="text-xl font-semibold mb-2">Subject cards</h2>
                <p className="text-sm">Math, Science, English and more with clear topic cards.</p>
              </div>
              <div className="flex-1 min-w-[140px] rounded-2xl bg-sky-50 p-5 text-slate-700 shadow-inner">
                <h2 className="text-xl font-semibold mb-2">Quiz practice</h2>
                <p className="text-sm">Instant feedback with points and explanations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isAuthenticated && isStudent && (
        <section className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-slate-700">Preferred Q&A medium:</p>
            <span className="inline-flex rounded-full bg-white px-4 py-2 text-slate-900 shadow-sm">{preferredMedium}</span>
          </div>
        </section>
      )}

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-semibold mb-3">Grade selection</h3>
          <p className="text-slate-600">Only your signed-up grade is active so you stay on the right level.</p>
        </div>
        <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-semibold mb-3">Easy subject cards</h3>
          <p className="text-slate-600">Choose the subject you want to practice in a colorful card layout.</p>
        </div>
        <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-semibold mb-3">Friendly review</h3>
          <p className="text-slate-600">Get a positive message when you are right and a helpful explanation when you are not.</p>
        </div>
      </section>
    </div>
  );
};

export default QAForumHome;
