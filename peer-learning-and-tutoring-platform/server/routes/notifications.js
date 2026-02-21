const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createNotification
} = require('../controllers/notificationController');

const router = express.Router();

// Validation rules
const notificationValidation = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('type').isIn(['booking', 'message', 'system', 'reminder', 'payment', 'review', 'session', 'promotion']).withMessage('Invalid notification type'),
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority')
];

// Protected routes
router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);
router.delete('/:id', authenticate, deleteNotification);

// Admin only routes
router.post('/', authenticate, authorize('admin'), notificationValidation, createNotification);

module.exports = router;
