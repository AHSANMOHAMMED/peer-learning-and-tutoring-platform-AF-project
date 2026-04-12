const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const voteController = require('../controllers/voteController');

// Vote routes
router.post('/', authenticate, voteController.vote);
router.get('/user/:targetType/:targetId', authenticate, voteController.getUserVote);
router.get('/counts/:targetType/:targetId', voteController.getVoteCounts);
router.get('/history', authenticate, voteController.getUserVoteHistory);
router.get('/history/:targetType', authenticate, voteController.getUserVoteHistory);
router.get('/stats', voteController.getVoteStats);

module.exports = router;
