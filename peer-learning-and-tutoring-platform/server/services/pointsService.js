const PointTransaction = require('../models/PointTransaction');
const User = require('../models/User');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');

class PointsService {
  // Point constants as per requirements
  static POINTS = {
    QUESTION_POSTED: 2,
    ANSWER_UPVOTE_RECEIVED: 10,
    ANSWER_DOWNVOTE_RECEIVED: -2,
    QUESTION_UPVOTE_RECEIVED: 5
  };

  // Award points to user and check for badge eligibility
  static async awardPoints(userId, points, type, referenceId = null, referenceType = null, description = '', metadata = {}) {
    try {
      // Create point transaction
      const transaction = await PointTransaction.createTransaction({
        user: userId,
        points,
        type,
        referenceId,
        referenceType,
        description,
        metadata
      });

      // Check for new badges after points award
      await this.checkAndAwardBadges(userId);

      return transaction;
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  // Get user's total points
  static async getUserTotalPoints(userId) {
    try {
      return await PointTransaction.getUserTotalPoints(userId);
    } catch (error) {
      console.error('Error getting user total points:', error);
      throw error;
    }
  }

  // Get user's points breakdown by type
  static async getUserPointsBreakdown(userId) {
    try {
      return await PointTransaction.getUserPointsByType(userId);
    } catch (error) {
      console.error('Error getting user points breakdown:', error);
      throw error;
    }
  }

  // Get user's points history
  static async getUserPointsHistory(userId, options = {}) {
    try {
      return await PointTransaction.getUserPointsHistory(userId, options);
    } catch (error) {
      console.error('Error getting user points history:', error);
      throw error;
    }
  }

  // Get leaderboard
  static async getLeaderboard(options = {}) {
    try {
      return await PointTransaction.getLeaderboard(options);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  // Get subject-specific leaderboard
  static async getSubjectLeaderboard(subject, options = {}) {
    try {
      const User = require('../models/User');
      const users = await User.find({
        [`subjectPoints.${subject}`]: { $exists: true, $gt: 0 }
      })
      .select('_id username profile.firstName profile.lastName profile.avatar subjectPoints')
      .sort({ [`subjectPoints.${subject}`]: -1 })
      .limit(options.limit || 10);

      return users.map(user => ({
        user: {
          _id: user._id,
          username: user.username,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          avatar: user.profile.avatar
        },
        subjectPoints: user.subjectPoints.get(subject) || 0,
        totalPoints: user.totalPoints
      }));
    } catch (error) {
      console.error('Error getting subject leaderboard:', error);
      throw error;
    }
  }

  // Check and award badges based on user activity
  static async checkAndAwardBadges(userId) {
    try {
      const qualifiedBadges = await Badge.getQualifiedBadges(userId);
      const user = await User.findById(userId);

      for (const badge of qualifiedBadges) {
        // Check if user already has this badge
        const existingUserBadge = await UserBadge.findOne({ user: userId, badge: badge._id });
        if (!existingUserBadge) {
          // Award the badge
          await UserBadge.awardBadge(userId, badge._id, {
            awardedAt: new Date(),
            automatic: true
          });

          // Emit real-time event
          if (global.io) {
            global.io.to(userId).emit('badgeEarned', {
              badge,
              user: {
                _id: user._id,
                username: user.username,
                firstName: user.profile.firstName,
                lastName: user.profile.lastName
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking and awarding badges:', error);
      throw error;
    }
  }

  // Calculate user's rank in a specific subject
  static async getUserSubjectRank(userId, subject) {
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);
      const userSubjectPoints = user.subjectPoints.get(subject) || 0;

      const usersWithHigherPoints = await User.countDocuments({
        [`subjectPoints.${subject}`]: { $gt: userSubjectPoints }
      });

      const totalUsersWithPoints = await User.countDocuments({
        [`subjectPoints.${subject}`]: { $exists: true, $gt: 0 }
      });

      if (totalUsersWithPoints === 0) return 0;

      return Math.floor(((totalUsersWithPoints - usersWithHigherPoints) / totalUsersWithPoints) * 100);
    } catch (error) {
      console.error('Error calculating user subject rank:', error);
      throw error;
    }
  }

  // Get user's progress towards next level/rank
  static async getUserProgress(userId) {
    try {
      const user = await User.findById(userId);
      const totalPoints = user.totalPoints;
      const rank = await user.getForumRank();

      // Define rank thresholds
      const ranks = [
        { name: 'Beginner', minPoints: 0, maxPoints: 99 },
        { name: 'Contributor', minPoints: 100, maxPoints: 499 },
        { name: 'Expert', minPoints: 500, maxPoints: 1499 },
        { name: 'Master', minPoints: 1500, maxPoints: 4999 },
        { name: 'Legend', minPoints: 5000, maxPoints: Infinity }
      ];

      let currentRank = ranks[0];
      let nextRank = ranks[1];
      let progress = 0;

      for (let i = 0; i < ranks.length; i++) {
        if (totalPoints >= ranks[i].minPoints && totalPoints <= ranks[i].maxPoints) {
          currentRank = ranks[i];
          nextRank = ranks[i + 1] || ranks[i];
          break;
        }
      }

      if (nextRank && nextRank.maxPoints !== Infinity) {
        const range = nextRank.maxPoints - nextRank.minPoints;
        const progressInCurrentRange = totalPoints - currentRank.minPoints;
        progress = Math.min(100, (progressInCurrentRange / range) * 100);
      } else {
        progress = 100; // Max rank
      }

      return {
        currentRank: currentRank.name,
        nextRank: nextRank.name,
        currentPoints: totalPoints,
        pointsToNextRank: nextRank.maxPoints === Infinity ? 0 : nextRank.minPoints - totalPoints,
        progress,
        rank
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }

  // Get points statistics for admin dashboard
  static async getPointsStats() {
    try {
      const totalPointsAwarded = await PointTransaction.aggregate([
        { $group: { _id: null, total: { $sum: '$points' } } }
      ]);

      const pointsByType = await PointTransaction.aggregate([
        {
          $group: {
            _id: '$type',
            total: { $sum: '$points' },
            count: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } }
      ]);

      const topEarners = await User.find({ totalPoints: { $gt: 0 } })
        .sort({ totalPoints: -1 })
        .limit(10)
        .select('username profile.firstName profile.lastName profile.avatar totalPoints reputation');

      const recentTransactions = await PointTransaction.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'username profile.firstName profile.lastName')
        .populate('referenceId');

      return {
        totalPointsAwarded: totalPointsAwarded[0]?.total || 0,
        pointsByType,
        topEarners,
        recentTransactions
      };
    } catch (error) {
      console.error('Error getting points stats:', error);
      throw error;
    }
  }

  // Process question posting
  static async awardQuestionPosted(userId, questionId, subject) {
    return await this.awardPoints(
      userId,
      this.POINTS.QUESTION_POSTED,
      'question_posted',
      questionId,
      'question',
      'Question posted',
      { subject }
    );
  }

  // Process answer upvote received
  static async awardAnswerUpvoteReceived(userId, answerId, subject) {
    return await this.awardPoints(
      userId,
      this.POINTS.ANSWER_UPVOTE_RECEIVED,
      'answer_upvote_received',
      answerId,
      'answer',
      'Answer received upvote',
      { subject }
    );
  }

  // Process answer downvote received
  static async awardAnswerDownvoteReceived(userId, answerId, subject) {
    return await this.awardPoints(
      userId,
      this.POINTS.ANSWER_DOWNVOTE_RECEIVED,
      'answer_downvote_received',
      answerId,
      'answer',
      'Answer received downvote',
      { subject }
    );
  }

  // Process question upvote received
  static async awardQuestionUpvoteReceived(userId, questionId, subject) {
    return await this.awardPoints(
      userId,
      this.POINTS.QUESTION_UPVOTE_RECEIVED,
      'question_upvote_received',
      questionId,
      'question',
      'Question received upvote',
      { subject }
    );
  }

  // Reverse points (when vote is removed or changed)
  static async reversePoints(userId, points, type, referenceId = null, referenceType = null, description = '') {
    return await this.awardPoints(
      userId,
      -points, // Reverse the points
      type,
      referenceId,
      referenceType,
      description
    );
  }

  // Process daily login bonus
  static async processDailyLogin(userId) {
    try {
      // Check if user already received daily bonus today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingBonus = await PointTransaction.findOne({
        user: userId,
        type: 'daily_login',
        createdAt: { $gte: today }
      });

      if (existingBonus) {
        return { awarded: false, reason: 'Already received daily bonus today' };
      }

      // Award daily bonus points
      await this.awardPoints(
        userId,
        5,
        'daily_login',
        null,
        null,
        'Daily login bonus'
      );

      return { awarded: true, points: 5 };
    } catch (error) {
      console.error('Error processing daily login:', error);
      throw error;
    }
  }

  // Award bonus for first answer of the day
  static async awardFirstAnswerOfDay(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingFirstAnswer = await PointTransaction.findOne({
        user: userId,
        type: 'first_answer_of_day',
        createdAt: { $gte: today }
      });

      if (existingFirstAnswer) {
        return { awarded: false, reason: 'Already received first answer bonus today' };
      }

      await this.awardPoints(
        userId,
        10,
        'first_answer_of_day',
        null,
        null,
        'First answer of the day bonus'
      );

      return { awarded: true, points: 10 };
    } catch (error) {
      console.error('Error awarding first answer of day:', error);
      throw error;
    }
  }
}

module.exports = PointsService;
