const express = require('express');
const router = express.Router();
const ParentDashboardService = require('../services/ParentDashboardService');
const AIModerationService = require('../services/AIModerationService');
const { authenticate } = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');

// ==========================================
// AI Moderation Routes
// ==========================================

/**
 * @route   POST /api/moderation/analyze
 * @desc    Analyze content for moderation
 * @access  Private
 */
router.post('/moderation/analyze', [
  authenticate,
  body('content').notEmpty().trim(),
  body('context').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, context } = req.body;

    const result = await AIModerationService.analyzeContent(content, context, {
      userId: req.user._id
    });

    res.json({
      success: true,
      message: 'Content analyzed',
      data: result
    });

  } catch (error) {
    console.error('Error analyzing content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze content',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/moderation/chat
 * @desc    Moderate chat message in real-time
 * @access  Private
 */
router.post('/moderation/chat', [
  authenticate,
  body('message').notEmpty().trim(),
  body('roomId').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { message, roomId } = req.body;

    const result = await AIModerationService.moderateChatMessage(
      message,
      roomId,
      req.user._id
    );

    res.json({
      success: true,
      message: 'Message moderated',
      data: result
    });

  } catch (error) {
    console.error('Error moderating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate message',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/moderation/academic-integrity
 * @desc    Check for academic integrity
 * @access  Private
 */
router.post('/moderation/academic-integrity', [
  authenticate,
  body('question').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { question } = req.body;

    const result = await AIModerationService.checkAcademicIntegrity(
      question,
      'homework_help'
    );

    res.json({
      success: true,
      message: 'Academic integrity check complete',
      data: result
    });

  } catch (error) {
    console.error('Error checking academic integrity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/moderation/stats
 * @desc    Get moderation statistics (Admin)
 * @access  Private (Admin)
 */
router.get('/moderation/stats', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { timeRange = '24h' } = req.query;

    const stats = await AIModerationService.getModerationStats(timeRange);

    res.json({
      success: true,
      message: 'Moderation stats retrieved',
      data: stats
    });

  } catch (error) {
    console.error('Error getting moderation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stats',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/moderation/queue
 * @desc    Get moderation queue (Admin)
 * @access  Private (Admin/Moderator)
 */
router.get('/moderation/queue', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { limit = 50 } = req.query;

    const queue = await AIModerationService.getModerationQueue(parseInt(limit));

    res.json({
      success: true,
      message: 'Moderation queue retrieved',
      data: { queue }
    });

  } catch (error) {
    console.error('Error getting moderation queue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue',
      error: error.message
    });
  }
});

// ==========================================
// Parent Dashboard Routes
// ==========================================

/**
 * @route   POST /api/parent/link-student
 * @desc    Link parent to student
 * @access  Private (Parents)
 */
router.post('/parent/link-student', [
  authenticate,
  body('studentEmail').isEmail(),
  body('relationship').optional().isIn(['parent', 'guardian', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { studentEmail, relationship } = req.body;

    const result = await ParentDashboardService.linkParentToStudent(
      req.user._id,
      studentEmail,
      relationship
    );

    res.json({
      success: true,
      message: 'Link request sent',
      data: result
    });

  } catch (error) {
    console.error('Error linking student:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to link student',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/parent/admin/link-requests
 * @desc    Get pending parent-student link requests (Admin)
 * @access  Private (Admin)
 */
router.get('/parent/admin/link-requests', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can access parent link requests'
      });
    }

    const requests = await ParentDashboardService.getPendingLinkRequestsForAdmin();

    res.json({
      success: true,
      message: 'Pending parent link requests retrieved',
      data: { requests }
    });
  } catch (error) {
    console.error('Error getting pending parent link requests:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve pending requests',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/parent/admin/review-link/:linkId
 * @desc    Admin approves/rejects parent link request
 * @access  Private (Admin)
 */
router.post('/parent/admin/review-link/:linkId', [
  authenticate,
  param('linkId').isMongoId(),
  body('approve').isBoolean(),
  body('reviewNote').optional().isString().trim().isLength({ max: 500 }),
  body('permissions').optional().isObject()
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can review parent link requests'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { linkId } = req.params;
    const { approve, reviewNote, permissions } = req.body;

    const result = await ParentDashboardService.reviewLinkRequestByAdmin(
      linkId,
      req.user._id,
      approve,
      reviewNote,
      permissions
    );

    res.json({
      success: true,
      message: approve ? 'Link approved by admin' : 'Link rejected by admin',
      data: result
    });
  } catch (error) {
    console.error('Error reviewing parent link request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to review link request',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/parent/student/link-requests
 * @desc    Get pending parent link requests for student
 * @access  Private (Student)
 */
router.get('/parent/student/link-requests', authenticate, async (req, res) => {
  try {
    const requests = await ParentDashboardService.getPendingLinkRequestsForStudent(req.user._id);
    res.json({
      success: true,
      message: 'Pending link requests retrieved',
      data: { requests }
    });
  } catch (error) {
    console.error('Error getting student pending requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve link requests',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/parent/student/respond-link/:linkId
 * @desc    Student responds to parent link request
 * @access  Private (Student)
 */
router.post('/parent/student/respond-link/:linkId', [
  authenticate,
  param('linkId').isMongoId(),
  body('approve').isBoolean(),
  body('permissions').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { linkId } = req.params;
    const { approve, permissions } = req.body;

    const result = await ParentDashboardService.respondToLinkRequest(
      linkId,
      req.user._id,
      approve,
      permissions
    );

    res.json({
      success: true,
      message: approve ? 'Link approved' : 'Link rejected',
      data: result
    });
  } catch (error) {
    console.error('Error responding to link request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to respond to link request',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/parent/link-requests
 * @desc    Get pending link requests sent by parent
 * @access  Private (Parent)
 */
router.get('/parent/link-requests', authenticate, async (req, res) => {
  try {
    const requests = await ParentDashboardService.getPendingLinkRequestsForParent(req.user._id);
    res.json({
      success: true,
      message: 'Pending link requests retrieved',
      data: { requests }
    });
  } catch (error) {
    console.error('Error getting parent pending requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve link requests',
      error: error.message
    });
  }
});



/**
 * @route   GET /api/parent/students
 * @desc    Get parent's linked students
 * @access  Private (Parents)
 */
router.get('/parent/students', authenticate, async (req, res) => {
  try {
    const students = await ParentDashboardService.getLinkedStudents(req.user._id);

    res.json({
      success: true,
      message: 'Linked students retrieved',
      data: { students }
    });

  } catch (error) {
    console.error('Error getting students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get students',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/parent/student/:studentId/summary
 * @desc    Get student summary for parent
 * @access  Private (Parents)
 */
router.get('/parent/student/:studentId/summary', [
  authenticate,
  param('studentId').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { studentId } = req.params;

    const summary = await ParentDashboardService.getStudentSummary(
      studentId,
      req.user._id
    );

    res.json({
      success: true,
      message: 'Student summary retrieved',
      data: summary
    });

  } catch (error) {
    console.error('Error getting student summary:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get summary',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/parent/student/:studentId/progress
 * @desc    Get student learning progress
 * @access  Private (Parents)
 */
router.get('/parent/student/:studentId/progress', [
  authenticate,
  param('studentId').isMongoId(),
  query('timeRange').optional().isIn(['7d', '30d', '90d'])
], async (req, res) => {
  try {
    const { studentId } = req.params;
    const { timeRange = '30d' } = req.query;

    const progress = await ParentDashboardService.getStudentProgress(
      studentId,
      req.user._id,
      timeRange
    );

    res.json({
      success: true,
      message: 'Progress retrieved',
      data: progress
    });

  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get progress',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/parent/student/:studentId/schedule
 * @desc    Get student schedule
 * @access  Private (Parents)
 */
router.get('/parent/student/:studentId/schedule', [
  authenticate,
  param('studentId').isMongoId()
], async (req, res) => {
  try {
    const { studentId } = req.params;
    const { days = 7 } = req.query;

    const schedule = await ParentDashboardService.getStudentSchedule(
      studentId,
      req.user._id,
      parseInt(days)
    );

    res.json({
      success: true,
      message: 'Schedule retrieved',
      data: schedule
    });

  } catch (error) {
    console.error('Error getting schedule:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get schedule',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/parent/student/:studentId/grades
 * @desc    Get student grades
 * @access  Private (Parents)
 */
router.get('/parent/student/:studentId/grades', [
  authenticate,
  param('studentId').isMongoId()
], async (req, res) => {
  try {
    const { studentId } = req.params;

    const grades = await ParentDashboardService.getStudentGrades(
      studentId,
      req.user._id
    );

    res.json({
      success: true,
      message: 'Grades retrieved',
      data: { grades }
    });

  } catch (error) {
    console.error('Error getting grades:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get grades',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/parent/alerts
 * @desc    Get parent alerts
 * @access  Private (Parents)
 */
router.get('/parent/alerts', authenticate, async (req, res) => {
  try {
    const alerts = await ParentDashboardService.getParentAlerts(req.user._id);

    res.json({
      success: true,
      message: 'Alerts retrieved',
      data: { alerts }
    });

  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alerts',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/parent/link/:linkId/permissions
 * @desc    Update link permissions
 * @access  Private
 */
router.put('/parent/link/:linkId/permissions', [
  authenticate,
  param('linkId').isMongoId(),
  body('permissions').isObject()
], async (req, res) => {
  try {
    const { linkId } = req.params;
    const { permissions } = req.body;

    const updatedPermissions = await ParentDashboardService.updatePermissions(
      linkId,
      req.user._id,
      permissions
    );

    res.json({
      success: true,
      message: 'Permissions updated',
      data: { permissions: updatedPermissions }
    });

  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update permissions',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/parent/link/:linkId
 * @desc    Remove parent link
 * @access  Private
 */
router.delete('/parent/link/:linkId', [
  authenticate,
  param('linkId').isMongoId()
], async (req, res) => {
  try {
    const { linkId } = req.params;
    const isParent = req.user.role === 'parent' || req.user.parentAccount;

    const result = await ParentDashboardService.removeLink(
      linkId,
      req.user._id,
      isParent
    );

    res.json({
      success: true,
      message: 'Link removed',
      data: result
    });

  } catch (error) {
    console.error('Error removing link:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove link',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/parent/student/:studentId/nudge
 * @desc    Nudge student with a reminder
 * @access  Private (Parents)
 */
router.post('/parent/student/:studentId/nudge', [
  authenticate,
  param('studentId').isMongoId(),
  body('type').optional().isIn(['session_reminder', 'homework_check'])
], async (req, res) => {
  try {
    const { studentId } = req.params;
    const { type } = req.body;

    const result = await ParentDashboardService.nudgeStudent(
      req.user._id,
      studentId,
      type
    );

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error nudging student:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to nudge student'
    });
  }
});

module.exports = router;
