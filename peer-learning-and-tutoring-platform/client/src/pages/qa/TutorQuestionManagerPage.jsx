import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { gradeLabels, qaForumSupportedGrades } from '../../data/qaData';
import { qaForumService } from '../../services/qaForumService';
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiUser, FiChevronRight, FiMessageSquare, FiCheckCircle, FiUsers, FiAward } from 'react-icons/fi';

// ─── Breadcrumb ──────────────────────────────────────────────────────────────

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

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case 'SET':    return Array.isArray(action.payload) ? action.payload : [];
    case 'ADD':    return [action.payload, ...state];
    case 'UPDATE': return state.map((q) => (q.id === action.payload.id ? action.payload : q));
    case 'DELETE': return state.filter((q) => q.id !== action.id);
    case 'GRADE_STUDENT':
      return state.map((q) =>
        q.id === action.questionId
          ? { ...q, studentAnswers: (q.studentAnswers || []).map((sa) =>
              sa.student === action.student ? { ...sa, marks: action.marks, feedback: action.feedback } : sa
            )}
          : q
      );
    case 'SAVE_TUTOR_ANSWER':
      return state.map((q) => q.id === action.id ? { ...q, tutorAnswer: action.answer } : q);
    default: return state;
  }
}

const diffColors = {
  Easy: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Medium: 'bg-orange-50 text-orange-700 border border-orange-200',
  Hard: 'bg-red-50 text-red-700 border border-red-200',
};

// ─── StudentAnswerRow ─────────────────────────────────────────────────────────

function StudentAnswerRow({ sa, onGrade }) {
  const [marks, setMarks] = useState(sa.marks ?? '');
  const [feedback, setFeedback] = useState(sa.feedback || '');
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
          <FiUser className="h-3.5 w-3.5 text-blue-600" />
        </div>
        {sa.student}
        {sa.marks != null && (
          <span className="ml-auto rounded-full bg-blue-100 text-blue-700 px-3 py-0.5 text-xs font-semibold">{sa.marks} pts</span>
        )}
      </div>
      <p className="text-slate-600 text-sm whitespace-pre-line pl-9">
        {sa.answer || <em className="text-slate-400">No answer submitted yet.</em>}
      </p>
      <div className="grid gap-2 sm:grid-cols-[90px_1fr_auto] pl-9">
        <input type="number" min={0} value={marks} onChange={(e) => setMarks(e.target.value)}
          placeholder="Marks"
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400" />
        <input value={feedback} onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write feedback for student..."
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400" />
        <button type="button" onClick={() => onGrade(sa.student, Number(marks), feedback)}
          className="rounded-xl bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
          Save
        </button>
      </div>
    </div>
  );
}

// ─── QuestionCard ─────────────────────────────────────────────────────────────

function QuestionCard({ question, grade, subject, onDelete, onSaveTutorAnswer, onGradeStudent }) {
  const [expanded, setExpanded] = useState(false);
  const [answerDraft, setAnswerDraft] = useState(question.tutorAnswer || '');
  const navigate = useNavigate();

  const totalPts = useMemo(
    () => (question.studentAnswers || []).reduce((s, sa) => s + (sa.marks || 0), 0),
    [question.studentAnswers]
  );

  return (
    <div className={`rounded-3xl border bg-white shadow-sm transition-shadow hover:shadow-md ${expanded ? 'border-blue-200' : 'border-slate-200'}`}>
      <div className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${diffColors[question.difficulty] || 'bg-slate-100 text-slate-700'}`}>
                {question.difficulty}
              </span>
              <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-0.5 text-xs font-semibold">
                {question.type === 'mcq' ? 'MCQ' : 'Structured'}
              </span>
              <span className="rounded-full bg-slate-100 text-slate-600 px-3 py-0.5 text-xs font-semibold">
                {question.points} pts
              </span>
              {(question.studentAnswers || []).length > 0 && (
                <span className="rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-0.5 text-xs font-semibold">
                  {question.studentAnswers.length} student{question.studentAnswers.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-slate-900 leading-snug">{question.title}</h3>
            <p className="text-slate-500 text-sm mt-1 line-clamp-2">{question.body}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/tutor/qa/${grade}/subjects/${encodeURIComponent(subject)}/edit`, { state: { question } })}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
              title="Edit"
            >
              <FiEdit2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => onDelete(question.id)}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors"
              title="Delete">
              <FiTrash2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setExpanded((p) => !p)}
              className={`rounded-xl border p-2.5 transition-colors ${expanded ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
              {expanded ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-blue-100 bg-blue-50/30 rounded-b-3xl p-6 space-y-6">

          {/* MCQ options */}
          {question.type === 'mcq' && question.options?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Answer Options</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {question.options.map((opt) => (
                  <div key={opt} className={`rounded-xl px-4 py-2.5 text-sm flex items-center gap-2 ${
                    opt === question.correctAnswer
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}>
                    {opt === question.correctAnswer && <FiCheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />}
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Model answer */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Model Answer</p>
            <textarea
              value={answerDraft}
              onChange={(e) => setAnswerDraft(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="Provide the model answer for students..."
            />
            <button type="button" onClick={() => onSaveTutorAnswer(question.id, answerDraft)}
              className="mt-3 rounded-xl bg-blue-600 px-5 py-2.5 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
              Update answer
            </button>
          </div>

          {/* Student answers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Student Answers ({(question.studentAnswers || []).length})
              </p>
              {(question.studentAnswers || []).length > 0 && (
                <span className="text-xs text-slate-500">Total marks: <strong className="text-blue-700">{totalPts}</strong></span>
              )}
            </div>
            {(question.studentAnswers || []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
                <FiUsers className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No student answers yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {question.studentAnswers.map((sa) => (
                  <StudentAnswerRow
                    key={sa.student}
                    sa={sa}
                    onGrade={(student, marks, feedback) => onGradeStudent(question.id, student, marks, feedback)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TutorQuestionManagerPage = () => {
  const { grade, subject } = useParams();
  const numericGrade = Number(grade);
  const decodedSubject = decodeURIComponent(subject);
  const { user, isAuthenticated } = useAuth();
  const isTutor = user?.role === 'tutor';
  const assignedGrade = Number(user?.profile?.grade);
  const isSupportedGrade = qaForumSupportedGrades.includes(numericGrade);
  const allowed = isAuthenticated && isTutor && isSupportedGrade && assignedGrade === numericGrade;
  const location = useLocation();
  const navigate = useNavigate();

  const [questions, dispatch] = useReducer(reducer, []);
  const [filter, setFilter] = useState('all');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  useEffect(() => {
    let active = true;
    const loadQuestions = async () => {
      if (!allowed) return;
      setIsLoadingQuestions(true);
      const result = await qaForumService.fetchQuestions({ grade: numericGrade, subject: decodedSubject });
      if (!active) return;
      if (result.success) {
        dispatch({
          type: 'SET',
          payload: (result.data || []).map((q) => ({
            ...q,
            tutorAnswer: q.tutorAnswer || q.correctAnswer || '',
            marks: q.marks ?? null,
            feedback: q.feedback || '',
            studentAnswers: q.studentAnswers || [],
          })),
        });
      }
      setIsLoadingQuestions(false);
    };

    loadQuestions();
    return () => {
      active = false;
    };
  }, [allowed, numericGrade, decodedSubject]);

  useEffect(() => {
    let active = true;
    const persistSavedQuestion = async () => {
      const { savedQuestion, isEdit } = location.state || {};
      if (!savedQuestion) return;

      const result = isEdit
        ? await qaForumService.updateTutorQuestion(savedQuestion.id, savedQuestion)
        : await qaForumService.createTutorQuestion(savedQuestion);

      if (active && result.success && result.data) {
        dispatch({
          type: isEdit ? 'UPDATE' : 'ADD',
          payload: {
            ...result.data,
            tutorAnswer: result.data.correctAnswer || '',
            marks: result.data.marks ?? null,
            feedback: result.data.feedback || '',
            studentAnswers: result.data.studentAnswers || [],
          },
        });
      }

      navigate(location.pathname, { replace: true, state: {} });
    };

    persistSavedQuestion();
    return () => {
      active = false;
    };
  }, [location.state, navigate, location.pathname]);

  const handleDeleteQuestion = (id) => {
    if (!window.confirm('Delete this question?')) return;
    qaForumService.deleteTutorQuestion(id).then((result) => {
      if (result.success) {
        dispatch({ type: 'DELETE', id });
      }
    });
  };

  const stats = useMemo(() => {
    const allSA = questions.flatMap((q) => q.studentAnswers || []);
    const students = [...new Set(allSA.map((sa) => sa.student))];
    const performance = students.map((student) => {
      const answers = allSA.filter((sa) => sa.student === student);
      return { student, answered: answers.filter((sa) => sa.answer).length, totalMarks: answers.reduce((s, sa) => s + (sa.marks || 0), 0) };
    });
    return { total: questions.length, answered: questions.filter((q) => q.tutorAnswer?.trim()).length, students: students.length, performance };
  }, [questions]);

  const filtered = useMemo(() => {
    if (filter === 'answered') return questions.filter((q) => q.tutorAnswer?.trim());
    if (filter === 'unanswered') return questions.filter((q) => !q.tutorAnswer?.trim());
    return questions;
  }, [questions, filter]);

  if (!allowed) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-10 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Access unavailable</h2>
          <p className="text-slate-500 mb-6">
            {isSupportedGrade
              ? 'You can only manage questions for your assigned grade.'
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Breadcrumb items={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Tutor Q&A', to: '/dashboard/tutor/qa/forum' },
        { label: 'Grade Selection', to: '/dashboard/tutor/qa' },
        { label: gradeLabels[numericGrade] || `Grade ${numericGrade}`, to: `/dashboard/tutor/qa/${numericGrade}/subjects` },
        { label: decodedSubject },
      ]} />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{decodedSubject}</h1>
          <p className="text-slate-500 mt-1">{gradeLabels[numericGrade] || `Grade ${numericGrade}`} · Question Manager</p>
        </div>
        <Link
          to={`/dashboard/tutor/qa/${numericGrade}/subjects/${encodeURIComponent(decodedSubject)}/create`}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <FiPlus className="h-4 w-4" /> New Question
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { icon: <FiMessageSquare className="h-5 w-5" />, label: 'Total Questions', value: stats.total, color: 'text-blue-600 bg-blue-50' },
          { icon: <FiCheckCircle className="h-5 w-5" />, label: 'Answered', value: stats.answered, color: 'text-emerald-600 bg-emerald-50' },
          { icon: <FiUsers className="h-5 w-5" />, label: 'Active Students', value: stats.students, color: 'text-indigo-600 bg-indigo-50' },
          { icon: <FiAward className="h-5 w-5" />, label: 'Marks Awarded', value: stats.performance.reduce((s, p) => s + p.totalMarks, 0), color: 'text-violet-600 bg-violet-50' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`h-10 w-10 rounded-2xl ${color} flex items-center justify-center mb-3`}>{icon}</div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Student performance */}
      {stats.performance.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Student Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">Student</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">Answered</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">Total Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.performance.map((p) => (
                  <tr key={p.student} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-medium text-slate-900 flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                        {p.student[0]}
                      </div>
                      {p.student}
                    </td>
                    <td className="py-3 text-slate-600">{p.answered} question{p.answered !== 1 ? 's' : ''}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-0.5 font-semibold text-xs">{p.totalMarks} pts</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-0">
        {[
          { key: 'all', label: `All (${questions.length})` },
          { key: 'answered', label: `Answered (${stats.answered})` },
          { key: 'unanswered', label: `Unanswered (${questions.length - stats.answered})` },
        ].map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setFilter(key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              filter === key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Question list */}
      {isLoadingQuestions ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500 font-medium">Loading questions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FiMessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium mb-4">No questions yet.</p>
          <Link
            to={`/dashboard/tutor/qa/${numericGrade}/subjects/${encodeURIComponent(decodedSubject)}/create`}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="h-4 w-4" /> Create first question
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              grade={numericGrade}
              subject={decodedSubject}
              onDelete={handleDeleteQuestion}
              onSaveTutorAnswer={(id, answer) => dispatch({ type: 'SAVE_TUTOR_ANSWER', id, answer })}
              onGradeStudent={(questionId, student, marks, feedback) =>
                dispatch({ type: 'GRADE_STUDENT', questionId, student, marks, feedback })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorQuestionManagerPage;
