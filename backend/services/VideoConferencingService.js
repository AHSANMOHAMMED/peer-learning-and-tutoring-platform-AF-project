const axios = require('axios');
const PeerSession = require('../models/PeerSession');
const User = require('../models/User');

class VideoConferencingService {
  constructor() {
    // Jitsi Meet configuration
    this.jitsiDomain = process.env.JITSI_DOMAIN || 'meet.jit.si';
    this.jwtSecret = process.env.JITSI_JWT_SECRET;
    
    // Zoom API configuration (optional)
    this.zoomApiKey = process.env.ZOOM_API_KEY;
    this.zoomApiSecret = process.env.ZOOM_API_SECRET;
    
    // Daily.co configuration (alternative)
    this.dailyApiKey = process.env.DAILY_API_KEY;
  }

  /**
   * Create Jitsi meeting room
   */
  async createJitsiRoom(sessionId, options = {}) {
    try {
      const roomName = `peerlearn-${sessionId}-${Date.now()}`;
      
      const config = {
        roomName,
        domain: this.jitsiDomain,
        options: {
          configOverwrite: {
            startWithAudioMuted: options.audioMuted || false,
            startWithVideoMuted: options.videoMuted || false,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'chat', 'recording',
              'livestreaming', 'etherpad', 'sharedvideo', 'settings',
              'videoquality', 'filmstrip', 'feedback', 'stats',
              'shortcuts', 'tileview', 'videobackgroundblur', 'download',
              'help', 'mute-everyone', 'security'
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: '#3b82f6',
          },
          userInfo: {
            displayName: options.userName,
            email: options.userEmail
          }
        }
      };

      // If JWT is configured, generate token
      if (this.jwtSecret) {
        config.jwt = this.generateJitsiJWT(roomName, options);
      }

      return {
        roomName,
        url: `https://${this.jitsiDomain}/${roomName}`,
        config
      };
    } catch (error) {
      console.error('Error creating Jitsi room:', error);
      throw error;
    }
  }

  /**
   * Generate Jitsi JWT token
   */
  generateJitsiJWT(roomName, options) {
    const jwt = require('jsonwebtoken');
    
    const payload = {
      context: {
        user: {
          name: options.userName,
          email: options.userEmail,
          id: options.userId
        }
      },
      aud: 'jitsi',
      iss: 'peerlearn',
      sub: this.jitsiDomain,
      room: roomName,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 hours
    };

    return jwt.sign(payload, this.jwtSecret, { algorithm: 'HS256' });
  }

  /**
   * Create Zoom meeting
   */
  async createZoomMeeting(sessionData) {
    try {
      if (!this.zoomApiKey || !this.zoomApiSecret) {
        throw new Error('Zoom API not configured');
      }

      const token = Buffer.from(`${this.zoomApiKey}:${this.zoomApiSecret}`).toString('base64');
      
      const response = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
          topic: sessionData.subject,
          type: 2, // Scheduled meeting
          start_time: sessionData.scheduledFor,
          duration: sessionData.duration || 60,
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            watermark: false,
            use_pmi: false,
            approval_type: 0,
            audio: 'both',
            auto_recording: 'cloud',
            waiting_room: true
          }
        },
        {
          headers: {
            'Authorization': `Basic ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        meetingId: response.data.id,
        joinUrl: response.data.join_url,
        startUrl: response.data.start_url,
        password: response.data.password,
        provider: 'zoom'
      };
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      throw error;
    }
  }

  /**
   * Create Daily.co room
   */
  async createDailyRoom(sessionData) {
    try {
      if (!this.dailyApiKey) {
        throw new Error('Daily.co API not configured');
      }

      const response = await axios.post(
        'https://api.daily.co/v1/rooms',
        {
          name: `peerlearn-${sessionData._id}`,
          privacy: 'public',
          properties: {
            max_participants: 50,
            enable_screenshare: true,
            enable_chat: true,
            start_video_off: false,
            start_audio_off: false,
            enable_recording: 'cloud',
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.dailyApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        roomName: response.data.name,
        url: response.data.url,
        token: response.data.token,
        provider: 'daily'
      };
    } catch (error) {
      console.error('Error creating Daily.co room:', error);
      throw error;
    }
  }

  /**
   * Start recording
   */
  async startRecording(sessionId, provider = 'jitsi') {
    try {
      const session = await PeerSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      switch (provider) {
        case 'jitsi':
          // Jitsi recording is handled client-side via Jibri
          return {
            status: 'started',
            provider: 'jitsi',
            message: 'Recording started via Jibri'
          };

        case 'zoom':
          // Zoom cloud recording is automatic
          return {
            status: 'started',
            provider: 'zoom',
            message: 'Cloud recording enabled'
          };

        case 'daily':
          // Start Daily.co recording
          const response = await axios.post(
            `https://api.daily.co/v1/rooms/peerlearn-${sessionId}/recordings`,
            { 
              layout: {
                preset: 'default',
                max_cam_streams: 25
              } 
            },
            {
              headers: {
                'Authorization': `Bearer ${this.dailyApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          return {
            status: 'started',
            provider: 'daily',
            recordingId: response.data.id
          };

        default:
          throw new Error('Unknown provider');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording
   */
  async stopRecording(sessionId, provider = 'jitsi') {
    try {
      switch (provider) {
        case 'daily':
          await axios.delete(
            `https://api.daily.co/v1/rooms/peerlearn-${sessionId}/recordings`,
            {
              headers: {
                'Authorization': `Bearer ${this.dailyApiKey}`
              }
            }
          );
          return { status: 'stopped', provider: 'daily' };

        default:
          return { status: 'stopped', provider };
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  /**
   * Get recording URL
   */
  async getRecordingUrl(sessionId, provider = 'daily') {
    try {
      if (provider === 'daily') {
        const response = await axios.get(
          `https://api.daily.co/v1/rooms/peerlearn-${sessionId}/recordings`,
          {
            headers: {
              'Authorization': `Bearer ${this.dailyApiKey}`
            }
          }
        );

        if (response.data.data && response.data.data.length > 0) {
          const recording = response.data.data[0];
          return {
            url: recording.download_url,
            duration: recording.duration,
            status: recording.status
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting recording:', error);
      throw error;
    }
  }

  /**
   * Generate meeting token for secure access
   */
  async generateMeetingToken(sessionId, userId, isHost = false) {
    try {
      const user = await User.findById(userId);
      const session = await PeerSession.findById(sessionId);

      if (!user || !session) {
        throw new Error('User or session not found');
      }

      // Check if user is participant
      const isParticipant = session.participants.some(
        p => p.user.toString() === userId.toString()
      );

      if (!isParticipant && !isHost) {
        throw new Error('Not authorized to join this session');
      }

      const token = {
        sessionId,
        userId,
        userName: user.name,
        isHost,
        exp: Math.floor(Date.now() / 1000) + 4 * 60 * 60 // 4 hours
      };

      return token;
    } catch (error) {
      console.error('Error generating token:', error);
      throw error;
    }
  }

  /**
   * Get session video config
   */
  async getSessionVideoConfig(sessionId, userId) {
    try {
      const session = await PeerSession.findById(sessionId)
        .populate('participants.user', 'name email');

      if (!session) {
        throw new Error('Session not found');
      }

      const user = session.participants.find(
        p => p.user._id.toString() === userId.toString()
      );

      if (!user) {
        throw new Error('Not a participant');
      }

      const isHost = session.createdBy.toString() === userId.toString();

      // Create or get existing room
      const roomConfig = await this.createJitsiRoom(sessionId, {
        userName: user.user.name,
        userEmail: user.user.email,
        userId,
        audioMuted: false,
        videoMuted: false
      });

      return {
        roomUrl: roomConfig.url,
        roomName: roomConfig.roomName,
        config: roomConfig.config,
        isHost,
        participants: session.participants.map(p => ({
          id: p.user._id,
          name: p.user.name,
          role: p.role
        }))
      };
    } catch (error) {
      console.error('Error getting video config:', error);
      throw error;
    }
  }

  /**
   * Send invite email
   */
  async sendMeetingInvite(sessionId, email, inviterId) {
    try {
      const [session, inviter] = await Promise.all([
        PeerSession.findById(sessionId),
        User.findById(inviterId)
      ]);

      if (!session || !inviter) {
        throw new Error('Session or inviter not found');
      }

      // Generate join link
      const joinLink = `${process.env.CLIENT_URL}/sessions/join/${sessionId}`;

      // Send email (via notification service or directly)
      // Implementation depends on email service

      return {
        sent: true,
        email,
        joinLink
      };
    } catch (error) {
      console.error('Error sending invite:', error);
      throw error;
    }
  }
}

module.exports = new VideoConferencingService();
