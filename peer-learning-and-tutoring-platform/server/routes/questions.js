const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { body } = require('express-validator');
const auth = require('../middleware/auth');

// Public routes
router.get('/', questionController.getQuestions);
router.get('/stats', questionController.getQuestionStats);
router.get('/subjects', questionController.getSubjectsByGrade);
router.get('/:id', questionController.getQuestionById);

// Protected routes
router.post('/', auth, questionController.createQuestion);
router.put('/:id', auth, questionController.updateQuestion);
router.delete('/:id', auth, questionController.deleteQuestion);
router.post('/:id/close', auth, questionController.closeQuestion);

module.exports = router;
