const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const VideoConferencingService = require('../services/VideoConferencingService');

// Get video config for session
router.get('/:sessionId/video-config', authenticate, async (req, res) => {
  try {
    const config = await VideoConferencingService.getSessionVideoConfig(
      req.params.sessionId,
      req.user._id
    );
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Create Zoom meeting (for tutors)
router.post('/:sessionId/zoom', authenticate, async (req, res) => {
  try {
    const PeerSession = require('../models/PeerSession');
    const session = await PeerSession.findById(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    if (session.tutor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only tutor can create Zoom meeting' });
    }
    
    const meeting = await VideoConferencingService.createZoomMeeting(session);
    res.json({ success: true, data: meeting });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Create Daily.co room
router.post('/:sessionId/daily', authenticate, async (req, res) => {
  try {
    const PeerSession = require('../models/PeerSession');
    const session = await PeerSession.findById(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    const room = await VideoConferencingService.createDailyRoom(session);
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Start recording
router.post('/:sessionId/record', authenticate, async (req, res) => {
  try {
    const { provider = 'daily' } = req.body;
    const result = await VideoConferencingService.startRecording(
      req.params.sessionId,
      provider
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Stop recording
router.delete('/:sessionId/record', authenticate, async (req, res) => {
  try {
    const { provider = 'daily' } = req.body;
    const result = await VideoConferencingService.stopRecording(
      req.params.sessionId,
      provider
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get recording URL
router.get('/:sessionId/recording', authenticate, async (req, res) => {
  try {
    const { provider = 'daily' } = req.query;
    const recording = await VideoConferencingService.getRecordingUrl(
      req.params.sessionId,
      provider
    );
    res.json({ success: true, data: recording });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
