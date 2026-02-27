const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation middleware
const validateVote = [
  body('targetType')
    .isIn(['question', 'answer'])
    .withMessage('Target type must be question or answer'),
  body('targetId')
    .isMongoId()
    .withMessage('Invalid target ID'),
  body('voteType')
    .isIn(['up', 'down'])
    .withMessage('Vote type must be up or down')
];

// Protected routes (all voting requires authentication)
router.post('/', voteController.vote);
router.get('/user/:targetType/:targetId', voteController.getUserVote);
router.get('/counts/:targetType/:targetId', voteController.getVoteCounts);
router.get('/history', voteController.getUserVoteHistory);
router.get('/stats', voteController.getVoteStats);

module.exports = router;
