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
  getMyQuestions,
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
router.get('/tutor/my-challenges', protect, authorize('tutor', 'mentor', 'superadmin', 'websiteAdmin'), getTutorChallenges);
router.get('/user/my', protect, getMyQuestions);

// Question detail
router.get('/:id', getQuestionById);

// Protected routes
router.post('/', protect, createQuestion);
router.put('/:id', protect, updateQuestion);
router.delete('/:id', protect, deleteQuestion);
router.post('/:id/close', protect, closeQuestion);

// Admin routes
router.put('/:id/approve', protect, authorize('websiteAdmin', 'superadmin'), approveQuestion);
router.put('/:id/reject', protect, authorize('websiteAdmin', 'superadmin'), rejectQuestion);

module.exports = router;
