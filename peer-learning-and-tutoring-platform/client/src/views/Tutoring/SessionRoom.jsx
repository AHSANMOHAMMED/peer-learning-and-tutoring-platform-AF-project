import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiPhoneOff, FiMessageSquare, FiUsers, FiMic, FiMicOff,
  FiVideo, FiVideoOff, FiMonitor, FiMoreVertical, FiArrowLeft,
  FiClock, FiAlertTriangle
} from 'react-icons/fi';
import { useTutoringController } from '../../controllers/useTutoringController';
import { useAuthViewModel } from '../../viewmodels/AuthViewModel';
import toast from 'react-hot-toast';

/**
 * SessionRoom - Video session room with Jitsi integration
 * 
 * MVC Pattern: View (Pure UI - Logic in useTutoringController)
 */
const SessionRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthViewModel();
  const { 
    currentSession, 
    fetchSessionById, 
    completeSession,
    joinSession,
    leaveSession,
    isLoading 
  } = useTutoringController();

  const [isInSession, setIsInSession] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [jitsiApi, setJitsiApi] = useState(null);

  // Fetch session on mount
  useEffect(() => {
    if (sessionId) {
      fetchSessionById(sessionId);
    }
    
    return () => {
      leaveSession();
    };
  }, [sessionId, fetchSessionById, leaveSession]);

  // Timer for session duration
  useEffect(() => {
    let interval;
    if (isInSession) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInSession]);

  // Initialize Jitsi
  useEffect(() => {
    if (!sessionId || jitsiApi) return;

    const initJitsi = async () => {
      try {
        // Dynamically load Jitsi script
        if (!window.JitsiMeetExternalAPI) {
          const script = document.createElement('script');
          script.src = 'https://meet.jit.si/external_api.js';
          script.async = true;
          script.onload = createJitsiRoom;
          document.body.appendChild(script);
        } else {
          createJitsiRoom();
        }
      } catch (err) {
        console.error('Failed to load Jitsi:', err);
        toast.error('Failed to initialize video call');
      }
    };

    const createJitsiRoom = () => {
      const domain = 'meet.jit.si';
      const options = {
        roomName: `peerlearn-${sessionId}`,
        width: '100%',
        height: '100%',
        parentNode: document.getElementById('jitsi-container'),
        configOverwrite: {
          prejoinPageEnabled: false,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_BACKGROUND: '#1a1a2e',
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings',
            'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
          ],
        },
        userInfo: {
          displayName: user?.displayName || 'User',
          email: user?.email || ''
        }
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);
      
      api.addEventListeners({
        readyToClose: () => {
          handleEndSession();
        },
        videoConferenceJoined: () => {
          setIsInSession(true);
          toast.success('You have joined the session!');
        },
        videoConferenceLeft: () => {
          setIsInSession(false);
        },
        participantJoined: (participant) => {
          toast.success(`${participant.displayName} joined the session`);
        },
        participantLeft: (participant) => {
          toast(`${participant.displayName} left the session`);
        }
      });

      setJitsiApi(api);
      setIsInSession(true);
    };

    initJitsi();

    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
    };
  }, [sessionId, user, jitsiApi]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleAudio');
      setIsMuted(!isMuted);
    }
  };

  const handleToggleVideo = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleVideo');
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleToggleScreenShare = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleShareScreen');
      setIsScreenSharing(!isScreenSharing);
    }
  };

  const handleEndSession = async () => {
    setShowEndConfirm(false);
    
    if (user?.role === 'tutor' && currentSession?.status === 'confirmed') {
      await completeSession(sessionId);
    }
    
    if (jitsiApi) {
      jitsiApi.executeCommand('hangup');
      jitsiApi.dispose();
    }
    
    leaveSession();
    navigate('/dashboard');
    toast.success('Session ended');
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowEndConfirm(true)}
              className="p-2 text-white hover:bg-white/10 rounded-lg"
            >
              <FiArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-white font-semibold">
                {currentSession?.subject || 'Tutoring Session'}
              </h2>
              <p className="text-white/70 text-sm">
                {currentSession?.topic || 'General Session'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Timer */}
            <div className="flex items-center px-4 py-2 bg-black/50 rounded-full text-white">
              <FiClock className="w-4 h-4 mr-2" />
              {formatTime(elapsedTime)}
            </div>

            {/* Participants Toggle */}
            <button
              onClick={() => setParticipantsOpen(!participantsOpen)}
              className={`p-2 rounded-lg transition-colors ${
                participantsOpen ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'
              }`}
            >
              <FiUsers className="w-5 h-5" />
            </button>

            {/* Chat Toggle */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-2 rounded-lg transition-colors ${
                chatOpen ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'
              }`}
            >
              <FiMessageSquare className="w-5 h-5" />
            </button>

            {/* More Options */}
            <button className="p-2 text-white hover:bg-white/10 rounded-lg">
              <FiMoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative">
        {/* Jitsi Container */}
        <div id="jitsi-container" className="w-full h-full" />

        {/* Participants Panel */}
        {participantsOpen && (
          <div className="absolute right-0 top-16 bottom-24 w-64 bg-black/80 backdrop-blur-sm rounded-l-xl p-4 z-10">
            <h3 className="text-white font-semibold mb-4">Participants</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-white">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  {user?.displayName?.[0] || 'Y'}
                </div>
                <div>
                  <p className="font-medium">{user?.displayName || 'You'}</p>
                  <p className="text-xs text-white/60">Host</p>
                </div>
              </div>
              {currentSession?.tutor && user?.role !== 'tutor' && (
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    {currentSession.tutor.displayName?.[0] || 'T'}
                  </div>
                  <div>
                    <p className="font-medium">{currentSession.tutor.displayName}</p>
                    <p className="text-xs text-white/60">Tutor</p>
                  </div>
                </div>
              )}
              {currentSession?.student && user?.role !== 'student' && (
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    {currentSession.student.displayName?.[0] || 'S'}
                  </div>
                  <div>
                    <p className="font-medium">{currentSession.student.displayName}</p>
                    <p className="text-xs text-white/60">Student</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Panel */}
        {chatOpen && (
          <div className="absolute right-0 top-16 bottom-24 w-80 bg-black/80 backdrop-blur-sm rounded-l-xl p-4 z-10 flex flex-col">
            <h3 className="text-white font-semibold mb-4">Chat</h3>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              <p className="text-white/60 text-sm text-center">Chat messages will appear here</p>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-center space-x-4">
          {/* Mute */}
          <button
            onClick={handleToggleMute}
            className={`p-4 rounded-full transition-colors ${
              isMuted 
                ? 'bg-red-500 text-white' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isMuted ? <FiMicOff className="w-6 h-6" /> : <FiMic className="w-6 h-6" />}
          </button>

          {/* Video */}
          <button
            onClick={handleToggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoOff 
                ? 'bg-red-500 text-white' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isVideoOff ? <FiVideoOff className="w-6 h-6" /> : <FiVideo className="w-6 h-6" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={handleToggleScreenShare}
            className={`p-4 rounded-full transition-colors ${
              isScreenSharing 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FiMonitor className="w-6 h-6" />
          </button>

          {/* End Call */}
          <button
            onClick={() => setShowEndConfirm(true)}
            className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            <FiPhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* End Session Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">End Session?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to end this tutoring session? 
              {user?.role === 'tutor' && ' The session will be marked as complete.'}
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
              >
                Continue Session
              </button>
              <button
                onClick={handleEndSession}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionRoom;
