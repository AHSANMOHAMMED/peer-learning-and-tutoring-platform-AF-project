import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { subjectsByGrade, loadPreferredMedium, getLocalizedSubjectName, getQAUiText, qaForumSupportedGrades } from '../../data/qaData';

const SubjectSelectionPage = () => {
  const { grade } = useParams();
  const numericGrade = Number(grade);
  const subjects = subjectsByGrade[numericGrade] || [];
  const { user, isAuthenticated } = useAuth();
  const isStudent = user?.role === 'student';
  const selectedGrade = Number(user?.profile?.grade);
  const isSupportedGrade = qaForumSupportedGrades.includes(numericGrade);
  const allowed = isAuthenticated && isStudent && isSupportedGrade && selectedGrade === numericGrade;
  const preferredMedium = loadPreferredMedium();
  const uiText = getQAUiText(preferredMedium).subjectSelection;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{uiText.chooseSubject}</h1>
          <p className="text-slate-600">
            {uiText.subjectsForGrade(numericGrade)}
            {numericGrade === 8 ? ' (Sri Lanka)' : ''}
          </p>
        </div>
        <Link
          to="/qa/grades"
          className="inline-flex items-center rounded-2xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
        >
          {uiText.backToGrades}
        </Link>
      </div>

      {!allowed ? (
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 text-blue-900">
          <h2 className="text-xl font-semibold mb-2">{uiText.accessUnavailable}</h2>
          <p className="text-slate-700 mb-4">
            {isSupportedGrade
              ? uiText.accessByGrade(grade)
              : uiText.accessUnsupported}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/login" className="rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition-colors">
              {uiText.login}
            </Link>
            <Link to="/qa/grades" className="rounded-xl border border-blue-600 px-5 py-3 text-blue-700 font-semibold hover:bg-blue-50 transition-colors">
              {uiText.chooseYourGrade}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((subject) => {
            const localizedSubject = getLocalizedSubjectName(subject, preferredMedium);
            const practiceText = uiText.practiceQuestions(numericGrade, localizedSubject);
            return (
              <Link
                key={subject}
                to={`/qa/grades/${numericGrade}/subjects/${encodeURIComponent(subject)}/questions`}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg font-bold">
                  {localizedSubject[0]}
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">{localizedSubject}</h2>
                <p className="text-slate-600 text-sm">{practiceText}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectSelectionPage;
