const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  getDashboardStatistics,
  getAllUsersAdmin,
  toggleUserStatus,
  changeUserRole,
  getPendingTutors,
  approveTutor,
  rejectTutor,
  getPendingMaterials,
  bulkUserOperations
} = require('../controllers/adminController');

const router = express.Router();

// Admin dashboard statistics
router.get('/statistics', authenticate, authorize('admin'), getDashboardStatistics);

// User management
router.get('/users', authenticate, authorize('admin'), getAllUsersAdmin);
router.put('/users/:id/status', authenticate, authorize('admin'), toggleUserStatus);
router.put('/users/:id/role', authenticate, authorize('admin'), changeUserRole);
router.post('/users/bulk', authenticate, authorize('admin'), bulkUserOperations);

// Tutor management
router.get('/tutors/pending', authenticate, authorize('admin'), getPendingTutors);
router.put('/tutors/:id/approve', authenticate, authorize('admin'), approveTutor);
router.put('/tutors/:id/reject', authenticate, authorize('admin'), rejectTutor);

// Material management
router.get('/materials/pending', authenticate, authorize('admin'), getPendingMaterials);

module.exports = router;

