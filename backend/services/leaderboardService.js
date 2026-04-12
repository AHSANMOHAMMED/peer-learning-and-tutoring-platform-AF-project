const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');
const UserBadge = require('../models/UserBadge');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

class LeaderboardService {
  // Get overall leaderboard
  static async getOverallLeaderboard(options = {}) {
    try {
      const {
        period = 'all', // 'all', 'week', 'month', 'year'
        limit = 10,
        offset = 0
      } = options;

      let matchStage = {};
      
      if (period !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (period) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        }
        
        matchStage.createdAt = { $gte: startDate };
      }

      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$user',
            totalPoints: { $sum: '$points' },
            transactionCount: { $sum: 1 }
          }
        },
        { $sort: { totalPoints: -1 } },
        { $skip: offset },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 1,
            totalPoints: 1,
            transactionCount: 1,
            user: {
              _id: '$user._id',
              username: '$user.username',
              firstName: '$user.profile.firstName',
              lastName: '$user.profile.lastName',
              avatar: '$user.profile.avatar',
              reputation: '$user.reputation',
              totalPoints: '$user.totalPoints'
            }
          }
        }
      ];

      const results = await PointTransaction.aggregate(pipeline);
      
      // Add rank numbers
      const leaderboard = results.map((entry, index) => ({
        ...entry,
        rank: offset + index + 1
      }));

      return leaderboard;
    } catch (error) {
      console.error('Error getting overall leaderboard:', error);
      throw error;
    }
  }

  // Get subject-specific leaderboard
  static async getSubjectLeaderboard(subject, options = {}) {
    try {
      const {
        period = 'all',
        limit = 10,
        offset = 0
      } = options;

      let query = {
        [`subjectPoints.${subject}`]: { $exists: true, $gt: 0 }
      };

      const users = await User.find(query)
        .select('_id username profile.firstName profile.lastName profile.avatar subjectPoints totalPoints reputation')
        .sort({ [`subjectPoints.${subject}`]: -1 })
        .skip(offset)
        .limit(limit);

      const leaderboard = users.map((user, index) => ({
        user: {
          _id: user._id,
          username: user.username,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          avatar: user.profile.avatar,
          reputation: user.reputation,
          totalPoints: user.totalPoints
        },
        subjectPoints: user.subjectPoints.get(subject) || 0,
        rank: offset + index + 1
      }));

      return leaderboard;
    } catch (error) {
      console.error('Error getting subject leaderboard:', error);
      throw error;
    }
  }

  // Get badge leaderboard
  static async getBadgeLeaderboard(options = {}) {
    try {
      const {
        period = 'all',
        limit = 10,
        category = null
      } = options;

      return await UserBadge.getBadgeLeaderboard({
        period,
        limit,
        category
      });
    } catch (error) {
      console.error('Error getting badge leaderboard:', error);
      throw error;
    }
  }

  // Get question leaderboard
  static async getQuestionLeaderboard(options = {}) {
    try {
      const {
        period = 'all',
        limit = 10,
        sortBy = 'votes' // 'votes', 'views', 'answers'
      } = options;

      let matchStage = {};
      
      if (period !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (period) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        }
        
        matchStage.createdAt = { $gte: startDate };
      }

      let sortOptions = {};
      switch (sortBy) {
        case 'votes':
          sortOptions = { voteScore: -1 };
          break;
        case 'views':
          sortOptions = { views: -1 };
          break;
        case 'answers':
          sortOptions = { answerCount: -1 };
          break;
        default:
          sortOptions = { voteScore: -1 };
      }

      const questions = await Question.find(matchStage)
        .sort(sortOptions)
        .limit(limit)
        .populate('author', 'username profile.firstName profile.lastName profile.avatar');

      return questions.map((question, index) => ({
        question: {
          _id: question._id,
          title: question.title,
          category: question.category,
          tags: question.tags,
          createdAt: question.createdAt
        },
        author: question.author,
        stats: {
          upvotes: question.upvotes,
          downvotes: question.downvotes,
          voteScore: question.voteScore,
          views: question.views,
          answerCount: question.answerCount
        },
        rank: index + 1
      }));
    } catch (error) {
      console.error('Error getting question leaderboard:', error);
      throw error;
    }
  }

  // Get answer leaderboard
  static async getAnswerLeaderboard(options = {}) {
    try {
      const {
        period = 'all',
        limit = 10,
        sortBy = 'votes' // 'votes', 'accepted'
      } = options;

      let matchStage = {};
      
      if (period !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (period) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        }
        
        matchStage.createdAt = { $gte: startDate };
      }

      let sortOptions = {};
      switch (sortBy) {
        case 'votes':
          sortOptions = { voteScore: -1 };
          break;
        case 'accepted':
          sortOptions = { isAccepted: -1, voteScore: -1 };
          break;
        default:
          sortOptions = { voteScore: -1 };
      }

      const answers = await Answer.find(matchStage)
        .sort(sortOptions)
        .limit(limit)
        .populate('author', 'username profile.firstName profile.lastName profile.avatar')
        .populate('question', 'title category');

      return answers.map((answer, index) => ({
        answer: {
          _id: answer._id,
          body: answer.body.substring(0, 200) + '...',
          createdAt: answer.createdAt,
          isAccepted: answer.isAccepted
        },
        question: answer.question,
        author: answer.author,
        stats: {
          upvotes: answer.upvotes,
          downvotes: answer.downvotes,
          voteScore: answer.voteScore,
          commentCount: answer.commentCount
        },
        rank: index + 1
      }));
    } catch (error) {
      console.error('Error getting answer leaderboard:', error);
      throw error;
    }
  }

  // Get user's rank in different categories
  static async getUserRanks(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Overall rank
      const overallRank = await user.getForumRank();

      // Subject ranks
      const subjectRanks = {};
      for (const [subject, points] of user.subjectPoints.entries()) {
        if (points > 0) {
          const usersWithHigherPoints = await User.countDocuments({
            [`subjectPoints.${subject}`]: { $gt: points }
          });
          const totalUsersWithPoints = await User.countDocuments({
            [`subjectPoints.${subject}`]: { $exists: true, $gt: 0 }
          });
          
          if (totalUsersWithPoints > 0) {
            subjectRanks[subject] = Math.floor(((totalUsersWithPoints - usersWithHigherPoints) / totalUsersWithPoints) * 100);
          }
        }
      }

      // Badge rank
      const userBadgeCount = await UserBadge.countDocuments({ user: userId });
      const usersWithMoreBadges = await User.aggregate([
        {
          $lookup: {
            from: 'userbadges',
            localField: '_id',
            foreignField: 'user',
            as: 'badges'
          }
        },
        {
          $match: {
            _id: { $ne: mongoose.Types.ObjectId(userId) }
          }
        },
        {
          $addFields: {
            badgeCount: { $size: '$badges' }
          }
        },
        {
          $match: {
            badgeCount: { $gt: userBadgeCount }
          }
        },
        {
          $count: 'count'
        }
      ]);

      const totalUsers = await User.countDocuments();
      const badgeRank = totalUsers > 0 ? Math.floor(((totalUsers - (usersWithMoreBadges[0]?.count || 0)) / totalUsers) * 100) : 0;

      return {
        overall: overallRank,
        subjects: subjectRanks,
        badges: badgeRank
      };
    } catch (error) {
      console.error('Error getting user ranks:', error);
      throw error;
    }
  }

  // Get leaderboard statistics
  static async getLeaderboardStats() {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ totalPoints: { $gt: 0 } });
      
      const topUser = await User.findOne()
        .sort({ totalPoints: -1 })
        .select('username profile.firstName profile.lastName totalPoints');

      const totalPointsAwarded = await PointTransaction.aggregate([
        { $group: { _id: null, total: { $sum: '$points' } } }
      ]);

      const totalBadgesAwarded = await UserBadge.countDocuments();

      const questionsByCategory = await Question.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      return {
        totalUsers,
        activeUsers,
        topUser,
        totalPointsAwarded: totalPointsAwarded[0]?.total || 0,
        totalBadgesAwarded,
        questionsByCategory
      };
    } catch (error) {
      console.error('Error getting leaderboard stats:', error);
      throw error;
    }
  }

  // Get trending topics (based on recent activity)
  static async getTrendingTopics(options = {}) {
    try {
      const {
        period = 'week', // 'week', 'month'
        limit = 10
      } = options;

      const startDate = period === 'week' 
        ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Trending categories
      const trendingCategories = await Question.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$category', count: { $sum: 1 }, totalViews: { $sum: '$views' } } },
        { $sort: { count: -1, totalViews: -1 } },
        { $limit: limit }
      ]);

      // Trending tags
      const trendingTags = await Question.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);

      // Most active users
      const mostActiveUsers = await PointTransaction.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$user',
            activityCount: { $sum: 1 },
            totalPoints: { $sum: '$points' }
          }
        },
        { $sort: { activityCount: -1, totalPoints: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' }
      ]);

      return {
        categories: trendingCategories,
        tags: trendingTags,
        users: mostActiveUsers.map(user => ({
          user: {
            _id: user.user._id,
            username: user.user.username,
            firstName: user.user.profile.firstName,
            lastName: user.user.profile.lastName,
            avatar: user.user.profile.avatar
          },
          activityCount: user.activityCount,
          totalPoints: user.totalPoints
        }))
      };
    } catch (error) {
      console.error('Error getting trending topics:', error);
      throw error;
    }
  }

  // Search leaderboard users
  static async searchUsers(query, options = {}) {
    try {
      const {
        limit = 10,
        offset = 0
      } = options;

      const users = await User.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { 'profile.firstName': { $regex: query, $options: 'i' } },
          { 'profile.lastName': { $regex: query, $options: 'i' } }
        ],
        totalPoints: { $gt: 0 }
      })
      .select('_id username profile.firstName profile.lastName profile.avatar totalPoints reputation')
      .sort({ totalPoints: -1 })
      .skip(offset)
      .limit(limit);

      return users.map((user, index) => ({
        user: {
          _id: user._id,
          username: user.username,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          avatar: user.profile.avatar,
          reputation: user.reputation,
          totalPoints: user.totalPoints
        },
        rank: offset + index + 1
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
}

module.exports = LeaderboardService;
