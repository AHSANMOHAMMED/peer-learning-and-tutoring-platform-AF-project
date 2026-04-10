const Booking = require('../models/Booking');
const SessionFeedback = require('../models/SessionFeedback');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const videoService = require('../services/videoService');

// Start a video session
exports.startSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { config = {} } = req.body;

    const booking = await Booking.findById(id)
      .populate('studentId', 'profile.firstName profile.lastName username')
      .populate('tutorId', 'userId subjects bio');

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check if user is the tutor
    if (booking.tutorId.userId.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only tutors can start sessions' 
      });
    }

    // Check if session can be started
    if (!booking.canStartSession()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session cannot be started at this time' 
      });
    }

    // Generate room ID and join URL
    const roomId = `peerlearn-${booking._id}-${uuidv4()}`;
    const joinUrl = await videoService.generateJoinUrl(roomId, config);

    // Start the video session
    const sessionStarted = booking.startVideoSession(roomId, joinUrl, config);
    
    if (!sessionStarted) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to start session' 
      });
    }

    await booking.save();

    // Add tutor as first participant
    await booking.joinVideoSession(userId);

    res.status(200).json({
      success: true,
      message: 'Session started successfully',
      data: {
        sessionId: booking._id,
        roomId,
        joinUrl,
        config: booking.session.roomConfig
      }
    });

  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Join a video session
exports.joinSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check if user can join session
    if (!booking.canJoinSession(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You cannot join this session' 
      });
    }

    // Add user to participants
    await booking.joinVideoSession(userId);

    res.status(200).json({
      success: true,
      message: 'Joined session successfully',
      data: {
        sessionId: booking._id,
        roomId: booking.session.roomId,
        joinUrl: booking.session.joinUrl,
        config: booking.session.roomConfig
      }
    });

  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Leave a video session
exports.leaveSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { connectionQuality } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check if user is a participant
    const isParticipant = booking.studentId.toString() === userId || 
                         booking.tutorId.userId.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not a participant in this session' 
      });
    }

    // Remove user from participants
    await booking.leaveVideoSession(userId, connectionQuality);

    res.status(200).json({
      success: true,
      message: 'Left session successfully'
    });

  } catch (error) {
    console.error('Leave session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// End a video session
exports.endSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { analytics = {} } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check if user is the tutor
    if (booking.tutorId.userId.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only tutors can end sessions' 
      });
    }

    // Complete the booking
    const sessionCompleted = booking.complete();
    
    if (!sessionCompleted) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot end session at this time' 
      });
    }

    // Update session analytics
    if (Object.keys(analytics).length > 0) {
      await booking.updateSessionAnalytics(analytics);
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Session ended successfully',
      data: {
        sessionId: booking._id,
        duration: booking.getSessionDuration(),
        analytics: booking.session.analytics
      }
    });

  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Start recording
exports.startRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check if user is the tutor
    if (booking.tutorId.userId.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only tutors can start recording' 
      });
    }

    // Check if recording is already enabled
    if (booking.session.recording.isRecording) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recording is already in progress' 
      });
    }

    // Start recording via video service
    const recordingId = await videoService.startRecording(booking.session.roomId);
    
    // Update booking
    await booking.startRecording(recordingId);

    res.status(200).json({
      success: true,
      message: 'Recording started successfully',
      data: {
        recordingId,
        startedAt: booking.session.recording.recordingStartedAt
      }
    });

  } catch (error) {
    console.error('Start recording error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Stop recording
exports.stopRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check if user is the tutor
    if (booking.tutorId.userId.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only tutors can stop recording' 
      });
    }

    // Check if recording is in progress
    if (!booking.session.recording.isRecording) {
      return res.status(400).json({ 
        success: false, 
        message: 'No recording in progress' 
      });
    }

    // Stop recording via video service
    const recordingData = await videoService.stopRecording(
      booking.session.roomId, 
      booking.session.recording.recordingId
    );
    
    // Update booking
    await booking.stopRecording(
      recordingData.url,
      recordingData.duration,
      recordingData.size
    );

    res.status(200).json({
      success: true,
      message: 'Recording stopped successfully',
      data: {
        recordingUrl: booking.session.recording.recordingUrl,
        duration: booking.session.recording.recordingDuration,
        size: booking.session.recording.recordingSize
      }
    });

  } catch (error) {
    console.error('Stop recording error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Report technical issue
exports.reportTechnicalIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { issueType } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check if user is a participant
    const isParticipant = booking.studentId.toString() === userId || 
                         booking.tutorId.userId.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not a participant in this session' 
      });
    }

    // Add technical issue
    await booking.addTechnicalIssue(userId, issueType);

    res.status(200).json({
      success: true,
      message: 'Technical issue reported successfully'
    });

  } catch (error) {
    console.error('Report technical issue error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get session details
exports.getSessionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(id)
      .populate('studentId', 'profile.firstName profile.lastName username profile.avatar')
      .populate('tutorId.userId', 'profile.firstName profile.lastName username profile.avatar')
      .populate('tutorId', 'subjects bio');

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check if user is a participant
    const isParticipant = booking.studentId._id.toString() === userId || 
                         booking.tutorId.userId._id.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not a participant in this session' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: booking._id,
        subject: booking.subject,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        session: booking.session,
        student: booking.studentId,
        tutor: booking.tutorId,
        canStart: booking.canStartSession(),
        canJoin: booking.canJoinSession(userId)
      }
    });

  } catch (error) {
    console.error('Get session details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get session history
exports.getSessionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    // Determine if user is student or tutor
    const user = await User.findById(userId);
    const userType = user.role === 'tutor' ? 'tutor' : 'student';

    const result = await Booking.getHistory(userId, userType, {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get session history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
