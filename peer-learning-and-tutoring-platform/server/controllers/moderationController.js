const Report = require('../models/Report');
const ModeratorAction = require('../models/ModeratorAction');
const User = require('../models/User');
const Material = require('../models/Material');
const Booking = require('../models/Booking');
const { emitNotification } = require('../services/notificationService');

// Submit a report
exports.submitReport = async (req, res) => {
  try {
    const { reportedType, reportedId, reason, description, evidence = [] } = req.body;
    const reporterId = req.user.id;

    // Validate that the reported item exists
    let reportedItem;
    switch (reportedType) {
      case 'user':
        reportedItem = await User.findById(reportedId);
        break;
      case 'material':
        reportedItem = await Material.findById(reportedId);
        break;
      case 'session':
        reportedItem = await Booking.findById(reportedId);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid reported type'
        });
    }

    if (!reportedItem) {
      return res.status(404).json({
        success: false,
        message: 'Reported item not found'
      });
    }

    // Check for duplicate reports
    const existingReport = await Report.findOne({
      reporterId,
      reportedType,
      reportedId,
      status: { $in: ['pending', 'under_review'] }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this item'
      });
    }

    // Create new report
    const report = new Report({
      reporterId,
      reportedType,
      reportedId,
      reason,
      description,
      evidence,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        platform: 'web'
      }
    });

    await report.save();

    // Auto-assign priority based on reason
    const priorityMap = {
      harassment: 'urgent',
      inappropriate: 'high',
      copyright: 'high',
      spam: 'medium',
      fake: 'medium',
      misinformation: 'medium',
      other: 'low'
    };

    if (priorityMap[reason]) {
      report.priority = priorityMap[reason];
      await report.save();
    }

    // Notify moderators
    await emitNotification('moderator', {
      type: 'new_report',
      data: {
        reportId: report._id,
        reportedType,
        reason,
        priority: report.priority
      }
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });

  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report'
    });
  }
};

// Get reports for moderators
exports.getReports = async (req, res) => {
  try {
    const { status, assignedTo, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    // Check if user is moderator or admin
    const user = await User.findById(userId);
    if (!['moderator', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const result = await Report.getByStatus(status, {
      page: parseInt(page),
      limit: parseInt(limit),
      assignedTo: assignedTo || undefined
    });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reports'
    });
  }
};

// Get report details
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is moderator or admin
    const user = await User.findById(userId);
    if (!['moderator', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const report = await Report.findById(id)
      .populate('reporterId', 'profile.firstName profile.lastName username email')
      .populate('assignedTo', 'profile.firstName profile.lastName username')
      .populate('relatedReports');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Get reported item details
    let reportedItem;
    switch (report.reportedType) {
      case 'user':
        reportedItem = await User.findById(report.reportedId, 'profile.firstName profile.lastName username email role');
        break;
      case 'material':
        reportedItem = await Material.findById(report.reportedId, 'title description type uploadedBy status');
        break;
      case 'session':
        reportedItem = await Booking.findById(report.reportedId, 'subject date startTime endTime status studentId tutorId');
        break;
    }

    res.status(200).json({
      success: true,
      data: {
        report,
        reportedItem
      }
    });

  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get report'
    });
  }
};

// Assign report to moderator
exports.assignReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { moderatorId } = req.body;
    const userId = req.user.id;

    // Check if user is moderator or admin
    const user = await User.findById(userId);
    if (!['moderator', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.assignTo(moderatorId);

    res.status(200).json({
      success: true,
      message: 'Report assigned successfully',
      data: report
    });

  } catch (error) {
    console.error('Assign report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign report'
    });
  }
};

// Resolve report
exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;
    const userId = req.user.id;

    // Check if user is moderator or admin
    const user = await User.findById(userId);
    if (!['moderator', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Create moderator action
    const moderatorAction = new ModeratorAction({
      moderatorId: userId,
      actionType: action === 'no_action' ? 'note_only' : action,
      targetId: report.reportedId,
      targetType: report.reportedType,
      reason: report.reason,
      notes,
      relatedReports: [report._id],
      details: {
        automated: false
      }
    });

    await moderatorAction.save();

    // Resolve the report
    await report.resolve(action, notes, userId);

    // Take action on the reported item if needed
    if (action !== 'no_action') {
      await takeModerationAction(report, action, userId, notes);
    }

    // Notify reporter
    await emitNotification(report.reporterId, {
      type: 'report_resolved',
      data: {
        reportId: report._id,
        action,
        notes
      }
    });

    res.status(200).json({
      success: true,
      message: 'Report resolved successfully',
      data: {
        report,
        action: moderatorAction
      }
    });

  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve report'
    });
  }
};

// Dismiss report
exports.dismissReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    // Check if user is moderator or admin
    const user = await User.findById(userId);
    if (!['moderator', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Create moderator action
    const moderatorAction = new ModeratorAction({
      moderatorId: userId,
      actionType: 'note_only',
      targetId: report.reportedId,
      targetType: report.reportedType,
      reason: report.reason,
      notes: `Report dismissed: ${notes}`,
      relatedReports: [report._id]
    });

    await moderatorAction.save();

    // Dismiss the report
    await report.dismiss(notes, userId);

    res.status(200).json({
      success: true,
      message: 'Report dismissed successfully',
      data: {
        report,
        action: moderatorAction
      }
    });

  } catch (error) {
    console.error('Dismiss report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss report'
    });
  }
};

// Escalate report
exports.escalateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, level } = req.body;
    const userId = req.user.id;

    // Check if user is moderator or admin
    const user = await User.findById(userId);
    if (!['moderator', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.escalate(reason, level);

    // Notify senior moderators
    await emitNotification('admin', {
      type: 'report_escalated',
      data: {
        reportId: report._id,
        level: report.escalation.level,
        reason
      }
    });

    res.status(200).json({
      success: true,
      message: 'Report escalated successfully',
      data: report
    });

  } catch (error) {
    console.error('Escalate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to escalate report'
    });
  }
};

// Get moderator actions
exports.getModeratorActions = async (req, res) => {
  try {
    const { moderatorId, actionType, status, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    // Check if user is moderator or admin
    const user = await User.findById(userId);
    if (!['moderator', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const result = await ModeratorAction.getByModerator(
      moderatorId || userId,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        actionType,
        status
      }
    );

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get moderator actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get moderator actions'
    });
  }
};

// Get pending appeals
exports.getPendingAppeals = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    // Check if user is moderator or admin
    const user = await User.findById(userId);
    if (!['moderator', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const result = await ModeratorAction.getPendingAppeals({
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get pending appeals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending appeals'
    });
  }
};

// Review appeal
exports.reviewAppeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;

    // Check if user is moderator or admin
    const user = await User.findById(userId);
    if (!['moderator', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const action = await ModeratorAction.findById(id);
    if (!action) {
      return res.status(404).json({
        success: false,
        message: 'Moderator action not found'
      });
    }

    await action.reviewAppeal(status, notes, userId);

    // If appeal is accepted, reverse the action
    if (status === 'accepted') {
      await reverseModerationAction(action, userId, notes);
    }

    // Notify the user who appealed
    await emitNotification(action.appeal.appealedBy, {
      type: 'appeal_reviewed',
      data: {
        actionId: action._id,
        status,
        notes
      }
    });

    res.status(200).json({
      success: true,
      message: 'Appeal reviewed successfully',
      data: action
    });

  } catch (error) {
    console.error('Review appeal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review appeal'
    });
  }
};

// Get moderation statistics
exports.getModerationStats = async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const userId = req.user.id;

    // Check if user is moderator or admin
    const user = await User.findById(userId);
    if (!['moderator', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [reportStats, actionStats, overdueReports] = await Promise.all([
      Report.getStatistics(timeframe),
      ModeratorAction.getStatistics(timeframe),
      Report.getOverdue()
    ]);

    const moderatorPerformance = await ModeratorAction.getModeratorPerformance(userId, timeframe);

    res.status(200).json({
      success: true,
      data: {
        reports: reportStats,
        actions: actionStats,
        overdue: overdueReports.length,
        performance: moderatorPerformance
      }
    });

  } catch (error) {
    console.error('Get moderation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get moderation statistics'
    });
  }
};

// Helper function to take moderation action
async function takeModerationAction(report, action, moderatorId, notes) {
  switch (action) {
    case 'content_removed':
      if (report.reportedType === 'material') {
        await Material.findByIdAndUpdate(report.reportedId, { status: 'rejected' });
      }
      break;
    
    case 'user_suspended':
      if (report.reportedType === 'user') {
        await User.findByIdAndUpdate(report.reportedId, { 
          isActive: false,
          suspensionUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
      }
      break;
    
    case 'user_banned':
      if (report.reportedType === 'user') {
        await User.findByIdAndUpdate(report.reportedId, { 
          isActive: false,
          isBanned: true
        });
      }
      break;
    
    case 'content_flagged':
      if (report.reportedType === 'material') {
        await Material.findByIdAndUpdate(report.reportedId, { 
          'flags.isFlagged': true,
          'flags.flaggedBy': moderatorId,
          'flags.flaggedAt': new Date()
        });
      }
      break;
  }
}

// Helper function to reverse moderation action
async function reverseModerationAction(action, moderatorId, notes) {
  switch (action.actionType) {
    case 'delete_content':
      if (action.targetType === 'material') {
        await Material.findByIdAndUpdate(action.targetId, { status: 'approved' });
      }
      break;
    
    case 'suspend':
      if (action.targetType === 'user') {
        await User.findByIdAndUpdate(action.targetId, { 
          isActive: true,
          suspensionUntil: null
        });
      }
      break;
    
    case 'ban':
      if (action.targetType === 'user') {
        await User.findByIdAndUpdate(action.targetId, { 
          isActive: true,
          isBanned: false
        });
      }
      break;
    
    case 'flag_content':
      if (action.targetType === 'material') {
        await Material.findByIdAndUpdate(action.targetId, { 
          'flags.isFlagged': false,
          'flags.resolved': true,
          'flags.resolvedBy': moderatorId,
          'flags.resolvedAt': new Date()
        });
      }
      break;
  }
}
