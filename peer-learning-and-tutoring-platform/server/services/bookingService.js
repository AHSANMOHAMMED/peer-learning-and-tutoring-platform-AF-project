const Booking = require('../models/Booking');
const Tutor = require('../models/Tutor');
const User = require('../models/User');
const TutorService = require('./tutorService');

/**
 * BookingService - Handles all booking-related business logic
 * This separates business logic from the data model and controllers
 */
class BookingService {
  /**
   * Check if a time slot is available for booking
   * @param {ObjectId} tutorId - Tutor's ID
   * @param {Date} date - Booking date
   * @param {string} startTime - Start time (HH:MM format)
   * @param {number} duration - Duration in minutes
   * @returns {Promise<boolean>} True if available
   */
  static async checkAvailability(tutorId, date, startTime, duration) {
    // First check tutor's general availability
    const isInAvailability = await TutorService.checkAvailability(tutorId, new Date(`${date.toISOString().split('T')[0]}T${startTime}`), duration);
    
    if (!isInAvailability) {
      return false;
    }
    
    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDateTime = new Date(2000, 0, 1, hours, minutes);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
    const endTime = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`;
    
    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      tutorId,
      date: date,
      status: { $in: ['pending', 'confirmed', 'in_progress'] },
      $or: [
        // New booking starts during existing booking
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gt: startTime } }
          ]
        },
        // New booking ends during existing booking
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gte: endTime } }
          ]
        },
        // New booking completely contains existing booking
        {
          $and: [
            { startTime: { $gte: startTime } },
            { endTime: { $lte: endTime } }
          ]
        }
      ]
    });
    
    return overlappingBookings.length === 0;
  }

  /**
   * Calculate booking payment amount based on tutor rate and duration
   * @param {Object} tutor - Tutor object
   * @param {string} subject - Subject name
   * @param {number} duration - Duration in minutes
   * @returns {number} Payment amount
   */
  static calculatePaymentAmount(tutor, subject, duration) {
    const subjectData = tutor.subjects.find(s => 
      s.name.toLowerCase() === subject.toLowerCase()
    );
    
    const hourlyRate = subjectData?.hourlyRate || tutor.hourlyRate || 0;
    return (hourlyRate * duration) / 60;
  }

  /**
   * Calculate end time from start time and duration
   * @param {string} startTime - Start time in HH:MM format
   * @param {number} duration - Duration in minutes
   * @returns {string} End time in HH:MM format
   */
  static calculateEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDateTime = new Date(2000, 0, 1, hours, minutes);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
    return `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`;
  }

  /**
   * Create a new booking
   * @param {ObjectId} studentId - Student's ID
   * @param {Object} bookingData - Booking details
   * @returns {Promise<Object>} Created booking
   */
  static async createBooking(studentId, bookingData) {
    const { tutorId, subject, grade, date, startTime, duration, timezone, notes } = bookingData;
    
    // Verify tutor exists
    const tutor = await Tutor.findById(tutorId).populate('userId');
    if (!tutor) {
      throw new Error('Tutor not found');
    }
    
    // Check if tutor teaches this subject/grade
    const teachesSubject = tutor.subjects.some(s => 
      s.name.toLowerCase() === subject.toLowerCase() &&
      (!grade || s.gradeLevels.includes(parseInt(grade)))
    );
    
    if (!teachesSubject) {
      throw new Error('Tutor does not teach this subject or grade level');
    }
    
    // Calculate end time
    const endTime = this.calculateEndTime(startTime, duration);
    
    // Calculate payment amount
    const amount = this.calculatePaymentAmount(tutor, subject, duration);
    
    // Check availability
    const isAvailable = await this.checkAvailability(tutorId, new Date(date), startTime, duration);
    
    if (!isAvailable) {
      throw new Error('This time slot is no longer available');
    }
    
    // Create booking
    const booking = new Booking({
      studentId,
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
      }
    });
    
    await booking.save();
    
    // Populate booking details
    await booking.populate([
      { path: 'studentId', select: 'profile.firstName profile.lastName profile.avatar username' },
      { 
        path: 'tutorId',
        populate: {
          path: 'userId',
          select: 'profile.firstName profile.lastName profile.avatar username'
        }
      }
    ]);
    
    return booking;
  }

  /**
   * Confirm a booking (tutor accepts the booking)
   * @param {ObjectId} bookingId - Booking ID
   * @param {ObjectId} userId - User ID (must be the tutor)
   * @returns {Promise<Object>} Updated booking
   */
  static async confirmBooking(bookingId, userId) {
    const booking = await Booking.findById(bookingId).populate('tutorId');
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    // Verify user is the tutor
    if (booking.tutorId.userId.toString() !== userId.toString()) {
      throw new Error('Only the assigned tutor can confirm this booking');
    }
    
    if (booking.status !== 'pending') {
      throw new Error(`Cannot confirm booking with status: ${booking.status}`);
    }
    
    booking.status = 'confirmed';
    await booking.save();
    
    return booking;
  }

  /**
   * Cancel a booking
   * @param {ObjectId} bookingId - Booking ID
   * @param {Object} cancellationData - Cancellation details (reason, cancelledBy, userId)
   * @returns {Promise<Object>} Updated booking
   */
  static async cancelBooking(bookingId, cancellationData) {
    const { reason, cancelledBy, userId } = cancellationData;
    
    const booking = await Booking.findById(bookingId).populate('tutorId');
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    // Verify user has permission to cancel
    const isStudent = booking.studentId.toString() === userId.toString();
    const isTutor = booking.tutorId.userId.toString() === userId.toString();
    
    if (!isStudent && !isTutor && cancelledBy !== 'system') {
      throw new Error('You do not have permission to cancel this booking');
    }
    
    if (!['pending', 'confirmed'].includes(booking.status)) {
      throw new Error(`Cannot cancel booking with status: ${booking.status}`);
    }
    
    booking.status = 'cancelled';
    booking.cancellation = {
      reason: reason || 'No reason provided',
      cancelledBy,
      cancelledAt: new Date(),
      refundStatus: 'pending'
    };
    
    await booking.save();
    
    // Calculate refund if payment was made
    if (booking.payment.status === 'paid') {
      // Refund policy: Full refund if cancelled 24+ hours before, 50% if less
      const bookingDateTime = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.startTime}`);
      const hoursUntilBooking = (bookingDateTime - new Date()) / (1000 * 60 * 60);
      
      if (hoursUntilBooking >= 24) {
        booking.payment.refundAmount = booking.payment.amount;
      } else if (hoursUntilBooking >= 0) {
        booking.payment.refundAmount = booking.payment.amount * 0.5;
      } else {
        booking.payment.refundAmount = 0; // No refund for past bookings
      }
      
      await booking.save();
    }
    
    return booking;
  }

  /**
   * Complete a booking (mark as finished)
   * @param {ObjectId} bookingId - Booking ID
   * @param {ObjectId} userId - User ID
   * @returns {Promise<Object>} Updated booking
   */
  static async completeBooking(bookingId, userId) {
    const booking = await Booking.findById(bookingId).populate('tutorId');
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    // Verify user is the student or tutor
    const isStudent = booking.studentId.toString() === userId.toString();
    const isTutor = booking.tutorId.userId.toString() === userId.toString();
    
    if (!isStudent && !isTutor) {
      throw new Error('You do not have permission to complete this booking');
    }
    
    if (booking.status !== 'in_progress') {
      throw new Error(`Cannot complete booking with status: ${booking.status}`);
    }
    
    booking.status = 'completed';
    booking.session.endedAt = new Date();
    
    // Calculate actual session duration
    if (booking.session.startedAt) {
      booking.session.analytics.totalDuration = Math.round(
        (booking.session.endedAt - booking.session.startedAt) / (1000 * 60)
      );
    }
    
    await booking.save();
    
    // Update tutor stats
    if (booking.tutorId._id) {
      await TutorService.updateStats(booking.tutorId._id, {
        duration: booking.duration,
        studentId: booking.studentId
      });
    }
    
    return booking;
  }

  /**
   * Start a video session for a booking
   * @param {ObjectId} bookingId - Booking ID
   * @param {Object} sessionData - Session configuration (roomId, joinUrl, config)
   * @returns {Promise<Object>} Updated booking
   */
  static async startVideoSession(bookingId, sessionData) {
    const { roomId, joinUrl, config = {} } = sessionData;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    if (booking.status !== 'confirmed') {
      throw new Error(`Cannot start session for booking with status: ${booking.status}`);
    }
    
    booking.status = 'in_progress';
    booking.session.startedAt = new Date();
    booking.session.roomId = roomId;
    booking.session.joinUrl = joinUrl;
    
    // Merge room config
    booking.session.roomConfig = {
      ...booking.session.roomConfig,
      ...config
    };
    
    await booking.save();
    
    return booking;
  }

  /**
   * Join a video session
   * @param {ObjectId} bookingId - Booking ID
   * @param {ObjectId} userId - User ID joining the session
   * @returns {Promise<Object>} Updated booking
   */
  static async joinVideoSession(bookingId, userId) {
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    const participant = booking.session.participants.find(
      p => p.userId.toString() === userId.toString()
    );
    
    if (participant) {
      participant.joinedAt = new Date();
    } else {
      booking.session.participants.push({
        userId,
        joinedAt: new Date()
      });
    }
    
    booking.session.analytics.participantCount = booking.session.participants.length;
    
    await booking.save();
    
    return booking;
  }

  /**
   * Leave a video session
   * @param {ObjectId} bookingId - Booking ID
   * @param {ObjectId} userId - User ID leaving the session
   * @param {string} connectionQuality - Connection quality rating
   * @returns {Promise<Object>} Updated booking
   */
  static async leaveVideoSession(bookingId, userId, connectionQuality = null) {
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    const participant = booking.session.participants.find(
      p => p.userId.toString() === userId.toString()
    );
    
    if (participant && participant.joinedAt) {
      participant.leftAt = new Date();
      participant.duration = Math.round((participant.leftAt - participant.joinedAt) / (1000 * 60));
      
      if (connectionQuality) {
        participant.connectionQuality = connectionQuality;
      }
    }
    
    await booking.save();
    
    return booking;
  }

  /**
   * Get bookings for a user (student or tutor)
   * @param {ObjectId} userId - User ID
   * @param {Object} filters - Optional filters (status, dateFrom, dateTo, page, limit)
   * @returns {Promise<Object>} Bookings with pagination
   */
  static async getUserBookings(userId, filters = {}) {
    const { status, dateFrom, dateTo, role, page = 1, limit = 10 } = filters;
    
    const query = {};
    
    // Determine if user is student or tutor
    if (role === 'student') {
      query.studentId = userId;
    } else if (role === 'tutor') {
      const tutor = await Tutor.findOne({ userId });
      if (tutor) {
        query.tutorId = tutor._id;
      } else {
        return { bookings: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
      }
    } else {
      // Search both
      const tutor = await Tutor.findOne({ userId });
      query.$or = [
        { studentId: userId },
        { tutorId: tutor?._id }
      ].filter(Boolean);
    }
    
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
        .populate({
          path: 'tutorId',
          populate: {
            path: 'userId',
            select: 'profile.firstName profile.lastName profile.avatar username'
          }
        })
        .sort({ date: -1, startTime: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      Booking.countDocuments(query)
    ]);
    
    return {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get upcoming bookings for a user
   * @param {ObjectId} userId - User ID
   * @param {number} limit - Maximum number of bookings to return
   * @returns {Promise<Array>} Array of upcoming bookings
   */
  static async getUpcomingBookings(userId, limit = 10) {
    const tutor = await Tutor.findOne({ userId });
    
    const query = {
      $or: [
        { studentId: userId },
        ...(tutor ? [{ tutorId: tutor._id }] : [])
      ],
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: new Date() }
    };
    
    return Booking.find(query)
      .populate('studentId', 'profile.firstName profile.lastName profile.avatar username')
      .populate({
        path: 'tutorId',
        populate: {
          path: 'userId',
          select: 'profile.firstName profile.lastName profile.avatar username'
        }
      })
      .sort({ date: 1, startTime: 1 })
      .limit(parseInt(limit))
      .exec();
  }
}

module.exports = BookingService;
