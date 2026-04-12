const Notification = require('../models/Notification');

// Emit notification via Socket.io
const emitNotification = async (recipient, notificationData) => {
  try {
    const { type, data } = notificationData;
    
    // Create notification record
    const notification = new Notification({
      recipientId: typeof recipient === 'string' ? recipient : recipient._id,
      type,
      title: getNotificationTitle(type, data),
      message: getNotificationMessage(type, data),
      data,
      isRead: false
    });

    await notification.save();

    // Emit via Socket.io if available
    if (global.io) {
      global.io.emit(`notification:${recipient}`, {
        id: notification._id,
        type,
        title: notification.title,
        message: notification.message,
        data,
        createdAt: notification.createdAt
      });
    }

    return notification;
  } catch (error) {
    console.error('Emit notification error:', error);
    throw error;
  }
};

// Get notification title based on type
const getNotificationTitle = (type, data) => {
  const titles = {
    new_report: 'New Report Submitted',
    report_resolved: 'Report Resolved',
    report_escalated: 'Report Escalated',
    appeal_reviewed: 'Appeal Reviewed',
    session_reminder: 'Session Reminder',
    session_started: 'Session Started',
    session_ended: 'Session Ended',
    booking_confirmed: 'Booking Confirmed',
    booking_cancelled: 'Booking Cancelled',
    material_approved: 'Material Approved',
    material_rejected: 'Material Rejected',
    new_message: 'New Message',
    review_received: 'New Review Received'
  };

  return titles[type] || 'Notification';
};

// Get notification message based on type
const getNotificationMessage = (type, data) => {
  const messages = {
    new_report: `A new report has been submitted for ${data.reportedType}: ${data.reason}`,
    report_resolved: `Your report has been resolved. Action taken: ${data.action}`,
    report_escalated: `Report has been escalated to level ${data.level}`,
    appeal_reviewed: `Your appeal has been ${data.status}: ${data.notes}`,
    session_reminder: 'Your tutoring session is starting soon',
    session_started: 'Your tutoring session has started',
    session_ended: 'Your tutoring session has ended',
    booking_confirmed: 'Your booking has been confirmed',
    booking_cancelled: 'Your booking has been cancelled',
    material_approved: 'Your material has been approved',
    material_rejected: 'Your material has been rejected',
    new_message: 'You have received a new message',
    review_received: 'You have received a new review'
  };

  return messages[type] || 'You have a new notification';
};

// Send bulk notifications
const sendBulkNotifications = async (recipients, notificationData) => {
  try {
    const notifications = [];
    
    for (const recipient of recipients) {
      const notification = await emitNotification(recipient, notificationData);
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Send bulk notifications error:', error);
    throw error;
  }
};

// Send email notification (placeholder for email service integration)
const sendEmailNotification = async (recipient, subject, message) => {
  try {
    // This would integrate with an email service like SendGrid, Nodemailer, etc.
    console.log(`Email notification sent to ${recipient}: ${subject}`);
    
    // Example implementation with nodemailer:
    /*
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipient,
      subject,
      text: message,
      html: `<p>${message}</p>`
    });
    */

    return true;
  } catch (error) {
    console.error('Send email notification error:', error);
    throw error;
  }
};

// Get user notifications
const getUserNotifications = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    
    const query = { recipientId: userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      Notification.countDocuments(query)
    ]);

    return {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Get user notifications error:', error);
    throw error;
  }
};

// Mark notification as read
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      throw new Error('Notification not found or access denied');
    }

    return notification;
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
};

// Mark all notifications as read for user
const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return result.modifiedCount;
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    throw error;
  }
};

// Delete notification
const deleteNotification = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: userId
    });

    if (!notification) {
      throw new Error('Notification not found or access denied');
    }

    return notification;
  } catch (error) {
    console.error('Delete notification error:', error);
    throw error;
  }
};

// Get unread notification count
const getUnreadNotificationCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: userId,
      isRead: false
    });

    return count;
  } catch (error) {
    console.error('Get unread notification count error:', error);
    throw error;
  }
};

// Schedule notification (for future delivery)
const scheduleNotification = async (recipient, notificationData, scheduledFor) => {
  try {
    const notification = new Notification({
      recipientId: typeof recipient === 'string' ? recipient : recipient._id,
      type: notificationData.type,
      title: getNotificationTitle(notificationData.type, notificationData.data),
      message: getNotificationMessage(notificationData.type, notificationData.data),
      data: notificationData.data,
      isRead: false,
      scheduledFor
    });

    await notification.save();

    // In a real implementation, you would use a job scheduler like node-cron or Bull
    // For now, we'll just store the scheduled notification
    
    return notification;
  } catch (error) {
    console.error('Schedule notification error:', error);
    throw error;
  }
};

// Process scheduled notifications (to be called by a cron job)
const processScheduledNotifications = async () => {
  try {
    const now = new Date();
    
    const scheduledNotifications = await Notification.find({
      scheduledFor: { $lte: now },
      isRead: false,
      sent: false
    });

    for (const notification of scheduledNotifications) {
      await emitNotification(notification.recipientId, {
        type: notification.type,
        data: notification.data
      });

      // Mark as sent
      notification.sent = true;
      notification.sentAt = now;
      await notification.save();
    }

    return scheduledNotifications.length;
  } catch (error) {
    console.error('Process scheduled notifications error:', error);
    throw error;
  }
};

module.exports = {
  emitNotification,
  sendBulkNotifications,
  sendEmailNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
  scheduleNotification,
  processScheduledNotifications
};
