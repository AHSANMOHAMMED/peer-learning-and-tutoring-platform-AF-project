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
  deleteUser
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

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and management
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get logged in user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data retrieved successfully
 *   put:
 *     summary: Update logged in user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile:
 *                 type: object
 *                 properties:
 *                   firstName: { type: string }
 *                   lastName: { type: string }
 *                   bio: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, profileValidation, updateProfile);

/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     summary: Upload profile avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 */
router.post('/avatar', authenticate, uploadAvatar);

/**
 * @swagger
 * /api/users/settings:
 *   get:
 *     summary: Get user settings
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update user settings
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/settings', authenticate, getSettings);
router.put('/settings', authenticate, updateSettings);

// Admin only routes
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: "[Admin] Get all users"
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/', authenticate, authorize('admin'), getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: "[Admin] Get user by ID"
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: "[Admin] Update user by ID"
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: "[Admin] Delete user"
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, authorize('admin'), getUserById);
router.put('/:id', authenticate, authorize('admin'), updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;
