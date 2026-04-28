const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getBookings, 
  updateBookingStatus, 
  updateWhiteboard,
  requestSkip
} = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Peer tutor session booking management
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new tutor session booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tutorId, date, timeSlot, subject]
 *             properties:
 *               tutorId: { type: string }
 *               date: { type: string, format: date }
 *               timeSlot: { type: string }
 *               subject: { type: string }
 *     responses:
 *       201:
 *         description: Booking created successfully
 *   get:
 *     summary: Get all bookings for the logged-in user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 */
router.post('/', authenticate, createBooking);
router.get('/', authenticate, getBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: Update booking status (confirm/cancel/complete)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, updateBookingStatus);

/**
 * @swagger
 * /api/bookings/{id}/whiteboard:
 *   put:
 *     summary: Update session whiteboard data
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/whiteboard', authenticate, updateWhiteboard);
router.post('/:id/skip', authenticate, requestSkip);

module.exports = router;
