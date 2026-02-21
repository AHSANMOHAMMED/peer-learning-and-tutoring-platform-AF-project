const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Booking = require('../models/Booking');

const router = express.Router();

// Get recent payments for parent
router.get('/parent/recent', authenticate, authorize('parent'), async (req, res) => {
  try {
    const parentId = req.userId;
    
    // For now, return mock data - in production this would query a Payment model
    // or aggregate from bookings with payment status
    const mockPayments = [
      {
        _id: '1',
        amount: 25.00,
        status: 'completed',
        tutorName: 'John Doe',
        date: new Date(Date.now() - 86400000).toISOString() // yesterday
      },
      {
        _id: '2',
        amount: 30.00,
        status: 'completed',
        tutorName: 'Jane Smith',
        date: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      }
    ];
    
    res.json({
      success: true,
      data: {
        payments: mockPayments
      }
    });
  } catch (error) {
    console.error('Get parent payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
});

module.exports = router;
