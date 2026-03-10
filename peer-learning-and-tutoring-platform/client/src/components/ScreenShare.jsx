import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Monitor, StopCircle, Share2, Video, Mic, MicOff, VideoOff } from 'lucide-react';

const ScreenShare = ({ 
  roomId, 
  socket, 
  userId, 
  isInstructor = false,
  onStreamStart,
  onStreamEnd
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const videoRef = useRef(null);
  const screenVideoRef = useRef(null);

  // WebRTC configuration
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  useEffect(() => {
    if (!socket || !roomId) return;

    // Handle WebRTC signaling
    socket.on('webrtc-offer', handleReceiveOffer);
    socket.on('webrtc-answer', handleReceiveAnswer);
    socket.on('webrtc-ice-candidate', handleReceiveIceCandidate);
    socket.on('user-joined-room', handleUserJoined);
    socket.on('user-left-room', handleUserLeft);
    socket.on('screen-share-started', handleRemoteScreenShareStarted);
    socket.on('screen-share-stopped', handleRemoteScreenShareStopped);

    return () => {
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('webrtc-ice-candidate');
      socket.off('user-joined-room');
      socket.off('user-left-room');
      socket.off('screen-share-started');
      socket.off('screen-share-stopped');
    };
  }, [socket, roomId]);

  const createPeerConnection = useCallback((participantId) => {
    const peerConnection = new RTCPeerConnection(iceServers);
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-ice-candidate', {
          roomId,
          targetUserId: participantId,
          candidate: event.candidate,
          fromUserId: userId
        });
      }
    };

    peerConnection.ontrack = (event) => {
      setRemoteStreams(prev => new Map(prev.set(participantId, event.streams[0])));
    };

    peerConnectionsRef.current.set(participantId, peerConnection);
    return peerConnection;
  }, [socket, roomId, userId]);

  const startScreenShare = async () => {
    try {
      // Get screen stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: true
      });

      screenStreamRef.current = screenStream;

      // Get camera/mic stream if video is enabled
      if (isVideoEnabled || isAudioEnabled) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: isVideoEnabled,
            audio: isAudioEnabled
          });
          localStreamRef.current = mediaStream;
          
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err) {
          console.log('Could not get user media:', err);
        }
      }

      // Display screen stream
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = screenStream;
      }

      // Create peer connections with all participants
      participants.forEach(participant => {
        if (participant.userId !== userId) {
          const peerConnection = createPeerConnection(participant.userId);
          
          // Add screen stream tracks
          screenStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, screenStream);
          });

          // Add local stream tracks if available
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
              peerConnection.addTrack(track, localStreamRef.current);
            });
          }

          // Create and send offer
          peerConnection.createOffer()
            .then(offer => peerConnection.setLocalDescription(offer))
            .then(() => {
              socket.emit('webrtc-offer', {
                roomId,
                targetUserId: participant.userId,
                offer: peerConnection.localDescription,
                fromUserId: userId
              });
            });
        }
      });

      // Handle screen share stop
      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      setIsSharing(true);
      socket.emit('screen-share-started', { roomId, userId });
      
      if (onStreamStart) {
        onStreamStart(screenStream);
      }

      toast.success('Screen sharing started');

    } catch (error) {
      console.error('Error starting screen share:', error);
      toast.error('Failed to start screen sharing');
    }
  };

  const stopScreenShare = () => {
    // Stop all tracks
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach(connection => {
      connection.close();
    });
    peerConnectionsRef.current.clear();

    setIsSharing(false);
    setRemoteStreams(new Map());
    socket.emit('screen-share-stopped', { roomId, userId });

    if (onStreamEnd) {
      onStreamEnd();
    }

    toast.success('Screen sharing stopped');
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  // WebRTC Handlers
  const handleReceiveOffer = async ({ offer, fromUserId }) => {
    const peerConnection = createPeerConnection(fromUserId);
    
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    socket.emit('webrtc-answer', {
      roomId,
      targetUserId: fromUserId,
      answer,
      fromUserId: userId
    });
  };

  const handleReceiveAnswer = async ({ answer, fromUserId }) => {
    const peerConnection = peerConnectionsRef.current.get(fromUserId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleReceiveIceCandidate = async ({ candidate, fromUserId }) => {
    const peerConnection = peerConnectionsRef.current.get(fromUserId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const handleUserJoined = ({ userId: joinedUserId }) => {
    if (joinedUserId !== userId && isSharing) {
      // Create new peer connection for the new user
      const peerConnection = createPeerConnection(joinedUserId);
      
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, screenStreamRef.current);
        });
      }

      peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
          socket.emit('webrtc-offer', {
            roomId,
            targetUserId: joinedUserId,
            offer: peerConnection.localDescription,
            fromUserId: userId
          });
        });
    }
  };

  const handleUserLeft = ({ userId: leftUserId }) => {
    const peerConnection = peerConnectionsRef.current.get(leftUserId);
    if (peerConnection) {
      peerConnection.close();
      peerConnectionsRef.current.delete(leftUserId);
    }
    
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(leftUserId);
      return newMap;
    });
  };

  const handleRemoteScreenShareStarted = ({ userId: sharerId }) => {
    toast.info('Someone started screen sharing');
  };

  const handleRemoteScreenShareStopped = ({ userId: sharerId }) => {
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(sharerId);
      return newMap;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold flex items-center">
          <Monitor className="w-5 h-5 mr-2 text-blue-600" />
          Screen Sharing
        </h3>
        
        <div className="flex items-center space-x-2">
          {!isSharing ? (
            <button
              onClick={startScreenShare}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Screen
            </button>
          ) : (
            <>
              <button
                onClick={toggleVideo}
                className={`p-2 rounded-lg transition-colors ${
                  isVideoEnabled ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-600'
                }`}
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              
              <button
                onClick={toggleAudio}
                className={`p-2 rounded-lg transition-colors ${
                  isAudioEnabled ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-600'
                }`}
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              
              <button
                onClick={stopScreenShare}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                Stop Sharing
              </button>
            </>
          )}
        </div>
      </div>

      {/* Video Area */}
      <div className="p-4">
        {isSharing ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Screen Stream */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
                style={{ maxHeight: '400px' }}
              />
              <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                Your Screen
              </div>
            </div>

            {/* Camera Stream */}
            {isVideoEnabled && localStreamRef.current && (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ maxHeight: '400px' }}
                />
                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  Camera
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Monitor className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {isInstructor 
                ? 'Share your screen to present content to students'
                : 'Waiting for instructor to start screen sharing...'
              }
            </p>
            
            {/* Remote Screen Shares */}
            {remoteStreams.size > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-4">Active Screen Shares</h4>
                <div className="grid grid-cols-1 gap-4">
                  {Array.from(remoteStreams.entries()).map(([participantId, stream]) => (
                    <div key={participantId} className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                        style={{ maxHeight: '300px' }}
                        ref={(videoElement) => {
                          if (videoElement) {
                            videoElement.srcObject = stream;
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Participants */}
      {participants.length > 0 && (
        <div className="px-4 pb-4">
          <h4 className="font-medium mb-2 text-sm text-gray-600">
            Participants ({participants.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {participants.map((participant) => (
              <div
                key={participant.userId}
                className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs font-medium text-blue-600">
                    {participant.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span>{participant.name}</span>
                {participant.isSharing && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                    Sharing
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenShare;
