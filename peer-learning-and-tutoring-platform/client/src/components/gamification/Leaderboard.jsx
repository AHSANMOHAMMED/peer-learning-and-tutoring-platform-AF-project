import React, { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, Users, Calendar } from 'lucide-react';
import { apiService } from '../../services/api';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);

  const tabs = [
    { id: 'global', label: 'All Time', icon: Trophy },
    { id: 'weekly', label: 'This Week', icon: TrendingUp },
    { id: 'monthly', label: 'This Month', icon: Calendar },
    { id: 'streaks', label: 'Top Streaks', icon: Medal }
  ];

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, limit]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('type', activeTab);
      params.append('limit', String(limit));

      const response = await apiService.get(`/api/gamification/leaderboard?${params}`);
      const rows = response?.data?.leaderboard || [];
      setLeaderboard(rows);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
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
            No leaderboard data available yet for this view.
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
                  {entry.user?.name || entry.user?.username || 'Unknown User'}
                </div>
                <div className="text-sm text-gray-500">
                  Level {entry.level?.current || 1}
                </div>
              </div>
            </div>

            {/* Score/Stats */}
            <div className="text-right">
              {activeTab !== 'streaks' && (
                <>
                  <div className="font-semibold text-lg text-gray-900">
                    {entry.points?.lifetime || 0}
                  </div>
                  <div className="text-sm text-gray-500">points</div>
                </>
              )}

              {activeTab === 'streaks' && (
                <>
                  <div className="font-semibold text-lg text-gray-900">
                    {entry.longestStreak || 0}
                  </div>
                  <div className="text-sm text-gray-500">days streak</div>
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
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[10, 20, 50, 100].map(size => (
                  <option key={size} value={size}>
                    Top {size}
                  </option>
                ))}
              </select>
            </div>
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
