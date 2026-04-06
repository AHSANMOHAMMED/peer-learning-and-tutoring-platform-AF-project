import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { qaForumSupportedGrades, gradeLabels, loadPreferredMedium, getQAUiText } from '../../data/qaData';

const GradeSelectionPage = () => {
  const { user, isAuthenticated } = useAuth();
  const selectedGrade = user?.profile?.grade;
  const selectedGradeNumber = Number(selectedGrade);
  const isStudent = user?.role === 'student';
  const isTutor = user?.role === 'tutor';

  const preferredMedium = loadPreferredMedium();
  const uiText = getQAUiText(preferredMedium).gradeSelection;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{uiText.chooseYourGrade}</h1>
        <p className="text-slate-600">{uiText.forumInfo}</p>
        <p className="mt-3 text-slate-500">{uiText.preferredMedium}: <strong>{preferredMedium}</strong></p>
      </div>

      {!isAuthenticated ? (
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 text-center text-blue-900">
          <p className="text-lg font-semibold mb-2">{uiText.pleaseLogin}</p>
          <Link to="/login" className="inline-flex items-center justify-center rounded-xl bg-blue-600 text-white px-6 py-3 shadow hover:bg-blue-700 transition-colors">
            {uiText.loginNow}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {qaForumSupportedGrades.map((grade) => {
            const active = (isStudent || isTutor) && selectedGradeNumber === grade;
            const targetRoute = isTutor
              ? `/dashboard/tutor/qa/${grade}/subjects`
              : `/qa/grades/${grade}/subjects`;
            return (
              <Link
                key={grade}
                to={active ? targetRoute : '#'}
                className={`group rounded-3xl border p-6 shadow-sm transition-all hover:shadow-lg ${
                  active ? 'border-blue-300 bg-blue-50 text-slate-900' : 'border-slate-200 bg-white text-slate-500 cursor-not-allowed opacity-70'
                }`}
                onClick={(e) => {
                  if (!active) {
                    e.preventDefault();
                  }
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-semibold">Grade {grade}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                    {active ? uiText.yourGrade : uiText.locked}
                  </span>
                </div>
                <p className="text-slate-600">{uiText.gradeCardDescription(grade)}</p>
              </Link>
            );
          })}
        </div>
      )}

      {isAuthenticated && isStudent && (
        <div className="mt-8 rounded-3xl bg-slate-50 border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-3">{uiText.yourAssignedGrade}</h2>
          <p className="text-slate-700">{uiText.yourAssignedGradeDesc(selectedGrade)}</p>
          <p className="text-sm text-slate-500 mt-2">{uiText.profileHint}</p>
        </div>
      )}

      {isAuthenticated && isTutor && (
        <div className="mt-8 rounded-3xl bg-slate-50 border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-3">{uiText.tutorAssignedGrade}</h2>
          <p className="text-slate-700">{uiText.tutorAssignedGradeDesc(selectedGrade)}</p>
          <p className="text-sm text-slate-500 mt-2">{uiText.tutorHint}</p>
        </div>
      )}
    </div>
  );
};

export default GradeSelectionPage;
