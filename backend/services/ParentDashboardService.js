const User = require('../models/User');
const ParentStudentLink = require('../models/ParentStudentLink');
const LectureCourse = require('../models/LectureCourse');
const PeerSession = require('../models/PeerSession');
const HomeworkSession = require('../models/HomeworkSession');
const UserGamification = require('../models/UserGamification');
const Notification = require('../models/Notification');

class ParentDashboardService {
  constructor() {
    this.maxLinkedStudents = 5; // Maximum students per parent account
  }

  /**
   * Link parent to student
   */
  async linkParentToStudent(parentId, studentEmail, relationship = 'parent') {
    try {
      // Find student
      const student = await User.findOne({
        email: studentEmail,
        role: 'student'
      });

      if (!student) {
        throw new Error('Student not found with that email');
      }

      // Check if link already exists
      const existingLink = await ParentStudentLink.findOne({
        parent: parentId,
        student: student._id
      });

      if (existingLink) {
        if (existingLink.status === 'active') {
          throw new Error('You are already linked to this student');
        }
        if (existingLink.status === 'pending') {
          throw new Error('Link request is already pending student approval');
        }
      }

      // Check parent's current links
      const currentLinks = await ParentStudentLink.countDocuments({
        parent: parentId,
        status: 'active'
      });

      if (currentLinks >= this.maxLinkedStudents) {
        throw new Error(`Maximum ${this.maxLinkedStudents} students can be linked per parent`);
      }

      // Create link
      const link = await ParentStudentLink.create({
        parent: parentId,
        student: student._id,
        relationship,
        status: 'pending'
      });

      // Notify student
      await Notification.create({
        recipient: student._id,
        type: 'social',
        title: 'Parent Link Request',
        message: `A parent wants to link to your account for monitoring. Please review and approve.`,
        priority: 'normal',
        actionUrl: '/dashboard/settings/parents',
        channels: ['inApp', 'email']
      });

      return {
        link,
        student: {
          id: student._id,
          name: student.name,
          email: student.email
        },
        status: 'pending_approval'
      };

    } catch (error) {
      console.error('Error linking parent to student:', error);
      throw error;
    }
  }

  /**
   * Student approves/rejects parent link
   */
  async respondToLinkRequest(linkId, studentId, approve, customPermissions = null) {
    try {
      const link = await ParentStudentLink.findOne({
        _id: linkId,
        student: studentId,
        status: 'pending'
      });

      if (!link) {
        throw new Error('Link request not found');
      }

      if (approve) {
        link.status = 'active';
        link.studentApproved = true;
        link.studentApprovedAt = new Date();
        link.activatedAt = new Date();
        
        // Apply custom permissions if provided
        if (customPermissions) {
          link.permissions = { ...link.permissions, ...customPermissions };
        }

        await link.save();

        // Notify parent
        const parent = await User.findById(link.parent);
        await Notification.create({
          recipient: link.parent,
          type: 'social',
          title: 'Student Link Approved',
          message: 'Your link request has been approved. You can now monitor student progress.',
          priority: 'normal',
          actionUrl: '/dashboard/parent',
          channels: ['inApp', 'email']
        });

        return { approved: true, link };
      } else {
        link.status = 'revoked';
        link.revokedAt = new Date();
        link.revokeReason = 'Student declined';
        await link.save();

        return { approved: false, link };
      }

    } catch (error) {
      console.error('Error responding to link request:', error);
      throw error;
    }
  }

  /**
   * Get parent's linked students
   */
  async getLinkedStudents(parentId) {
    try {
      const links = await ParentStudentLink.find({
        parent: parentId,
        status: 'active'
      }).populate('student', 'name email profile.grade profile.avatar');

      return links.map(link => ({
        linkId: link._id,
        student: link.student,
        relationship: link.relationship,
        permissions: link.permissions,
        linkedAt: link.activatedAt
      }));

    } catch (error) {
      console.error('Error getting linked students:', error);
      throw error;
    }
  }

  /**
   * Get student summary for parent dashboard
   */
  async getStudentSummary(studentId, parentId) {
    try {
      // Verify parent has access
      const link = await ParentStudentLink.findOne({
        parent: parentId,
        student: studentId,
        status: 'active'
      });

      if (!link) {
        throw new Error('No access to this student\'s data');
      }

      const student = await User.findById(studentId).select('name profile');
      
      // Get gamification data
      const gamification = await UserGamification.findOne({ user: studentId })
        .select('level points streaks stats badges');

      // Get enrolled courses
      const courses = await LectureCourse.find({
        'enrolledStudents.user': studentId
      })
        .select('title subject sessions enrolledStudents progress')
        .lean();

      // Calculate course progress
      const courseData = courses.map(course => {
        const enrollment = course.enrolledStudents.find(
          e => e.user.toString() === studentId.toString()
        );
        return {
          courseId: course._id,
          title: course.title,
          subject: course.subject,
          totalSessions: course.totalSessions,
          progress: enrollment?.progress || 0,
          status: enrollment?.status || 'enrolled',
          lastSessionAttended: enrollment?.lastSessionAttended
        };
      });

      // Get recent activity
      const recentSessions = await PeerSession.find({
        'participants.user': studentId,
        status: 'completed'
      })
        .sort({ completedAt: -1 })
        .limit(5)
        .select('subject completedAt rating');

      return {
        student: {
          id: student._id,
          name: student.name,
          grade: student.profile?.grade
        },
        gamification: gamification ? {
          level: gamification.level,
          points: gamification.points,
          streak: gamification.streaks,
          totalSessions: gamification.stats.totalSessions,
          badges: gamification.badges.length
        } : null,
        courses: courseData,
        recentActivity: recentSessions,
        permissions: link.permissions
      };

    } catch (error) {
      console.error('Error getting student summary:', error);
      throw error;
    }
  }

  /**
   * Get student learning progress
   */
  async getStudentProgress(studentId, parentId, timeRange = '30d') {
    try {
      // Verify access
      const link = await ParentStudentLink.findOne({
        parent: parentId,
        student: studentId,
        status: 'active',
        'permissions.viewProgress': true
      });

      if (!link) {
        throw new Error('No permission to view progress');
      }

      const days = parseInt(timeRange);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get session history
      const sessions = await PeerSession.find({
        'participants.user': studentId,
        status: 'completed',
        completedAt: { $gte: startDate }
      }).sort({ completedAt: -1 });

      // Get homework sessions
      const homeworkSessions = await HomeworkSession.find({
        user: studentId,
        status: 'completed',
        completionDate: { $gte: startDate }
      }).sort({ completionDate: -1 });

      // Calculate progress metrics
      const progress = {
        totalSessions: sessions.length,
        totalHours: sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60,
        homeworkSessions: homeworkSessions.length,
        subjectsStudied: [...new Set(sessions.map(s => s.subject))],
        averageRating: sessions.length > 0
          ? sessions.reduce((sum, s) => sum + (s.rating || 0), 0) / sessions.length
          : 0,
        dailyActivity: this.calculateDailyActivity(sessions, days),
        improvement: this.calculateImprovement(sessions),
        // Mocked history for charts until more granular tracking is in place
        history: Array.from({ length: 4 }, (_, i) => ({
          week: `W${i + 1}`,
          completionRate: Math.floor(Math.random() * 40) + 60, // 60-100%
          averageScore: Math.floor(Math.random() * 30) + 70   // 70-100%
        }))
      };

      return progress;

    } catch (error) {
      console.error('Error getting student progress:', error);
      throw error;
    }
  }

  /**
   * Calculate daily activity
   */
  calculateDailyActivity(sessions, days) {
    const activity = {};
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      activity[dateStr] = 0;
    }

    sessions.forEach(session => {
      const dateStr = session.completedAt.toISOString().split('T')[0];
      if (activity[dateStr] !== undefined) {
        activity[dateStr] += 1;
      }
    });

    return activity;
  }

  /**
   * Calculate learning improvement
   */
  calculateImprovement(sessions) {
    if (sessions.length < 5) return { hasData: false };

    const firstHalf = sessions.slice(0, Math.floor(sessions.length / 2));
    const secondHalf = sessions.slice(Math.floor(sessions.length / 2));

    const firstAvg = firstHalf.reduce((sum, s) => sum + (s.rating || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + (s.rating || 0), 0) / secondHalf.length;

    return {
      hasData: true,
      firstHalfAverage: firstAvg.toFixed(1),
      secondHalfAverage: secondAvg.toFixed(1),
      improvement: ((secondAvg - firstAvg) * 20).toFixed(0), // Convert to percentage
      trend: secondAvg > firstAvg ? 'improving' : secondAvg < firstAvg ? 'declining' : 'stable'
    };
  }

  /**
   * Get student schedule
   */
  async getStudentSchedule(studentId, parentId, days = 7) {
    try {
      const link = await ParentStudentLink.findOne({
        parent: parentId,
        student: studentId,
        status: 'active',
        'permissions.viewSchedule': true
      });

      if (!link) {
        throw new Error('No permission to view schedule');
      }

      const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      // Get upcoming sessions
      const upcomingSessions = await PeerSession.find({
        'participants.user': studentId,
        status: { $in: ['scheduled', 'active'] },
        scheduledFor: { $lte: endDate }
      }).sort({ scheduledFor: 1 });

      // Get course schedules
      const courses = await LectureCourse.find({
        'enrolledStudents.user': studentId,
        status: 'published'
      }).select('title schedule sessions');

      return {
        upcomingSessions: upcomingSessions.map(s => ({
          id: s._id,
          subject: s.subject,
          scheduledFor: s.scheduledFor,
          duration: s.duration,
          status: s.status
        })),
        courses: courses.map(c => ({
          id: c._id,
          title: c.title,
          schedule: c.schedule
        }))
      };

    } catch (error) {
      console.error('Error getting student schedule:', error);
      throw error;
    }
  }

  /**
   * Get student grades/performance
   */
  async getStudentGrades(studentId, parentId) {
    try {
      const link = await ParentStudentLink.findOne({
        parent: parentId,
        student: studentId,
        status: 'active',
        'permissions.viewGrades': true
      });

      if (!link) {
        throw new Error('No permission to view grades');
      }

      // Get completed courses with grades
      const courses = await LectureCourse.find({
        'enrolledStudents.user': studentId,
        'enrolledStudents.status': 'completed'
      }).select('title subject enrolledStudents');

      const grades = courses.map(course => {
        const enrollment = course.enrolledStudents.find(
          e => e.user.toString() === studentId.toString()
        );
        return {
          courseId: course._id,
          courseTitle: course.title,
          subject: course.subject,
          grade: enrollment?.grade,
          completionDate: enrollment?.completedAt,
          attendanceRate: enrollment?.attendanceRate
        };
      });

      return grades;

    } catch (error) {
      console.error('Error getting student grades:', error);
      throw error;
    }
  }

  /**
   * Get alerts and notifications for parent
   */
  async getParentAlerts(parentId) {
    try {
      const links = await ParentStudentLink.find({
        parent: parentId,
        status: 'active'
      }).select('student permissions');

      const alerts = [];

      for (const link of links) {
        if (!link.permissions.receiveNotifications) continue;

        const studentId = link.student;

        // Check for concerning patterns
        const recentSessions = await PeerSession.find({
          'participants.user': studentId,
          completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        // No activity alert
        if (recentSessions.length === 0) {
          const student = await User.findById(studentId).select('name');
          alerts.push({
            type: 'no_activity',
            priority: 'medium',
            studentId,
            studentName: student.name,
            message: 'No learning activity in the past 7 days',
            suggestedAction: 'Encourage student to schedule study sessions'
          });
        }

        // Get gamification data for streak alerts
        const gamification = await UserGamification.findOne({ user: studentId });
        if (gamification && gamification.streaks.current > 0 && gamification.streaks.current % 10 === 0) {
          alerts.push({
            type: 'streak_milestone',
            priority: 'low',
            studentId,
            studentName: gamification.user?.name || 'Student',
            message: `${gamification.streaks.current}-day learning streak!`,
            suggestedAction: 'Celebrate this achievement'
          });
        }
      }

      return alerts;

    } catch (error) {
      console.error('Error getting parent alerts:', error);
      throw error;
    }
  }

  /**
   * Update permissions
   */
  async updatePermissions(linkId, studentId, permissions) {
    try {
      const link = await ParentStudentLink.findOne({
        _id: linkId,
        student: studentId,
        status: 'active'
      });

      if (!link) {
        throw new Error('Link not found');
      }

      link.permissions = { ...link.permissions, ...permissions };
      await link.save();

      return link.permissions;

    } catch (error) {
      console.error('Error updating permissions:', error);
      throw error;
    }
  }

  /**
   * Remove link
   */
  async removeLink(linkId, userId, isParent) {
    try {
      const query = isParent 
        ? { _id: linkId, parent: userId }
        : { _id: linkId, student: userId };

      const link = await ParentStudentLink.findOne(query);

      if (!link) {
        throw new Error('Link not found');
      }

      link.status = 'revoked';
      link.revokedAt = new Date();
      link.revokeReason = isParent ? 'Parent removed' : 'Student removed';
      await link.save();

      // Notify other party
      const notifyUserId = isParent ? link.student : link.parent;
      await Notification.create({
        recipient: notifyUserId,
        type: 'social',
        title: 'Parent Link Removed',
        message: isParent 
          ? 'Your parent has removed the monitoring link.'
          : 'The student has removed your monitoring access.',
        priority: 'normal',
        channels: ['inApp', 'email']
      });

      return { removed: true };

    } catch (error) {
      console.error('Error removing link:', error);
      throw error;
    }
  }

  /**
   * Get pending link requests for a specific student
   */
  async getPendingLinkRequestsForStudent(studentId) {
    try {
      return await ParentStudentLink.find({
        student: studentId,
        status: 'pending'
      }).populate('parent', 'username email profile.firstName profile.lastName');
    } catch (error) {
      console.error('Error getting student pending requests:', error);
      throw error;
    }
  }

  /**
   * Get pending link requests sent by a specific parent
   */
  async getPendingLinkRequestsForParent(parentId) {
    try {
      return await ParentStudentLink.find({
        parent: parentId,
        status: 'pending'
      }).populate('student', 'username email profile.firstName profile.lastName');
    } catch (error) {
      console.error('Error getting parent pending requests:', error);
      throw error;
    }
  }

  /**
   * Nudge student to join a session or start studying
   */
  async nudgeStudent(parentId, studentId, messageType = 'session_reminder') {
    try {
      // 1. Verify access
      const link = await ParentStudentLink.findOne({
        parent: parentId,
        student: studentId,
        status: 'active'
      });

      if (!link) throw new Error('No monitoring link active for this student');

      const parent = await User.findById(parentId).select('name');
      const student = await User.findById(studentId).select('name');

      let title = 'Parent Reminder';
      let message = `${parent.name} is reminding you to check your study schedule.`;

      if (messageType === 'session_reminder') {
        title = 'Time for Class!';
        message = `${parent.name} sent you a reminder for your upcoming session. Join now!`;
      } else if (messageType === 'homework_check') {
        title = 'Homework Check';
        message = `${parent.name} is asking about your homework progress.`;
      }

      // 2. Create notification
      await Notification.create({
        recipient: studentId,
        sender: parentId,
        type: 'alert',
        title,
        message,
        priority: 'high',
        channels: ['inApp', 'email', 'push']
      });

      return { success: true, message: `Nudge sent to ${student.name}` };
    } catch (error) {
      console.error('Error nudging student:', error);
      throw error;
    }
  }

  /**
   * Get all pending link requests for admin review
   */
  async getPendingLinkRequestsForAdmin() {
    try {
      return await ParentStudentLink.find({ status: 'pending' })
        .populate('parent', 'username email profile.firstName profile.lastName')
        .populate('student', 'username email profile.firstName profile.lastName')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting pending requests for admin:', error);
      throw error;
    }
  }

  /**
   * Admin reviews a link request
   */
  async reviewLinkRequestByAdmin(linkId, adminId, approve, reviewNote, permissions = null) {
    try {
      const link = await ParentStudentLink.findById(linkId);
      if (!link) throw new Error('Link request not found');

      if (approve) {
        link.status = 'active';
        link.adminApproved = true;
        link.adminId = adminId;
        link.adminApprovedAt = new Date();
        link.activatedAt = new Date();
        if (permissions) {
          link.permissions = { ...link.permissions, ...permissions };
        }
      } else {
        link.status = 'revoked';
        link.revokedAt = new Date();
        link.revokeReason = reviewNote || 'Admin rejected';
      }

      await link.save();

      // Notify parent
      const Notification = require('../models/Notification'); // Ensure Notification is available
      await Notification.create({
        recipient: link.parent,
        type: 'system',
        title: approve ? 'Link Approved' : 'Link Rejected',
        message: approve 
          ? 'Your student link request has been approved by the administration.' 
          : `Your student link request was rejected. Reason: ${reviewNote || 'Contact support for details.'}`,
        priority: 'high',
        channels: ['inApp', 'email']
      });

      return link;
    } catch (error) {
      console.error('Error in admin review:', error);
      throw error;
    }
  }
}

module.exports = new ParentDashboardService();
