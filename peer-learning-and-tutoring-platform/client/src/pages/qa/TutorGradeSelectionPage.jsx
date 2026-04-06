import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { qaForumSupportedGrades, gradeLabels } from '../../data/qaData';
import { FiChevronRight, FiLock } from 'react-icons/fi';

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

const TutorGradeSelectionPage = () => {
  const { user, isAuthenticated } = useAuth();
  const isTutor = user?.role === 'tutor';
  const assignedGrade = Number(user?.profile?.grade);

  if (!isAuthenticated || !isTutor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-10 text-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <FiLock className="h-7 w-7 text-blue-600" />
          </div>
          <p className="text-lg font-semibold text-slate-900 mb-2">Tutor access only</p>
          <p className="text-slate-500 mb-6">Please log in with a tutor account to continue.</p>
          <Link to="/login" className="inline-flex items-center justify-center rounded-2xl bg-blue-600 text-white px-6 py-3 font-semibold hover:bg-blue-700 transition-colors">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumb items={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Tutor Q&A', to: '/dashboard/tutor/qa/forum' },
        { label: 'Grade Selection' },
      ]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Select Your Grade</h1>
        <p className="text-slate-500 mt-2">QA forum supports Grades 6, 8, and 9. Only your assigned grade is unlocked.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {qaForumSupportedGrades.map((grade) => {
          const active = assignedGrade === grade;
          return (
            <Link
              key={grade}
              to={active ? `/dashboard/tutor/qa/${grade}/subjects` : '#'}
              onClick={(e) => { if (!active) e.preventDefault(); }}
              className={`group relative rounded-3xl border p-6 shadow-sm transition-all ${
                active
                  ? 'border-blue-300 bg-white hover:shadow-lg hover:border-blue-400 cursor-pointer'
                  : 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-50'
              }`}
            >
              {active && (
                <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
              )}
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-bold mb-4 ${
                active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                {grade}
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-slate-900">{gradeLabels[grade] || `Grade ${grade}`}</span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                  active ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  {active ? 'Your Grade' : <span className="flex items-center gap-1"><FiLock className="h-3 w-3" /> Locked</span>}
                </span>
              </div>
              <p className="text-slate-500 text-sm">
                {active ? 'Manage questions, answers, and student performance.' : 'Not your assigned grade.'}
              </p>
              {active && (
                <div className="mt-4 flex items-center gap-1 text-blue-600 text-sm font-medium">
                  Open subjects <FiChevronRight className="h-4 w-4" />
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl bg-blue-50 border border-blue-200 px-6 py-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <FiLock className="h-4 w-4 text-blue-600" />
        </div>
        <p className="text-sm text-slate-600">
          Assigned to <strong className="text-blue-700">Grade {assignedGrade || 'not set'}</strong>.
          Update your profile from the dashboard if this is incorrect.
        </p>
      </div>
    </div>
  );
};

export default TutorGradeSelectionPage;
