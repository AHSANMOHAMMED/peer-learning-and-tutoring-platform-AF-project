const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getTutors,
  getTutorById,
  createTutor,
  updateTutor,
  deleteTutor,
  addAvailability,
  removeAvailability,
  addSubject,
  removeSubject,
  getTutorReviews,
  getTutorStats,
  verifyTutor,
  getFeaturedTutors,
  getTopRatedTutors,
  suspendTutor,
  activateTutor
} = require('../controllers/tutorController');

const router = express.Router();

// Validation rules
const tutorValidation = [
  body('bio').optional().isLength({ max: 2000 }).withMessage('Bio must be less than 2000 characters'),
  body('teachingStyle').optional().isLength({ max: 1000 }).withMessage('Teaching style must be less than 1000 characters'),
  body('hourlyRate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).withMessage('Invalid currency')
];

const subjectValidation = [
  body('name').notEmpty().withMessage('Subject name is required'),
  body('gradeLevels').isArray().withMessage('Grade levels must be an array'),
  body('hourlyRate').isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
];

const availabilityValidation = [
  body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be 0-6'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format'),
  body('isRecurring').optional().isBoolean().withMessage('Is recurring must be a boolean')
];

// Public routes
router.get('/', getTutors);
router.get('/search', getTutors);
router.get('/featured', getFeaturedTutors);
router.get('/top-rated', getTopRatedTutors);
router.get('/:id', getTutorById);
router.get('/:id/reviews', getTutorReviews);
router.get('/:id/stats', getTutorStats);

// Protected routes - require authentication
router.post('/', authenticate, tutorValidation, createTutor);
router.put('/:id', authenticate, tutorValidation, updateTutor);
router.delete('/:id', authenticate, deleteTutor);

// Availability management
router.post('/:id/availability', authenticate, availabilityValidation, addAvailability);
router.delete('/:id/availability/:slotId', authenticate, removeAvailability);

// Subject management
router.post('/:id/subjects', authenticate, subjectValidation, addSubject);
router.delete('/:id/subjects/:subjectId', authenticate, removeSubject);

// Admin only routes
router.post('/:id/verify', authenticate, authorize('admin'), verifyTutor);
router.put('/:id/suspend', authenticate, authorize('admin'), [
  body('reason').notEmpty().withMessage('Suspension reason is required')
], suspendTutor);
router.put('/:id/activate', authenticate, authorize('admin'), activateTutor);

module.exports = router;
