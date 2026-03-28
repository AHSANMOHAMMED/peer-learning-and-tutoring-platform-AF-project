import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTutoringController } from '../../controllers/useTutoringController';
import toast from 'react-hot-toast';

/**
 * SessionRoomPage
 * Embedded Jitsi video conferencing for tutoring sessions
 * Features: Video call, post-session feedback, end session
 */
const SessionRoomPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const {
    session,
    loading,
    getById,
    joinSession,
    endSession,
    submitFeedback,
  } = useTutoringController();

  const [jitsiContainerReady, setJitsiContainerReady] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Load session on mount
  useEffect(() => {
    if (sessionId) {
      getById(sessionId);
    }
  }, [sessionId]);

  // Initialize Jitsi when session is loaded
  useEffect(() => {
    if (session && !sessionStarted) {
      initializeJitsi();
      // Auto-join session
      if (session.status === 'confirmed') {
        handleJoinSession();
      }
    }
  }, [session]);

  /**
   * Initialize Jitsi Meet iframe
   */
  const initializeJitsi = () => {
    const container = document.getElementById('jitsi-container');
    if (!container) return;

    // Generate room name from session ID
    const roomName = `peerlearn-${session._id}`;

    // Jitsi config
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: container,
      configOverwrite: {
        disableSimulcast: false,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'chat',
          'raisehand',
          'recording',
          'settings',
          'help',
        ],
        SHOW_JITSI_WATERMARK: false,
      },
      jwt: process.env.REACT_APP_JITSI_JWT,
      userInfo: {
        displayName: session.studentId?.name || 'Student',
      },
    };

    try {
      // eslint-disable-next-line
      const api = new window.JitsiMeetExternalAPI('meet.jit.si', options);

      // Listen for hang up
      api.addEventListeners({
        onConferenceLeft: () => {
          setShowFeedbackForm(true);
        },
      });

      setJitsiContainerReady(true);
    } catch (error) {
      console.error('Jitsi initialization error:', error);
      toast.error('Failed to start video conference');
    }
  };

  /**
   * Mark session as joined/in_progress
   */
  const handleJoinSession = async () => {
    const result = await joinSession(sessionId);
    if (result) {
      setSessionStarted(true);
      toast.success('Joined session!');
    }
  };

  /**
   * End session and show feedback form
   */
  const handleEndSession = async () => {
    if (window.confirm('Are you sure you want to end this session?')) {
      const result = await endSession(sessionId);
      if (result) {
        setShowFeedbackForm(true);
      }
    }
  };

  /**
   * Submit post-session feedback
   */
  const handleSubmitFeedback = async () => {
    setIsSubmittingFeedback(true);
    const result = await submitFeedback(sessionId, feedback);
    setIsSubmittingFeedback(false);

    if (result) {
      toast.success('Feedback submitted!');
      setTimeout(() => {
        navigate('/sessions/my-sessions');
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-white text-xl">Session not found</p>
          <button
            onClick={() => navigate('/sessions/my-sessions')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Session Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between text-white">
        <div>
          <h1 className="text-2xl font-bold">{session.subject} Tutoring Session</h1>
          <p className="text-sm text-gray-400">
            {session.studentId?.name} & {session.tutorId?.name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <p className="text-gray-400">Session Status</p>
            <p className="font-semibold capitalize">
              {session.status === 'in_progress' ? '🟢 Live' : '🟡 Scheduled'}
            </p>
          </div>
          <button
            onClick={handleEndSession}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Jitsi Container */}
      <div className="flex-1 overflow-hidden">
        <div id="jitsi-container" style={{ height: '100%' }} />
      </div>

      {/* Fallback: Jitsi Script (if not loaded via package) */}
      {!jitsiContainerReady && (
        <script src="https://meet.jit.si/external_api.js" />
      )}

      {/* Feedback Modal (Post-Session) */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Session Feedback</h2>
            <p className="text-gray-600 mb-6">
              Please rate your tutoring session experience
            </p>

            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rating (1-5 stars)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedback({ ...feedback, rating: star })}
                    className={`text-4xl transition-transform ${
                      feedback.rating >= star
                        ? 'text-yellow-400 scale-110'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={feedback.comment}
                onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                placeholder="Share your experience..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmitFeedback}
                disabled={isSubmittingFeedback}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <button
                onClick={() => {
                  setShowFeedbackForm(false);
                  navigate('/sessions/my-sessions');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
              >
                Skip
              </button>
            </div>

            <p className="text-xs text-gray-600 mt-4 text-center">
              Your feedback helps us improve the platform
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionRoomPage;
