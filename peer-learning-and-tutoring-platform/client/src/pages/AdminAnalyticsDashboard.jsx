import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, Users, BookOpen, DollarSign, TrendingUp, 
  Activity, Clock, MapPin, Calendar, AlertCircle,
  CheckCircle, XCircle, ArrowUp, ArrowDown, Filter,
  Download, RefreshCw, Settings, Bell
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const AdminAnalyticsDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
    fetchRealtimeMetrics();
    
    // Real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchRealtimeMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const response = await api.get('/api/analytics/platform', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeMetrics = async () => {
    try {
      const response = await api.get('/api/analytics/realtime');
      if (response.data.success) {
        setRealtimeMetrics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching realtime metrics:', error);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              {change}
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Platform performance and user engagement insights
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            <button
              onClick={fetchAnalytics}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={() => {/* Export functionality */}}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Stats Bar */}
      {realtimeMetrics && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium">Live</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm">
                  {realtimeMetrics.onlineUsers} users online
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">
                  {realtimeMetrics.activeSessions} active sessions
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                  {realtimeMetrics.activeGroups} active groups
                </span>
              </div>
            </div>
            
            <div className="text-sm text-blue-200">
              Last updated: {new Date(realtimeMetrics.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={analytics?.overview?.totalUsers || 0}
          change={`${analytics?.overview?.userGrowthRate || 0}%`}
          trend={analytics?.overview?.userGrowthRate >= 0 ? 'up' : 'down'}
          icon={Users}
        />
        
        <StatCard
          title="Active Sessions"
          value={analytics?.overview?.totalSessions || 0}
          change="+12%"
          trend="up"
          icon={BookOpen}
        />
        
        <StatCard
          title="Revenue"
          value={`LKR ${analytics?.earnings?.totalRevenue?.toLocaleString() || 0}`}
          change="+8%"
          trend="up"
          icon={DollarSign}
        />
        
        <StatCard
          title="Completion Rate"
          value={`${analytics?.engagement?.completionRate || 0}%`}
          change="+5%"
          trend="up"
          icon={TrendingUp}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="flex border-b border-gray-200">
          {['overview', 'engagement', 'sessions', 'revenue', 'geography'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* User Engagement Chart Placeholder */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">User Engagement Trends</h3>
                <div className="h-64 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">Engagement chart would be rendered here</p>
                </div>
              </div>

              {/* Popular Subjects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Popular Subjects</h3>
                  <div className="space-y-3">
                    {analytics?.sessions?.popularSubjects?.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700">{subject.subject}</span>
                        <div className="flex items-center">
                          <div 
                            className="h-2 bg-blue-600 rounded-full mr-2"
                            style={{ width: `${Math.min(subject.sessions * 10, 200)}px` }}
                          ></div>
                          <span className="text-sm text-gray-600">{subject.sessions} sessions</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Peak Hours</h3>
                  <div className="space-y-2">
                    {analytics?.sessions?.peakHours?.slice(0, 5).map((hour, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700">{hour.hour}:00</span>
                        <span className="text-sm text-gray-600">{hour.count} sessions</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'engagement' && (
            <div className="space-y-6">
              {/* Engagement Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Avg Session Duration</h4>
                  <p className="text-3xl font-bold text-blue-600">
                    {analytics?.engagement?.avgSessionDuration || 0} min
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-2">Completion Rate</h4>
                  <p className="text-3xl font-bold text-green-600">
                    {analytics?.engagement?.completionRate || 0}%
                  </p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-900 mb-2">Satisfaction Score</h4>
                  <p className="text-3xl font-bold text-purple-600">
                    {analytics?.engagement?.satisfactionScore || 0}%
                  </p>
                </div>
              </div>

              {/* Heatmap Placeholder */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Activity Heatmap</h3>
                <div className="h-64 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">24x7 activity heatmap would be rendered here</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-6">
              {/* Session Type Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Session Types</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span>Peer Tutoring</span>
                      <span className="font-semibold">45%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span>Group Study</span>
                      <span className="font-semibold">30%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span>Lectures</span>
                      <span className="font-semibold">25%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Session Trends</h3>
                  <div className="h-48 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">Trend chart would be rendered here</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="space-y-6">
              {/* Revenue Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-2">Total Revenue</h4>
                  <p className="text-3xl font-bold text-green-600">
                    LKR {analytics?.earnings?.totalRevenue?.toLocaleString() || 0}
                  </p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Net Revenue</h4>
                  <p className="text-3xl font-bold text-blue-600">
                    LKR {analytics?.earnings?.netRevenue?.toLocaleString() || 0}
                  </p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-900 mb-2">Avg Transaction</h4>
                  <p className="text-3xl font-bold text-purple-600">
                    LKR {Math.round(analytics?.earnings?.averageTransactionValue || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'geography' && (
            <div className="space-y-6">
              {/* Geographic Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Users by Region</h3>
                  <div className="space-y-3">
                    {analytics?.geographicData?.regions?.map((region, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span>{region.name}</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${region.percentage}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold">{region.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Cities</h3>
                  <div className="space-y-3">
                    {analytics?.geographicData?.topCities?.map((city, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span>{city.name}</span>
                        <span className="font-semibold">{city.users} users</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alerts & Notifications */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          System Alerts
        </h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
            <span className="text-yellow-800">Server load at 75% - consider scaling</span>
          </div>
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-800">All services operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;
