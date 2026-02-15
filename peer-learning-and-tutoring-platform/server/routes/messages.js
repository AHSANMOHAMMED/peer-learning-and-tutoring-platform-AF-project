const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  getUnreadCount,
  archiveConversation,
  deleteConversation
} = require('../controllers/messageController');

const router = express.Router();

// Validation rules
const messageValidation = [
  body('content').optional().isLength({ max: 2000 }).withMessage('Message must be less than 2000 characters'),
  body('attachments').optional().isArray().withMessage('Attachments must be an array')
];

const conversationValidation = [
  body('participantId').notEmpty().withMessage('Participant ID is required')
];

// Conversation routes
router.get('/conversations', authenticate, getConversations);
router.post('/conversations', authenticate, conversationValidation, getOrCreateConversation);
router.get('/conversations/:id/messages', authenticate, getMessages);
router.post('/conversations/:id/messages', authenticate, messageValidation, sendMessage);
router.post('/conversations/:id/archive', authenticate, archiveConversation);
router.delete('/conversations/:id', authenticate, deleteConversation);

// Message routes
router.put('/messages/:id/read', authenticate, markMessageAsRead);
router.delete('/messages/:id', authenticate, deleteMessage);

// Unread count
router.get('/unread-count', authenticate, getUnreadCount);

module.exports = router;
