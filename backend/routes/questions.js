const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticate } = require('../middleware/auth');
const Question = require('../models/Question');

// Public routes
router.get('/', questionController.getQuestions);

router.get('/stats', async (req, res) => {
  try {
    const count = await Question.countDocuments();
    res.json({ totalQuestions: count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.get('/subjects', (req, res) => {
  res.json({ subjects: ['Mathematics', 'Science', 'History', 'Geography', 'English'] });
});

router.get('/:id', questionController.getQuestionById);

// Protected routes
router.post('/', authenticate, questionController.createQuestion);
router.put('/:id', authenticate, questionController.updateQuestion);
router.delete('/:id', authenticate, questionController.deleteQuestion);
router.post('/:id/close', authenticate, questionController.closeQuestion);
router.put('/:id/approve', authenticate, questionController.approveQuestion);
router.put('/:id/reject', authenticate, questionController.rejectQuestion);

module.exports = router;
