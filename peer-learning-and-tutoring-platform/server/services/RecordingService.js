const LectureCourse = require('../models/LectureCourse');
const GroupRoom = require('../models/GroupRoom');
const PeerSession = require('../models/PeerSession');

class RecordingService {
  constructor() {
    this.activeRecordings = new Map();
    this.supportedFormats = ['mp4', 'webm', 'mov'];
  }

  /**
   * Start recording a session
   * @param {String} sessionType - Type of session ('lecture', 'group', 'peer')
   * @param {String} sessionId - Session ID
   * @param {String} roomId - Room/Socket room ID
   * @param {Object} options - Recording options
   * @returns {Object} Recording session info
   */
  async startRecording(sessionType, sessionId, roomId, options = {}) {
    try {
      const recordingId = `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const recordingSession = {
        id: recordingId,
        sessionType,
        sessionId,
        roomId,
        startedAt: new Date(),
        status: 'recording',
        format: options.format || 'mp4',
        quality: options.quality || '1080p',
        includeAudio: options.includeAudio !== false,
        includeVideo: options.includeVideo !== false,
        includeScreen: options.includeScreen !== false,
        autoStopDuration: options.autoStopDuration || null, // minutes
        cloudStorage: options.cloudStorage || 'aws-s3',
        metadata: {
          participants: [],
          duration: 0,
          fileSize: 0,
          segments: []
        }
      };

      this.activeRecordings.set(recordingId, recordingSession);

      // Update session in database
      await this.updateSessionRecordingStatus(sessionType, sessionId, 'recording', recordingId);

      // Setup auto-stop if specified
      if (options.autoStopDuration) {
        setTimeout(() => {
          this.stopRecording(recordingId);
        }, options.autoStopDuration * 60 * 1000);
      }

      // Broadcast recording started
      if (global.io) {
        global.io.to(roomId).emit('recordingStarted', {
          recordingId,
          sessionType,
          sessionId,
          startedAt: recordingSession.startedAt
        });
      }

      console.log(`Recording started: ${recordingId} for ${sessionType} session ${sessionId}`);
      
      return recordingSession;

    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording a session
   * @param {String} recordingId - Recording ID
   * @returns {Object} Recording result
   */
  async stopRecording(recordingId) {
    try {
      const recording = this.activeRecordings.get(recordingId);
      if (!recording) {
        throw new Error('Recording not found');
      }

      if (recording.status !== 'recording') {
        throw new Error('Recording is not active');
      }

      recording.status = 'processing';
      recording.endedAt = new Date();
      recording.metadata.duration = (recording.endedAt - recording.startedAt) / 1000; // seconds

      // Generate recording URL (placeholder - would integrate with actual storage)
      const recordingUrl = await this.processAndStoreRecording(recording);

      // Update session in database
      await this.updateSessionRecordingStatus(
        recording.sessionType,
        recording.sessionId,
        'completed',
        recordingId,
        recordingUrl
      );

      // Remove from active recordings
      this.activeRecordings.delete(recordingId);

      // Broadcast recording stopped
      if (global.io) {
        global.io.to(recording.roomId).emit('recordingStopped', {
          recordingId,
          sessionType: recording.sessionType,
          sessionId: recording.sessionId,
          duration: recording.metadata.duration,
          recordingUrl,
          endedAt: recording.endedAt
        });
      }

      console.log(`Recording stopped: ${recordingId}, duration: ${recording.metadata.duration}s`);

      return {
        ...recording,
        recordingUrl,
        status: 'completed'
      };

    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  /**
   * Pause recording
   * @param {String} recordingId - Recording ID
   */
  async pauseRecording(recordingId) {
    const recording = this.activeRecordings.get(recordingId);
    if (!recording) {
      throw new Error('Recording not found');
    }

    recording.status = 'paused';
    recording.pausedAt = new Date();

    if (global.io) {
      global.io.to(recording.roomId).emit('recordingPaused', {
        recordingId,
        pausedAt: recording.pausedAt
      });
    }

    return recording;
  }

  /**
   * Resume recording
   * @param {String} recordingId - Recording ID
   */
  async resumeRecording(recordingId) {
    const recording = this.activeRecordings.get(recordingId);
    if (!recording) {
      throw new Error('Recording not found');
    }

    recording.status = 'recording';
    recording.resumedAt = new Date();
    
    // Calculate paused duration
    if (recording.pausedAt) {
      const pausedDuration = recording.resumedAt - recording.pausedAt;
      recording.totalPausedTime = (recording.totalPausedTime || 0) + pausedDuration;
    }

    if (global.io) {
      global.io.to(recording.roomId).emit('recordingResumed', {
        recordingId,
        resumedAt: recording.resumedAt
      });
    }

    return recording;
  }

  /**
   * Get recording status
   * @param {String} recordingId - Recording ID
   * @returns {Object} Recording status
   */
  async getRecordingStatus(recordingId) {
    const recording = this.activeRecordings.get(recordingId);
    if (!recording) {
      // Check database for completed recording
      return await this.findRecordingInDatabase(recordingId);
    }

    return {
      ...recording,
      currentDuration: recording.status === 'recording' 
        ? (new Date() - recording.startedAt - (recording.totalPausedTime || 0)) / 1000
        : recording.metadata.duration
    };
  }

  /**
   * Update session recording status in database
   */
  async updateSessionRecordingStatus(sessionType, sessionId, status, recordingId, recordingUrl = null) {
    try {
      switch (sessionType) {
        case 'lecture':
          await LectureCourse.updateOne(
            { 'sessions._id': sessionId },
            {
              $set: {
                'sessions.$.status': status === 'recording' ? 'live' : 'completed',
                'sessions.$.recordingUrl': recordingUrl,
                'sessions.$.isRecorded': true
              }
            }
          );
          break;

        case 'group':
          // Group rooms don't have individual session recording in the current schema
          // Could be added if needed
          break;

        case 'peer':
          await PeerSession.findByIdAndUpdate(sessionId, {
            recordingUrl,
            isRecorded: true
          });
          break;

        default:
          throw new Error('Unknown session type');
      }
    } catch (error) {
      console.error('Error updating session recording status:', error);
      throw error;
    }
  }

  /**
   * Process and store recording
   * @param {Object} recording - Recording object
   * @returns {String} Recording URL
   */
  async processAndStoreRecording(recording) {
    // This is a placeholder implementation
    // In a real implementation, this would:
    // 1. Process the raw recording data
    // 2. Transcode to different formats if needed
    // 3. Upload to cloud storage (AWS S3, Cloudflare R2, etc.)
    // 4. Generate CDN URLs
    // 5. Update database with recording metadata

    const mockProcessing = async () => {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock URL
      const timestamp = Date.now();
      const mockUrl = `https://cdn.peerlearn.com/recordings/${recording.sessionType}/${recording.sessionId}/${recording.id}.${recording.format}`;
      
      return mockUrl;
    };

    return await mockProcessing();
  }

  /**
   * Find recording in database
   */
  async findRecordingInDatabase(recordingId) {
    // Search across all session types
    const lectureRecording = await LectureCourse.findOne(
      { 'sessions.recordingId': recordingId },
      { 'sessions.$': 1 }
    );

    if (lectureRecording) {
      return lectureRecording.sessions[0];
    }

    const peerRecording = await PeerSession.findOne({ recordingId });
    if (peerRecording) {
      return peerRecording;
    }

    return null;
  }

  /**
   * Get recordings for a session
   * @param {String} sessionType - Session type
   * @param {String} sessionId - Session ID
   * @returns {Array} Recordings
   */
  async getSessionRecordings(sessionType, sessionId) {
    try {
      switch (sessionType) {
        case 'lecture':
          const lectureCourse = await LectureCourse.findOne(
            { 'sessions._id': sessionId },
            { 'sessions.$': 1 }
          );
          return lectureCourse ? [lectureCourse.sessions[0]] : [];

        case 'peer':
          const peerSession = await PeerSession.findById(sessionId);
          return peerSession && peerSession.isRecorded ? [peerSession] : [];

        default:
          return [];
      }
    } catch (error) {
      console.error('Error getting session recordings:', error);
      throw error;
    }
  }

  /**
   * Get all active recordings
   * @returns {Array} Active recordings
   */
  getActiveRecordings() {
    return Array.from(this.activeRecordings.values());
  }

  /**
   * Cleanup stale recordings
   * Stops recordings that have been running too long (safety measure)
   */
  async cleanupStaleRecordings(maxDuration = 180) { // 180 minutes default
    const now = new Date();
    const staleRecordings = [];

    this.activeRecordings.forEach((recording, recordingId) => {
      const duration = (now - recording.startedAt) / (1000 * 60); // minutes
      if (duration > maxDuration) {
        staleRecordings.push(recordingId);
      }
    });

    for (const recordingId of staleRecordings) {
      console.log(`Auto-stopping stale recording: ${recordingId}`);
      await this.stopRecording(recordingId);
    }

    return staleRecordings.length;
  }

  /**
   * Generate recording transcript using AI
   * @param {String} recordingUrl - Recording URL
   * @returns {Object} Transcript data
   */
  async generateTranscript(recordingUrl) {
    // Placeholder for AI transcription service integration
    // Would integrate with services like:
    // - OpenAI Whisper
    // - Google Speech-to-Text
    // - AWS Transcribe
    
    return {
      recordingUrl,
      transcript: null,
      status: 'pending',
      message: 'Transcription service not configured'
    };
  }

  /**
   * Generate recording summary using AI
   * @param {String} transcript - Recording transcript
   * @returns {Object} Summary data
   */
  async generateSummary(transcript) {
    // Placeholder for AI summary generation
    // Would integrate with services like:
    // - OpenAI GPT
    // - Google Gemini
    
    return {
      transcript,
      summary: null,
      status: 'pending',
      message: 'AI summary service not configured'
    };
  }

  /**
   * Delete recording
   * @param {String} recordingId - Recording ID
   * @returns {Boolean} Success status
   */
  async deleteRecording(recordingId) {
    try {
      // Stop if active
      if (this.activeRecordings.has(recordingId)) {
        await this.stopRecording(recordingId);
      }

      // Delete from storage
      // Placeholder - would delete from actual cloud storage
      
      // Update database
      await LectureCourse.updateMany(
        { 'sessions.recordingId': recordingId },
        {
          $set: {
            'sessions.$.recordingUrl': null,
            'sessions.$.isRecorded': false
          }
        }
      );

      await PeerSession.updateMany(
        { recordingId },
        {
          recordingUrl: null,
          isRecorded: false
        }
      );

      return true;

    } catch (error) {
      console.error('Error deleting recording:', error);
      throw error;
    }
  }
}

// Create singleton instance
const recordingService = new RecordingService();

// Setup periodic cleanup
setInterval(() => {
  recordingService.cleanupStaleRecordings();
}, 30 * 60 * 1000); // Every 30 minutes

module.exports = recordingService;
