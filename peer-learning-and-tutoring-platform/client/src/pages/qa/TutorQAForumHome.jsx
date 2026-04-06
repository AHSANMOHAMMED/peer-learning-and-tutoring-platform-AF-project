import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { FiBookOpen, FiEdit3, FiUsers, FiBarChart2, FiChevronRight } from 'react-icons/fi';

const Breadcrumb = ({ items }) => (
  <nav className="flex items-center gap-1 text-sm text-slate-500 mb-6">
    {items.map((item, i) => (
      <React.Fragment key={i}>
        {i > 0 && <FiChevronRight className="h-3.5 w-3.5 text-slate-400" />}
        {item.to ? (
          <Link to={item.to} className="hover:text-blue-600 transition-colors">{item.label}</Link>
        ) : (
          <span className="text-slate-800 font-medium">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

const TutorQAForumHome = () => {
  const { isAuthenticated, user } = useAuth();
  const isTutor = user?.role === 'tutor';
  const assignedGrade = user?.profile?.grade;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Tutor Q&A Forum' }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-3xl p-10 shadow-xl">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative grid gap-10 md:grid-cols-2 items-center">
          <div>
            <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-widest mb-4">
              Tutor Q&A Forum
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Manage Questions &amp; Guide Students
            </h1>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Create grade-based questions, provide model answers, review student responses, and track performance — all in one place.
            </p>
            {isAuthenticated && isTutor ? (
              <Link
                to="/dashboard/tutor/qa"
                className="inline-flex items-center gap-2 rounded-2xl bg-white text-blue-700 px-7 py-3.5 font-semibold shadow-lg hover:bg-blue-50 transition-colors"
              >
                Go to Grade {assignedGrade || 'Selection'} <FiChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-2 rounded-2xl bg-white text-blue-700 px-7 py-3.5 font-semibold shadow-lg hover:bg-blue-50 transition-colors">
                Log in as Tutor
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <FiBookOpen className="h-5 w-5" />, title: 'Grade-locked', desc: 'Only manage your assigned grade.' },
              { icon: <FiEdit3 className="h-5 w-5" />, title: 'Full CRUD', desc: 'Create, edit, and delete questions.' },
              { icon: <FiUsers className="h-5 w-5" />, title: 'Student answers', desc: 'Review and grade every response.' },
              { icon: <FiBarChart2 className="h-5 w-5" />, title: 'Performance', desc: 'Track marks and scores.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-white/10 backdrop-blur-sm p-5 border border-white/20 hover:bg-white/15 transition-colors">
                <div className="mb-3 h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">{icon}</div>
                <p className="font-semibold text-white">{title}</p>
                <p className="text-blue-200 text-sm mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-5">How it works</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { step: '01', title: 'Select your grade', desc: 'Your assigned grade is pre-selected. Other grades are locked for role consistency.' },
            { step: '02', title: 'Pick a subject', desc: 'All subjects for your grade are listed. Choose one to start managing questions.' },
            { step: '03', title: 'Manage questions', desc: 'Create, edit, delete questions. Provide model answers and grade student responses.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-black text-blue-100 mb-3">{step}</div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {isAuthenticated && isTutor && (
        <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900">Ready to manage your questions?</p>
            <p className="text-slate-500 text-sm mt-1">
              Assigned to <strong className="text-blue-700">Grade {assignedGrade || 'N/A'}</strong>. Jump straight into your subjects.
            </p>
          </div>
          <Link
            to="/dashboard/tutor/qa"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors shrink-0"
          >
            Open Question Manager <FiChevronRight className="h-4 w-4" />
          </Link>
        </section>
      )}
    </div>
  );
};

export default TutorQAForumHome;
