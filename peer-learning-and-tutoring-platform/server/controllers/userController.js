const User = require('../models/User');
const Booking = require('../models/Booking');
const Material = require('../models/Material');
const Report = require('../models/Report');
const { validationResult } = require('express-validator');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { profile } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update profile fields
    if (profile) {
      Object.keys(profile).forEach(key => {
        if (key !== '_id') {
          user.profile[key] = profile[key];
        }
      });
    }
    
    user.updatedAt = new Date();
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.profile.avatar = avatarUrl;
    await user.save();
    
    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatar: avatarUrl }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
};

// Get user settings
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user.settings || {}
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

// Update user settings
const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.settings = { ...user.settings, ...settings };
    await user.save();
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: user.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 10, search } = req.query;
    
    const query = {};
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      User.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Get user by ID (admin only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields (excluding sensitive ones)
    Object.keys(updateData).forEach(key => {
      if (!['_id', 'password', 'emailVerificationToken', 'passwordResetToken'].includes(key)) {
        user[key] = updateData[key];
      }
    });
    
    user.updatedAt = new Date();
    await user.save();
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user.toPublicJSON()
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

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await User.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
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

// Get admin statistics (admin only)
const getAdminStatistics = async (req, res) => {
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

    res.json({
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
    console.error('Get admin statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Get parent children (parent only)
const getParentChildren = async (req, res) => {
  try {
    const parentId = req.userId;
    
    // For now, return empty array - this would need a parent-child relationship model
    // Or we can search for students with the same email domain or phone
    res.json({
      success: true,
      data: {
        children: []
      }
    });
  } catch (error) {
    console.error('Get parent children error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch children',
      error: error.message
    });
  }
};

// Get student progress by ID (parent or admin)
const getStudentProgress = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get student's completed bookings with ratings
    const bookings = await Booking.find({
      studentId: id,
      status: 'completed'
    }).populate('tutorId', 'userId subjects')
     .sort({ completedAt: -1 })
     .limit(10);

    // Calculate progress metrics
    const totalSessions = bookings.length;
    const averageRating = bookings.reduce((acc, b) => acc + (b.rating || 0), 0) / (totalSessions || 1);
    const subjects = [...new Set(bookings.map(b => b.subject))];

    res.json({
      success: true,
      data: {
        totalSessions,
        averageRating,
        subjects,
        recentBookings: bookings
      }
    });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student progress',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  getSettings,
  updateSettings,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAdminStatistics,
  getParentChildren,
  getStudentProgress
};
