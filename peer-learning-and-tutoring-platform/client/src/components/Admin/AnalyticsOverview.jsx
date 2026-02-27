import React, { useEffect } from 'react';
import { 
  FiUsers, 
  FiBook, 
  FiCalendar, 
  FiStar,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign
} from 'react-icons/fi';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useAdminController } from '../../controllers/useAdminController';
import StatCard from '../Dashboard/StatCard';

/**
 * AnalyticsOverview - Admin view for platform analytics and charts
 * 
 * MVC Pattern: View (Pure UI - Logic in useAdminController)
 */
const AnalyticsOverview = () => {
  const { platformStats, fetchPlatformStats, isLoading } = useAdminController();

  useEffect(() => {
    fetchPlatformStats();
  }, [fetchPlatformStats]);

  // Mock data for charts
  const sessionsOverTimeData = [
    { month: 'Jan', sessions: 120, bookings: 145 },
    { month: 'Feb', sessions: 185, bookings: 210 },
    { month: 'Mar', sessions: 240, bookings: 285 },
    { month: 'Apr', sessions: 320, bookings: 380 },
    { month: 'May', sessions: 410, bookings: 465 },
    { month: 'Jun', sessions: 485, bookings: 520 },
  ];

  const userRegistrationData = [
    { month: 'Jan', students: 45, tutors: 8 },
    { month: 'Feb', students: 62, tutors: 12 },
    { month: 'Mar', students: 85, tutors: 15 },
    { month: 'Apr', students: 110, tutors: 22 },
    { month: 'May', students: 135, tutors: 28 },
    { month: 'Jun', students: 158, tutors: 35 },
  ];

  const roleDistributionData = [
    { name: 'Students', value: platformStats?.totalStudents || 980, color: '#3b82f6' },
    { name: 'Tutors', value: platformStats?.totalTutors || 245, color: '#10b981' },
    { name: 'Parents', value: 20, color: '#8b5cf6' },
    { name: 'Admins', value: 5, color: '#ef4444' },
  ];

  const topSubjectsData = [
    { subject: 'Mathematics', sessions: 450 },
    { subject: 'Physics', sessions: 320 },
    { subject: 'English', sessions: 280 },
    { subject: 'Chemistry', sessions: 220 },
    { subject: 'Biology', sessions: 180 },
  ];

  const earningsData = [
    { month: 'Jan', earnings: 3200 },
    { month: 'Feb', earnings: 4850 },
    { month: 'Mar', earnings: 6200 },
    { month: 'Apr', earnings: 7800 },
    { month: 'May', earnings: 9200 },
    { month: 'Jun', earnings: 10500 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Platform Analytics</h1>
        <p className="text-blue-100">
          Overview of platform performance and key metrics.
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users"
          value={platformStats?.totalUsers || 1250}
          icon={FiUsers}
          trend="+12% vs last month"
          color="blue"
        />
        <StatCard 
          title="Active Tutors"
          value={platformStats?.totalTutors || 245}
          icon={FiBook}
          trend="+8% vs last month"
          color="emerald"
        />
        <StatCard 
          title="Total Sessions"
          value={platformStats?.totalSessions || 3456}
          icon={FiCalendar}
          trend="+15% vs last month"
          color="purple"
        />
        <StatCard 
          title="Avg. Rating"
          value={platformStats?.averageRating || 4.7}
          icon={FiStar}
          trend="Steady"
          color="amber"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sessions Over Time */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Sessions Over Time</h2>
            <span className="text-sm text-emerald-600 flex items-center">
              <FiTrendingUp className="w-4 h-4 mr-1" />
              +24%
            </span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sessionsOverTimeData}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorSessions)" 
                  name="Completed Sessions"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Bookings"
                  dot={{ fill: '#10b981', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Registration Trends */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">User Registration Trends</h2>
            <span className="text-sm text-emerald-600 flex items-center">
              <FiTrendingUp className="w-4 h-4 mr-1" />
              +18%
            </span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userRegistrationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Bar dataKey="students" fill="#3b82f6" name="Students" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tutors" fill="#10b981" name="Tutors" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Role Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">User Role Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {roleDistributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Subjects */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Subjects</h2>
          <div className="space-y-4">
            {topSubjectsData.map((subject, index) => (
              <div key={subject.subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{index + 1}. {subject.subject}</span>
                  <span className="text-gray-500">{subject.sessions} sessions</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${(subject.sessions / 450) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Overview</h2>
          <div className="h-48 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  formatter={(value) => `$${value}`}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="text-lg font-bold text-emerald-600">${platformStats?.totalEarnings || 45280}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-lg font-bold text-blue-600">$10,500</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-gray-600">Avg. Per Session</span>
              <span className="text-lg font-bold text-purple-600">$42.50</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Health Summary */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-6">Platform Health Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-400 mb-2">99.9%</div>
            <p className="text-slate-300">Uptime</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">0.4s</div>
            <p className="text-slate-300">Avg. Response</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-400 mb-2">{platformStats?.activeSessions || 12}</div>
            <p className="text-slate-300">Active Sessions</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">94%</div>
            <p className="text-slate-300">Satisfaction</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
