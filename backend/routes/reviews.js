const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  addTutorResponse,
  markHelpful,
  reportReview,
  getTutorReviews
} = require('../controllers/reviewController');

const router = express.Router();

// Validation rules
const reviewValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('rating.overall').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be 1-5'),
  body('rating.teaching').optional().isInt({ min: 1, max: 5 }).withMessage('Teaching rating must be 1-5'),
  body('rating.knowledge').optional().isInt({ min: 1, max: 5 }).withMessage('Knowledge rating must be 1-5'),
  body('rating.communication').optional().isInt({ min: 1, max: 5 }).withMessage('Communication rating must be 1-5'),
  body('rating.punctuality').optional().isInt({ min: 1, max: 5 }).withMessage('Punctuality rating must be 1-5'),
  body('comment').isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters')
];

const responseValidation = [
  body('comment').isLength({ min: 1, max: 500 }).withMessage('Response must be 1-500 characters')
];

const reportValidation = [
  body('reason').notEmpty().withMessage('Reason is required')
];

// Public routes
router.get('/', getReviews);
router.get('/tutor/:tutorId', getTutorReviews);

// Protected routes
router.get('/:id', authenticate, getReviewById);
router.post('/', authenticate, reviewValidation, createReview);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

// Review actions
router.post('/:id/response', authenticate, responseValidation, addTutorResponse);
router.post('/:id/helpful', authenticate, markHelpful);
router.post('/:id/report', authenticate, reportValidation, reportReview);

module.exports = router;
