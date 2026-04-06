import React from 'react';
import { BarChart3, BookOpen, Target } from 'lucide-react';

const toGradeBand = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'E';
};

const toGradePoint = (percentage) => Number((percentage / 10).toFixed(1));

const ParentQAForum = ({ qaPerformance, studentGrade }) => {
  const subjectPerformance = qaPerformance?.subjectPerformance || [];

  if (!qaPerformance || subjectPerformance.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
        No Q&A submissions available yet for this student.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-blue-700">Student Grade</p>
          <p className="text-2xl font-bold text-blue-900">{studentGrade || 'N/A'}</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-700">Total Attempts</p>
          <p className="text-2xl font-bold text-emerald-900">{qaPerformance.attempts}</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-indigo-700">Total Grade Points</p>
          <p className="text-2xl font-bold text-indigo-900">{qaPerformance.totalPoints}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-amber-700">Overall Score</p>
          <p className="text-2xl font-bold text-amber-900">{qaPerformance.scorePercentage.toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Subject-wise Q&A Performance
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Subject</th>
                <th className="text-left px-4 py-3 font-medium">Attempts</th>
                <th className="text-left px-4 py-3 font-medium">Marks</th>
                <th className="text-left px-4 py-3 font-medium">Grade Points</th>
                <th className="text-left px-4 py-3 font-medium">Score %</th>
                <th className="text-left px-4 py-3 font-medium">Grade Band</th>
              </tr>
            </thead>
            <tbody>
              {subjectPerformance.map((item) => {
                const gradePoint = toGradePoint(item.scorePercentage);
                const gradeBand = toGradeBand(item.scorePercentage);

                return (
                  <tr key={item.subject} className="border-t">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.subject}</td>
                    <td className="px-4 py-3 text-gray-700">{item.attempts}</td>
                    <td className="px-4 py-3 text-gray-700">{item.marks}</td>
                    <td className="px-4 py-3 text-gray-700">{item.points}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-700 font-medium">{item.scorePercentage}%</span>
                        <span className="text-xs text-gray-500">(GP {gradePoint})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        {gradeBand}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-xl p-4 bg-white">
          <h4 className="font-semibold text-gray-900 flex items-center mb-2">
            <BarChart3 className="w-4 h-4 mr-2" />
            Performance Insight
          </h4>
          <p className="text-sm text-gray-600">
            Highest subject score: {Math.max(...subjectPerformance.map((s) => s.scorePercentage))}%
          </p>
        </div>
        <div className="border rounded-xl p-4 bg-white">
          <h4 className="font-semibold text-gray-900 flex items-center mb-2">
            <Target className="w-4 h-4 mr-2" />
            Latest Submission
          </h4>
          <p className="text-sm text-gray-600">
            {qaPerformance.latestSubmissionAt
              ? new Date(qaPerformance.latestSubmissionAt).toLocaleString()
              : 'No submissions yet'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParentQAForum;
