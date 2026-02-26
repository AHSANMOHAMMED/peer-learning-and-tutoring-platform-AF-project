const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation middleware
const validateAnswer = [
  body('body')
    .trim()
    .isLength({ min: 30, max: 10000 })
    .withMessage('Answer must be between 30 and 10000 characters')
];

// Public routes
router.get('/question/:questionId', answerController.getAnswersByQuestion);
router.get('/stats', answerController.getAnswerStats);
router.get('/:id', answerController.getAnswerById);

// Protected routes
router.post('/question/:questionId', answerController.createAnswer);
router.put('/:id', answerController.updateAnswer);
router.delete('/:id', answerController.deleteAnswer);
router.post('/:id/accept', answerController.acceptAnswer);

module.exports = router;
