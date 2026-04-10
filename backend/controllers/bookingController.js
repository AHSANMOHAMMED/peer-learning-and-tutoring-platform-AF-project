const Booking = require('../models/Booking');
const Tutor = require('../models/Tutor');

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
    const query = req.user.role === 'student' 
      ? { studentId: req.user._id } 
      : { tutorId: req.user._id };
    
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
        // Mock meeting URL generation
        booking.meetingUrl = `https://meet.jit.si/peerlearn-session-${booking._id}`;
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
