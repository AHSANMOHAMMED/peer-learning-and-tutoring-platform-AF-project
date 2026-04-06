import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiCalendar, 
  FiClock, 
  FiBook, 
  FiAward,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiStar,
  FiArrowRight,
  FiPlus,
  FiMessageSquare
} from 'react-icons/fi';
import { useAuthViewModel } from '../../viewmodels/AuthViewModel';
import { useDashboardController } from '../../controllers/useDashboardController';
import { useStudentController } from '../../controllers/useStudentController';
import { useTutorController } from '../../controllers/useTutorController';
import { useAdminController } from '../../controllers/useAdminController';
import ParentDashboard from '../../pages/ParentDashboard';
import StatCard from './StatCard';
import SessionCard from './SessionCard';
import TutorCard from './TutorCard';
import ProgressRing from './ProgressRing';

/**
 * DashboardHome - Role-aware dashboard home view
 * Renders different content based on user role (Student/Tutor/Parent/Admin)
 * 
 * MVC Pattern: View (Pure UI - All logic in Controllers)
 */
const DashboardHome = () => {
  const { user } = useAuthViewModel();
  const { 
    isLoading: dashboardLoading, 
    stats: dashboardStats,
    upcomingBookings 
  } = useDashboardController();

  // Role-specific controllers
  const studentController = useStudentController();
  const tutorController = useTutorController();
  const adminController = useAdminController();

  const getThemeColors = () => {
    switch (user?.role) {
      case 'student': return { gradient: 'from-blue-500 to-indigo-600', color: 'blue' };
      case 'tutor': return { gradient: 'from-emerald-500 to-teal-600', color: 'emerald' };
      case 'parent': return { gradient: 'from-cyan-500 to-blue-600', color: 'cyan' };
      case 'admin':
      case 'moderator': return { gradient: 'from-slate-700 to-slate-900', color: 'slate' };
      default: return { gradient: 'from-blue-500 to-indigo-600', color: 'blue' };
    }
  };

  const theme = getThemeColors();

  // Loading state
  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-${theme.color}-600`}></div>
      </div>
    );
  }

  // Render Student Dashboard
  const renderStudentDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Card */}
      <div className={`bg-gradient-to-r ${theme.gradient} rounded-2xl p-8 text-white shadow-xl`}>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.profile?.firstName || 'Student'}! 👋</h1>
        <p className="text-blue-100 text-lg">
          Ready to continue your learning journey? You have {upcomingBookings.length} upcoming sessions.
        </p>
        <div className="mt-6 flex gap-4">
          <Link 
            to="/browse-tutors"
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md"
          >
            <FiPlus className="mr-2" />
            Book a Session
          </Link>
          <Link 
            to="/resources"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors border border-blue-400"
          >
            <FiBook className="mr-2" />
            Study Materials
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Upcoming Sessions"
          value={dashboardStats.upcomingSessions}
          icon={FiCalendar}
          trend="+2 this week"
          color={theme.color}
        />
        <StatCard 
          title="Completed Sessions"
          value={dashboardStats.completedSessions}
          icon={FiBook}
          trend="Keep it up!"
          color={theme.color}
        />
        <StatCard 
          title="Hours Learned"
          value={dashboardStats.totalHours}
          icon={FiClock}
          trend="Total"
          color={theme.color}
        />
        <StatCard 
          title="Current Streak"
          value={`${studentController.studentStats?.currentStreak || 5} days`}
          icon={FiTrendingUp}
          trend="🔥 On fire!"
          color={theme.color}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Upcoming Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
              <Link to="/dashboard/student/bookings" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                View All <FiArrowRight className="ml-1" />
              </Link>
            </div>
            
            {upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.slice(0, 3).map(booking => (
                  <SessionCard key={booking.id} booking={booking} userRole="student" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No upcoming sessions</p>
                <Link to="/browse-tutors" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FiPlus className="mr-2" />
                  Book Now
                </Link>
              </div>
            )}
          </div>

          {/* Progress Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Learning Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <ProgressRing 
                  percentage={68} 
                  color="#3b82f6"
                  size={120}
                  strokeWidth={8}
                />
                <p className="mt-3 font-semibold text-gray-900">Overall Progress</p>
                <p className="text-sm text-gray-500">68% complete</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-4">Subject Progress</h3>
                <div className="space-y-4">
                  {[
                    { subject: 'Mathematics', progress: 85, color: 'bg-blue-500' },
                    { subject: 'Physics', progress: 72, color: 'bg-emerald-500' },
                    { subject: 'English', progress: 60, color: 'bg-amber-500' },
                  ].map(item => (
                    <div key={item.subject}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{item.subject}</span>
                        <span className="text-gray-500">{item.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recommended Tutors */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recommended Tutors</h2>
              <Link to="/browse-tutors" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Browse
              </Link>
            </div>
            <div className="space-y-4">
              {studentController.recommendedTutors?.slice(0, 3).map(tutor => (
                <TutorCard key={tutor.id} tutor={tutor} compact />
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-amber-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FiAward className="mr-2 text-amber-500" />
              Achievements
            </h2>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <FiBook className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Bookworm</p>
                  <p className="text-xs text-gray-500">Completed 20 sessions</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                  <FiTrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">On Fire</p>
                  <p className="text-xs text-gray-500">5-day streak</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Tutor Dashboard
  const renderTutorDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Card */}
      <div className={`bg-gradient-to-r ${theme.gradient} rounded-2xl p-8 text-white shadow-xl`}>
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.profile?.firstName || 'Tutor'}! 👨‍🏫</h1>
        <p className="text-emerald-100 text-lg">
          You have {tutorController.pendingRequests?.length || 0} new session requests.
        </p>
        <div className="mt-6 flex gap-4">
          <Link 
            to="/dashboard/tutor/requests"
            className="inline-flex items-center px-6 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors shadow-md"
          >
            <FiCalendar className="mr-2" />
            View Requests
          </Link>
          <Link 
            to="/dashboard/tutor/availability"
            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors border border-emerald-500"
          >
            <FiClock className="mr-2" />
            Set Availability
          </Link>
          <Link 
            to="/dashboard/tutor/qa/overview"
            className="inline-flex items-center px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/40"
          >
            <FiMessageSquare className="mr-2" />
            Q&amp;A Forum
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Sessions"
          value={tutorController.tutorStats?.totalSessions || 156}
          icon={FiBook}
          trend="Lifetime"
          color={theme.color}
        />
        <StatCard 
          title="Total Students"
          value={tutorController.tutorStats?.totalStudents || 42}
          icon={FiUsers}
          trend="Unique learners"
          color={theme.color}
        />
        <StatCard 
          title="Average Rating"
          value={tutorController.tutorStats?.averageRating || 4.8}
          icon={FiStar}
          trend={`${tutorController.tutorStats?.totalReviews || 89} reviews`}
          color={theme.color}
        />
        <StatCard 
          title="This Week's Earnings"
          value={`$${tutorController.tutorStats?.thisWeekEarnings || 675}`}
          icon={FiDollarSign}
          trend="Great week!"
          color={theme.color}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Requests */}
          {tutorController.pendingRequests?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-500">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Requests ({tutorController.pendingRequests.length})</h2>
              <div className="space-y-4">
                {tutorController.pendingRequests.slice(0, 2).map(request => (
                  <SessionCard key={request.id} booking={request} userRole="tutor" showActions />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
              <Link to="/dashboard/tutor/sessions" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center">
                View All <FiArrowRight className="ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {tutorController.upcomingSessions?.slice(0, 3).map(session => (
                <SessionCard key={session.id} booking={session} userRole="tutor" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Q&A Forum Card */}
          <Link
            to="/dashboard/tutor/qa/overview"
            className="block bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FiMessageSquare className="w-6 h-6 text-white" />
              </div>
              <FiArrowRight className="w-5 h-5 text-blue-200" />
            </div>
            <h3 className="text-lg font-bold mb-1">Q&amp;A Forum</h3>
            <p className="text-blue-200 text-sm">Manage questions, grade student answers &amp; track performance.</p>
            <div className="mt-4 pt-4 border-t border-white/20 flex gap-4 text-xs text-blue-200">
              <span>✏️ Create questions</span>
              <span>📊 Student reports</span>
            </div>
          </Link>

          {/* Recent Reviews */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Reviews</h2>
            <div className="space-y-4">
              {tutorController.reviews?.slice(0, 3).map(review => (
                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center mb-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">{review.student.displayName}</span>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
            <Link to="/dashboard/tutor/reviews" className="mt-4 block text-center text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              View All Reviews
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-lg p-6 border border-emerald-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-bold text-emerald-600">{tutorController.tutorStats?.completionRate || 98}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${tutorController.tutorStats?.completionRate || 98}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-600">Total Earnings</span>
                <span className="font-bold text-gray-900">${tutorController.tutorStats?.totalEarnings || 8420}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Admin Dashboard
  const renderAdminDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Card */}
      <div className={`bg-gradient-to-r ${theme.gradient} rounded-2xl p-8 text-white shadow-xl`}>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard 🛡️</h1>
        <p className="text-slate-200 text-lg">
          Platform overview and management tools.
        </p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users"
          value={adminController.platformStats?.totalUsers || 1250}
          icon={FiUsers}
          trend="+12% this month"
          color="blue"
        />
        <StatCard 
          title="Active Tutors"
          value={adminController.platformStats?.totalTutors || 245}
          icon={FiBook}
          trend={`${adminController.platformStats?.pendingApprovals || 2} pending approval`}
          color="emerald"
        />
        <StatCard 
          title="Total Sessions"
          value={adminController.platformStats?.totalSessions || 3456}
          icon={FiCalendar}
          trend={`${adminController.platformStats?.activeSessions || 12} active now`}
          color="purple"
        />
        <StatCard 
          title="Pending Reports"
          value={adminController.platformStats?.pendingReports || 5}
          icon={FiTrendingUp}
          trend="Requires attention"
          color="red"
          highlight={adminController.platformStats?.pendingReports > 0}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/dashboard/admin/tutor-approvals"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <FiBook className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Tutor Approvals</h3>
              <p className="text-sm text-gray-500 mt-1">{adminController.platformStats?.pendingApprovals || 2} pending</p>
            </Link>
            <Link 
              to="/dashboard/admin/reports"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FiTrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Reports</h3>
              <p className="text-sm text-gray-500 mt-1">{adminController.platformStats?.pendingReports || 5} pending</p>
            </Link>
            <Link 
              to="/dashboard/admin/users"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">User Management</h3>
              <p className="text-sm text-gray-500 mt-1">Manage users</p>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { action: 'New tutor application', user: 'Dr. Robert Taylor', time: '5 min ago', type: 'info' },
                { action: 'Report resolved', user: 'Harassment case', time: '15 min ago', type: 'success' },
                { action: 'User suspended', user: 'fake.tutor@example.com', time: '1 hour ago', type: 'warning' },
                { action: 'New session completed', user: 'John + Sarah', time: '2 hours ago', type: 'neutral' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      activity.type === 'info' ? 'bg-blue-500' :
                      activity.type === 'success' ? 'bg-emerald-500' :
                      activity.type === 'warning' ? 'bg-amber-500' :
                      'bg-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.user}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Platform Health */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Health</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">System Status</span>
                  <span className="text-emerald-600 font-medium">Operational</span>
                </div>
                <div className="h-2 bg-emerald-100 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">User Satisfaction</span>
                  <span className="text-blue-600 font-medium">{adminController.platformStats?.averageRating || 4.7}/5</span>
                </div>
                <div className="h-2 bg-blue-100 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl shadow-lg p-6 text-white">
            <h2 className="text-lg font-bold mb-4">Platform Earnings</h2>
            <p className="text-4xl font-bold">${adminController.platformStats?.totalEarnings || 45280}</p>
            <p className="text-slate-300 mt-2">Total revenue to date</p>
            <div className="mt-4 pt-4 border-t border-slate-600">
              <p className="text-sm text-slate-400">This month: $5,240</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render based on role
  switch (user?.role) {
    case 'student':
      return renderStudentDashboard();
    case 'tutor':
      return renderTutorDashboard();
    case 'parent':
      return <ParentDashboard />;
    case 'admin':
    case 'moderator':
      return renderAdminDashboard();
    default:
      return renderStudentDashboard();
  }
};

export default DashboardHome;
