const Booking = require('../models/Booking');
const Tutor = require('../models/Tutor');
const User = require('../models/User');
const EmailService = require('../services/emailService');

// @desc    Book a session
// @route   POST /api/bookings
// @access  Private (Student)
exports.createBooking = async (req, res) => {
  const { tutorId, date, startTime, endTime, subject, price } = req.body;

  try {
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    const booking = await Booking.create({
      tutorId,
      studentId: req.user._id,
      date,
      startTime,
      endTime,
      subject,
      price,
      status: 'pending'
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bookings for user
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query = { studentId: req.user._id };
    } else if (req.user.role === 'tutor') {
      // Find the tutor profile to get the ID if needed, 
      // but Booking model stores tutorId as the User ID in some implementations or Tutor ID in others.
      // Looking at createBooking, it uses tutorId from body (Tutor model ID).
      // Wait, let's check the Booking model.
      query = { tutorId: req.user._id }; 
    } else if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      query = {}; // All bookings
    } else {
      query = { studentId: req.user._id }; // Default
    }
    
    const bookings = await Booking.find(query)
      .populate('tutorId')
      .populate('studentId', 'username email profile.firstName profile.lastName profile.avatar');
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status (confirm/cancel)
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBookingStatus = async (req, res) => {
  const { status } = req.body; // 'confirmed', 'cancelled', 'completed', 'in_progress'

  try {
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      // Validate that only relevant users can update
      if (booking.tutorId.toString() !== req.user._id.toString() && 
          booking.studentId.toString() !== req.user._id.toString() && 
          req.user.role !== 'admin') {
        return res.status(401).json({ message: 'User not authorized' });
      }

      booking.status = status;
      if (status === 'confirmed') {
        // Platform-integrated meeting room
        booking.meetingUrl = `/session/${booking._id}`;
      }
      
      const updatedBooking = await booking.save();
      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update whiteboard data
// @route   PUT /api/bookings/:id/whiteboard
// @access  Private
exports.updateWhiteboard = async (req, res) => {
  const { whiteboardData } = req.body;

  try {
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      booking.whiteboardData = whiteboardData;
      const updatedBooking = await booking.save();
      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Request to skip a session
// @route   POST /api/bookings/:id/skip
// @access  Private (Student)
exports.requestSkip = async (req, res) => {
  const { reason } = req.body;

  try {
    const booking = await Booking.findById(req.params.id)
      .populate('studentId', 'username profile.firstName profile.lastName email')
      .populate('tutorId', 'profile.firstName profile.lastName');

    if (booking) {
      if (booking.studentId._id.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized' });
      }

      booking.status = 'skip_requested';
      booking.skipRequest = {
        reason,
        requestedAt: new Date(),
        status: 'pending'
      };

      const updatedBooking = await booking.save();
      
      // Notify Parent via email if linked
      try {
        const ParentStudentLink = require('../models/ParentStudentLink');
        const links = await ParentStudentLink.find({ 
          student: req.user._id, 
          status: 'active',
          'permissions.receiveNotifications': true
        }).populate('parent', 'email profile.firstName');
        
        const childName = `${booking.studentId.profile?.firstName || booking.studentId.username}`;
        
        for (const link of links) {
          if (link.parent && link.parent.email) {
            await EmailService.sendChildActivityAlert(
              link.parent.email,
              link.parent.profile?.firstName || 'Parent',
              childName,
              'Absence Requested',
              `${childName} has requested an absence for a session scheduled on ${new Date(booking.date).toLocaleDateString()}. Reason: ${reason}`
            );
          }
        }
      } catch (emailErr) {
        console.error('Error notifying parent about skip request:', emailErr);
      }

      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
