import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuthContext } from '../../contexts/AuthContext';
import { useTutoringController } from '../../controllers/useTutoringController';
import { useModerationController } from '../../controllers/useModerationController';
import { useMaterialController } from '../../controllers/useMaterialController';
import toast from 'react-hot-toast';

/**
 * Dashboard
 * Role-aware home page with widgets and quick stats
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { getUpcoming } = useTutoringController();
  const { getStats } = useModerationController();
  const { listPending } = useMaterialController();

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [moderationStats, setModerationStats] = useState(null);
  const [pendingMaterials, setPendingMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Load data based on user role
        if (user?.role === 'student' || user?.role === 'tutor') {
          const sessions = await getUpcoming();
          setUpcomingSessions(sessions || []);
        }

        if (user?.role === 'moderator' || user?.role === 'admin') {
          const stats = await getStats();
          setModerationStats(stats);

          const pending = await listPending();
          setPendingMaterials(pending || []);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user, getUpcoming, getStats, listPending]);

  const StatCard = ({ icon, label, value, color = 'blue', onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-${color}-500`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <p className="text-4xl">{icon}</p>
      </div>
    </div>
  );

  const SessionCard = ({ session }) => (
    <div
      onClick={() => navigate(`/sessions/${session._id}`)}
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{session.subject}</h3>
          <p className="text-sm text-gray-600">
            {user?.role === 'student' ? `Tutor: ${session.tutorId?.firstName || 'TBD'}` : `Student: ${session.studentId?.firstName || 'TBD'}`}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          session.status === 'confirmed'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {session.status === 'confirmed' ? 'Confirmed' : 'Pending'}
        </span>
      </div>

      <div className="text-sm text-gray-700 space-y-1">
        <p>📅 {new Date(session.startTime).toLocaleDateString()}</p>
        <p>⏰ {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </div>

      {session.status === 'confirmed' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/sessions/room/${session._id}`);
          }}
          className="mt-4 w-full px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
        >
          Join Video
        </button>
      )}
    </div>
  );

  return (
    <DashboardLayout pageTitle={`Welcome, ${user?.firstName || user?.name || 'User'}!`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Quick Stats Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Overview</h2>

          {/* Student/Tutor Dashboard */}
          {(user?.role === 'student' || user?.role === 'tutor') && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon="📅"
                label="Upcoming Sessions"
                value={upcomingSessions.length}
                color="blue"
                onClick={() => navigate('/sessions/my-sessions')}
              />
              <StatCard
                icon="📚"
                label="Study Materials"
                value={user?.role === 'tutor' ? '3' : '12'}
                color="purple"
                onClick={() => navigate('/materials')}
              />
              {user?.role === 'student' && (
                <>
                  <StatCard
                    icon="👥"
                    label="My Tutors"
                    value="5"
                    color="green"
                    onClick={() => navigate('/tutors')}
                  />
                  <StatCard
                    icon="⭐"
                    label="Avg. Rating"
                    value="4.8"
                    color="yellow"
                    onClick={() => navigate('/profile')}
                  />
                </>
              )}
              {user?.role === 'tutor' && (
                <>
                  <StatCard
                    icon="👤"
                    label="Total Students"
                    value="12"
                    color="green"
                    onClick={() => navigate('/profile')}
                  />
                  <StatCard
                    icon="⭐"
                    label="Avg. Rating"
                    value="4.9"
                    color="yellow"
                    onClick={() => navigate('/profile')}
                  />
                </>
              )}
            </div>
          )}

          {/* Moderator/Admin Dashboard */}
          {(user?.role === 'moderator' || user?.role === 'admin') && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon="⚠️"
                label="Pending Reports"
                value={moderationStats?.pendingCount || 0}
                color="red"
                onClick={() => navigate('/moderation/dashboard')}
              />
              <StatCard
                icon="✅"
                label="Approved Reports"
                value={moderationStats?.approvedCount || 0}
                color="green"
                onClick={() => navigate('/moderation/dashboard')}
              />
              <StatCard
                icon="🚫"
                label="Dismissed Reports"
                value={moderationStats?.dismissedCount || 0}
                color="yellow"
                onClick={() => navigate('/moderation/dashboard')}
              />
              <StatCard
                icon="📋"
                label="Pending Materials"
                value={pendingMaterials.length}
                color="blue"
                onClick={() => navigate('/materials/approval-queue')}
              />
            </div>
          )}
        </div>

        {/* Upcoming Sessions Widget */}
        {(user?.role === 'student' || user?.role === 'tutor') && upcomingSessions.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {user?.role === 'student' ? 'Upcoming Sessions' : 'Session Requests'}
              </h2>
              <button
                onClick={() => navigate('/sessions/my-sessions')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingSessions.slice(0, 3).map((session) => (
                <SessionCard key={session._id} session={session} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(user?.role === 'student' || user?.role === 'tutor') && upcomingSessions.length === 0 && !loading && (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-4xl mb-4">📭</p>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Upcoming Sessions</h3>
            <p className="text-gray-600 mb-6">
              {user?.role === 'student'
                ? "You don't have any scheduled sessions yet. Browse tutors to book one!"
                : 'You have no pending session requests right now. Check back soon!'}
            </p>
            <button
              onClick={() =>
                navigate(user?.role === 'student' ? '/tutors' : '/sessions/my-sessions')
              }
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {user?.role === 'student' ? 'Browse Tutors' : 'View My Sessions'}
            </button>
          </div>
        )}

        {/* Quick Action Cards */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user?.role === 'student' && (
              <>
                <div
                  onClick={() => navigate('/tutors')}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow text-white"
                >
                  <p className="text-4xl mb-3">👨‍🏫</p>
                  <h3 className="font-bold text-lg">Find a Tutor</h3>
                  <p className="text-blue-100 text-sm mt-1">Browse and schedule with expert tutors</p>
                </div>
                <div
                  onClick={() => navigate('/sessions/schedule')}
                  className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow text-white"
                >
                  <p className="text-4xl mb-3">📅</p>
                  <h3 className="font-bold text-lg">Schedule Session</h3>
                  <p className="text-green-100 text-sm mt-1">Book a tutoring session now</p>
                </div>
                <div
                  onClick={() => navigate('/materials')}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow text-white"
                >
                  <p className="text-4xl mb-3">📚</p>
                  <h3 className="font-bold text-lg">Study Materials</h3>
                  <p className="text-purple-100 text-sm mt-1">Access quality study resources</p>
                </div>
              </>
            )}

            {user?.role === 'tutor' && (
              <>
                <div
                  onClick={() => navigate('/sessions/my-sessions')}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow text-white"
                >
                  <p className="text-4xl mb-3">📅</p>
                  <h3 className="font-bold text-lg">My Sessions</h3>
                  <p className="text-blue-100 text-sm mt-1">View session requests and schedule</p>
                </div>
                <div
                  onClick={() => navigate('/materials/upload')}
                  className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow text-white"
                >
                  <p className="text-4xl mb-3">📤</p>
                  <h3 className="font-bold text-lg">Upload Materials</h3>
                  <p className="text-green-100 text-sm mt-1">Share study resources with students</p>
                </div>
                <div
                  onClick={() => navigate('/profile')}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow text-white"
                >
                  <p className="text-4xl mb-3">👤</p>
                  <h3 className="font-bold text-lg">My Profile</h3>
                  <p className="text-purple-100 text-sm mt-1">Update your profile and expertise</p>
                </div>
              </>
            )}

            {(user?.role === 'moderator' || user?.role === 'admin') && (
              <>
                <div
                  onClick={() => navigate('/moderation/dashboard')}
                  className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow text-white"
                >
                  <p className="text-4xl mb-3">⚠️</p>
                  <h3 className="font-bold text-lg">Review Reports</h3>
                  <p className="text-red-100 text-sm mt-1">Handle user reports and moderation</p>
                </div>
                <div
                  onClick={() => navigate('/materials/approval-queue')}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow text-white"
                >
                  <p className="text-4xl mb-3">📋</p>
                  <h3 className="font-bold text-lg">Approve Materials</h3>
                  <p className="text-blue-100 text-sm mt-1">Review pending study materials</p>
                </div>
                <div
                  onClick={() => navigate('/users')}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow text-white"
                >
                  <p className="text-4xl mb-3">👥</p>
                  <h3 className="font-bold text-lg">Manage Users</h3>
                  <p className="text-purple-100 text-sm mt-1">Ban, suspend, or warn users</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tip Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 Pro Tip</h3>
          <p className="text-blue-800">
            {user?.role === 'student'
              ? 'Complete your profile to match with tutors better and increase booking success rates.'
              : user?.role === 'tutor'
              ? 'Upload study materials regularly to build your student base and earn extra income.'
              : 'Review reports promptly and take appropriate moderation actions to maintain a safe community.'
            }
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
