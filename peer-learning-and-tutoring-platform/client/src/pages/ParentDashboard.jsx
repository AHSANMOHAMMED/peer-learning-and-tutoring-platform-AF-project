import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, Calendar, BookOpen, Award, Bell,
  ChevronRight, Plus, Link, Settings, Eye, EyeOff,
  CheckCircle, AlertCircle, BarChart3, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import ParentQAForum from '../components/Parent/ParentQAForum';

const ParentDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [grades, setGrades] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');

  const getStudentDisplayName = (studentObj) => {
    if (!studentObj) return 'Student';
    return (
      studentObj.name ||
      `${studentObj?.profile?.firstName || ''} ${studentObj?.profile?.lastName || ''}`.trim() ||
      studentObj.username ||
      'Student'
    );
  };

  const getStudentInitial = (studentObj) => getStudentDisplayName(studentObj).charAt(0).toUpperCase();

  useEffect(() => {
    fetchStudents();
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      const studentId = selectedStudent?.student?._id || selectedStudent?.student?.id;
      if (studentId) {
        fetchStudentDetails(studentId);
      }
    }
  }, [selectedStudent, activeTab]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/parent/students');
      if (response.data.success) {
        setStudents(response.data.data.students);
        if (response.data.data.students.length > 0 && !selectedStudent) {
          setSelectedStudent(response.data.data.students[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/api/parent/alerts');
      if (response.data.success) {
        setAlerts(response.data.data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      if (activeTab === 'overview' || activeTab === 'qa-forum') {
        const response = await api.get(`/api/parent/student/${studentId}/summary`);
        if (response.data.success) {
          setStudentData(response.data.data);
        }
      } else if (activeTab === 'progress') {
        const response = await api.get(`/api/parent/student/${studentId}/progress?timeRange=30d`);
        if (response.data.success) {
          setProgress(response.data.data);
        }
      } else if (activeTab === 'schedule') {
        const response = await api.get(`/api/parent/student/${studentId}/schedule?days=14`);
        if (response.data.success) {
          setSchedule(response.data.data);
        }
      } else if (activeTab === 'grades') {
        const summaryResponse = await api.get(`/api/parent/student/${studentId}/summary`);
        if (summaryResponse.data.success) {
          setStudentData(summaryResponse.data.data);
        }

        const response = await api.get(`/api/parent/student/${studentId}/grades`);
        if (response.data.success) {
          setGrades(response.data.data.grades || []);
        }
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const linkStudent = async () => {
    try {
      const response = await api.post('/api/parent/link-student', {
        studentEmail: linkEmail,
        relationship: 'parent'
      });

      if (response.data.success) {
        toast.success('Link request sent to admin for approval.');
        setShowLinkModal(false);
        setLinkEmail('');
        fetchStudents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to link student');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold">Parent Dashboard</h1>
                <p className="text-gray-600">Monitor your child's learning journey</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/browse-tutors"
                className="flex items-center px-4 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50"
              >
                Contact Tutors
              </a>
              <button
                onClick={() => setShowLinkModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Link Student
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {students.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Students Linked</h2>
            <p className="text-gray-600 mb-6">
              Link to your child's account to monitor their progress and activities
            </p>
            <button
              onClick={() => setShowLinkModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Link Your First Student
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full lg:w-64">
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <h3 className="font-semibold mb-4">Your Students</h3>
                <div className="space-y-2">
                  {students.map((student) => (
                    <button
                      key={student.linkId}
                      onClick={() => setSelectedStudent(student)}
                      className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                        selectedStudent?.linkId === student.linkId
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        {getStudentInitial(student.student)}
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{getStudentDisplayName(student.student)}</p>
                        <p className="text-sm text-gray-500">
                          Grade {student.student?.grade ?? student.student?.profile?.grade ?? 'N/A'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Alerts Summary */}
              {alerts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Bell className="w-4 h-4 mr-2" />
                    Alerts ({alerts.length})
                  </h3>
                  <div className="space-y-2">
                    {alerts.slice(0, 3).map((alert, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg text-sm ${
                          alert.priority === 'high'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}
                      >
                        <p className="font-medium">{alert.studentName}</p>
                        <p>{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            {selectedStudent && studentData && (
              <div className="flex-1">
                {/* Student Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                        {getStudentInitial(studentData.student)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{getStudentDisplayName(studentData.student)}</h2>
                        <p className="text-gray-600">Grade {studentData.student.grade}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {studentData.gamification && (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            Level {studentData.gamification.level.current}
                          </p>
                          <p className="text-sm text-gray-500">
                            {studentData.gamification.points.lifetime.toLocaleString()} points
                          </p>
                        </div>
                      )}
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Settings className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  {studentData.gamification && (
                    <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{studentData.gamification.totalSessions}</p>
                        <p className="text-sm text-gray-500">Sessions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{studentData.courses.length}</p>
                        <p className="text-sm text-gray-500">Courses</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{studentData.gamification.streak.current}</p>
                        <p className="text-sm text-gray-500">Day Streak</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{studentData.gamification.badges}</p>
                        <p className="text-sm text-gray-500">Badges</p>
                      </div>
                    </div>
                  )}

                  {/* Q&A Performance */}
                  {studentData.qaPerformance && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{studentData.qaPerformance.attempts}</p>
                        <p className="text-sm text-gray-500">Q&A Attempts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{studentData.qaPerformance.totalMarks}</p>
                        <p className="text-sm text-gray-500">Marks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{studentData.qaPerformance.totalPoints}</p>
                        <p className="text-sm text-gray-500">Total Score</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {studentData.qaPerformance.scorePercentage.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-500">Performance</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm mb-6">
                  <div className="flex border-b">
                    {[
                      { id: 'overview', label: 'Overview' },
                      { id: 'progress', label: 'Progress' },
                      { id: 'schedule', label: 'Schedule' },
                      { id: 'grades', label: 'Grades' },
                      { id: 'qa-forum', label: 'QA Forum' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-6 py-4 text-sm font-medium capitalize transition-colors ${
                          activeTab === tab.id
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-6">
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Active Courses */}
                        <div>
                          <h3 className="font-semibold text-lg mb-4 flex items-center">
                            <BookOpen className="w-5 h-5 mr-2" />
                            Active Courses
                          </h3>
                          {studentData.courses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {studentData.courses.map((course) => (
                                <div
                                  key={course.courseId}
                                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold">{course.title}</h4>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      course.status === 'completed'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      {course.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 mb-3">{course.subject}</p>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{ width: `${course.progress}%` }}
                                    />
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {course.progress}% complete
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No active courses</p>
                          )}
                        </div>

                        {/* Recent Activity */}
                        <div>
                          <h3 className="font-semibold text-lg mb-4 flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            Recent Activity
                          </h3>
                          {studentData.recentActivity?.length > 0 ? (
                            <div className="space-y-2">
                              {studentData.recentActivity.map((activity, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div>
                                    <p className="font-medium">{activity.subject}</p>
                                    <p className="text-sm text-gray-500">
                                      {new Date(activity.completedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center">
                                    <Award className="w-4 h-4 text-yellow-500 mr-1" />
                                    <span>{activity.rating}/5</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No recent activity</p>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'progress' && progress && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">
                              {progress.totalSessions}
                            </p>
                            <p className="text-sm text-gray-600">Sessions (30d)</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">
                              {progress.totalHours.toFixed(1)}
                            </p>
                            <p className="text-sm text-gray-600">Hours Learned</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-purple-600">
                              {progress.homeworkSessions}
                            </p>
                            <p className="text-sm text-gray-600">AI Homework</p>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-orange-600">
                              {progress.averageRating.toFixed(1)}
                            </p>
                            <p className="text-sm text-gray-600">Avg Rating</p>
                          </div>
                        </div>

                        {/* Activity Chart Placeholder */}
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h4 className="font-semibold mb-4">Daily Activity (Last 30 Days)</h4>
                          <div className="h-48 flex items-end space-x-1">
                            {Object.entries(progress.dailyActivity).map(([date, count]) => (
                              <div
                                key={date}
                                className="flex-1 bg-blue-500 rounded-t"
                                style={{ height: `${Math.max(count * 10, 5)}%` }}
                                title={`${date}: ${count} sessions`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'schedule' && schedule && (
                      <div>
                        <h3 className="font-semibold text-lg mb-4">Upcoming Schedule</h3>
                        {schedule.upcomingSessions.length > 0 || schedule.courses.length > 0 ? (
                          <div className="space-y-4">
                            {schedule.upcomingSessions.map((session, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-4 border rounded-lg"
                              >
                                <div>
                                  <p className="font-semibold">{session.subject}</p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(session.scheduledFor).toLocaleString()}
                                  </p>
                                </div>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                  {session.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No upcoming sessions scheduled</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'grades' && (
                      <div className="space-y-6">
                        {grades.length > 0 ? (
                          <div className="space-y-3">
                            {grades.map((gradeItem) => (
                              <div
                                key={gradeItem.courseId}
                                className="p-4 border rounded-lg flex items-center justify-between"
                              >
                                <div>
                                  <p className="font-semibold">{gradeItem.courseTitle}</p>
                                  <p className="text-sm text-gray-500">{gradeItem.subject}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold">{gradeItem.grade ?? 'N/A'}</p>
                                  <p className="text-xs text-gray-500">
                                    Attendance: {gradeItem.attendanceRate ?? 0}%
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No completed course grades yet</p>
                        )}

                        {studentData?.qaPerformance?.subjectPerformance?.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-lg mb-3">Q&A Subject Performance</h3>
                            <div className="space-y-3">
                              {studentData.qaPerformance.subjectPerformance.map((item) => (
                                <div
                                  key={item.subject}
                                  className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
                                >
                                  <div>
                                    <p className="font-medium">{item.subject}</p>
                                    <p className="text-sm text-gray-500">Attempts: {item.attempts}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">{item.marks}/{item.points}</p>
                                    <p className="text-sm text-blue-600">{item.scorePercentage}%</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'qa-forum' && (
                      <ParentQAForum
                        qaPerformance={studentData?.qaPerformance}
                        studentGrade={studentData?.student?.grade}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Link Student Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Link to Student</h2>
            <p className="text-gray-600 mb-4">
              Enter your child's email address. An admin will review and approve your request before access is granted.
            </p>
            <input
              type="email"
              value={linkEmail}
              onChange={(e) => setLinkEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLinkModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={linkStudent}
                disabled={!linkEmail}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
