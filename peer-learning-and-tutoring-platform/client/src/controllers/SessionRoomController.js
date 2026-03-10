import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

/**
 * SessionRoomController - Manages interactive session room functionality
 * Handles whiteboard, screen sharing, polls, chat, and participant management
 */
export const useSessionRoomController = (sessionId, user) => {
  const navigate = useNavigate();
  const { socket, joinRoom, leaveRoom, emit } = useSocket();
  const { showNotification } = useNotification();
  
  // State
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [activeTab, setActiveTab] = useState('whiteboard'); // whiteboard, chat, participants, polls
  
  // Whiteboard state
  const [whiteboardData, setWhiteboardData] = useState({
    strokes: [],
    currentStroke: null,
    color: '#000000',
    strokeWidth: 2,
    tool: 'pen' // pen, eraser, line, rectangle, circle
  });
  const whiteboardRef = useRef(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Screen sharing state
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenShareStream, setScreenShareStream] = useState(null);
  
  // Polling state
  const [activePolls, setActivePolls] = useState([]);
  const [pollHistory, setPollHistory] = useState([]);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    type: 'single_choice',
    duration: 60
  });
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef(null);

  // Load session data
  useEffect(() => {
    if (!sessionId || !user) return;
    
    const loadSession = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/lectures/session/${sessionId}`);
        const sessionData = response.data;
        
        setSession(sessionData);
        setParticipants(sessionData.participants || []);
        setIsHost(sessionData.host?._id === user._id);
        
        // Join socket room
        joinRoom(`session_${sessionId}`);
        
        showNotification('Joined session successfully', 'success');
      } catch (error) {
        console.error('Error loading session:', error);
        showNotification('Failed to load session', 'error');
        navigate('/lectures');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
    
    return () => {
      leaveRoom(`session_${sessionId}`);
      stopScreenShare();
      stopRecording();
    };
  }, [sessionId, user]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleParticipantJoined = (data) => {
      setParticipants(prev => [...prev, data.user]);
      showNotification(`${data.user.name} joined the session`, 'info');
    };

    const handleParticipantLeft = (data) => {
      setParticipants(prev => prev.filter(p => p._id !== data.userId));
      showNotification('A participant left the session', 'info');
    };

    const handleWhiteboardUpdate = (data) => {
      setWhiteboardData(prev => ({
        ...prev,
        strokes: [...prev.strokes, data.stroke]
      }));
    };

    const handleWhiteboardClear = () => {
      setWhiteboardData(prev => ({ ...prev, strokes: [] }));
    };

    const handleNewMessage = (data) => {
      setMessages(prev => [...prev, data]);
    };

    const handleScreenShareStarted = (data) => {
      showNotification(`${data.userName} started screen sharing`, 'info');
    };

    const handleScreenShareStopped = () => {
      setScreenShareStream(null);
    };

    const handlePollCreated = (data) => {
      setActivePolls(prev => [...prev, data.poll]);
      showNotification('New poll started', 'info');
    };

    const handlePollUpdated = (data) => {
      setActivePolls(prev => 
        prev.map(p => p.id === data.pollId ? { ...p, ...data.results } : p)
      );
    };

    const handleRecordingStarted = () => {
      setIsRecording(true);
      startRecordingTimer();
      showNotification('Recording started', 'info');
    };

    const handleRecordingStopped = (data) => {
      setIsRecording(false);
      stopRecordingTimer();
      showNotification(`Recording saved: ${data.duration}`, 'success');
    };

    socket.on('participant_joined', handleParticipantJoined);
    socket.on('participant_left', handleParticipantLeft);
    socket.on('whiteboard_update', handleWhiteboardUpdate);
    socket.on('whiteboard_clear', handleWhiteboardClear);
    socket.on('new_message', handleNewMessage);
    socket.on('screen_share_started', handleScreenShareStarted);
    socket.on('screen_share_stopped', handleScreenShareStopped);
    socket.on('poll_created', handlePollCreated);
    socket.on('poll_updated', handlePollUpdated);
    socket.on('recording_started', handleRecordingStarted);
    socket.on('recording_stopped', handleRecordingStopped);

    return () => {
      socket.off('participant_joined', handleParticipantJoined);
      socket.off('participant_left', handleParticipantLeft);
      socket.off('whiteboard_update', handleWhiteboardUpdate);
      socket.off('whiteboard_clear', handleWhiteboardClear);
      socket.off('new_message', handleNewMessage);
      socket.off('screen_share_started', handleScreenShareStarted);
      socket.off('screen_share_stopped', handleScreenShareStopped);
      socket.off('poll_created', handlePollCreated);
      socket.off('poll_updated', handlePollUpdated);
      socket.off('recording_started', handleRecordingStarted);
      socket.off('recording_stopped', handleRecordingStopped);
    };
  }, [socket]);

  // Recording timer
  const startRecordingTimer = () => {
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setRecordingDuration(0);
  };

  // Whiteboard functions
  const startStroke = (point) => {
    const stroke = {
      id: `stroke_${Date.now()}`,
      points: [point],
      color: whiteboardData.color,
      strokeWidth: whiteboardData.strokeWidth,
      tool: whiteboardData.tool
    };
    setWhiteboardData(prev => ({ ...prev, currentStroke: stroke }));
  };

  const continueStroke = (point) => {
    if (!whiteboardData.currentStroke) return;
    
    setWhiteboardData(prev => ({
      ...prev,
      currentStroke: {
        ...prev.currentStroke,
        points: [...prev.currentStroke.points, point]
      }
    }));
  };

  const endStroke = () => {
    if (!whiteboardData.currentStroke) return;
    
    const stroke = whiteboardData.currentStroke;
    setWhiteboardData(prev => ({
      ...prev,
      strokes: [...prev.strokes, stroke],
      currentStroke: null
    }));
    
    // Broadcast to other participants
    emit('whiteboard_update', { sessionId, stroke });
  };

  const clearWhiteboard = () => {
    setWhiteboardData(prev => ({ ...prev, strokes: [], currentStroke: null }));
    emit('whiteboard_clear', { sessionId });
  };

  const setWhiteboardTool = (tool) => {
    setWhiteboardData(prev => ({ ...prev, tool }));
  };

  const setWhiteboardColor = (color) => {
    setWhiteboardData(prev => ({ ...prev, color }));
  };

  const setStrokeWidth = (width) => {
    setWhiteboardData(prev => ({ ...prev, strokeWidth: width }));
  };

  // Chat functions
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: `msg_${Date.now()}`,
      sessionId,
      userId: user._id,
      userName: user.name,
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    emit('send_message', { sessionId, message });
  }, [newMessage, sessionId, user, emit]);

  // Screen share functions
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      setScreenShareStream(stream);
      setIsScreenSharing(true);
      
      emit('screen_share_started', { sessionId, userName: user.name });
      
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
      showNotification('Failed to start screen sharing', 'error');
    }
  };

  const stopScreenShare = () => {
    if (screenShareStream) {
      screenShareStream.getTracks().forEach(track => track.stop());
      setScreenShareStream(null);
    }
    setIsScreenSharing(false);
    emit('screen_share_stopped', { sessionId });
  };

  // Polling functions
  const createPoll = async () => {
    if (!newPoll.question.trim() || newPoll.options.some(o => !o.trim())) {
      showNotification('Please fill in all poll fields', 'error');
      return;
    }
    
    try {
      const response = await api.post(`/lectures/${sessionId}/polls`, {
        ...newPoll,
        createdBy: user._id
      });
      
      setNewPoll({ question: '', options: ['', ''], type: 'single_choice', duration: 60 });
      showNotification('Poll created', 'success');
      
      emit('poll_created', { sessionId, poll: response.data });
    } catch (error) {
      console.error('Error creating poll:', error);
      showNotification('Failed to create poll', 'error');
    }
  };

  const startPoll = async (pollId) => {
    try {
      await api.post(`/lectures/polls/${pollId}/start`);
      showNotification('Poll started', 'success');
    } catch (error) {
      console.error('Error starting poll:', error);
      showNotification('Failed to start poll', 'error');
    }
  };

  const submitVote = async (pollId, optionIds) => {
    try {
      const response = await api.post(`/lectures/polls/${pollId}/vote`, {
        optionIds,
        userId: user._id
      });
      
      showNotification('Vote submitted', 'success');
      emit('poll_updated', { sessionId, pollId, results: response.data });
    } catch (error) {
      console.error('Error submitting vote:', error);
      showNotification(error.response?.data?.message || 'Failed to submit vote', 'error');
    }
  };

  const loadPolls = async () => {
    try {
      const response = await api.get(`/lectures/${sessionId}/polls`);
      setActivePolls(response.data.active || []);
      setPollHistory(response.data.history || []);
    } catch (error) {
      console.error('Error loading polls:', error);
    }
  };

  // Recording functions
  const toggleRecording = async () => {
    if (isRecording) {
      try {
        await api.post(`/lectures/${sessionId}/recording/stop`);
        setIsRecording(false);
        stopRecordingTimer();
      } catch (error) {
        console.error('Error stopping recording:', error);
        showNotification('Failed to stop recording', 'error');
      }
    } else {
      try {
        await api.post(`/lectures/${sessionId}/recording/start`);
        setIsRecording(true);
        startRecordingTimer();
      } catch (error) {
        console.error('Error starting recording:', error);
        showNotification('Failed to start recording', 'error');
      }
    }
  };

  // Participant management
  const muteParticipant = (participantId) => {
    emit('mute_participant', { sessionId, participantId });
  };

  const removeParticipant = async (participantId) => {
    try {
      await api.post(`/lectures/${sessionId}/remove-participant`, { participantId });
      showNotification('Participant removed', 'success');
    } catch (error) {
      console.error('Error removing participant:', error);
      showNotification('Failed to remove participant', 'error');
    }
  };

  // Leave session
  const leaveSession = () => {
    leaveRoom(`session_${sessionId}`);
    navigate('/lectures');
  };

  // End session (host only)
  const endSession = async () => {
    if (!isHost) return;
    
    try {
      await api.post(`/lectures/${sessionId}/end`);
      emit('session_ended', { sessionId });
      showNotification('Session ended', 'success');
      navigate('/lectures');
    } catch (error) {
      console.error('Error ending session:', error);
      showNotification('Failed to end session', 'error');
    }
  };

  // Poll form handlers
  const updatePollQuestion = (question) => {
    setNewPoll(prev => ({ ...prev, question }));
  };

  const updatePollOption = (index, value) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((o, i) => i === index ? value : o)
    }));
  };

  const addPollOption = () => {
    setNewPoll(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const removePollOption = (index) => {
    if (newPoll.options.length <= 2) {
      showNotification('Poll must have at least 2 options', 'error');
      return;
    }
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  return {
    // State
    session,
    participants,
    isLoading,
    isHost,
    activeTab,
    setActiveTab,
    
    // Whiteboard
    whiteboardData,
    whiteboardRef,
    startStroke,
    continueStroke,
    endStroke,
    clearWhiteboard,
    setWhiteboardTool,
    setWhiteboardColor,
    setStrokeWidth,
    
    // Chat
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    
    // Screen share
    isScreenSharing,
    screenShareStream,
    startScreenShare,
    stopScreenShare,
    
    // Polling
    activePolls,
    pollHistory,
    newPoll,
    createPoll,
    startPoll,
    submitVote,
    loadPolls,
    updatePollQuestion,
    updatePollOption,
    addPollOption,
    removePollOption,
    
    // Recording
    isRecording,
    recordingDuration,
    toggleRecording,
    
    // Participants
    muteParticipant,
    removeParticipant,
    
    // Session
    leaveSession,
    endSession
  };
};

export default useSessionRoomController;
