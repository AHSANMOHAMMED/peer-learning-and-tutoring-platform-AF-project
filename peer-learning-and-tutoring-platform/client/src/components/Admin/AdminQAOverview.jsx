import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const AdminQAOverview = () => {
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState('All');
  const [subject, setSubject] = useState('All');
  const [data, setData] = useState({
    overview: {
      totalSubmissions: 0,
      uniqueStudents: 0,
      uniqueTutors: 0,
      totalQuestionsByTutors: 0,
      totalAnswersByTutors: 0,
    },
    studentPerformance: [],
    tutorQuestionActivity: [],
    tutorAnswerActivity: [],
  });

  const subjects = useMemo(() => {
    const set = new Set();
    data.studentPerformance.forEach((row) => set.add(row.subject));
    data.tutorQuestionActivity.forEach((row) => set.add(row.subject));
    data.tutorAnswerActivity.forEach((row) => set.add(row.subject));
    return ['All', ...Array.from(set).sort()];
  }, [data]);

  const grades = ['All', 6, 7, 8, 9, 10, 11, 12, 13];

  const loadOverview = async () => {
    setLoading(true);
    try {
      const params = {};
      if (grade !== 'All') params.grade = grade;
      if (subject !== 'All') params.subject = subject;
      const query = new URLSearchParams(params).toString();
      const response = await api.get(`/api/qa-submissions/admin/qa-overview${query ? `?${query}` : ''}`);
      if (response.data?.success) {
        setData(response.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, [grade, subject]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin QA Overview</h1>
        <p className="text-gray-600 mt-1">Student performance and tutor QA activity by grade and subject.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="text-xs uppercase text-gray-500">Submissions</p>
          <p className="text-2xl font-bold text-blue-700">{data.overview.totalSubmissions}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">Students</p>
          <p className="text-2xl font-bold text-blue-700">{data.overview.uniqueStudents}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">Tutors</p>
          <p className="text-2xl font-bold text-blue-700">{data.overview.uniqueTutors}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">Tutor Questions</p>
          <p className="text-2xl font-bold text-blue-700">{data.overview.totalQuestionsByTutors}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">Tutor Answers</p>
          <p className="text-2xl font-bold text-blue-700">{data.overview.totalAnswersByTutors}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700">Grade</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2"
          >
            {grades.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-6 text-gray-500">Loading QA analytics...</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Performance</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-500 border-b">
                  <tr>
                    <th className="py-2 pr-4">Student</th>
                    <th className="py-2 pr-4">Grade</th>
                    <th className="py-2 pr-4">Subject</th>
                    <th className="py-2 pr-4">Attempts</th>
                    <th className="py-2 pr-4">Marks</th>
                    <th className="py-2 pr-4">Points</th>
                    <th className="py-2 pr-4">Score %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.studentPerformance.map((row, index) => (
                    <tr key={`${row.studentName}-${row.subject}-${row.grade}-${index}`} className="border-b last:border-b-0">
                      <td className="py-2 pr-4 font-medium">{row.studentName}</td>
                      <td className="py-2 pr-4">{row.grade}</td>
                      <td className="py-2 pr-4">{row.subject}</td>
                      <td className="py-2 pr-4">{row.attempts}</td>
                      <td className="py-2 pr-4">{row.marks}</td>
                      <td className="py-2 pr-4">{row.points}</td>
                      <td className="py-2 pr-4">{row.averageScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tutor Question Activity</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-500 border-b">
                  <tr>
                    <th className="py-2 pr-4">Tutor</th>
                    <th className="py-2 pr-4">Grade</th>
                    <th className="py-2 pr-4">Subject</th>
                    <th className="py-2 pr-4">Questions Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tutorQuestionActivity.map((row, index) => (
                    <tr key={`${row.tutorId}-${row.subject}-${row.grade}-${index}`} className="border-b last:border-b-0">
                      <td className="py-2 pr-4 font-medium">{row.tutorName}</td>
                      <td className="py-2 pr-4">{row.grade}</td>
                      <td className="py-2 pr-4">{row.subject}</td>
                      <td className="py-2 pr-4">{row.questionsCreated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tutor Answer Activity</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-500 border-b">
                  <tr>
                    <th className="py-2 pr-4">Tutor</th>
                    <th className="py-2 pr-4">Grade</th>
                    <th className="py-2 pr-4">Subject</th>
                    <th className="py-2 pr-4">Answers</th>
                    <th className="py-2 pr-4">Accepted</th>
                    <th className="py-2 pr-4">Correct Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tutorAnswerActivity.map((row, index) => (
                    <tr key={`${row.tutorId}-${row.subject}-${row.grade}-${index}`} className="border-b last:border-b-0">
                      <td className="py-2 pr-4 font-medium">{row.tutorName}</td>
                      <td className="py-2 pr-4">{row.grade}</td>
                      <td className="py-2 pr-4">{row.subject}</td>
                      <td className="py-2 pr-4">{row.answersProvided}</td>
                      <td className="py-2 pr-4">{row.acceptedAnswers}</td>
                      <td className="py-2 pr-4">{row.correctStatusAnswers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminQAOverview;
