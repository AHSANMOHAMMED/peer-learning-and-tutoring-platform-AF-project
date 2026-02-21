const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  getSettings,
  updateSettings,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAdminStatistics,
  getParentChildren,
  getStudentProgress
} = require('../controllers/userController');

const router = express.Router();

// Validation rules
const profileValidation = [
  body('profile.firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('profile.lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('profile.grade').optional().isInt({ min: 6, max: 13 }).withMessage('Grade must be 6-13'),
  body('profile.school').optional().trim(),
  body('profile.phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('profile.bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters')
];

// Current user routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, profileValidation, updateProfile);
router.post('/avatar', authenticate, uploadAvatar);
router.get('/settings', authenticate, getSettings);
router.put('/settings', authenticate, updateSettings);

// Admin only routes
router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get('/admin/statistics', authenticate, authorize('admin'), getAdminStatistics);
router.get('/:id', authenticate, authorize('admin'), getUserById);
router.put('/:id', authenticate, authorize('admin'), updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

// Parent only routes
router.get('/parent/children', authenticate, authorize('parent'), getParentChildren);

// Parent or admin - get student progress
router.get('/student/:id/progress', authenticate, authorize('parent', 'admin'), getStudentProgress);

module.exports = router;
