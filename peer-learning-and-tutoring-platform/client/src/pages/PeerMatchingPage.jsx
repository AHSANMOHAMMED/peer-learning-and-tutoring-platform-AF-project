import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Users, Clock, Star, Filter, Calendar, 
  BookOpen, Award, ChevronRight, User, CheckCircle,
  AlertCircle, TrendingUp, MessageCircle
} from 'lucide-react';
import peerController from '../controllers/PeerController';

const PeerMatchingPage = () => {
  const navigate = useNavigate();
  const [state, setState] = useState(peerController.getState());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [requestForm, setRequestForm] = useState({
    subject: '',
    grade: '',
    topic: '',
    description: '',
    scheduledAt: '',
    duration: 30,
    difficulty: 'intermediate',
    tags: []
  });

  const [filters, setFilters] = useState({
    minScore: 0.3,
    subject: '',
    grade: '',
    minReputation: 0,
    available: true,
    sortBy: 'score',
    sortOrder: 'desc'
  });

  useEffect(() => {
    const handleStateChange = (newState) => {
      setState(newState);
    };

    peerController.subscribe('peerMatchingPage', handleStateChange);
    
    // Load user sessions on mount
    peerController.getUserSessions({ status: 'pending,matched,active' });

    return () => {
      peerController.unsubscribe('peerMatchingPage');
    };
  }, []);

  const handleRequestHelp = async (e) => {
    e.preventDefault();
    
    try {
      const matches = await peerController.requestHelp(requestForm);
      if (matches.length === 0) {
        alert('No matches found. Try adjusting your criteria or expanding your search.');
      }
    } catch (error) {
      console.error('Error requesting help:', error);
    }
  };

  const handleCreateSession = async (match) => {
    try {
      const session = await peerController.createSession({
        helperId: match.user._id,
        ...requestForm
      });
      
      // Navigate to session details
      navigate(`/peer-sessions/${session._id}`);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getFilteredAndSortedMatches = () => {
    let filtered = peerController.filterMatches(state.matches, filters);
    return peerController.sortMatches(filtered, filters.sortBy, filters.sortOrder);
  };

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'IT', 'Art', 'Music'];
  const grades = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const filteredMatches = getFilteredAndSortedMatches();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find Peer Tutors
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with fellow students who can help you learn and grow together
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Request Form */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Search className="w-5 h-5 mr-2 text-blue-600" />
                Request Peer Help
              </h2>
              
              <form onSubmit={handleRequestHelp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={requestForm.subject}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade Level
                  </label>
                  <select
                    value={requestForm.grade}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, grade: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Grade</option>
                    {grades.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={requestForm.topic}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Quadratic Equations"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={requestForm.description}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what you need help with..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="datetime-local"
                    value={requestForm.scheduledAt}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <select
                    value={requestForm.duration}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={requestForm.difficulty}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={state.loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {state.loading ? 'Finding Matches...' : 'Find Peer Tutors'}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Matches Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              {/* Filters */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-600" />
                  Available Peer Tutors ({filteredMatches.length})
                </h2>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Filters
                </button>
              </div>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Match Score
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={filters.minScore}
                        onChange={(e) => handleFilterChange('minScore', parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">{(filters.minScore * 100).toFixed(0)}%</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sort By
                      </label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="score">Match Score</option>
                        <option value="reputation">Reputation</option>
                        <option value="sessions">Sessions</option>
                        <option value="rating">Rating</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Matches List */}
              <div className="space-y-4">
                {state.loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Finding peer tutors...</p>
                  </div>
                ) : filteredMatches.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {state.matches.length === 0 
                        ? 'Request help to see available peer tutors'
                        : 'No matches found with current filters'
                      }
                    </p>
                  </div>
                ) : (
                  filteredMatches.map((match, index) => (
                    <motion.div
                      key={match.user._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {match.user.name}
                              </h3>
                              <span className="text-sm text-gray-500">
                                Grade {match.reputation.grade}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <span className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                {match.reputation.averageRating.toFixed(1)}
                              </span>
                              <span className="flex items-center">
                                <Award className="w-4 h-4 text-purple-500 mr-1" />
                                {match.reputation.reputation}
                              </span>
                              <span className="flex items-center">
                                <BookOpen className="w-4 h-4 text-green-500 mr-1" />
                                {match.reputation.totalSessions} sessions
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-2">
                              {match.reputation.subjects.map(subject => (
                                <span
                                  key={subject}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                >
                                  {subject}
                                </span>
                              ))}
                            </div>

                            {/* Match Score Breakdown */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                  Match Score
                                </span>
                                <span className="text-sm font-semibold text-green-600">
                                  {(match.score * 100).toFixed(0)}%
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                                  Subject: {(match.breakdown.subject * 100).toFixed(0)}%
                                </div>
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                  Grade: {(match.breakdown.grade * 100).toFixed(0)}%
                                </div>
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                                  Rep: {(match.breakdown.reputation * 100).toFixed(0)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          {match.available ? (
                            <span className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Available
                            </span>
                          ) : (
                            <span className="flex items-center text-red-600 text-sm">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Busy
                            </span>
                          )}
                          
                          <button
                            onClick={() => handleCreateSession(match)}
                            disabled={!match.available}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                          >
                            Request Session
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeerMatchingPage;
