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
  bulkUserOperations,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  broadcastNotification,
  rotateAccessKeys
} = require('../controllers/adminController');

const router = express.Router();

// Admin dashboard statistics
router.get('/statistics', authenticate, authorize('admin', 'superadmin'), getDashboardStatistics);

// User management
router.get('/users', authenticate, authorize('admin', 'superadmin'), getAllUsersAdmin);
router.post('/users', authenticate, authorize('admin', 'superadmin'), createUser);
router.get('/users/:id', authenticate, authorize('admin', 'superadmin'), getUserById);
router.put('/users/:id', authenticate, authorize('admin', 'superadmin'), updateUser);
router.delete('/users/:id', authenticate, authorize('admin', 'superadmin'), deleteUser);
router.put('/users/:id/status', authenticate, authorize('admin', 'superadmin'), toggleUserStatus);
router.put('/users/:id/role', authenticate, authorize('admin', 'superadmin'), changeUserRole);
router.post('/users/bulk', authenticate, authorize('admin', 'superadmin'), bulkUserOperations);

// Tutor management
router.get('/tutors/pending', authenticate, authorize('admin', 'superadmin'), getPendingTutors);
router.put('/tutors/:id/approve', authenticate, authorize('admin', 'superadmin'), approveTutor);
router.put('/tutors/:id/reject', authenticate, authorize('admin', 'superadmin'), rejectTutor);

// Material management
router.get('/materials/pending', authenticate, authorize('admin', 'superadmin'), getPendingMaterials);

// System operations
router.post('/broadcast', authenticate, authorize('admin', 'superadmin'), broadcastNotification);
router.post('/rotate-keys', authenticate, authorize('admin', 'superadmin'), rotateAccessKeys);

module.exports = router;

