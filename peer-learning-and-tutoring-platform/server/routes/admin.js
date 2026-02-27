const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getDashboardStatistics } = require('../controllers/adminController');

const router = express.Router();

// Admin dashboard statistics
router.get('/statistics', authenticate, authorize('admin'), getDashboardStatistics);

module.exports = router;

