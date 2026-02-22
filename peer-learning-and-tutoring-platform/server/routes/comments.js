const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation middleware
const validateComment = [
  body('body')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Comment must be between 5 and 1000 characters')
];

// Public routes
router.get('/:targetType/:targetId', commentController.getCommentsByTarget);
router.get('/single/:id', commentController.getCommentById);
router.get('/stats', commentController.getCommentStats);

// Protected routes
router.post('/:targetType/:targetId', commentController.createComment);
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);
router.get('/user/my-comments', commentController.getUserComments);

module.exports = router;
