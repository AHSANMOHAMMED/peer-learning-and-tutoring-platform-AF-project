const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getBookings, 
  updateBookingStatus, 
  updateWhiteboard 
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.put('/:id', protect, updateBookingStatus);
router.put('/:id/whiteboard', protect, updateWhiteboard);

module.exports = router;
