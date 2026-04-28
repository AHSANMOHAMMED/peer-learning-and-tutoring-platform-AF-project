const express = require('express');
const router = express.Router();
const { 
  getQuestions, 
  getQuestionById, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion, 
  closeQuestion, 
  approveQuestion, 
  rejectQuestion, 
  getQuestionStats,
  getTutorChallenges
} = require('../controllers/questionController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getQuestions);
router.get('/stats', getQuestionStats);
router.get('/subjects', (req, res) => {
  res.json({ subjects: ['Mathematics', 'Science', 'History', 'Geography', 'English'] });
});

// Tutor specific
router.get('/tutor/my-challenges', protect, authorize('tutor', 'admin', 'superadmin'), getTutorChallenges);

// Question detail
router.get('/:id', getQuestionById);

// Protected routes
router.post('/', protect, createQuestion);
router.put('/:id', protect, updateQuestion);
router.delete('/:id', protect, deleteQuestion);
router.post('/:id/close', protect, closeQuestion);

// Admin routes
router.put('/:id/approve', protect, authorize('admin', 'superadmin'), approveQuestion);
router.put('/:id/reject', protect, authorize('admin', 'superadmin'), rejectQuestion);

module.exports = router;
