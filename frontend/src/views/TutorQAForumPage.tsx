import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiMessageSquare, FiSearch, FiLayers, FiStar, FiBarChart2, FiEdit2, FiUsers } from 'react-icons/fi';
import { useAuth } from '../controllers/useAuth';
import Layout from '../components/Layout';

const gradeLabels: Record<number, string> = {
  6: 'Grade 6',
  7: 'Grade 7',
  8: 'Grade 8',
  9: 'Grade 9',
  10: 'Grade 10',
  11: 'O/L',
  12: 'A/L',
  13: 'A/L (2nd Year)'
};

const subjectsByGrade: Record<number, string[]> = {
  8: ['Mathematics', 'Science', 'English', 'History'],
  12: ['Physics', 'Chemistry', 'Biology', 'Pure Maths']
};

interface Question {
  id: string;
  student: string;
  grade: string;
  subject: string;
  title: string;
  body: string;
  status: string;
  askedOn: string;
  studentAnswer: string;
  tutorAnswer: string;
  marks: number | null;
  feedback: string;
}

const initialQuestions: Question[] = [
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
  }
];

const TutorQAForumPage: React.FC = () => {
  const { user } = useAuth();
  const assignedGrade = Number(user?.grade || 8);
  const availableSubjects = subjectsByGrade[assignedGrade] || ['General'];
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [selectedId, setSelectedId] = useState<string>(initialQuestions[0]?.id);
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
    setMarksDraft(selectedQuestion.marks?.toString() ?? '');
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

  const handleSelectQuestion = (id: string) => {
    setSelectedId(id);
    const question = questions.find((q) => q.id === id);
    setAnswerDraft(question?.tutorAnswer || '');
    setMarksDraft(question?.marks?.toString() ?? '');
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
      <Layout userRole="tutor">
        <div className="min-h-screen bg-slate-50 p-8">
          <div className="max-w-4xl mx-auto rounded-3xl bg-white p-10 shadow-lg">
            <h2 className="text-2xl font-semibold">No questions available</h2>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="tutor">
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-teal-500 font-semibold">Tutor Q&A</p>
              <h1 className="text-4xl font-bold text-slate-900">Review student questions</h1>
              <p className="mt-3 text-slate-600 max-w-2xl">
                Select the subject, filter unanswered questions, answer clearly, assign marks and feedback.
              </p>
            </div>
            <Link
              to="/tutor/dashboard"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-white font-semibold shadow-lg hover:bg-slate-800 transition-colors"
            >
              Back to dashboard
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total questions</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{summaryStats.total}</p>
                </div>
                <FiMessageSquare className="h-8 w-8 text-teal-600" />
              </div>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pending</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{summaryStats.unanswered}</p>
                </div>
                <FiLayers className="h-8 w-8 text-teal-600" />
              </div>
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
                      className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none"
                    >
                      <option>All</option>
                      {availableSubjects.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">Student questions</h2>
                </div>
                <div className="space-y-3">
                  {filteredQuestions.map((question) => (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => handleSelectQuestion(question.id)}
                      className={`w-full text-left rounded-3xl border p-4 transition ${
                        question.id === selectedId ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-500">{question.student} · Grade {question.grade} · {question.subject}</p>
                          <h3 className="mt-2 text-base font-semibold text-slate-900">{question.title}</h3>
                          <p className="mt-2 text-sm text-slate-600 line-clamp-2">{question.body}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          question.status === 'Answered' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'
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
                    rows={6}
                    className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none"
                    placeholder="Type a clear explanation..."
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
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Feedback</label>
                    <textarea
                      value={feedbackDraft}
                      onChange={(e) => setFeedbackDraft(e.target.value)}
                      rows={2}
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleSaveAnswer}
                    className="inline-flex items-center justify-center rounded-2xl bg-teal-600 px-6 py-3 text-white font-semibold shadow-lg hover:bg-teal-700 transition-colors"
                  >
                    Save answer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TutorQAForumPage;
