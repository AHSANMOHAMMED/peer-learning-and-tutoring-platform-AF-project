import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Users, Calendar, Filter } from 'lucide-react';
import axios from 'axios';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('overall');
  const [period, setPeriod] = useState('all');
  const [subject, setSubject] = useState('all');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const subjects = [
    { value: 'all', label: 'All Subjects' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Science', label: 'Science' },
    { value: 'English', label: 'English' },
    { value: 'History', label: 'History' },
    { value: 'Geography', label: 'Geography' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Physics', label: 'Physics' },
    { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Biology', label: 'Biology' }
  ];

  const tabs = [
    { id: 'overall', label: 'Overall', icon: Trophy },
    { id: 'subject', label: 'By Subject', icon: Medal },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'questions', label: 'Questions', icon: TrendingUp },
    { id: 'answers', label: 'Answers', icon: Users }
  ];

  const periods = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  useEffect(() => {
    fetchLeaderboard();
    fetchStats();
  }, [activeTab, period, subject]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      let url = '/api/leaderboard';
      
      if (activeTab === 'subject' && subject !== 'all') {
        url += `/subject/${subject}`;
      } else if (activeTab === 'badges') {
        url += '/badges';
      } else if (activeTab === 'questions') {
        url += '/questions';
      } else if (activeTab === 'answers') {
        url += '/answers';
      }

      const params = new URLSearchParams();
      if (period !== 'all') params.append('period', period);
      params.append('limit', 20);

      const response = await axios.get(`${url}?${params}`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/leaderboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />;
    return <span className="text-sm font-medium text-gray-600">#{rank}</span>;
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const renderLeaderboardContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (leaderboard.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600">
            {activeTab === 'subject' && subject !== 'all' 
              ? 'No activity in this subject yet'
              : 'No activity in this time period'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {leaderboard.map((entry, index) => (
          <div
            key={entry._id || entry.user?._id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-12">
              {getRankIcon(entry.rank || index + 1)}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                {entry.user?.firstName?.[0] || entry.user?.username?.[0] || 'U'}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {entry.user?.firstName && entry.user?.lastName
                    ? `${entry.user.firstName} ${entry.user.lastName}`
                    : entry.user?.username || 'Unknown User'}
                </div>
                <div className="text-sm text-gray-500">@{entry.user?.username}</div>
              </div>
            </div>

            {/* Score/Stats */}
            <div className="text-right">
              {activeTab === 'overall' && (
                <>
                  <div className="font-semibold text-lg text-gray-900">
                    {entry.totalPoints || entry.points}
                  </div>
                  <div className="text-sm text-gray-500">points</div>
                </>
              )}
              
              {activeTab === 'subject' && (
                <>
                  <div className="font-semibold text-lg text-gray-900">
                    {entry.subjectPoints}
                  </div>
                  <div className="text-sm text-gray-500">
                    {subject} points
                  </div>
                </>
              )}
              
              {activeTab === 'badges' && (
                <>
                  <div className="font-semibold text-lg text-gray-900">
                    {entry.totalBadges}
                  </div>
                  <div className="text-sm text-gray-500">badges</div>
                </>
              )}
              
              {activeTab === 'questions' && (
                <>
                  <div className="font-semibold text-lg text-gray-900">
                    {entry.stats?.voteScore || 0}
                  </div>
                  <div className="text-sm text-gray-500">votes</div>
                </>
              )}
              
              {activeTab === 'answers' && (
                <>
                  <div className="font-semibold text-lg text-gray-900">
                    {entry.stats?.voteScore || 0}
                  </div>
                  <div className="text-sm text-gray-500">votes</div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-600">Top contributors and achievements</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                <div className="text-sm text-gray-500">Total Users</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.activeUsers}</div>
                <div className="text-sm text-gray-500">Active Users</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalBadgesAwarded}</div>
                <div className="text-sm text-gray-500">Badges Awarded</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalPointsAwarded}</div>
                <div className="text-sm text-gray-500">Points Awarded</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex gap-4 ml-auto">
            {/* Period Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {periods.map(p => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter (for subject tab) */}
            {activeTab === 'subject' && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.map(s => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          {renderLeaderboardContent()}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
