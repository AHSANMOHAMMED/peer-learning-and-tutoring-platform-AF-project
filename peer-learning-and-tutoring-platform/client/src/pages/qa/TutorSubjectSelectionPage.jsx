import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { subjectsByGrade, gradeLabels, qaForumSupportedGrades } from '../../data/qaData';
import { FiChevronRight, FiBook } from 'react-icons/fi';

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

const TutorSubjectSelectionPage = () => {
  const { grade } = useParams();
  const numericGrade = Number(grade);
  const { user, isAuthenticated } = useAuth();
  const isTutor = user?.role === 'tutor';
  const assignedGrade = Number(user?.profile?.grade);
  const isSupportedGrade = qaForumSupportedGrades.includes(numericGrade);
  const allowed = isAuthenticated && isTutor && isSupportedGrade && assignedGrade === numericGrade;
  const subjects = subjectsByGrade[numericGrade] || [];

  if (!allowed) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-10 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Access unavailable</h2>
          <p className="text-slate-500 mb-6">
            {isSupportedGrade
              ? 'You can only manage subjects for your assigned grade.'
              : 'This QA forum currently supports Grades 6, 8, and 9 only.'}
          </p>
          <Link to="/dashboard/tutor/qa" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors">
            ← Back to grade selection
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
        { label: 'Grade Selection', to: '/dashboard/tutor/qa' },
        { label: gradeLabels[numericGrade] || `Grade ${numericGrade}` },
      ]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {gradeLabels[numericGrade] || `Grade ${numericGrade}`} — Subjects
        </h1>
        <p className="text-slate-500 mt-2">Select a subject to manage questions and student answers.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {subjects.map((subject) => (
          <Link
            key={subject}
            to={`/dashboard/tutor/qa/${numericGrade}/subjects/${encodeURIComponent(subject)}`}
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-blue-300"
          >
            <div className="mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg">
              {subject[0]}
            </div>
            <h2 className="text-base font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{subject}</h2>
            <p className="text-slate-500 text-sm leading-relaxed">Create, edit, and manage questions.</p>
            <div className="mt-4 flex items-center gap-1 text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Manage <FiChevronRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TutorSubjectSelectionPage;
