import React, { useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { gradeLabels, qaForumSupportedGrades } from '../../data/qaData';
import { FiChevronRight, FiCheckCircle } from 'react-icons/fi';

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

const emptyForm = { title: '', body: '', type: 'mcq', difficulty: 'Easy', points: 5, option1: '', option2: '', option3: '', option4: '', correctAnswer: '', explanation: '' };

const TutorCreateQuestionPage = () => {
  const { grade, subject } = useParams();
  const numericGrade = Number(grade);
  const decodedSubject = decodeURIComponent(subject);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isTutor = user?.role === 'tutor';
  const assignedGrade = Number(user?.profile?.grade);
  const isSupportedGrade = qaForumSupportedGrades.includes(numericGrade);
  const allowed = isAuthenticated && isTutor && isSupportedGrade && assignedGrade === numericGrade;
  const editing = location.state?.question || null;

  const [form, setForm] = useState(() => {
    if (!editing) return emptyForm;
    const opts = editing.options || [];
    return { title: editing.title || '', body: editing.body || '', type: editing.type || 'mcq', difficulty: editing.difficulty || 'Easy', points: editing.points || 5, option1: opts[0] || '', option2: opts[1] || '', option3: opts[2] || '', option4: opts[3] || '', correctAnswer: editing.correctAnswer || '', explanation: editing.explanation || '' };
  });

  const [errors, setErrors] = useState({});
  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.body.trim()) errs.body = 'Question body is required.';
    if (!form.correctAnswer.trim()) errs.correctAnswer = 'Correct / model answer is required.';
    if (form.type === 'mcq' && (!form.option1.trim() || !form.option2.trim())) errs.options = 'At least 2 options are required for MCQ.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const options = form.type === 'mcq' ? [form.option1, form.option2, form.option3, form.option4].filter(Boolean) : [];
    const payload = {
      id: editing?.id || `tutor-q-${Date.now()}`,
      grade: numericGrade, subject: decodedSubject,
      title: form.title.trim(), body: form.body.trim(),
      type: form.type, difficulty: form.difficulty, points: Number(form.points),
      options, correctAnswer: form.correctAnswer.trim(), explanation: form.explanation.trim(),
      tutorAnswer: form.correctAnswer.trim(), marks: null, feedback: '',
      studentAnswers: editing?.studentAnswers || [],
    };
    navigate(`/dashboard/tutor/qa/${numericGrade}/subjects/${encodeURIComponent(decodedSubject)}`, { state: { savedQuestion: payload, isEdit: !!editing } });
  };

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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Breadcrumb items={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Tutor Q&A', to: '/dashboard/tutor/qa/forum' },
        { label: 'Grade Selection', to: '/dashboard/tutor/qa' },
        { label: gradeLabels[numericGrade] || `Grade ${numericGrade}`, to: `/dashboard/tutor/qa/${numericGrade}/subjects` },
        { label: decodedSubject, to: `/dashboard/tutor/qa/${numericGrade}/subjects/${encodeURIComponent(decodedSubject)}` },
        { label: editing ? 'Edit Question' : 'New Question' },
      ]} />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{editing ? 'Edit Question' : 'Create New Question'}</h1>
        <p className="text-slate-500 mt-1">{gradeLabels[numericGrade] || `Grade ${numericGrade}`} · {decodedSubject}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        {/* Form header bar */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-5">
          <p className="text-white font-semibold">{editing ? 'Update question details below' : 'Fill in the question details below'}</p>
          <p className="text-blue-200 text-sm mt-0.5">All fields marked * are required</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Question title *</label>
            <input value={form.title} onChange={set('title')} placeholder="e.g. What is 12 × 7?"
              className={`w-full rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${errors.title ? 'border-red-400 bg-red-50' : 'border-slate-300'}`} />
            {errors.title && <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1"><FiCheckCircle className="h-3.5 w-3.5" />{errors.title}</p>}
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Question body *</label>
            <textarea value={form.body} onChange={set('body')} rows={3} placeholder="Describe the question in detail..."
              className={`w-full rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${errors.body ? 'border-red-400 bg-red-50' : 'border-slate-300'}`} />
            {errors.body && <p className="mt-1.5 text-sm text-red-500">{errors.body}</p>}
          </div>

          {/* Type / Difficulty / Points */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Question type</label>
              <select value={form.type} onChange={set('type')}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                <option value="mcq">MCQ</option>
                <option value="structured">Structured / Essay</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Difficulty</label>
              <select value={form.difficulty} onChange={set('difficulty')}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Points</label>
              <input type="number" min={1} value={form.points} onChange={set('points')}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          {/* MCQ Options */}
          {form.type === 'mcq' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Answer options (min 2) *</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {['option1', 'option2', 'option3', 'option4'].map((key, i) => (
                  <div key={key} className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <input value={form[key]} onChange={set(key)} placeholder={`Option ${i + 1}${i < 2 ? ' *' : ''}`}
                      className="w-full rounded-2xl border border-slate-300 pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                ))}
              </div>
              {errors.options && <p className="mt-1.5 text-sm text-red-500">{errors.options}</p>}
            </div>
          )}

          {/* Correct / Model Answer */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {form.type === 'mcq' ? 'Correct answer *' : 'Model answer *'}
            </label>
            <input value={form.correctAnswer} onChange={set('correctAnswer')}
              placeholder={form.type === 'mcq' ? 'Must match one of the options exactly' : 'Write the ideal answer...'}
              className={`w-full rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${errors.correctAnswer ? 'border-red-400 bg-red-50' : 'border-slate-300'}`} />
            {errors.correctAnswer && <p className="mt-1.5 text-sm text-red-500">{errors.correctAnswer}</p>}
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Explanation <span className="text-slate-400 font-normal">(shown to students after attempt)</span></label>
            <textarea value={form.explanation} onChange={set('explanation')} rows={3}
              placeholder="Explain why the answer is correct..."
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button type="submit"
              className="rounded-2xl bg-blue-600 px-8 py-3 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              {editing ? 'Save changes' : 'Create question'}
            </button>
            <Link to={`/dashboard/tutor/qa/${numericGrade}/subjects/${encodeURIComponent(decodedSubject)}`}
              className="rounded-2xl border border-slate-300 px-8 py-3 text-slate-700 hover:bg-slate-100 transition-colors">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TutorCreateQuestionPage;
