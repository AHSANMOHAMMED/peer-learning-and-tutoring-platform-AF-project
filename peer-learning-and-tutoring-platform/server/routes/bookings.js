const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  confirmBooking,
  cancelBooking,
  completeBooking,
  getStudentBookings,
  getTutorBookings,
  getUpcomingBookings,
  checkAvailability
} = require('../controllers/bookingController');

const router = express.Router();

// Validation rules
const bookingValidation = [
  body('tutorId').notEmpty().withMessage('Tutor ID is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('grade').optional().isInt({ min: 6, max: 13 }).withMessage('Grade must be 6-13'),
  body('date').notEmpty().withMessage('Date is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('duration').isInt({ min: 30, max: 180 }).withMessage('Duration must be 30-180 minutes'),
  body('timezone').optional().isString().withMessage('Timezone must be a string')
];

const cancelValidation = [
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters')
];

// Protected routes - require authentication
router.get('/', authenticate, authorize('admin'), getBookings);
router.post('/', authenticate, bookingValidation, createBooking);
router.get('/upcoming', authenticate, getUpcomingBookings);
router.post('/check-availability', authenticate, checkAvailability);

// Booking by ID routes
router.get('/:id', authenticate, getBookingById);
router.put('/:id', authenticate, updateBooking);
router.delete('/:id', authenticate, cancelBooking); // Soft delete via cancel

// Booking actions
router.post('/:id/confirm', authenticate, confirmBooking);
router.post('/:id/cancel', authenticate, cancelValidation, cancelBooking);
router.post('/:id/complete', authenticate, completeBooking);

// User-specific bookings
router.get('/student/:studentId', authenticate, getStudentBookings);
router.get('/tutor/:tutorId', authenticate, getTutorBookings);

module.exports = router;
