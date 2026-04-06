import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiCheckCircle, FiMessageSquare, FiSearch, FiLayers, FiStar, FiBarChart2, FiEdit2, FiUsers } from 'react-icons/fi';
import { useAuthViewModel } from '../viewmodels/AuthViewModel';
import { subjectsByGrade, gradeLabels } from '../data/qaData';

const initialQuestions = [
  {
    id: 'qa-1',
    student: 'Anitha',
    grade: '8',
    subject: 'Mathematics',
    title: 'How do I solve this equation with fractions?',
    body: 'I am confused when the denominator changes after adding fractions. Please explain step by step.',
    status: 'Unanswered',
    askedOn: '2026-04-01',
    studentAnswer: '',
    tutorAnswer: '',
    marks: null,
    feedback: '',
  },
  {
    id: 'qa-2',
    student: 'Namal',
    grade: '8',
    subject: 'Science',
    title: 'What is photosynthesis exactly?',
    body: 'I understand plants need sunlight but I do not know what happens inside the leaf.',
    status: 'Answered',
    askedOn: '2026-03-30',
    studentAnswer: 'Plants use sunlight to make food.',
    tutorAnswer: 'Photosynthesis is the process by which plants convert light energy into chemical energy using water and carbon dioxide.',
    marks: 4,
    feedback: 'Good start — add the role of chlorophyll next time.',
  },
  {
    id: 'qa-3',
    student: 'Saman',
    grade: '8',
    subject: 'Mathematics',
    title: 'Difference between area and perimeter?',
    body: 'When do I use area and when do I use perimeter in word problems?',
    status: 'Unanswered',
    askedOn: '2026-04-02',
    studentAnswer: '',
    tutorAnswer: '',
    marks: null,
    feedback: '',
  }
];

const TutorQAForumPage = () => {
  const { user } = useAuthViewModel();
  const assignedGrade = Number(user?.profile?.grade);
  const availableSubjects = subjectsByGrade[assignedGrade] || [];
  const [questions, setQuestions] = useState(initialQuestions);
  const [selectedId, setSelectedId] = useState(initialQuestions[0]?.id);
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [answerDraft, setAnswerDraft] = useState('');
  const [marksDraft, setMarksDraft] = useState('');
  const [feedbackDraft, setFeedbackDraft] = useState('');

  const selectedQuestion = useMemo(
    () => questions.find((question) => question.id === selectedId) || questions[0],
    [questions, selectedId]
  );

  useEffect(() => {
    if (!selectedQuestion) return;

    setAnswerDraft(selectedQuestion.tutorAnswer || '');
    setMarksDraft(selectedQuestion.marks ?? '');
    setFeedbackDraft(selectedQuestion.feedback || '');
  }, [selectedQuestion]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const subjectMatches = subjectFilter === 'All' || question.subject === subjectFilter;
      const gradeMatches = !assignedGrade || Number(question.grade) === assignedGrade;
      const statusMatches =
        statusFilter === 'All' || question.status.toLowerCase() === statusFilter.toLowerCase();
      return subjectMatches && gradeMatches && statusMatches;
    });
  }, [questions, subjectFilter, statusFilter, assignedGrade]);

  const summaryStats = useMemo(() => {
    const total = questions.length;
    const answered = questions.filter((q) => q.status === 'Answered').length;
    const unanswered = questions.filter((q) => q.status === 'Unanswered').length;
    const activeStudents = new Set(questions.map((q) => q.student)).size;
    return { total, answered, unanswered, activeStudents };
  }, [questions]);

  const handleSelectQuestion = (id) => {
    setSelectedId(id);
    const question = questions.find((q) => q.id === id);
    setAnswerDraft(question?.tutorAnswer || '');
    setMarksDraft(question?.marks ?? '');
    setFeedbackDraft(question?.feedback || '');
  };

  const handleSaveAnswer = () => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === selectedId
          ? {
              ...question,
              tutorAnswer: answerDraft,
              marks: marksDraft ? Number(marksDraft) : question.marks,
              feedback: feedbackDraft,
              status: answerDraft.trim() ? 'Answered' : question.status,
            }
          : question
      )
    );
    alert('Answer saved. Student can now review it.');
  };

  if (!selectedQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto rounded-3xl bg-white p-10 shadow-lg">
          <h2 className="text-2xl font-semibold">No questions available</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-500 font-semibold">Tutor Q&A</p>
            <h1 className="text-4xl font-bold text-slate-900">Review student questions and answer doubts</h1>
            <p className="mt-3 text-slate-600 max-w-2xl">
              {assignedGrade
                ? `${gradeLabels[assignedGrade] || `Grade ${assignedGrade}`} subjects, question review, answers, and student performance in one place.`
                : 'Select the subject, filter unanswered questions, answer clearly, assign marks and feedback, and track student performance.'}
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-white font-semibold shadow-lg hover:bg-slate-800 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            to="/dashboard/tutor/qa/overview"
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition"
          >
            <div className="flex items-center gap-2 text-slate-900 font-semibold"><FiBarChart2 className="h-4 w-4 text-blue-600" /> Overview</div>
            <p className="mt-1 text-sm text-slate-500">Quick stats and shortcuts.</p>
          </Link>
          <Link
            to="/dashboard/tutor/qa"
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition"
          >
            <div className="flex items-center gap-2 text-slate-900 font-semibold"><FiEdit2 className="h-4 w-4 text-blue-600" /> Question Manager</div>
            <p className="mt-1 text-sm text-slate-500">Create, edit, delete questions.</p>
          </Link>
          <Link
            to="/dashboard/tutor/qa/reports"
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition"
          >
            <div className="flex items-center gap-2 text-slate-900 font-semibold"><FiUsers className="h-4 w-4 text-blue-600" /> Student Reports</div>
            <p className="mt-1 text-sm text-slate-500">Answers, marks, performance.</p>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total questions</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{summaryStats.total}</p>
              </div>
              <FiMessageSquare className="h-8 w-8 text-sky-600" />
            </div>
            <p className="text-sm text-slate-500">Questions from students across subjects.</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pending</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{summaryStats.unanswered}</p>
              </div>
              <FiLayers className="h-8 w-8 text-sky-600" />
            </div>
            <p className="text-sm text-slate-500">Unanswered questions you can review first.</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Answered</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{summaryStats.answered}</p>
              </div>
              <FiCheckCircle className="h-8 w-8 text-violet-600" />
            </div>
            <p className="text-sm text-slate-500">Already answered student doubts.</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Active students</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{summaryStats.activeStudents}</p>
              </div>
              <FiStar className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-sm text-slate-500">Students who asked questions recently.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Filters</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Subject</label>
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none"
                  >
                    <option>All</option>
                    {availableSubjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none"
                  >
                    <option>All</option>
                    <option>Answered</option>
                    <option>Unanswered</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Student questions</h2>
                  <p className="text-sm text-slate-500">Tap a question to open the answer panel.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600">
                  <FiSearch className="h-4 w-4" /> {filteredQuestions.length} results
                </div>
              </div>
              <div className="space-y-3">
                {filteredQuestions.map((question) => (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => handleSelectQuestion(question.id)}
                    className={`w-full text-left rounded-3xl border p-4 transition ${
                      question.id === selectedId ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-500">{question.student} · Grade {question.grade} · {question.subject}</p>
                        <h3 className="mt-2 text-base font-semibold text-slate-900">{question.title}</h3>
                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{question.body}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        question.status === 'Answered' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {question.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-slate-500">Selected question</p>
                <h2 className="text-2xl font-semibold text-slate-900">{selectedQuestion.title}</h2>
              </div>
              <span className="text-sm text-slate-500">Asked on {selectedQuestion.askedOn}</span>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                <p className="text-sm font-medium text-slate-700">Student question</p>
                <p className="mt-3 text-slate-700 whitespace-pre-line">{selectedQuestion.body}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Your answer</label>
                <textarea
                  value={answerDraft}
                  onChange={(e) => setAnswerDraft(e.target.value)}
                  rows={8}
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none"
                  placeholder="Type a clear explanation, add steps or examples..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Marks</label>
                  <input
                    type="number"
                    value={marksDraft}
                    onChange={(e) => setMarksDraft(e.target.value)}
                    min={0}
                    className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none"
                    placeholder="Assign marks"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Feedback</label>
                  <textarea
                    value={feedbackDraft}
                    onChange={(e) => setFeedbackDraft(e.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none"
                    placeholder="Write feedback like 'Good attempt' or 'Revise this concept'"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Student answer</p>
                  <p className="text-sm text-slate-600">{selectedQuestion.studentAnswer || 'No answer submitted yet.'}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveAnswer}
                  className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-6 py-3 text-white font-semibold shadow-lg hover:bg-sky-700 transition-colors"
                >
                  Save answer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorQAForumPage;
