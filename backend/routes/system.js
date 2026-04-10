const express = require('express');
const router = express.Router();
const { getGlobalAnalytics } = require('../controllers/systemController');
const { protect, authorize } = require('../middleware/auth');

// Super Admin analytics route
router.get('/analytics', protect, authorize('admin', 'superadmin'), getGlobalAnalytics);

module.exports = router;
