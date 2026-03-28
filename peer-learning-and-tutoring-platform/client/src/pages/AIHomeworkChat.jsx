import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, BookOpen, Lightbulb, CheckCircle, 
  Sparkles, Clock, RotateCcw, Star, ChevronRight,
  MessageSquare, History, MoreHorizontal, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const AIHomeworkChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [subject, setSubject] = useState('mathematics');
  const [grade, setGrade] = useState('10');
  const [showSetup, setShowSetup] = useState(true);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const subjects = [
    { id: 'mathematics', name: 'Mathematics', icon: '🔢' },
    { id: 'physics', name: 'Physics', icon: '⚛️' },
    { id: 'chemistry', name: 'Chemistry', icon: '⚗️' },
    { id: 'biology', name: 'Biology', icon: '🧬' },
    { id: 'english', name: 'English', icon: '📚' },
    { id: 'history', name: 'History', icon: '📜' },
    { id: 'general', name: 'General', icon: '🎓' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchSessionHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessionHistory = async () => {
    try {
      const response = await api.get('/api/ai-homework/sessions/history');
      if (response.data.success) {
        setSessionHistory(response.data.data.sessions);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const startSession = async () => {
    try {
      setIsLoading(true);
      const response = await api.post('/api/ai-homework/start', {
        subject,
        grade,
        topic: ''
      });

      if (response.data.success) {
        setSessionId(response.data.data.sessionId);
        setMessages([
          {
            role: 'assistant',
            content: response.data.data.welcomeMessage,
            timestamp: new Date()
          }
        ]);
        setShowSetup(false);
      }
    } catch (error) {
      toast.error('Failed to start session');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsLoading(true);

    try {
      const response = await api.post(`/api/ai-homework/${sessionId}/message`, {
        message: userMessage
      });

      if (response.data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.data.content,
          timestamp: new Date(),
          metadata: response.data.data
        }]);

        // Show toast for practice problems if available
        if (response.data.data.resources?.length > 0) {
          toast.success('Resources available! Check the message.');
        }
      }
    } catch (error) {
      toast.error('Failed to get response');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      await api.post(`/api/ai-homework/${sessionId}/end`);
      toast.success('Session ended! Great work! 🎉');
      setSessionId(null);
      setMessages([]);
      setShowSetup(true);
      fetchSessionHistory();
    } catch (error) {
      console.error(error);
    }
  };

  const loadSession = async (session) => {
    // This would load a previous session if we had that endpoint
    toast.info('Session history view coming soon!');
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                AI Homework Assistant
              </h1>
              <p className="text-gray-600">
                Get help with homework questions, learn concepts, and practice problems
              </p>
            </div>

            {/* Subject Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Subject
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {subjects.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSubject(sub.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      subject === sub.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{sub.icon}</div>
                    <div className="text-sm font-medium">{sub.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Grade Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Grade
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>

            {/* Start Button */}
            <button
              onClick={startSession}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <RotateCcw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Learning Session
                </>
              )}
            </button>

            {/* Session History */}
            {sessionHistory.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Recent Sessions
                </h3>
                <div className="space-y-2">
                  {sessionHistory.slice(0, 5).map((session, index) => (
                    <button
                      key={index}
                      onClick={() => loadSession(session)}
                      className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{session.subject}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(session.startedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {session.topic && (
                        <div className="text-sm text-gray-600">{session.topic}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">AI Homework Assistant</h2>
            <p className="text-xs text-gray-500 capitalize">{subject} • Grade {grade}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <History className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={endSession}
            className="p-2 hover:bg-red-50 rounded-lg text-red-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white shadow-sm border'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Show metadata for assistant messages */}
              {message.role === 'assistant' && message.metadata?.followUpQuestions && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Suggested follow-ups:</p>
                  {message.metadata.followUpQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="block text-sm text-blue-600 hover:underline mb-1"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {message.role === 'assistant' && message.metadata?.resources?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2 flex items-center">
                    <BookOpen className="w-3 h-3 mr-1" />
                    Resources:
                  </p>
                  {message.metadata.resources.map((r, i) => (
                    <div key={i} className="text-sm text-gray-700">
                      • {r.type}: {r.description}
                    </div>
                  ))}
                </div>
              )}

              <div className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-blue-200' : 'text-gray-400'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white shadow-sm border rounded-2xl px-4 py-3 flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span className="text-sm text-gray-500">AI is thinking...</span>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask your homework question..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send • AI will guide you through understanding, not just give answers
        </p>
      </div>
    </div>
  );
};

export default AIHomeworkChat;
