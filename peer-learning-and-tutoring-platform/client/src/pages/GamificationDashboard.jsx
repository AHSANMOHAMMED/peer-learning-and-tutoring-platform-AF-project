import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Star, Zap, Target, TrendingUp, Users, Award,
  Medal, Crown, Flame, ChevronRight, Lock, CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const GamificationDashboard = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, badgesRes, leaderboardRes] = await Promise.all([
        api.get('/api/gamification/profile'),
        api.get('/api/gamification/badges/my'),
        api.get('/api/gamification/leaderboard?type=global&limit=10')
      ]);

      if (profileRes.data.success) {
        setProfile(profileRes.data.data);
      }
      if (badgesRes.data.success) {
        setBadges(badgesRes.data.data.badges);
      }
      if (leaderboardRes.data.success) {
        setLeaderboard(leaderboardRes.data.data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Failed to load gamification data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
            {t('Your Achievements')}
          </h1>
          <p className="text-gray-600 mt-2">
            Track your progress, earn badges, and compete with peers
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Total Points</p>
                <p className="text-3xl font-bold">{profile.points.lifetime.toLocaleString()}</p>
              </div>
              <Star className="w-10 h-10 text-yellow-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Current Level</p>
                <p className="text-3xl font-bold">{profile.level.current}</p>
                <p className="text-sm text-blue-100">{profile.level.title}</p>
              </div>
              <Crown className="w-10 h-10 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Day Streak</p>
                <p className="text-3xl font-bold">{profile.streaks.current}</p>
                <p className="text-sm text-orange-100">
                  Best: {profile.streaks.longest}
                </p>
              </div>
              <Flame className="w-10 h-10 text-orange-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Badges Earned</p>
                <p className="text-3xl font-bold">{badges.length}</p>
              </div>
              <Award className="w-10 h-10 text-purple-200" />
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b">
            {['overview', 'badges', 'leaderboard'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Level Progress */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Level Progress</h3>
                      <p className="text-gray-600 text-sm">
                        {profile.progress.progressPercentage.toFixed(1)}% to Level {profile.level.current + 1}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {profile.points.total.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        / {profile.progress.pointsForNextLevel.toLocaleString()} points
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                      style={{ width: `${profile.progress.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Recent Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {profile.stats.totalSessions}
                    </p>
                    <p className="text-sm text-gray-600">Sessions</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {profile.stats.coursesCompleted}
                    </p>
                    <p className="text-sm text-gray-600">Courses</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {profile.ranking.global}
                    </p>
                    <p className="text-sm text-gray-600">Global Rank</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {profile.points.earnedThisWeek}
                    </p>
                    <p className="text-sm text-gray-600">Points This Week</p>
                  </div>
                </div>

                {/* Leaderboard Preview */}
                {profile.nearbyLeaderboard && profile.nearbyLeaderboard.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Leaderboard
                    </h3>
                    <div className="space-y-2">
                      {profile.nearbyLeaderboard.map((user, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            user.isCurrentUser
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="w-8 text-center font-semibold text-gray-500">
                              {user.rank}
                            </span>
                            <span className={`ml-3 ${user.isCurrentUser ? 'font-semibold' : ''}`}>
                              {user.name} {user.isCurrentUser && '(You)'}
                            </span>
                          </div>
                          <span className="font-semibold">{user.points.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'badges' && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {badges.map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl"
                      style={{ backgroundColor: badge.badge?.color || '#CD7F32' }}
                    >
                      {badge.badge?.icon ? (
                        <img src={badge.badge.icon} alt="" className="w-10 h-10" />
                      ) : (
                        <Medal className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <h4 className="font-semibold text-sm">{badge.badge?.name}</h4>
                    <p className="text-xs text-gray-500 capitalize">{badge.badge?.tier}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
                
                {badges.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No badges earned yet. Start learning to earn badges!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="space-y-2">
                {leaderboard.map((user, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      index < 3
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="ml-4">
                        <p className="font-semibold">{user.user?.name}</p>
                        <p className="text-sm text-gray-500">
                          Level {user.level?.current} • {user.badgeCount} badges
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600">
                        {user.points?.lifetime?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationDashboard;
