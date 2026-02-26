import { useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
// import socketService from '../services/socketService';

export const useSocket = () => {
  const { isAuthenticated, token } = useContext(AuthContext);
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to socket when authenticated
      // socketRef.current = socketService.connect(token);
      
      // Join user's personal room
      const userId = localStorage.getItem('userId');
      if (userId) {
        // socketService.joinRoom(userId);
      }

      return () => {
        // if (socketRef.current) {
        //   socketService.disconnect();
        //   socketRef.current = null;
        //   socketRef.connected = false;
        // }
      };
    } else {
      // if (socketRef.current) {
      //   socketService.disconnect();
      //   socketRef.current = null;
      //   socketRef.connected = false;
      // }
    }
  }, [isAuthenticated, token]);

  return socketRef.current;
};

export const useSocketEvent = (event, callback) => {
  const socket = useSocket();
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!socket) return;

    const handler = (...args) => {
      callbackRef.current(...args);
    };

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [socket, event]);
};

export const useQuestionSocket = (questionId) => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !questionId) return;

    // Join question room
    // socketService.joinQuestionRoom(questionId);

    return () => {
      // Leave question room on cleanup
      // socketService.leaveQuestionRoom(questionId);
    };
  }, [socket, questionId]);

  const emitTyping = (isTyping) => {
    if (socket && questionId) {
      // socketService.sendTypingAnswer(questionId, isTyping);
    }
  };

  return {
    socket,
    emitTyping
  };
};

export const useLeaderboardSocket = (type) => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !type) return;

    // Join leaderboard room
    socketService.joinLeaderboard(type);

    return () => {
      // Leave leaderboard room on cleanup
      // Note: You might want to implement leaveLeaderboard in socketService
    };
  }, [socket, type]);

  return socket;
};

export default useSocket;
