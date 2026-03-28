import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { 
  Users, MessageCircle, Presentation, BarChart3, 
  Monitor, Video, Mic, Settings, LogOut, MoreVertical,
  ChevronLeft, Fullscreen, Minimize
} from 'lucide-react';

// Components
import CollaborativeWhiteboard from '../components/CollaborativeWhiteboard';
import LivePoll from '../components/LivePoll';
import ScreenShare from '../components/ScreenShare';
import lectureController from '../controllers/LectureController';
import groupController from '../controllers/GroupController';

const SessionRoom = () => {
  const { type, id, sessionId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState('video');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingId, setRecordingId] = useState(null);
  const [poll, setPoll] = useState(null);
  const [whiteboardData, setWhiteboardData] = useState(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Join room and load session data
  useEffect(() => {
    if (!socket) return;

    const roomId = `${type}_${id}${sessionId ? `_${sessionId}` : ''}`;
    
    // Join appropriate room
    if (type === 'lecture') {
      socket.emit('joinLectureSession', sessionId);
    } else if (type === 'group') {
      socket.emit('joinGroupRoom', id);
    } else if (type === 'peer') {
      socket.emit('joinPeerSession', id);
    }

    // Load session data
    loadSessionData();

    // Socket event listeners
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);
    socket.on('newMessage', handleNewMessage);
    socket.on('recordingStarted', handleRecordingStarted);
    socket.on('recordingStopped', handleRecordingStopped);
    socket.on('pollStarted', handlePollStarted);
    socket.on('pollEnded', handlePollEnded);
    socket.on('whiteboardUpdated', handleWhiteboardUpdated);
    socket.on('sessionEnded', handleSessionEnded);

    return () => {
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('newMessage');
      socket.off('recordingStarted');
      socket.off('recordingStopped');
      socket.off('pollStarted');
      socket.off('pollEnded');
      socket.off('whiteboardUpdated');
      socket.off('sessionEnded');
    };
  }, [socket, type, id, sessionId]);

  const loadSessionData = async () => {
    try {
      let data;
      if (type === 'lecture' && sessionId) {
        data = await lectureController.getSessionDetails(id, sessionId);
        const course = await lectureController.getCourseDetails(id);
        setIsInstructor(course.isInstructor);
        if (data.polls && data.polls.length > 0) {
          const activePoll = data.polls.find(p => p.isActive);
          if (activePoll) setPoll(activePoll);
        }
      } else if (type === 'group') {
        data = await groupController.getGroupRoomDetails(id);
        setIsInstructor(data.isHost);
        setChatMessages(data.chat || []);
      }
      setSessionData(data);
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session');
    }
  };

  const handleUserJoined = (data) => {
    setParticipants(prev => [...prev, data.user]);
    toast.info(`${data.user.name} joined the session`);
  };

  const handleUserLeft = (data) => {
    setParticipants(prev => prev.filter(p => p._id !== data.userId));
    toast.info('A user left the session');
  };

  const handleNewMessage = (data) => {
    setChatMessages(prev => [...prev, data.message]);
  };

  const handleRecordingStarted = (data) => {
    setIsRecording(true);
    setRecordingId(data.recordingId);
    toast.info('Recording started');
  };

  const handleRecordingStopped = (data) => {
    setIsRecording(false);
    setRecordingId(null);
    toast.success(`Recording stopped. Duration: ${Math.round(data.duration / 60)} minutes`);
  };

  const handlePollStarted = (data) => {
    setPoll(data.poll);
    toast.info('New poll started!');
  };

  const handlePollEnded = () => {
    setPoll(prev => prev ? { ...prev, isActive: false } : null);
    toast.info('Poll ended');
  };

  const handleWhiteboardUpdated = (data) => {
    setWhiteboardData(data.whiteboardData);
  };

  const handleSessionEnded = () => {
    toast.info('Session has ended');
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !socket) return;

    const message = {
      text: newMessage,
      timestamp: new Date(),
      user: { name: 'You' } // Would come from auth context
    };

    if (type === 'group') {
      groupController.addChatMessage(id, newMessage)
        .then(() => {
          socket.emit('groupRoomMessage', {
            roomId: id,
            message,
            userId: 'current-user-id'
          });
          setNewMessage('');
        });
    }
  }, [newMessage, socket, type, id]);

  const startRecording = async () => {
    try {
      const response = await fetch('/api/recordings/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: type,
          sessionId: sessionId || id,
          roomId: `${type}_${id}${sessionId ? `_${sessionId}` : ''}`
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecordingId(data.recordingId);
        setIsRecording(true);
        toast.success('Recording started');
      }
    } catch (error) {
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recordingId) return;
    
    try {
      const response = await fetch(`/api/recordings/${recordingId}/stop`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setIsRecording(false);
        setRecordingId(null);
        toast.success('Recording stopped');
      }
    } catch (error) {
      toast.error('Failed to stop recording');
    }
  };

  const handleVote = async (pollId, answer) => {
    try {
      await lectureController.submitPollResponse(id, sessionId, pollId, answer);
    } catch (error) {
      toast.error('Failed to submit vote');
    }
  };

  const handleCreatePoll = async (pollData) => {
    // Would call API to create poll
    toast.success('Poll created');
  };

  const handleStartPoll = async (pollId) => {
    socket.emit('startPoll', { sessionId, pollId });
  };

  const handleEndPoll = async (pollId) => {
    socket.emit('endPoll', { sessionId, pollId });
  };

  const handleWhiteboardUpdate = (data) => {
    setWhiteboardData(data);
    socket.emit('whiteboardUpdate', {
      roomId: `${type}_${id}`,
      whiteboardData: data,
      userId: 'current-user-id'
    });
  };

  const leaveSession = () => {
    if (socket) {
      if (type === 'lecture') {
        socket.emit('leaveLectureSession', sessionId);
      } else if (type === 'group') {
        socket.emit('leaveGroupRoom', id);
      } else if (type === 'peer') {
        socket.emit('leavePeerSession', id);
      }
    }
    navigate('/dashboard');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={leaveSession}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="font-semibold">
              {sessionData?.title || 'Live Session'}
            </h1>
            <p className="text-sm text-gray-400">
              {participants.length} participants • {isInstructor ? 'Instructor' : 'Student'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isRecording && (
            <span className="flex items-center px-3 py-1 bg-red-600 rounded-full text-sm">
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
              REC
            </span>
          )}
          
          {isInstructor && (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isRecording ? 'Stop Recording' : 'Record'}
            </button>
          )}
          
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Fullscreen className="w-5 h-5" />}
          </button>
          
          <button
            onClick={leaveSession}
            className="p-2 hover:bg-red-600 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <div className="w-16 bg-gray-800 flex flex-col items-center py-4 space-y-4">
          {[
            { id: 'video', icon: Video, label: 'Video' },
            { id: 'whiteboard', icon: Presentation, label: 'Whiteboard' },
            { id: 'poll', icon: BarChart3, label: 'Poll' },
            { id: 'screen', icon: Monitor, label: 'Screen' },
            { id: 'chat', icon: MessageCircle, label: 'Chat' },
            { id: 'participants', icon: Users, label: 'People' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-3 rounded-xl transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        {/* Main Area */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full bg-gray-800 rounded-xl overflow-hidden">
            {activeTab === 'video' && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p>Video stream placeholder</p>
                  <p className="text-sm text-gray-500 mt-2">
                    WebRTC video would be integrated here
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'whiteboard' && (
              <CollaborativeWhiteboard
                roomId={`${type}_${id}`}
                socket={socket}
                userId="current-user-id"
                isInstructor={isInstructor}
                initialData={whiteboardData}
                onWhiteboardUpdate={handleWhiteboardUpdate}
                readOnly={!isInstructor && type === 'lecture'}
              />
            )}

            {activeTab === 'poll' && (
              <div className="h-full p-4">
                <LivePoll
                  poll={poll}
                  isInstructor={isInstructor}
                  onVote={handleVote}
                  onStartPoll={handleStartPoll}
                  onEndPoll={handleEndPoll}
                  onCreatePoll={handleCreatePoll}
                  userId="current-user-id"
                  totalParticipants={participants.length}
                />
              </div>
            )}

            {activeTab === 'screen' && (
              <ScreenShare
                roomId={`${type}_${id}`}
                socket={socket}
                userId="current-user-id"
                isInstructor={isInstructor}
              />
            )}

            {activeTab === 'chat' && (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === 'current-user-id' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender === 'current-user-id'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-white'
                        }`}
                      >
                        <p>{msg.message}</p>
                        <span className="text-xs opacity-75">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={sendMessage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'participants' && (
              <div className="h-full p-4">
                <h3 className="text-white font-semibold mb-4">
                  Participants ({participants.length})
                </h3>
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant._id}
                      className="flex items-center p-3 bg-gray-700 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-medium">
                          {participant.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{participant.name}</p>
                        <p className="text-sm text-gray-400">
                          {participant.role || 'Student'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionRoom;
