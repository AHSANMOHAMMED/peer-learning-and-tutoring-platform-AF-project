const crypto = require('crypto');

class VideoService {
  constructor() {
    this.jitsiConfig = {
      domain: process.env.JITSI_DOMAIN || 'meet.jit.si',
      appId: process.env.JITSI_APP_ID || 'vpaas-magic-cookie-1f7415320d0b4c26b75156453d4a6636',
      appSecret: process.env.JITSI_APP_SECRET || 'MySuperSecretKey1234567890',
      baseUrl: process.env.JITSI_BASE_URL || 'https://meet.jit.si'
    };
  }

  // Generate JWT token for Jitsi authentication
  generateJWT(roomName, user = {}) {
    const payload = {
      aud: 'jitsi',
      iss: this.jitsiConfig.appId,
      sub: this.jitsiConfig.domain,
      room: roomName,
      exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60), // 2 hours
      iat: Math.floor(Date.now() / 1000),
      context: {
        user: {
          id: user.id || 'anonymous',
          name: user.name || 'Anonymous User',
          avatar: user.avatar || '',
          email: user.email || ''
        },
        features: {
          livestreaming: false,
          recording: true,
          transcription: false,
          'outbound-call': false
        }
      }
    };

    return this.signJWT(payload);
  }

  // Sign JWT with app secret
  signJWT(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', this.jitsiConfig.appSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // Generate join URL for a room
  async generateJoinUrl(roomName, config = {}) {
    const { user, isModerator = false } = config;
    
    const jwt = this.generateJWT(roomName, user);
    
    const params = new URLSearchParams({
      jwt,
      config: JSON.stringify({
        prejoinPageEnabled: true,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableClosePage: false,
        disableInviteFunctions: false,
        disableProfile: false,
        hideConferenceSubject: false,
        hideConferenceTimer: false,
        enableWelcomePage: false,
        enableLobbyChat: true,
        enableNoAudioDetection: true,
        enableNoisyMicDetection: true,
        enableRemb: true,
        enableTcc: true,
        useStunTurn: true,
        disableThirdPartyRequests: true,
        ...config.roomConfig
      }),
      interfaceConfig: JSON.stringify({
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'info', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
          'e2ee'
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'profile', 'moderator'],
        SHOW_CHROME_EXTENSION_BANNER: false,
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        ...config.interfaceConfig
      })
    });

    return `${this.jitsiConfig.baseUrl}/${roomName}?${params.toString()}`;
  }

  // Start recording for a room
  async startRecording(roomName) {
    try {
      // In a real implementation, this would make an API call to Jitsi
      // For now, we'll simulate the recording start
      const recordingId = `recording_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
      
      console.log(`Starting recording for room: ${roomName}, Recording ID: ${recordingId}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return recordingId;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Failed to start recording');
    }
  }

  // Stop recording for a room
  async stopRecording(roomName, recordingId) {
    try {
      // In a real implementation, this would make an API call to Jitsi
      console.log(`Stopping recording for room: ${roomName}, Recording ID: ${recordingId}`);
      
      // Simulate API call delay and processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate recording data
      const recordingData = {
        url: `https://storage.peerlearn.com/recordings/${recordingId}.mp4`,
        duration: Math.floor(Math.random() * 3600) + 300, // 5 minutes to 1 hour
        size: Math.floor(Math.random() * 500000000) + 50000000, // 50MB to 500MB
        format: 'mp4'
      };
      
      return recordingData;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw new Error('Failed to stop recording');
    }
  }

  // Get recording status
  async getRecordingStatus(recordingId) {
    try {
      // Simulate checking recording status
      const statuses = ['processing', 'completed', 'failed'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        recordingId,
        status: randomStatus,
        progress: randomStatus === 'processing' ? Math.floor(Math.random() * 100) : 100,
        url: randomStatus === 'completed' ? `https://storage.peerlearn.com/recordings/${recordingId}.mp4` : null
      };
    } catch (error) {
      console.error('Failed to get recording status:', error);
      throw new Error('Failed to get recording status');
    }
  }

  // Delete recording
  async deleteRecording(recordingId) {
    try {
      console.log(`Deleting recording: ${recordingId}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Failed to delete recording:', error);
      throw new Error('Failed to delete recording');
    }
  }

  // Get room participants
  async getRoomParticipants(roomName) {
    try {
      // In a real implementation, this would make an API call to Jitsi
      // For now, we'll simulate participant data
      const participants = [
        {
          id: 'participant1',
          name: 'John Doe',
          avatar: '',
          email: 'john@example.com',
          role: 'moderator',
          joinedAt: new Date(Date.now() - 300000), // 5 minutes ago
          isAudioMuted: false,
          isVideoMuted: false,
          isScreenSharing: false
        },
        {
          id: 'participant2',
          name: 'Jane Smith',
          avatar: '',
          email: 'jane@example.com',
          role: 'participant',
          joinedAt: new Date(Date.now() - 240000), // 4 minutes ago
          isAudioMuted: true,
          isVideoMuted: false,
          isScreenSharing: false
        }
      ];
      
      return participants;
    } catch (error) {
      console.error('Failed to get room participants:', error);
      throw new Error('Failed to get room participants');
    }
  }

  // Kick participant from room
  async kickParticipant(roomName, participantId) {
    try {
      console.log(`Kicking participant ${participantId} from room ${roomName}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Failed to kick participant:', error);
      throw new Error('Failed to kick participant');
    }
  }

  // Mute participant
  async muteParticipant(roomName, participantId, muteAudio = true, muteVideo = false) {
    try {
      console.log(`Muting participant ${participantId} in room ${roomName} - Audio: ${muteAudio}, Video: ${muteVideo}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Failed to mute participant:', error);
      throw new Error('Failed to mute participant');
    }
  }

  // Generate room name
  generateRoomName(bookingId, additionalInfo = '') {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    const baseName = `peerlearn-${bookingId}`;
    
    return additionalInfo ? `${baseName}-${additionalInfo}-${timestamp}-${random}` : `${baseName}-${timestamp}-${random}`;
  }

  // Validate room configuration
  validateRoomConfig(config) {
    const validConfig = {
      prejoinPageEnabled: true,
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      enableClosePage: false,
      disableInviteFunctions: false,
      disableProfile: false,
      hideConferenceSubject: false,
      hideConferenceTimer: false,
      enableWelcomePage: false,
      enableLobbyChat: true,
      enableNoAudioDetection: true,
      enableNoisyMicDetection: true,
      enableRemb: true,
      enableTcc: true,
      useStunTurn: true,
      disableThirdPartyRequests: true
    };

    // Merge with provided config, ensuring only valid keys are included
    const mergedConfig = { ...validConfig };
    
    Object.keys(config).forEach(key => {
      if (key in validConfig) {
        mergedConfig[key] = config[key];
      }
    });

    return mergedConfig;
  }

  // Get room statistics
  async getRoomStatistics(roomName) {
    try {
      // In a real implementation, this would make an API call to Jitsi
      // For now, we'll simulate statistics
      const stats = {
        roomName,
        participantCount: Math.floor(Math.random() * 10) + 1,
        totalDuration: Math.floor(Math.random() * 3600) + 300, // 5 minutes to 1 hour
        audioQuality: 'good',
        videoQuality: 'good',
        connectionQuality: 'excellent',
        dataUsage: Math.floor(Math.random() * 100000000) + 10000000, // 10MB to 100MB
        recordingEnabled: Math.random() > 0.5,
        screenShareActive: Math.random() > 0.7
      };
      
      return stats;
    } catch (error) {
      console.error('Failed to get room statistics:', error);
      throw new Error('Failed to get room statistics');
    }
  }
}

module.exports = new VideoService();
