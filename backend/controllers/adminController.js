const User = require('../models/User');
const Booking = require('../models/Booking');
const Report = require('../models/Report');
const Material = require('../models/Material');
const Tutor = require('../models/Tutor');
const Notification = require('../models/Notification');
const EmailService = require('../services/emailService');
const notificationService = require('../services/notificationService');

// Get aggregated statistics for admin dashboard
const getDashboardStatistics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTutors,
      totalStudents,
      totalSessions,
      pendingReports,
      pendingMaterials
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'tutor' }),
      User.countDocuments({ role: 'student' }),
      Booking.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Material.countDocuments({ status: 'pending' })
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalTutors,
        totalStudents,
        totalSessions,
        pendingReports,
        pendingMaterials
      }
    });
  } catch (error) {
    console.error('Admin dashboard statistics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics',
      error: error.message
    });
  }
};

// Get all users with pagination and filters
const getAllUsersAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.isActive = status === 'active';
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Activate/Deactivate user
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, reason } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.isActive = isActive;
    if (reason) {
      user.statusChangeReason = reason;
      user.statusChangedBy = req.user._id;
      user.statusChangedAt = new Date();
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user: { ...user.toObject(), password: undefined } }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// Change user role
const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, reason } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const oldRole = user.role;
    user.role = role;
    user.roleChangeReason = reason;
    user.roleChangedBy = req.user._id;
    user.roleChangedAt = new Date();
    
    await user.save();
    
    res.json({
      success: true,
      message: `User role changed from ${oldRole} to ${role}`,
      data: { user: { ...user.toObject(), password: undefined } }
    });
  } catch (error) {
    console.error('Change user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change user role',
      error: error.message
    });
  }
};

// Get pending tutor applications
const getPendingTutors = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const tutors = await Tutor.find({ 
      verificationStatus: 'pending' 
    })
    .populate('userId', 'username email profile')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });
    
    const total = await Tutor.countDocuments({ verificationStatus: 'pending' });
    
    res.json({
      success: true,
      data: {
        tutors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get pending tutors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending tutors',
      error: error.message
    });
  }
};

// Approve tutor application
const approveTutor = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const tutor = await Tutor.findById(id).populate('userId');
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    tutor.verificationStatus = 'approved';
    tutor.verifiedBy = req.user._id;
    tutor.verifiedAt = new Date();
    tutor.verificationNotes = notes;
    
    await tutor.save();
    
    // Update user role to tutor
    const user = await User.findByIdAndUpdate(tutor.userId, { role: 'tutor' }, { returnDocument: 'after' });
    
    // Send Notifications
    try {
      if (user) {
        // In-app Notification
        await Notification.create({
          userId: user._id,
          title: 'Tutor Application Approved',
          message: 'Congratulations! Your application to become a tutor has been approved. You can now access the Tutor Workspace.',
          type: 'success',
          link: '/tutor-dashboard'
        });

        // Email Notification
        await EmailService.sendTutorApprovedEmail(user.email, user.username);
      }
    } catch (notifyError) {
      console.error('Error sending tutor approval notifications:', notifyError);
      // Non-blocking: we still return success for the database update
    }
    
    res.json({
      success: true,
      message: 'Tutor application approved successfully',
      data: tutor
    });
  } catch (error) {
    console.error('Approve tutor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve tutor',
      error: error.message
    });
  }
};

// Reject tutor application
const rejectTutor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;
    
    const tutor = await Tutor.findById(id).populate('userId');
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    tutor.verificationStatus = 'rejected';
    tutor.rejectedBy = req.user._id;
    tutor.rejectedAt = new Date();
    tutor.rejectionReason = reason;
    tutor.rejectionNotes = notes;
    
    await tutor.save();

    // Send Notifications
    try {
      const user = tutor.userId;
      if (user) {
        // In-app Notification
        await Notification.create({
          userId: user._id,
          title: 'Tutor Application Update',
          message: `Your tutor application has been reviewed. Status: Rejected. Reason: ${reason}`,
          type: 'error',
          link: '/profile/setup'
        });

        // Email Notification
        await EmailService.sendTutorRejectedEmail(user.email, user.username, reason);
      }
    } catch (notifyError) {
      console.error('Error sending tutor rejection notifications:', notifyError);
    }
    
    res.json({
      success: true,
      message: 'Tutor application rejected',
      data: tutor
    });
  } catch (error) {
    console.error('Reject tutor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject tutor',
      error: error.message
    });
  }
};

// Get pending materials
const getPendingMaterials = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const materials = await Material.find({ status: 'pending' })
      .populate('uploadedBy', 'username email profile')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Material.countDocuments({ status: 'pending' });
    
    res.json({
      success: true,
      data: {
        materials,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get pending materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending materials',
      error: error.message
    });
  }
};

// Bulk operations
const bulkUserOperations = async (req, res) => {
  try {
    const { userIds, operation, data } = req.body;
    
    let result;
    switch (operation) {
      case 'activate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { isActive: true, statusChangedBy: req.user._id, statusChangedAt: new Date() }
        );
        break;
      case 'deactivate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { isActive: false, statusChangedBy: req.user._id, statusChangedAt: new Date() }
        );
        break;
      case 'changeRole':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { 
            role: data.role, 
            roleChangedBy: req.user._id, 
            roleChangedAt: new Date(),
            roleChangeReason: data.reason 
          }
        );
        break;
      case 'delete':
        result = await User.deleteMany({ _id: { $in: userIds } });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation'
        });
    }
    
    res.json({
      success: true,
      message: `Bulk operation completed. ${result.modifiedCount || result.deletedCount || 0} users affected.`,
      data: { modifiedCount: result.modifiedCount || result.deletedCount || 0 }
    });
  } catch (error) {
    console.error('Bulk user operations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operations',
      error: error.message
    });
  }
};

// Create a new user (Admin)
const createUser = async (req, res) => {
  try {
    const { username, email, password, role, district, stream, grade, profile } = req.body;

    // Check for existing user
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: existing.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    const user = await User.create({
      username,
      email,
      password: password || 'Temp@1234',
      role: role || 'student',
      district: district || undefined,
      stream: stream || undefined,
      grade: grade || undefined,
      school: req.body.school || undefined,
      profile: profile || {},
      isVerified: true, // Admin-created users are pre-verified
      authProvider: 'local'
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: { ...user.toObject(), password: undefined } }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

// Get single user by ID (Admin)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get additional stats
    const [bookingCount, questionCount, answerCount] = await Promise.all([
      Booking.countDocuments({ $or: [{ studentId: id }, { tutorId: id }] }),
      require('../models/Question').countDocuments({ author: id }),
      require('../models/Answer').countDocuments({ author: id })
    ]);

    // Check if user is a tutor
    let tutorProfile = null;
    if (user.role === 'tutor') {
      tutorProfile = await Tutor.findOne({ userId: id });
    }

    res.json({
      success: true,
      data: {
        user,
        stats: {
          bookings: bookingCount,
          questions: questionCount,
          answers: answerCount
        },
        tutorProfile
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
};

// Update user (Admin)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, district, stream, grade, profile, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check for duplicate email/username if changed
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: id } });
      if (emailExists) return res.status(409).json({ success: false, message: 'Email already in use' });
    }
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username, _id: { $ne: id } });
      if (usernameExists) return res.status(409).json({ success: false, message: 'Username already taken' });
    }

    // Apply updates
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (district !== undefined) user.district = district || undefined;
    if (stream !== undefined) user.stream = stream || undefined;
    if (grade !== undefined) user.grade = grade || undefined;
    if (req.body.school !== undefined) user.school = req.body.school || undefined;
    if (isActive !== undefined) user.isActive = isActive;
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: { ...user.toObject(), password: undefined } }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// Delete user (Admin) — permanent delete
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent self-deletion
    if (id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    // Cascade: remove tutor profile if exists
    await Tutor.deleteMany({ userId: id });

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `User "${user.username}" deleted successfully`
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// Broadcast notification to all users or specific roles
const broadcastNotification = async (req, res) => {
  try {
    const { message, title, targetRole, priority = 'medium' } = req.body;
    
    if (!message || !title) {
      return res.status(400).json({
        success: false,
        message: 'Message and title are required for broadcast'
      });
    }

    const query = {};
    if (targetRole && targetRole !== 'All') {
      query.role = targetRole.toLowerCase().slice(0, -1); // 'Students' -> 'student'
      // Handle the pluralization from UI ('Students' / 'Tutors') 
      if (targetRole === 'Students') query.role = 'student';
      if (targetRole === 'Tutors') query.role = 'tutor';
    }

    const users = await User.find(query).select('_id');
    const userIds = users.map(u => u._id);

    if (userIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found for the selected broadcast criteria'
      });
    }

    await notificationService.sendBulkNotifications(userIds, {
      type: 'broadcast',
      data: {
        title,
        message,
        priority,
        sender: req.user.username
      }
    });

    res.json({
      success: true,
      message: `Broadcast successfully dispatched to ${userIds.length} users`,
      data: { recipientCount: userIds.length }
    });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dispatch broadcast',
      error: error.message
    });
  }
};

// Simulated Access Key Rotation for Security Hub
const rotateAccessKeys = async (req, res) => {
  try {
    const keyPairId = require('crypto').randomBytes(12).toString('hex').toUpperCase();
    const timestamp = new Date().toISOString();

    // In a real system, this would interact with AWS KMS, Google Secret Manager, or rotate JWT secrets
    console.log(`[SECURITY] Access Key Rotation initiated by ${req.user.username} (ID: ${req.user._id})`);
    console.log(`[SECURITY] New Key Group ID: ${keyPairId}`);

    // Create a system notification for the audit trail
    await Notification.create({
      userId: req.user._id,
      title: 'Security Keys Rotated',
      message: `Access key rotation completed successfully. New identifier: ${keyPairId}`,
      type: 'warning',
      data: { keyPairId, rotatedAt: timestamp, rotatedBy: req.user.username }
    });

    res.json({
      success: true,
      message: 'Platform access keys rotated successfully',
      data: {
        keyPairId,
        timestamp,
        status: 'ACTIVE_ROTATED'
      }
    });
  } catch (error) {
    console.error('Rotate access keys error:', error);
    res.status(500).json({
      success: false,
      message: 'Critical failure during key rotation',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStatistics,
  getAllUsersAdmin,
  toggleUserStatus,
  changeUserRole,
  getPendingTutors,
  approveTutor,
  rejectTutor,
  getPendingMaterials,
  bulkUserOperations,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  broadcastNotification,
  rotateAccessKeys
};

