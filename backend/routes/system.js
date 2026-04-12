const express = require('express');
const router = express.Router();
const { getGlobalAnalytics, getPulseStats } = require('../controllers/systemController');
const { protect, authorize } = require('../middleware/auth');

// Super Admin analytics route
router.get('/analytics', protect, authorize('admin', 'superadmin'), getGlobalAnalytics);

// Real-time pulse stats for all authenticated users
router.get('/pulse', protect, getPulseStats);

module.exports = router;
