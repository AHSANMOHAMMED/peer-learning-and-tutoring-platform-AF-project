import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const SessionRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInSession, setIsInSession] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [sessionTime, setSessionTime] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [technicalIssues, setTechnicalIssues] = useState([]);

  useEffect(() => {
    fetchSessionDetails();
    
    const interval = setInterval(() => {
      if (isInSession) {
        setSessionTime(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [id, isInSession]);

  const fetchSessionDetails = async () => {
    try {
      const response = await axios.get(`/api/sessions/${id}`);
      setSession(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load session');
      setLoading(false);
    }
  };

  const startSession = async () => {
    try {
      const response = await axios.post(`/api/sessions/${id}/start`, {
        config: {
          isRecordingEnabled: true,
          isChatEnabled: true,
          isScreenShareEnabled: true,
          isWhiteboardEnabled: true
        }
      });
      
      setSession(prev => ({
        ...prev,
        ...response.data.data
      }));
      
      setIsInSession(true);
      toast.success('Session started successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start session');
    }
  };

  const joinSession = async () => {
    try {
      const response = await axios.post(`/api/sessions/${id}/join`);
      
      setSession(prev => ({
        ...prev,
        ...response.data.data
      }));
      
      setIsInSession(true);
      toast.success('Joined session successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join session');
    }
  };

  const leaveSession = async () => {
    try {
      await axios.post(`/api/sessions/${id}/leave`, {
        connectionQuality
      });
      
      setIsInSession(false);
      toast.success('Left session successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave session');
    }
  };

  const endSession = async () => {
    try {
      const analytics = {
        totalDuration: sessionTime,
        chatMessagesCount: 0, // This would come from chat component
        screenShareDuration: 0, // This would come from screen share tracking
        whiteboardUsage: 0, // This would come from whiteboard tracking
        connectionIssues: technicalIssues.length
      };

      await axios.post(`/api/sessions/${id}/end`, { analytics });
      
      setIsInSession(false);
      toast.success('Session ended successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to end session');
    }
  };

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        await axios.post(`/api/sessions/${id}/recording/stop`);
        setIsRecording(false);
        toast.success('Recording stopped');
      } else {
        await axios.post(`/api/sessions/${id}/recording/start`);
        setIsRecording(true);
        toast.success('Recording started');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle recording');
    }
  };

  const reportTechnicalIssue = async (issueType) => {
    try {
      await axios.post(`/api/sessions/${id}/issues`, { issueType });
      
      if (!technicalIssues.includes(issueType)) {
        setTechnicalIssues(prev => [...prev, issueType]);
      }
      
      toast.success('Technical issue reported');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report issue');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading session...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-white text-lg font-semibold">
              {session.subject} - {session.student?.profile?.firstName} {session.student?.profile?.lastName}
            </h1>
            <span className="text-gray-400 text-sm">
              {formatTime(sessionTime)}
            </span>
            {isRecording && (
              <span className="flex items-center space-x-1 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Recording</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={connectionQuality}
              onChange={(e) => setConnectionQuality(e.target.value)}
              className="bg-gray-700 text-white text-sm px-3 py-1 rounded"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
            
            <button
              onClick={() => setShowControls(!showControls)}
              className="text-white hover:text-gray-300"
            >
              {showControls ? 'Hide' : 'Show'} Controls
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Container */}
        <div className="flex-1 relative">
          {isInSession && session.joinUrl ? (
            <iframe
              ref={iframeRef}
              src={session.joinUrl}
              className="w-full h-full border-0"
              allow="camera; microphone; fullscreen; display-capture"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-white text-2xl mb-4">
                  {session.status === 'confirmed' ? 'Ready to Start Session' : 'Session Not Available'}
                </h2>
                
                {session.canStart && !isInSession && (
                  <button
                    onClick={startSession}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Start Session
                  </button>
                )}
                
                {session.canJoin && !isInSession && (
                  <button
                    onClick={joinSession}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Join Session
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Floating Controls */}
          {showControls && isInSession && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-90 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleRecording}
                  className={`px-4 py-2 rounded font-medium ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
                
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium"
                >
                  {showChat ? 'Hide' : 'Show'} Chat
                </button>
                
                <button
                  onClick={() => setShowWhiteboard(!showWhiteboard)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium"
                >
                  {showWhiteboard ? 'Hide' : 'Show'} Whiteboard
                </button>
                
                <button
                  onClick={leaveSession}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-medium"
                >
                  Leave Session
                </button>
                
                <button
                  onClick={endSession}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
                >
                  End Session
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {(showChat || showWhiteboard) && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            {showChat && (
              <div className="h-full">
                <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
                  <h3 className="text-white font-semibold">Chat</h3>
                </div>
                <div className="p-4">
                  <p className="text-gray-400 text-sm">Chat functionality would be implemented here</p>
                </div>
              </div>
            )}
            
            {showWhiteboard && (
              <div className="h-full">
                <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
                  <h3 className="text-white font-semibold">Whiteboard</h3>
                </div>
                <div className="p-4">
                  <p className="text-gray-400 text-sm">Whiteboard functionality would be implemented here</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Technical Issues */}
      {technicalIssues.length > 0 && (
        <div className="bg-yellow-900 border-t border-yellow-700 px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-yellow-300 text-sm">
              Reported Issues: {technicalIssues.join(', ')}
            </span>
            <button
              onClick={() => setTechnicalIssues([])}
              className="text-yellow-300 hover:text-yellow-100 text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Quick Issue Report */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center space-x-4">
          <span className="text-gray-400 text-sm">Report Issue:</span>
          {['audio', 'video', 'connection', 'screen_share', 'whiteboard', 'other'].map(issue => (
            <button
              key={issue}
              onClick={() => reportTechnicalIssue(issue)}
              disabled={technicalIssues.includes(issue)}
              className={`px-3 py-1 rounded text-sm ${
                technicalIssues.includes(issue)
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {issue.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SessionRoom;
