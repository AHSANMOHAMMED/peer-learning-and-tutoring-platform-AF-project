const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  register,
  login,
  getCurrentUser,
  logout,
  changePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['student', 'tutor', 'parent', 'admin'])
    .withMessage('Invalid role'),
  body('profile.firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim(),
  body('profile.lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim(),
  body('profile.grade')
    .optional()
    .isInt({ min: 6, max: 13 })
    .withMessage('Grade must be between 6 and 13')
];

const loginValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);
router.put('/change-password', authenticate, changePasswordValidation, validate, changePassword);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);

module.exports = router;
