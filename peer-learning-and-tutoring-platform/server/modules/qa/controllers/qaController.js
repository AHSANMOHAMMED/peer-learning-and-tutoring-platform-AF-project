const { QuestionService, AnswerService, VoteService, PointsService, NotificationService, LeaderboardService } = require('../services/qaService');

class QuestionController {
  static async createQuestion(req, res) {
    try {
      const { title, body, tags, category } = req.body;
      // For testing without authentication - use mock user ID
      const userId = req.user?.id || '507f1f77bcf86cd799439011'; // Mock ObjectId

      if (!title || !body || !category) {
        return res.status(400).json({
          success: false,
          message: 'Title, body, and category are required'
        });
      }

      const questionData = {
        title,
        body,
        tags: tags || [],
        category,
        userId
      };

      const question = await QuestionService.createQuestion(questionData);

      res.status(201).json({
        success: true,
        data: question,
        message: 'Question created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getQuestions(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        tags,
        sortBy = 'createdAt',
        sortOrder = -1
      } = req.query;

      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        category,
        tags: tags ? tags.split(',') : undefined,
        sortBy,
        sortOrder: parseInt(sortOrder)
      };

      const result = await QuestionService.getQuestions(filters);

      res.json({
        success: true,
        data: result.questions,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getQuestionById(req, res) {
    try {
      const { id } = req.params;
      const question = await QuestionService.getQuestionById(id);

      res.json({
        success: true,
        data: question
      });
    } catch (error) {
      if (error.message === 'Question not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const question = await QuestionService.updateQuestion(id, userId, updateData);

      res.json({
        success: true,
        data: question,
        message: 'Question updated successfully'
      });
    } catch (error) {
      if (error.message === 'Question not found or unauthorized') {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async deleteQuestion(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await QuestionService.deleteQuestion(id, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error.message === 'Question not found or unauthorized') {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

class AnswerController {
  static async createAnswer(req, res) {
    try {
      const { questionId, body } = req.body;
      // For testing without authentication - use mock user ID
      const userId = req.user?.id || '507f1f77bcf86cd799439011'; // Mock ObjectId

      if (!questionId || !body) {
        return res.status(400).json({
          success: false,
          message: 'Question ID and body are required'
        });
      }

      const answerData = {
        questionId,
        body,
        userId
      };

      const answer = await AnswerService.createAnswer(answerData);

      res.status(201).json({
        success: true,
        data: answer,
        message: 'Answer created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getAnswersByQuestionId(req, res) {
    try {
      const { questionId } = req.params;
      const answers = await AnswerService.getAnswersByQuestionId(questionId);

      res.json({
        success: true,
        data: answers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async updateAnswer(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const answer = await AnswerService.updateAnswer(id, userId, updateData);

      res.json({
        success: true,
        data: answer,
        message: 'Answer updated successfully'
      });
    } catch (error) {
      if (error.message === 'Answer not found or unauthorized') {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async deleteAnswer(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await AnswerService.deleteAnswer(id, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error.message === 'Answer not found or unauthorized') {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async acceptAnswer(req, res) {
    try {
      const { id } = req.params; // answer ID
      const { questionId } = req.body;
      const userId = req.user.id;

      const answer = await AnswerService.acceptAnswer(id, questionId, userId);

      res.json({
        success: true,
        data: answer,
        message: 'Answer accepted successfully'
      });
    } catch (error) {
      if (error.message === 'Question not found or unauthorized' || error.message === 'Answer not found') {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

class VoteController {
  static async vote(req, res) {
    try {
      const { targetType, targetId, value } = req.body;
      // For testing without authentication - use mock user ID
      const userId = req.user?.id || '507f1f77bcf86cd799439011'; // Mock ObjectId

      if (!targetType || !targetId || value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Target type, target ID, and value are required'
        });
      }

      if (!['question', 'answer'].includes(targetType)) {
        return res.status(400).json({
          success: false,
          message: 'Target type must be question or answer'
        });
      }

      if (![1, -1].includes(parseInt(value))) {
        return res.status(400).json({
          success: false,
          message: 'Value must be 1 (upvote) or -1 (downvote)'
        });
      }

      const result = await VoteService.vote(userId, targetType, targetId, parseInt(value));

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

class LeaderboardController {
  static async getLeaderboard(req, res) {
    try {
      const { type = 'overall', timeframe = 'all', limit = 10 } = req.query;

      if (!['overall', 'category'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be overall or category'
        });
      }

      if (!['all', 'weekly', 'monthly'].includes(timeframe)) {
        return res.status(400).json({
          success: false,
          message: 'Timeframe must be all, weekly, or monthly'
        });
      }

      const leaderboard = await LeaderboardService.getLeaderboard(type, timeframe, parseInt(limit));

      res.json({
        success: true,
        data: leaderboard
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getUserRank(req, res) {
    try {
      const { userId } = req.params;
      const rank = await LeaderboardService.getUserRank(userId);

      res.json({
        success: true,
        data: { rank }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

class NotificationController {
  static async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { unreadOnly = false } = req.query;

      const notifications = await NotificationService.getUserNotifications(userId, unreadOnly === 'true');

      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await NotificationService.markAsRead(id, userId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        data: notification,
        message: 'Notification marked as read'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      const result = await NotificationService.markAllAsRead(userId);

      res.json({
        success: true,
        data: result,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

class UserController {
  static async getUserPoints(req, res) {
    try {
      const { userId } = req.params;
      const points = await PointsService.getUserTotalPoints(userId);

      res.json({
        success: true,
        data: { totalPoints: points }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getUserPointHistory(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 10 } = req.query;

      const history = await PointsService.getUserPointHistory(userId, parseInt(limit));

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = {
  QuestionController,
  AnswerController,
  VoteController,
  LeaderboardController,
  NotificationController,
  UserController
};
