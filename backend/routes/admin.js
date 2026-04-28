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
const {
  getAdminGames,
  getAdminGameById,
  updateGameTimer,
  updateGameStatus,
  deleteGame
} = require('../controllers/breakTimeGameController');

const router = express.Router();

// Admin dashboard statistics
router.get('/statistics', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), getDashboardStatistics);

// Break Time Games management
router.get('/games', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), getAdminGames);
router.get('/games/:id', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), getAdminGameById);
router.put('/games/:id/timer', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), updateGameTimer);
router.put('/games/:id/status', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), updateGameStatus);
router.delete('/games/:id', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), deleteGame);

// User management
router.get('/users', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), getAllUsersAdmin);
router.post('/users', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), createUser);
router.get('/users/:id', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), getUserById);
router.put('/users/:id', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), updateUser);
router.delete('/users/:id', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), deleteUser);
router.put('/users/:id/status', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), toggleUserStatus);
router.put('/users/:id/role', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), changeUserRole);
router.post('/users/bulk', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), bulkUserOperations);

// Tutor management
router.get('/tutors/pending', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), getPendingTutors);
router.put('/tutors/:id/approve', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), approveTutor);
router.put('/tutors/:id/reject', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), rejectTutor);

// Material management
router.get('/materials/pending', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), getPendingMaterials);

// System operations
router.post('/broadcast', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), broadcastNotification);
router.post('/rotate-keys', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), rotateAccessKeys);

module.exports = router;

