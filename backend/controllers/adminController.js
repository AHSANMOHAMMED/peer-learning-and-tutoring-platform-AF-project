const User = require('../models/User');
const Booking = require('../models/Booking');
const Report = require('../models/Report');
const Material = require('../models/Material');
const Tutor = require('../models/Tutor');

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
    
    const tutor = await Tutor.findById(id);
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
    await User.findByIdAndUpdate(tutor.userId, { role: 'tutor' });
    
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
    
    const tutor = await Tutor.findById(id);
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
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { 
            isActive: false,
            deletedAt: new Date(),
            deletedBy: req.user._id
          }
        );
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation'
        });
    }
    
    res.json({
      success: true,
      message: `Bulk operation completed. ${result.modifiedCount} users affected.`,
      data: { modifiedCount: result.modifiedCount }
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

module.exports = {
  getDashboardStatistics,
  getAllUsersAdmin,
  toggleUserStatus,
  changeUserRole,
  getPendingTutors,
  approveTutor,
  rejectTutor,
  getPendingMaterials,
  bulkUserOperations
};

