const Tutor = require('../models/Tutor');
const User = require('../models/User');
const Review = require('../models/Review');
const { validationResult } = require('express-validator');

// Get all tutors with search and filters
const getTutors = async (req, res) => {
  try {
    const searchParams = req.query;
    const result = await Tutor.search(searchParams);
    
    res.json({
      success: true,
      data: {
        tutors: result.tutors,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get tutors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutors',
      error: error.message
    });
  }
};

// Get tutor by ID
const getTutorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tutor = await Tutor.findById(id)
      .populate('user', 'profile.firstName profile.lastName profile.avatar profile.bio username email')
      .exec();
    
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    res.json({
      success: true,
      data: tutor
    });
  } catch (error) {
    console.error('Get tutor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor',
      error: error.message
    });
  }
};

// Create tutor profile
const createTutor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { subjects, availability, qualifications, bio, teachingStyle, languages, hourlyRate, currency } = req.body;
    
    // Check if user already has a tutor profile
    const existingTutor = await Tutor.findOne({ userId: req.userId });
    if (existingTutor) {
      return res.status(400).json({
        success: false,
        message: 'User already has a tutor profile'
      });
    }
    
    // Verify user is a tutor or can become one
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create tutor profile
    const tutor = new Tutor({
      userId: req.userId,
      subjects: subjects || [],
      availability: availability || [],
      qualifications: qualifications || {},
      bio,
      teachingStyle,
      languages: languages || [],
      hourlyRate,
      currency
    });
    
    await tutor.save();
    
    // Update user role to tutor if not already
    if (user.role !== 'tutor') {
      user.role = 'tutor';
      await user.save();
    }
    
    // Populate and return
    const populatedTutor = await Tutor.findById(tutor._id)
      .populate('user', 'profile.firstName profile.lastName profile.avatar username')
      .exec();
    
    res.status(201).json({
      success: true,
      message: 'Tutor profile created successfully',
      data: populatedTutor
    });
  } catch (error) {
    console.error('Create tutor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tutor profile',
      error: error.message
    });
  }
};

// Update tutor profile
const updateTutor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const updateData = req.body;
    
    // Check ownership
    const tutor = await Tutor.findById(id);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    // Check if user is owner or admin
    const isOwner = tutor.userId.toString() === req.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'userId' && key !== '_id') {
        tutor[key] = updateData[key];
      }
    });
    
    tutor.updatedAt = new Date();
    await tutor.save();
    
    // Populate and return
    const populatedTutor = await Tutor.findById(tutor._id)
      .populate('user', 'profile.firstName profile.lastName profile.avatar username')
      .exec();
    
    res.json({
      success: true,
      message: 'Tutor profile updated successfully',
      data: populatedTutor
    });
  } catch (error) {
    console.error('Update tutor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tutor profile',
      error: error.message
    });
  }
};

// Delete tutor profile
const deleteTutor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tutor = await Tutor.findById(id);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    // Check if user is owner or admin
    const isOwner = tutor.userId.toString() === req.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await Tutor.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Tutor profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete tutor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tutor profile',
      error: error.message
    });
  }
};

// Add availability slot
const addAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const availabilityData = req.body;
    
    const tutor = await Tutor.findById(id);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    // Check ownership
    const isOwner = tutor.userId.toString() === req.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    tutor.addAvailability(availabilityData);
    await tutor.save();
    
    res.json({
      success: true,
      message: 'Availability added successfully',
      data: tutor.availability
    });
  } catch (error) {
    console.error('Add availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add availability',
      error: error.message
    });
  }
};

// Remove availability slot
const removeAvailability = async (req, res) => {
  try {
    const { id, slotId } = req.params;
    
    const tutor = await Tutor.findById(id);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    // Check ownership
    const isOwner = tutor.userId.toString() === req.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    tutor.removeAvailability(slotId);
    await tutor.save();
    
    res.json({
      success: true,
      message: 'Availability removed successfully',
      data: tutor.availability
    });
  } catch (error) {
    console.error('Remove availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove availability',
      error: error.message
    });
  }
};

// Add subject
const addSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subjectData = req.body;
    
    const tutor = await Tutor.findById(id);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    // Check ownership
    const isOwner = tutor.userId.toString() === req.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    tutor.addSubject(subjectData);
    await tutor.save();
    
    res.json({
      success: true,
      message: 'Subject added successfully',
      data: tutor.subjects
    });
  } catch (error) {
    console.error('Add subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add subject',
      error: error.message
    });
  }
};

// Remove subject
const removeSubject = async (req, res) => {
  try {
    const { id, subjectId } = req.params;
    
    const tutor = await Tutor.findById(id);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    // Check ownership
    const isOwner = tutor.userId.toString() === req.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    tutor.removeSubject(subjectId);
    await tutor.save();
    
    res.json({
      success: true,
      message: 'Subject removed successfully',
      data: tutor.subjects
    });
  } catch (error) {
    console.error('Remove subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove subject',
      error: error.message
    });
  }
};

// Get tutor reviews
const getTutorReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;
    
    const result = await Review.getTutorReviews(id, {
      page,
      limit,
      sortBy,
      sortOrder
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get tutor reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

// Get tutor stats
const getTutorStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tutor = await Tutor.findById(id);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    // Get rating stats
    const ratingStats = await Review.calculateTutorStats(id);
    
    res.json({
      success: true,
      data: {
        stats: tutor.stats,
        rating: ratingStats
      }
    });
  } catch (error) {
    console.error('Get tutor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor stats',
      error: error.message
    });
  }
};

// Verify tutor (admin only)
const verifyTutor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tutor = await Tutor.findById(id);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    tutor.isVerified = true;
    await tutor.save();
    
    res.json({
      success: true,
      message: 'Tutor verified successfully',
      data: { isVerified: true }
    });
  } catch (error) {
    console.error('Verify tutor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify tutor',
      error: error.message
    });
  }
};

// Get featured tutors
const getFeaturedTutors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const tutors = await Tutor.getFeatured(parseInt(limit));
    
    res.json({
      success: true,
      data: tutors
    });
  } catch (error) {
    console.error('Get featured tutors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured tutors',
      error: error.message
    });
  }
};

// Get top rated tutors
const getTopRatedTutors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const tutors = await Tutor.getTopRated(parseInt(limit));
    
    res.json({
      success: true,
      data: tutors
    });
  } catch (error) {
    console.error('Get top rated tutors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top rated tutors',
      error: error.message
    });
  }
};

module.exports = {
  getTutors,
  getTutorById,
  createTutor,
  updateTutor,
  deleteTutor,
  addAvailability,
  removeAvailability,
  addSubject,
  removeSubject,
  getTutorReviews,
  getTutorStats,
  verifyTutor,
  getFeaturedTutors,
  getTopRatedTutors
};
