const Booking = require('../models/Booking');
const Tutor = require('../models/Tutor');
const User = require('../models/User');
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
    
    const {
      tutorId,
      subject,
      grade,
      date,
      startTime,
      duration,
      timezone,
      notes
    } = req.body;
    
    // Verify tutor exists
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    // Check if tutor teaches this subject
    const teachesSubject = tutor.subjects.some(s => 
      s.name.toLowerCase() === subject.toLowerCase() ||
      s.gradeLevels.includes(parseInt(grade))
    );
    
    if (!teachesSubject) {
      return res.status(400).json({
        success: false,
        message: 'Tutor does not teach this subject or grade level'
      });
    }
    
    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDateTime = new Date(2000, 0, 1, hours, minutes);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
    const endTime = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`;
    
    // Calculate payment amount
    const subjectRate = tutor.subjects.find(s => 
      s.name.toLowerCase() === subject.toLowerCase()
    )?.hourlyRate || tutor.hourlyRate || 0;
    const amount = (subjectRate * duration) / 60;
    
    // Check availability
    const isAvailable = await Booking.checkAvailability(
      tutorId,
      new Date(date),
      startTime,
      duration
    );
    
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is no longer available. Please select another time.'
      });
    }
    
    // Create booking
    const booking = new Booking({
      studentId: req.userId,
      tutorId,
      subject,
      grade,
      date: new Date(date),
      startTime,
      endTime,
      duration,
      timezone: timezone || 'UTC',
      payment: {
        amount,
        currency: tutor.currency || 'USD',
        status: 'pending'
      },
      notes: {
        student: notes
      },
      status: 'pending'
    });
    
    await booking.save();
    
    // Populate and return
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
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
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
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is the tutor or admin
    const isTutor = booking.tutorId.toString() === req.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isTutor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the tutor can confirm this booking'
      });
    }
    
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be confirmed'
      });
    }
    
    booking.confirm();
    await booking.save();
    
    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      data: booking
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm booking',
      error: error.message
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
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
    
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled'
      });
    }
    
    const cancelledBy = isStudent ? 'student' : isTutor ? 'tutor' : 'system';
    booking.cancel(reason, cancelledBy);
    await booking.save();
    
    // TODO: Process refund if payment was made
    if (booking.payment.status === 'paid') {
      // Initiate refund process
    }
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};

// Complete booking
const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is the tutor or admin
    const isTutor = booking.tutorId.toString() === req.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isTutor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the tutor can complete this booking'
      });
    }
    
    if (booking.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be in progress to complete'
      });
    }
    
    booking.complete();
    await booking.save();
    
    // Update tutor stats
    const tutor = await Tutor.findById(booking.tutorId);
    if (tutor) {
      tutor.updateStats({
        duration: booking.duration,
        studentId: booking.studentId
      });
      await tutor.save();
    }
    
    res.json({
      success: true,
      message: 'Booking completed successfully',
      data: booking
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete booking',
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
    
    const isAvailable = await Booking.checkAvailability(
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
