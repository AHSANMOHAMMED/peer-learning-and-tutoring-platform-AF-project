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
const ADMIN_ROLES = ['admin', 'websiteAdmin', 'superadmin'];

// Admin dashboard statistics
router.get('/statistics', authenticate, authorize(ADMIN_ROLES), getDashboardStatistics);

// Break Time Games management
router.get('/games', authenticate, authorize(ADMIN_ROLES), getAdminGames);
router.get('/games/:id', authenticate, authorize(ADMIN_ROLES), getAdminGameById);
router.put('/games/:id/timer', authenticate, authorize(ADMIN_ROLES), updateGameTimer);
router.put('/games/:id/status', authenticate, authorize(ADMIN_ROLES), updateGameStatus);
router.delete('/games/:id', authenticate, authorize(ADMIN_ROLES), deleteGame);

// User management
router.get('/users', authenticate, authorize(ADMIN_ROLES), getAllUsersAdmin);
router.post('/users', authenticate, authorize(ADMIN_ROLES), createUser);
router.get('/users/:id', authenticate, authorize(ADMIN_ROLES), getUserById);
router.put('/users/:id', authenticate, authorize(ADMIN_ROLES), updateUser);
router.delete('/users/:id', authenticate, authorize(ADMIN_ROLES), deleteUser);
router.put('/users/:id/status', authenticate, authorize(ADMIN_ROLES), toggleUserStatus);
router.put('/users/:id/role', authenticate, authorize(ADMIN_ROLES), changeUserRole);
router.post('/users/bulk', authenticate, authorize(ADMIN_ROLES), bulkUserOperations);

// Tutor management
router.get('/tutors/pending', authenticate, authorize(ADMIN_ROLES), getPendingTutors);
router.put('/tutors/:id/approve', authenticate, authorize(ADMIN_ROLES), approveTutor);
router.put('/tutors/:id/reject', authenticate, authorize(ADMIN_ROLES), rejectTutor);

// Material management
router.get('/materials/pending', authenticate, authorize(ADMIN_ROLES), getPendingMaterials);

// System operations
router.post('/broadcast', authenticate, authorize(ADMIN_ROLES), broadcastNotification);
router.post('/rotate-keys', authenticate, authorize(ADMIN_ROLES), rotateAccessKeys);

module.exports = router;

