const Booking = require('../models/Booking');
const Tutor = require('../models/Tutor');
const User = require('../models/User');
const BookingService = require('../services/bookingService');
const { validationResult } = require('express-validator');

// Get all bookings with filters
const getBookings = async (req, res) => {
  try {
    const { status, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    
    const skip = (page - 1) * limit;
    
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('studentId', 'profile.firstName profile.lastName profile.avatar username')
        .populate('tutorId', 'userId subjects bio')
        .populate({
          path: 'tutorId',
          populate: {
            path: 'userId',
            select: 'profile.firstName profile.lastName profile.avatar username'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      Booking.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id)
      .populate('studentId', 'profile.firstName profile.lastName profile.avatar username email')
      .populate({
        path: 'tutorId',
        populate: {
          path: 'userId',
          select: 'profile.firstName profile.lastName profile.avatar username email'
        }
      })
      .exec();
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user has access to this booking
    const isStudent = booking.studentId._id.toString() === req.userId.toString();
    const isTutor = booking.tutorId.userId._id.toString() === req.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isStudent && !isTutor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// Create booking
const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const bookingData = req.body;
    
    // Use BookingService to create booking
    const booking = await BookingService.createBooking(req.userId, bookingData);
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                       error.message.includes('does not teach') || error.message.includes('no longer available') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create booking',
      error: error.message
    });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check ownership
    const isStudent = booking.studentId.toString() === req.userId.toString();
    const isTutor = booking.tutorId.toString() === req.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isStudent && !isTutor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'studentId' && key !== 'tutorId' && key !== 'payment') {
        booking[key] = updateData[key];
      }
    });
    
    booking.updatedAt = new Date();
    await booking.save();
    
    const populatedBooking = await Booking.findById(booking._id)
      .populate('studentId', 'profile.firstName profile.lastName profile.avatar username')
      .populate({
        path: 'tutorId',
        populate: {
          path: 'userId',
          select: 'profile.firstName profile.lastName profile.avatar username'
        }
      })
      .exec();
    
    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
};

// Confirm booking (tutor only)
const confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Use BookingService to confirm booking
    const booking = await BookingService.confirmBooking(id, req.userId);
    
    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      data: booking
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                       error.message.includes('Only the') || error.message.includes('Cannot confirm') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to confirm booking',
      error: error.message
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const booking = await Booking.findById(id).populate('tutorId');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Determine who is cancelling
    const isStudent = booking.studentId.toString() === req.userId.toString();
    const isTutor = booking.tutorId.userId.toString() === req.userId.toString();
    const cancelledBy = isStudent ? 'student' : isTutor ? 'tutor' : 'system';
    
    // Use BookingService to cancel booking
    const updatedBooking = await BookingService.cancelBooking(id, {
      reason,
      cancelledBy,
      userId: req.userId
    });
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                       error.message.includes('permission') || error.message.includes('Cannot cancel') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to cancel booking',
      error: error.message
    });
  }
};

// Complete booking
const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Use BookingService to complete booking
    const booking = await BookingService.completeBooking(id, req.userId);
    
    res.json({
      success: true,
      message: 'Booking completed successfully',
      data: booking
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                       error.message.includes('permission') || error.message.includes('Cannot complete') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to complete booking',
      error: error.message
    });
  }
};

// Get student bookings
const getStudentBookings = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    // Check if user is the student or admin
    const isOwnProfile = studentId === req.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const result = await Booking.getHistory(studentId, 'student', {
      status,
      page,
      limit
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get student bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student bookings',
      error: error.message
    });
  }
};

// Get tutor bookings
const getTutorBookings = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    // Check if user is the tutor owner or admin
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    const isOwner = tutor.userId.toString() === req.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const result = await Booking.getHistory(tutorId, 'tutor', {
      status,
      page,
      limit
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get tutor bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor bookings',
      error: error.message
    });
  }
};

// Get upcoming bookings
const getUpcomingBookings = async (req, res) => {
  try {
    const { userType } = req.query;
    const userId = req.userId;
    
    const bookings = await Booking.getUpcoming(userId, userType || 'student');
    
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get upcoming bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming bookings',
      error: error.message
    });
  }
};

// Check availability
const checkAvailability = async (req, res) => {
  try {
    const { tutorId, date, startTime, duration } = req.body;
    
    // Use BookingService to check availability
    const isAvailable = await BookingService.checkAvailability(
      tutorId,
      new Date(date),
      startTime,
      parseInt(duration)
    );
    
    res.json({
      success: true,
      data: { isAvailable }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error.message
    });
  }
};

module.exports = {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  confirmBooking,
  cancelBooking,
  completeBooking,
  getStudentBookings,
  getTutorBookings,
  getUpcomingBookings,
  checkAvailability
};
