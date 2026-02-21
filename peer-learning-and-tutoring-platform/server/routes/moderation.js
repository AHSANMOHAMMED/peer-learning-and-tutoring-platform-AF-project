const express = require('express');
const { body, param, query } = require('express-validator');
const moderationController = require('../controllers/moderationController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Submit a report
router.post(
  '/reports',
  authenticate,
  [
    body('reportedType').isIn(['user', 'material', 'session', 'review', 'message']).withMessage('Invalid reported type'),
    body('reportedId').isMongoId().withMessage('Invalid reported ID'),
    body('reason').isIn(['inappropriate', 'spam', 'harassment', 'copyright', 'fake', 'misinformation', 'other']).withMessage('Invalid reason'),
    body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description must be 1-1000 characters'),
    body('evidence').optional().isArray().withMessage('Evidence must be an array'),
    body('evidence.*').optional().isURL().withMessage('Evidence must be valid URLs')
  ],
  validate,
  moderationController.submitReport
);

// Get reports for moderators
router.get(
  '/reports',
  authenticate,
  [
    query('status').optional().isIn(['pending', 'under_review', 'resolved', 'dismissed']).withMessage('Invalid status'),
    query('assignedTo').optional().isMongoId().withMessage('Invalid assignedTo ID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  moderationController.getReports
);

// Get report details
router.get(
  '/reports/:id',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid report ID')
  ],
  validate,
  moderationController.getReportById
);

// Assign report to moderator
router.put(
  '/reports/:id/assign',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid report ID'),
    body('moderatorId').isMongoId().withMessage('Invalid moderator ID')
  ],
  validate,
  moderationController.assignReport
);

// Resolve report
router.put(
  '/reports/:id/resolve',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid report ID'),
    body('action').isIn(['no_action', 'warning', 'content_removed', 'user_suspended', 'user_banned', 'content_flagged']).withMessage('Invalid action'),
    body('notes').optional().trim().isLength({ max: 2000 }).withMessage('Notes must be less than 2000 characters')
  ],
  validate,
  moderationController.resolveReport
);

// Dismiss report
router.put(
  '/reports/:id/dismiss',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid report ID'),
    body('notes').trim().isLength({ min: 1, max: 2000 }).withMessage('Notes must be 1-2000 characters')
  ],
  validate,
  moderationController.dismissReport
);

// Escalate report
router.put(
  '/reports/:id/escalate',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid report ID'),
    body('reason').trim().isLength({ min: 1, max: 500 }).withMessage('Reason must be 1-500 characters'),
    body('level').optional().isInt({ min: 1, max: 5 }).withMessage('Level must be between 1 and 5')
  ],
  validate,
  moderationController.escalateReport
);

// Get moderator actions
router.get(
  '/actions',
  authenticate,
  [
    query('moderatorId').optional().isMongoId().withMessage('Invalid moderator ID'),
    query('actionType').optional().isIn(['warning', 'suspend', 'ban', 'delete_content', 'approve_content', 'flag_content', 'unflag_content', 'restrict_access', 'verify_user', 'unverify_user', 'escalate', 'assign_case', 'close_case', 'note_only']).withMessage('Invalid action type'),
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'needs_review']).withMessage('Invalid status'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  moderationController.getModeratorActions
);

// Get pending appeals
router.get(
  '/appeals/pending',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  moderationController.getPendingAppeals
);

// Review appeal
router.put(
  '/appeals/:id/review',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid appeal ID'),
    body('status').isIn(['accepted', 'rejected']).withMessage('Invalid status'),
    body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
  ],
  validate,
  moderationController.reviewAppeal
);

// Get moderation statistics
router.get(
  '/statistics',
  authenticate,
  [
    query('timeframe').optional().isIn(['7d', '30d', '90d']).withMessage('Invalid timeframe')
  ],
  validate,
  moderationController.getModerationStats
);

module.exports = router;
