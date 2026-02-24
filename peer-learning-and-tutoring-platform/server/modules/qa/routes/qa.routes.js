const express = require('express');
const router = express.Router();
const {
  QuestionController,
  AnswerController,
  VoteController,
  LeaderboardController,
  NotificationController,
  UserController
} = require('../controllers/qaController');

// Question Routes
router.post('/questions', QuestionController.createQuestion);
router.get('/questions', QuestionController.getQuestions);
router.get('/questions/:id', QuestionController.getQuestionById);
router.put('/questions/:id', QuestionController.updateQuestion);
router.delete('/questions/:id', QuestionController.deleteQuestion);

// Answer Routes
router.post('/answers', AnswerController.createAnswer);
router.get('/answers/:questionId', AnswerController.getAnswersByQuestionId);
router.put('/answers/:id', AnswerController.updateAnswer);
router.delete('/answers/:id', AnswerController.deleteAnswer);
router.post('/answers/:id/accept', AnswerController.acceptAnswer);

// Vote Routes
router.post('/vote', VoteController.vote);

// Leaderboard Routes
router.get('/leaderboard/overall', LeaderboardController.getLeaderboard);
router.get('/leaderboard/:category', LeaderboardController.getLeaderboard);
router.get('/leaderboard/user/:userId', LeaderboardController.getUserRank);

// Notification Routes
router.get('/notifications', NotificationController.getNotifications);
router.put('/notifications/:id/read', NotificationController.markAsRead);
router.put('/notifications/read-all', NotificationController.markAllAsRead);

// User Points Routes
router.get('/users/:userId/points', UserController.getUserPoints);
router.get('/users/:userId/points/history', UserController.getUserPointHistory);

module.exports = router;
