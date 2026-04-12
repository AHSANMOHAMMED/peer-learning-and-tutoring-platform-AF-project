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
router.get('/statistics', authenticate, authorize('admin', 'superadmin'), getDashboardStatistics);

// User management
router.get('/users', authenticate, authorize('admin', 'superadmin'), getAllUsersAdmin);
router.put('/users/:id/status', authenticate, authorize('admin', 'superadmin'), toggleUserStatus);
router.put('/users/:id/role', authenticate, authorize('admin', 'superadmin'), changeUserRole);
router.post('/users/bulk', authenticate, authorize('admin', 'superadmin'), bulkUserOperations);

// Tutor management
router.get('/tutors/pending', authenticate, authorize('admin', 'superadmin'), getPendingTutors);
router.put('/tutors/:id/approve', authenticate, authorize('admin', 'superadmin'), approveTutor);
router.put('/tutors/:id/reject', authenticate, authorize('admin', 'superadmin'), rejectTutor);

// Material management
router.get('/materials/pending', authenticate, authorize('admin', 'superadmin'), getPendingMaterials);

module.exports = router;

