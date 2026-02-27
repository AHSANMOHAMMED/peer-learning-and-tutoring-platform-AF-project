const mongoose = require('mongoose');

const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Vote = require('../models/Vote');
const PointTransaction = require('../models/PointTransaction');
const Notification = require('../models/Notification');

class PointsService {
  static async awardPoints(userId, action, subjectId, subjectType, points) {
    try {
      const transaction = new PointTransaction({
        userId,
        action,
        points,
        subject: subjectId,
        subjectType
      });
      
      await transaction.save();
      return transaction;
    } catch (error) {
      throw new Error(`Failed to award points: ${error.message}`);
    }
  }

  static async getUserTotalPoints(userId) {
    try {
      const result = await PointTransaction.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$userId', totalPoints: { $sum: '$points' } } }
      ]);
      
      return result.length > 0 ? result[0].totalPoints : 0;
    } catch (error) {
      throw new Error(`Failed to get user points: ${error.message}`);
    }
  }

  static async getUserPointHistory(userId, limit = 10) {
    try {
      return await PointTransaction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('subject', 'title body')
        .lean();
    } catch (error) {
      throw new Error(`Failed to get point history: ${error.message}`);
    }
  }
}

class NotificationService {
  static async createNotification(userId, type, message, relatedId, relatedType) {
    try {
      const notification = new Notification({
        userId,
        type,
        message,
        relatedId,
        relatedType
      });
      
      await notification.save();
      return notification;
    } catch (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  static async getUserNotifications(userId, unreadOnly = false) {
    try {
      const query = { userId };
      if (unreadOnly) {
        query.isRead = false;
      }
      
      return await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
    } catch (error) {
      throw new Error(`Failed to get notifications: ${error.message}`);
    }
  }

  static async markAsRead(notificationId, userId) {
    try {
      return await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  static async markAllAsRead(userId) {
    try {
      return await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );
    } catch (error) {
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  }
}

class QuestionService {
  static async createQuestion(questionData) {
    try {
      const question = new Question(questionData);
      await question.save();
      
      // Award points for creating question
      await PointsService.awardPoints(
        questionData.userId,
        'question_created',
        question._id,
        'question',
        2
      );
      
      return await Question.findById(question._id).populate('userId', 'name email');
    } catch (error) {
      throw new Error(`Failed to create question: ${error.message}`);
    }
  }

  static async getQuestions(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        tags,
        userId,
        sortBy = 'createdAt',
        sortOrder = -1
      } = filters;

      const query = { isActive: true };
      
      if (category) query.category = category;
      if (tags && tags.length > 0) query.tags = { $in: tags };
      if (userId) query.userId = userId;

      const questions = await Question.find(query)
        .populate('userId', 'name email')
        .sort({ [sortBy]: sortOrder })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const total = await Question.countDocuments(query);

      return {
        questions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get questions: ${error.message}`);
    }
  }

  static async getQuestionById(questionId) {
    try {
      const question = await Question.findById(questionId)
        .populate('userId', 'name email')
        .lean();
      
      if (!question) {
        throw new Error('Question not found');
      }

      // Increment view count
      await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } });

      return question;
    } catch (error) {
      throw new Error(`Failed to get question: ${error.message}`);
    }
  }

  static async updateQuestion(questionId, userId, updateData) {
    try {
      const question = await Question.findOne({ _id: questionId, userId });
      
      if (!question) {
        throw new Error('Question not found or unauthorized');
      }

      Object.assign(question, updateData);
      await question.save();
      
      return await Question.findById(questionId).populate('userId', 'name email');
    } catch (error) {
      throw new Error(`Failed to update question: ${error.message}`);
    }
  }

  static async deleteQuestion(questionId, userId) {
    try {
      const question = await Question.findOne({ _id: questionId, userId });
      
      if (!question) {
        throw new Error('Question not found or unauthorized');
      }

      // Soft delete
      question.isActive = false;
      await question.save();
      
      return { message: 'Question deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete question: ${error.message}`);
    }
  }
}

class AnswerService {
  static async createAnswer(answerData) {
    try {
      const answer = new Answer(answerData);
      await answer.save();
      
      // Award points for creating answer (base points, bonus if accepted)
      await PointsService.awardPoints(
        answerData.userId,
        'answer_created',
        answer._id,
        'answer',
        1
      );
      
      // Notify question author
      const question = await Question.findById(answerData.questionId).select('userId title');
      if (question.userId.toString() !== answerData.userId.toString()) {
        await NotificationService.createNotification(
          question.userId,
          'answer_added',
          `New answer to your question: "${question.title}"`,
          answer._id,
          'answer'
        );
      }
      
      return await Answer.findById(answer._id).populate('userId', 'name email');
    } catch (error) {
      throw new Error(`Failed to create answer: ${error.message}`);
    }
  }

  static async getAnswersByQuestionId(questionId) {
    try {
      return await Answer.find({ questionId, isActive: true })
        .populate('userId', 'name email')
        .sort({ createdAt: 1 })
        .lean();
    } catch (error) {
      throw new Error(`Failed to get answers: ${error.message}`);
    }
  }

  static async updateAnswer(answerId, userId, updateData) {
    try {
      const answer = await Answer.findOne({ _id: answerId, userId });
      
      if (!answer) {
        throw new Error('Answer not found or unauthorized');
      }

      Object.assign(answer, updateData);
      await answer.save();
      
      return await Answer.findById(answerId).populate('userId', 'name email');
    } catch (error) {
      throw new Error(`Failed to update answer: ${error.message}`);
    }
  }

  static async deleteAnswer(answerId, userId) {
    try {
      const answer = await Answer.findOne({ _id: answerId, userId });
      
      if (!answer) {
        throw new Error('Answer not found or unauthorized');
      }

      // Soft delete
      answer.isActive = false;
      await answer.save();
      
      return { message: 'Answer deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete answer: ${error.message}`);
    }
  }

  static async acceptAnswer(answerId, questionId, userId) {
    try {
      // Verify user owns the question
      const question = await Question.findOne({ _id: questionId, userId });
      if (!question) {
        throw new Error('Question not found or unauthorized');
      }

      // Unaccept any previously accepted answer
      await Answer.updateMany(
        { questionId, isAccepted: true },
        { isAccepted: false }
      );

      // Accept this answer
      const answer = await Answer.findByIdAndUpdate(
        answerId,
        { isAccepted: true },
        { new: true }
      ).populate('userId', 'name email');

      if (!answer) {
        throw new Error('Answer not found');
      }

      // Award bonus points for accepted answer
      await PointsService.awardPoints(
        answer.userId._id,
        'answer_accepted',
        answerId,
        'answer',
        15
      );

      // Notify answer author
      await NotificationService.createNotification(
        answer.userId._id,
        'answer_accepted',
        'Your answer has been accepted!',
        answerId,
        'answer'
      );

      return answer;
    } catch (error) {
      throw new Error(`Failed to accept answer: ${error.message}`);
    }
  }
}

class VoteService {
  static async vote(userId, targetType, targetId, value) {
    try {
      // Check for existing vote
      const existingVote = await Vote.findOne({
        userId,
        targetType,
        targetId
      });

      let pointsAwarded = 0;
      let notificationMessage = '';

      if (existingVote) {
        // Update existing vote
        const oldValue = existingVote.value;
        existingVote.value = value;
        await existingVote.save();

        // Calculate point difference
        const pointDiff = value - oldValue;
        if (targetType === 'answer' && pointDiff !== 0) {
          pointsAwarded = pointDiff * 10; // 10 points per upvote on answer
          notificationMessage = pointDiff > 0 ? 
            'Your answer received an upvote!' : 
            'Your answer received a downvote';
        }
      } else {
        // Create new vote
        const vote = new Vote({
          userId,
          targetType,
          targetId,
          value
        });
        await vote.save();

        // Award points for new vote
        if (targetType === 'answer' && value === 1) {
          pointsAwarded = 10; // 10 points for upvote on answer
          notificationMessage = 'Your answer received an upvote!';
        }
      }

      // Update vote count on target
      if (targetType === 'question') {
        await Question.findByIdAndUpdate(targetId, {
          $inc: { votesCount: existingVote ? value - existingVote.value : value }
        });
      } else if (targetType === 'answer') {
        await Answer.findByIdAndUpdate(targetId, {
          $inc: { votesCount: existingVote ? value - existingVote.value : value }
        });
      }

      // Award points if applicable
      if (pointsAwarded !== 0) {
        const target = await this.getTargetAuthor(targetType, targetId);
        if (target) {
          await PointsService.awardPoints(
            target.userId,
            targetType === 'answer' ? 
              (pointsAwarded > 0 ? 'answer_upvoted' : 'answer_downvoted') :
              (pointsAwarded > 0 ? 'question_upvoted' : 'question_downvoted'),
            targetId,
            targetType,
            pointsAwarded
          );

          // Notify the target author
          await NotificationService.createNotification(
            target.userId,
            'vote_received',
            notificationMessage,
            targetId,
            targetType
          );
        }
      }

      return { message: 'Vote recorded successfully' };
    } catch (error) {
      throw new Error(`Failed to vote: ${error.message}`);
    }
  }

  static async getTargetAuthor(targetType, targetId) {
    try {
      if (targetType === 'question') {
        const question = await Question.findById(targetId).select('userId');
        return question;
      } else if (targetType === 'answer') {
        const answer = await Answer.findById(targetId).select('userId');
        return answer;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

class LeaderboardService {
  static async getLeaderboard(type = 'overall', timeframe = 'all', limit = 10) {
    try {
      const matchStage = {};
      
      // Apply timeframe filter
      if (timeframe !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (timeframe) {
          case 'weekly':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'monthly':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        
        matchStage.createdAt = { $gte: startDate };
      }

      // Apply category filter for overall leaderboard
      if (type === 'category' && type !== 'overall') {
        matchStage.action = { $in: ['question_created', 'answer_upvoted', 'answer_accepted'] };
      }

      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$userId',
            totalPoints: { $sum: '$points' },
            questionCount: {
              $sum: { $cond: [{ $eq: ['$action', 'question_created'] }, 1, 0] }
            },
            answerCount: {
              $sum: { $cond: [{ $eq: ['$action', 'answer_upvoted'] }, 1, 0] }
            }
          }
        },
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
            userId: '$_id',
            username: '$user.username',
            email: '$user.email',
            totalPoints: '$totalPoints',
            questionCount: '$questionCount',
            answerCount: '$answerCount'
          }
        },
        { $sort: { totalPoints: -1 } },
        { $limit: limit }
      ];

      // Add rank calculation
      const results = await PointTransaction.aggregate(pipeline);
      
      // Calculate ranks
      results.forEach((user, index) => {
        user.rank = index + 1;
      });

      return results;
    } catch (error) {
      throw new Error(`Failed to get leaderboard: ${error.message}`);
    }
  }

  static async getUserRank(userId) {
    try {
      const pipeline = [
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$userId',
            totalPoints: { $sum: '$points' }
          }
        },
        {
          $lookup: {
            from: 'pointtransactions',
            let: { userPoints: '$totalPoints' },
            pipeline: [
              {
                $group: {
                  _id: '$userId',
                  totalPoints: { $sum: '$points' }
                }
              },
              {
                $match: {
                  totalPoints: { $gt: '$$userPoints' }
                }
              },
              {
                $count: 'higherCount'
              }
            ],
            as: 'higherUsers'
          }
        },
        {
          $project: {
            rank: { $add: [1, { $ifNull: [{ $arrayElemAt: ['$higherUsers.higherCount', 0] }, 0] }] }
          }
        }
      ];

      const result = await PointTransaction.aggregate(pipeline);
      return result.length > 0 ? result[0].rank : null;
    } catch (error) {
      throw new Error(`Failed to get user rank: ${error.message}`);
    }
  }
}

module.exports = {
  QuestionService,
  AnswerService,
  VoteService,
  PointsService,
  NotificationService,
  LeaderboardService
};
