const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Tutor = require('../models/Tutor');
const { validationResult } = require('express-validator');

// Get all reviews
const getReviews = async (req, res) => {
  try {
    const { tutorId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = { isVisible: true };
    if (tutorId) query.tutorId = tutorId;
    
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortDirection;
    
    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('reviewerId', 'profile.firstName profile.lastName profile.avatar username')
        .populate('bookingId', 'date subject')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      Review.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

// Get review by ID
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id)
      .populate('reviewerId', 'profile.firstName profile.lastName profile.avatar username')
      .populate('tutorId', 'userId subjects bio')
      .populate('bookingId', 'date subject grade')
      .exec();
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Get review by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review',
      error: error.message
    });
  }
};

// Create review
const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { bookingId, rating, comment } = req.body;
    
    // Check if booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }
    
    // Check if user is the student
    const isStudent = booking.studentId.toString() === req.userId.toString();
    if (!isStudent) {
      return res.status(403).json({
        success: false,
        message: 'Only the student can review this booking'
      });
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({
      bookingId,
      reviewerId: req.userId
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }
    
    // Create review
    const review = new Review({
      bookingId,
      reviewerId: req.userId,
      tutorId: booking.tutorId,
      rating,
      comment,
      verifiedPurchase: booking.payment.status === 'paid'
    });
    
    await review.save();
    
    // Update tutor rating
    const tutor = await Tutor.findById(booking.tutorId);
    if (tutor) {
      tutor.updateRating(rating);
      await tutor.save();
    }
    
    // Update booking with review reference
    booking.addReview(review._id, 'student');
    await booking.save();
    
    // Populate and return
    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'profile.firstName profile.lastName profile.avatar username')
      .populate('bookingId', 'date subject')
      .exec();
    
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: populatedReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
};

// Update review
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user is the reviewer
    const isReviewer = review.reviewerId.toString() === req.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isReviewer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Store old rating for tutor update
    const oldRating = review.rating.overall;
    
    // Update review
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    review.updatedAt = new Date();
    
    await review.save();
    
    // Recalculate tutor rating if rating changed
    if (rating && rating.overall !== oldRating) {
      const tutor = await Tutor.findById(review.tutorId);
      if (tutor) {
        // Recalculate from all reviews
        const stats = await Review.calculateTutorStats(review.tutorId);
        if (stats) {
          tutor.rating.average = stats.averageOverall;
          tutor.rating.breakdown = {
            teaching: stats.averageTeaching,
            knowledge: stats.averageKnowledge,
            communication: stats.averageCommunication,
            punctuality: stats.averagePunctuality
          };
          await tutor.save();
        }
      }
    }
    
    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'profile.firstName profile.lastName profile.avatar username')
      .populate('bookingId', 'date subject')
      .exec();
    
    res.json({
      success: true,
      message: 'Review updated successfully',
      data: populatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user is the reviewer or admin
    const isReviewer = review.reviewerId.toString() === req.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isReviewer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await Review.findByIdAndDelete(id);
    
    // Recalculate tutor rating
    const tutor = await Tutor.findById(review.tutorId);
    if (tutor) {
      const stats = await Review.calculateTutorStats(review.tutorId);
      if (stats) {
        tutor.rating.average = stats.averageOverall;
        tutor.rating.count = stats.totalReviews;
        tutor.rating.breakdown = {
          teaching: stats.averageTeaching,
          knowledge: stats.averageKnowledge,
          communication: stats.averageCommunication,
          punctuality: stats.averagePunctuality
        };
      } else {
        // No reviews left
        tutor.rating.average = 0;
        tutor.rating.count = 0;
        tutor.rating.breakdown = {
          teaching: 0,
          knowledge: 0,
          communication: 0,
          punctuality: 0
        };
      }
      await tutor.save();
    }
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

// Add tutor response
const addTutorResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user is the tutor
    const isTutor = review.tutorId.toString() === req.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isTutor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the tutor can respond to this review'
      });
    }
    
    review.addTutorResponse(comment);
    await review.save();
    
    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'profile.firstName profile.lastName profile.avatar username')
      .populate('bookingId', 'date subject')
      .exec();
    
    res.json({
      success: true,
      message: 'Response added successfully',
      data: populatedReview
    });
  } catch (error) {
    console.error('Add tutor response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      error: error.message
    });
  }
};

// Mark review as helpful
const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    const marked = review.markHelpful(req.userId);
    await review.save();
    
    res.json({
      success: true,
      message: marked ? 'Review marked as helpful' : 'Already marked as helpful',
      data: { helpfulCount: review.helpful.count }
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful',
      error: error.message
    });
  }
};

// Report review
const reportReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    review.report(reason, req.userId);
    await review.save();
    
    res.json({
      success: true,
      message: 'Review reported successfully'
    });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report review',
      error: error.message
    });
  }
};

// Get tutor reviews with stats
const getTutorReviews = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await Review.getTutorReviews(tutorId, { page, limit });
    const stats = await Review.calculateTutorStats(tutorId);
    
    res.json({
      success: true,
      data: {
        ...result,
        stats
      }
    });
  } catch (error) {
    console.error('Get tutor reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor reviews',
      error: error.message
    });
  }
};

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  addTutorResponse,
  markHelpful,
  reportReview,
  getTutorReviews
};
