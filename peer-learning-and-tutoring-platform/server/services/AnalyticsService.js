const mongoose = require('mongoose');
const User = require('../models/User');
const LectureCourse = require('../models/LectureCourse');
const PeerSession = require('../models/PeerSession');
const GroupRoom = require('../models/GroupRoom');

class AnalyticsService {
  constructor() {
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    this.cache = new Map();
  }

  /**
   * Get comprehensive platform analytics
   * @param {Object} filters - Date range and other filters
   * @returns {Object} Platform-wide analytics
   */
  async getPlatformAnalytics(filters = {}) {
    const cacheKey = `platform_${JSON.stringify(filters)}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }
    }

    const { startDate, endDate } = this.parseDateFilters(filters);

    const analytics = {
      overview: await this.getOverviewMetrics(startDate, endDate),
      userEngagement: await this.getUserEngagementMetrics(startDate, endDate),
      sessionAnalytics: await this.getSessionAnalytics(startDate, endDate),
      contentPerformance: await this.getContentPerformance(startDate, endDate),
      geographicData: await this.getGeographicDistribution(),
      trends: await this.getTrendsData(startDate, endDate),
      heatmapData: await this.generateHeatmapData(startDate, endDate),
      generatedAt: new Date()
    };

    this.cache.set(cacheKey, { data: analytics, timestamp: Date.now() });
    return analytics;
  }

  /**
   * Get overview metrics
   */
  async getOverviewMetrics(startDate, endDate) {
    const [
      totalUsers,
      activeUsers,
      totalSessions,
      totalCourses,
      newUsersThisMonth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      PeerSession.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      LectureCourse.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
    ]);

    return {
      totalUsers,
      activeUsers,
      totalSessions,
      totalCourses,
      newUsersThisMonth,
      userGrowthRate: ((newUsersThisMonth / (totalUsers - newUsersThisMonth)) * 100).toFixed(1),
      avgSessionsPerUser: totalUsers > 0 ? (totalSessions / totalUsers).toFixed(1) : 0
    };
  }

  /**
   * Get user engagement metrics
   */
  async getUserEngagementMetrics(startDate, endDate) {
    const sessions = await PeerSession.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).select('duration status feedback participants');

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const avgDuration = totalSessions > 0 
      ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions 
      : 0;

    // Calculate ratings
    const allRatings = sessions.flatMap(s => s.feedback?.map(f => f.rating) || []);
    const avgRating = allRatings.length > 0
      ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
      : 0;

    // Calculate completion rate
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Calculate retention (users with multiple sessions)
    const userSessionCounts = {};
    sessions.forEach(s => {
      s.participants?.forEach(p => {
        const userId = p.user?.toString();
        if (userId) {
          userSessionCounts[userId] = (userSessionCounts[userId] || 0) + 1;
        }
      });
    });

    const returningUsers = Object.values(userSessionCounts).filter(c => c > 1).length;
    const retentionRate = Object.keys(userSessionCounts).length > 0
      ? (returningUsers / Object.keys(userSessionCounts).length) * 100
      : 0;

    return {
      totalSessions,
      completedSessions,
      completionRate: completionRate.toFixed(1),
      avgSessionDuration: Math.round(avgDuration),
      avgRating: avgRating.toFixed(1),
      retentionRate: retentionRate.toFixed(1),
      satisfactionScore: (avgRating / 5 * 100).toFixed(1)
    };
  }

  /**
   * Get session analytics with engagement breakdown
   */
  async getSessionAnalytics(startDate, endDate) {
    // Get session data by type
    const peerSessions = await PeerSession.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).select('subject grade status participants duration');

    const groupRooms = await GroupRoom.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).select('subject participants stats');

    const courses = await LectureCourse.find({
      startDate: { $gte: startDate, $lte: endDate }
    }).select('subject sessions stats enrolledStudents');

    // Analyze by subject
    const subjectStats = {};
    
    [...peerSessions, ...groupRooms].forEach(session => {
      const subject = session.subject || 'Unknown';
      if (!subjectStats[subject]) {
        subjectStats[subject] = { sessions: 0, participants: 0, avgDuration: 0 };
      }
      subjectStats[subject].sessions++;
      subjectStats[subject].participants += session.participants?.length || 0;
      subjectStats[subject].avgDuration += session.duration || 0;
    });

    // Calculate averages
    Object.keys(subjectStats).forEach(subject => {
      const stats = subjectStats[subject];
      stats.avgDuration = stats.sessions > 0 ? Math.round(stats.avgDuration / stats.sessions) : 0;
    });

    // Time of day analysis
    const hourlyDistribution = Array(24).fill(0);
    peerSessions.forEach(session => {
      const hour = new Date(session.createdAt).getHours();
      hourlyDistribution[hour]++;
    });

    // Day of week analysis
    const dailyDistribution = Array(7).fill(0);
    peerSessions.forEach(session => {
      const day = new Date(session.createdAt).getDay();
      dailyDistribution[day]++;
    });

    return {
      bySubject: subjectStats,
      hourlyDistribution,
      dailyDistribution,
      peakHours: hourlyDistribution.map((count, hour) => ({ hour, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      popularSubjects: Object.entries(subjectStats)
        .sort((a, b) => b[1].sessions - a[1].sessions)
        .slice(0, 5)
        .map(([subject, stats]) => ({ subject, ...stats }))
    };
  }

  /**
   * Get content performance metrics
   */
  async getContentPerformance(startDate, endDate) {
    const materials = await LectureCourse.aggregate([
      { $unwind: '$resources' },
      { $group: {
        _id: '$resources.type',
        count: { $sum: 1 },
        avgSessionCount: { $avg: { $size: '$sessions' } }
      }}
    ]);

    const topCourses = await LectureCourse.find()
      .select('title stats subject enrolledStudents')
      .sort({ 'stats.totalEnrollments': -1 })
      .limit(10);

    return {
      materialsByType: materials,
      topCourses: topCourses.map(c => ({
        title: c.title,
        subject: c.subject,
        enrollments: c.stats?.totalEnrollments || 0,
        rating: c.stats?.averageRating || 0,
        completionRate: c.stats?.completedEnrollments && c.stats?.totalEnrollments
          ? ((c.stats.completedEnrollments / c.stats.totalEnrollments) * 100).toFixed(1)
          : 0
      }))
    };
  }

  /**
   * Get geographic distribution (mock implementation)
   */
  async getGeographicDistribution() {
    // In real implementation, this would use IP geolocation
    // For now, return mock data representing Sri Lanka/South Asia
    return {
      regions: [
        { name: 'Colombo District', users: 450, percentage: 35 },
        { name: 'Gampaha District', users: 280, percentage: 22 },
        { name: 'Kandy District', users: 150, percentage: 12 },
        { name: 'Galle District', users: 120, percentage: 9 },
        { name: 'Other Sri Lankan Districts', users: 220, percentage: 17 },
        { name: 'International', users: 64, percentage: 5 }
      ],
      topCities: [
        { name: 'Colombo', users: 380 },
        { name: 'Dehiwala-Mount Lavinia', users: 120 },
        { name: 'Moratuwa', users: 95 },
        { name: 'Kandy', users: 85 },
        { name: 'Negombo', users: 70 }
      ]
    };
  }

  /**
   * Get trends data over time
   */
  async getTrendsData(startDate, endDate) {
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const interval = daysDiff > 30 ? 'week' : 'day';

    // Get daily/weekly session counts
    const sessions = await PeerSession.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).select('createdAt');

    const trendData = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const periodStart = new Date(current);
      const periodEnd = interval === 'day' 
        ? new Date(current.getTime() + 24 * 60 * 60 * 1000)
        : new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);

      const count = sessions.filter(s => {
        const date = new Date(s.createdAt);
        return date >= periodStart && date < periodEnd;
      }).length;

      trendData.push({
        period: interval === 'day' 
          ? periodStart.toLocaleDateString()
          : `Week ${Math.ceil((periodStart - startDate) / (7 * 24 * 60 * 60 * 1000))}`,
        sessions: count,
        timestamp: periodStart
      });

      current.setTime(periodEnd.getTime());
    }

    // Calculate growth rate
    const firstHalf = trendData.slice(0, Math.floor(trendData.length / 2));
    const secondHalf = trendData.slice(Math.floor(trendData.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.sessions, 0) / firstHalf.length || 1;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.sessions, 0) / secondHalf.length;
    
    const growthRate = ((secondAvg - firstAvg) / firstAvg) * 100;

    return {
      data: trendData,
      interval,
      growthRate: growthRate.toFixed(1),
      trend: growthRate > 10 ? 'up' : growthRate < -10 ? 'down' : 'stable'
    };
  }

  /**
   * Generate engagement heatmap data
   */
  async generateHeatmapData(startDate, endDate) {
    // Get sessions with detailed timestamps
    const sessions = await PeerSession.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed'
    }).select('createdAt duration participants feedback');

    // Create 24x7 grid (hours x days)
    const heatmap = Array(7).fill(null).map(() => Array(24).fill(0));
    const engagementScores = Array(7).fill(null).map(() => Array(24).fill([]));

    sessions.forEach(session => {
      const date = new Date(session.createdAt);
      const day = date.getDay();
      const hour = date.getHours();

      // Calculate engagement score
      const participantCount = session.participants?.length || 0;
      const avgRating = session.feedback?.length > 0
        ? session.feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / session.feedback.length
        : 3;
      const duration = session.duration || 30;

      const engagementScore = Math.min(
        ((participantCount * 10) + (avgRating * 15) + (duration / 2)) / 3,
        100
      );

      heatmap[day][hour]++;
      engagementScores[day][hour].push(engagementScore);
    });

    // Calculate average engagement per cell
    const avgEngagement = engagementScores.map(day => 
      day.map(hourScores => {
        if (hourScores.length === 0) return 0;
        return hourScores.reduce((a, b) => a + b, 0) / hourScores.length;
      })
    );

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
      sessionCount: heatmap,
      engagementScores: avgEngagement,
      days,
      hours: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      peakCell: this.findPeakCell(heatmap, days),
      quietCell: this.findQuietCell(heatmap, days)
    };
  }

  /**
   * Get user-specific analytics
   */
  async getUserAnalytics(userId) {
    const user = await User.findById(userId).select('profile sessions attendedSessions');
    
    if (!user) return null;

    const sessions = await PeerSession.find({
      'participants.user': userId
    }).select('subject duration feedback status createdAt');

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    // Calculate subject preferences
    const subjectCounts = {};
    sessions.forEach(s => {
      subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
    });

    const favoriteSubject = Object.entries(subjectCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

    // Calculate average rating given
    const ratingsGiven = sessions.flatMap(s => 
      s.feedback?.filter(f => f.user?.toString() === userId).map(f => f.rating) || []
    );
    const avgRatingGiven = ratingsGiven.length > 0
      ? ratingsGiven.reduce((a, b) => a + b, 0) / ratingsGiven.length
      : 0;

    // Learning streak
    const streak = this.calculateStreak(sessions);

    return {
      totalSessions,
      completedSessions,
      totalHours: Math.round(totalDuration / 60),
      favoriteSubject,
      avgRatingGiven: avgRatingGiven.toFixed(1),
      streak,
      subjectDistribution: subjectCounts,
      progressTrend: this.calculateProgressTrend(sessions),
      skillLevel: this.assessSkillLevel(sessions, user.profile?.grade)
    };
  }

  /**
   * Get real-time dashboard metrics
   */
  async getRealTimeMetrics() {
    const now = new Date();
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);

    const [
      activeSessions,
      onlineUsers,
      activeGroups
    ] = await Promise.all([
      PeerSession.countDocuments({
        status: 'active',
        updatedAt: { $gte: fiveMinutesAgo }
      }),
      User.countDocuments({
        lastActive: { $gte: fiveMinutesAgo }
      }),
      GroupRoom.countDocuments({
        isActive: true,
        'participants.1': { $exists: true } // At least 2 participants
      })
    ]);

    return {
      activeSessions,
      onlineUsers,
      activeGroups,
      timestamp: now,
      serverLoad: Math.round((activeSessions / 100) * 100), // Mock load percentage
      responseTime: Math.round(Math.random() * 100 + 50) // Mock response time in ms
    };
  }

  // Helper methods
  parseDateFilters(filters) {
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
    const startDate = filters.startDate 
      ? new Date(filters.startDate)
      : new Date(endDate - 30 * 24 * 60 * 60 * 1000); // Default 30 days
    
    return { startDate, endDate };
  }

  findPeakCell(heatmap, days) {
    let max = 0;
    let cell = null;
    
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        if (heatmap[d][h] > max) {
          max = heatmap[d][h];
          cell = { day: days[d], hour: h, count: max };
        }
      }
    }
    
    return cell;
  }

  findQuietCell(heatmap, days) {
    let min = Infinity;
    let cell = null;
    
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        if (heatmap[d][h] < min && heatmap[d][h] > 0) {
          min = heatmap[d][h];
          cell = { day: days[d], hour: h, count: min };
        }
      }
    }
    
    return cell;
  }

  calculateStreak(sessions) {
    if (sessions.length === 0) return 0;
    
    const sorted = sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    let streak = 1;
    let lastDate = new Date(sorted[0].createdAt);
    
    for (let i = 1; i < sorted.length; i++) {
      const currentDate = new Date(sorted[i].createdAt);
      const diffDays = (lastDate - currentDate) / (1000 * 60 * 60 * 24);
      
      if (diffDays <= 2) { // Within 2 days counts as streak
        streak++;
        lastDate = currentDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  calculateProgressTrend(sessions) {
    if (sessions.length < 3) return 'insufficient_data';
    
    const sorted = sessions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, s) => sum + (s.feedback?.[0]?.rating || 3), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + (s.feedback?.[0]?.rating || 3), 0) / secondHalf.length;
    
    if (secondAvg > firstAvg + 0.5) return 'improving';
    if (secondAvg < firstAvg - 0.5) return 'declining';
    return 'stable';
  }

  assessSkillLevel(sessions, grade) {
    const avgRating = sessions.reduce((sum, s) => 
      sum + (s.feedback?.reduce((fs, f) => fs + f.rating, 0) / (s.feedback?.length || 1) || 3), 0
    ) / sessions.length;

    if (avgRating >= 4.5) return 'expert';
    if (avgRating >= 3.5) return 'proficient';
    if (avgRating >= 2.5) return 'intermediate';
    return 'beginner';
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = new AnalyticsService();
