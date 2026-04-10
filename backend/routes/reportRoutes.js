const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, reportController.createReport);
router.get('/', protect, authorize('admin', 'superadmin'), reportController.getReports);
router.patch('/:id/status', protect, authorize('admin', 'superadmin'), reportController.updateReportStatus);

module.exports = router;
