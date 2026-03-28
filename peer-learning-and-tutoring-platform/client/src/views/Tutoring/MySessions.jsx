import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiCalendar, FiClock, FiUser, FiVideo, FiCheck, FiX,
  FiMessageSquare, FiStar, FiMoreVertical, FiLoader,
  FiRefreshCw, FiArrowRight, FiFilter
} from 'react-icons/fi';
import { useTutoringController } from '../../controllers/useTutoringController';
import { useAuthViewModel } from '../../viewmodels/AuthViewModel';
import toast from 'react-hot-toast';

/**
 * MySessions - Session management view with tabs for upcoming/past/pending
 * 
 * MVC Pattern: View (Pure UI - Logic in useTutoringController)
 */
const MySessions = () => {
  const navigate = useNavigate();
  const { user } = useAuthViewModel();
  const { 
    sessions,
    upcomingSessions,
    pastSessions,
    pendingRequests,
    isLoading,
    isSubmitting,
    fetchSessions,
    fetchPendingRequests,
    acceptSession,
    rejectSession,
    cancelSession,
    rescheduleSession,
    completeSession,
    submitFeedback,
    joinSession
  } = useTutoringController();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedSession, setSelectedSession] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  const isTutor = user?.role === 'tutor';
  const isStudent = user?.role === 'student';

  useEffect(() => {
    fetchSessions();
    if (isTutor) {
      fetchPendingRequests();
    }
  }, [fetchSessions, fetchPendingRequests, isTutor]);

  const handleAccept = async (sessionId) => {
    const result = await acceptSession(sessionId);
    if (result.success) {
      toast.success('Session accepted!');
    }
  };

  const handleReject = async (sessionId) => {
    const result = await rejectSession(sessionId, 'Schedule conflict');
    if (result.success) {
      toast.success('Session declined');
    }
  };

  const handleCancel = async (sessionId) => {
    if (window.confirm('Are you sure you want to cancel this session?')) {
      const result = await cancelSession(sessionId, 'Cancelled by user');
      if (result.success) {
        toast.success('Session cancelled');
      }
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      toast.error('Please select new date and time');
      return;
    }
    
    const result = await rescheduleSession(selectedSession.id, newDate, newTime);
    if (result.success) {
      setRescheduleModalOpen(false);
      setSelectedSession(null);
    }
  };

  const handleComplete = async (sessionId) => {
    const result = await completeSession(sessionId);
    if (result.success) {
      toast.success('Session marked as complete!');
    }
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    const result = await submitFeedback(selectedSession.id, rating, feedback);
    if (result.success) {
      setFeedbackModalOpen(false);
      setSelectedSession(null);
      setRating(0);
      setFeedback('');
    }
  };

  const handleJoinSession = (session) => {
    const result = joinSession(session);
    if (result.success) {
      window.open(result.url, '_blank');
    }
  };

  const openFeedbackModal = (session) => {
    setSelectedSession(session);
    setRating(0);
    setFeedback('');
    setFeedbackModalOpen(true);
    setActionMenuOpen(null);
  };

  const openRescheduleModal = (session) => {
    setSelectedSession(session);
    setNewDate(session.date);
    setNewTime(session.startTime);
    setRescheduleModalOpen(true);
    setActionMenuOpen(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800',
      confirmed: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const getDisplaySessions = () => {
    switch (activeTab) {
      case 'upcoming':
        return [...upcomingSessions, ...sessions.filter(s => ['pending', 'confirmed'].includes(s.status))];
      case 'past':
        return pastSessions;
      case 'pending':
        return isTutor ? pendingRequests : sessions.filter(s => s.status === 'pending');
      default:
        return upcomingSessions;
    }
  };

  const renderStars = (value, interactive = false, onChange = null) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onChange && onChange(star)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          disabled={!interactive}
        >
          <FiStar
            className={`w-5 h-5 ${
              star <= value ? 'text-amber-400 fill-current' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  const displaySessions = getDisplaySessions();

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Sessions</h1>
          <p className="text-gray-600">Manage your tutoring sessions</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={() => { fetchSessions(); fetchPendingRequests(); }}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Refresh"
          >
            <FiRefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {isStudent && (
            <Link
              to="/tutoring/schedule"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <FiCalendar className="mr-2" />
              Book New Session
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming
          {upcomingSessions.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
              {upcomingSessions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'past' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Past
        </button>
        {isTutor && (
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center ${
              activeTab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <FiLoader className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && displaySessions.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCalendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {activeTab === 'upcoming' ? 'No upcoming sessions' : 
             activeTab === 'past' ? 'No past sessions' : 'No pending requests'}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'upcoming' && isStudent && 'Book your first session to get started'}
            {activeTab === 'upcoming' && isTutor && 'You have no upcoming sessions scheduled'}
            {activeTab === 'past' && 'Your session history will appear here'}
            {activeTab === 'pending' && isTutor && 'No pending session requests'}
          </p>
          {activeTab === 'upcoming' && isStudent && (
            <Link
              to="/tutoring/schedule"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              <FiCalendar className="mr-2" />
              Book a Session
            </Link>
          )}
        </div>
      )}

      {/* Sessions List */}
      {!isLoading && displaySessions.length > 0 && (
        <div className="space-y-4">
          {displaySessions.map(session => (
            <div
              key={session.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                {/* Left: Session Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <FiCalendar className="w-4 h-4 mr-1" />
                      {new Date(session.date).toLocaleDateString('en-US', { 
                        weekday: 'short', month: 'short', day: 'numeric' 
                      })}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <FiClock className="w-4 h-4 mr-1" />
                      {session.startTime} ({session.duration || 60} min)
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{session.subject}</h3>
                  <p className="text-gray-600 text-sm mb-3">{session.topic || session.notes || 'General tutoring session'}</p>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mr-2">
                        <FiUser className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-sm text-gray-700">
                        {isStudent ? `Tutor: ${session.tutor?.displayName || 'Tutor'}` : `Student: ${session.student?.displayName || 'Student'}`}
                      </span>
                    </div>
                    {session.rating && (
                      <div className="flex items-center text-amber-500">
                        <FiStar className="w-4 h-4 fill-current mr-1" />
                        <span className="text-sm">{session.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="mt-4 md:mt-0 flex items-center space-x-2">
                  {/* Pending Actions (Tutor) */}
                  {session.status === 'pending' && isTutor && (
                    <>
                      <button
                        onClick={() => handleAccept(session.id)}
                        disabled={isSubmitting}
                        className="flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                      >
                        <FiCheck className="w-4 h-4 mr-2" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(session.id)}
                        disabled={isSubmitting}
                        className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <FiX className="w-4 h-4 mr-2" />
                        Decline
                      </button>
                    </>
                  )}

                  {/* Confirmed Actions */}
                  {session.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleJoinSession(session)}
                        className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        <FiVideo className="w-4 h-4 mr-2" />
                        Join
                      </button>
                      <button
                        onClick={() => openRescheduleModal(session)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancel(session.id)}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {/* Completed Actions */}
                  {session.status === 'completed' && isStudent && !session.rating && (
                    <button
                      onClick={() => openFeedbackModal(session)}
                      className="flex items-center px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                    >
                      <FiStar className="w-4 h-4 mr-2" />
                      Rate Session
                    </button>
                  )}

                  {session.status === 'completed' && isTutor && (
                    <button
                      onClick={() => handleComplete(session.id)}
                      disabled={isSubmitting}
                      className="flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                    >
                      <FiCheck className="w-4 h-4 mr-2" />
                      Mark Complete
                    </button>
                  )}

                  {/* More Actions Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setActionMenuOpen(actionMenuOpen === session.id ? null : session.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <FiMoreVertical className="w-5 h-5" />
                    </button>
                    
                    {actionMenuOpen === session.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => navigate(`/sessions/${session.id}`)}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                        >
                          View Details
                        </button>
                        {session.status === 'confirmed' && (
                          <button
                            onClick={() => openRescheduleModal(session)}
                            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                          >
                            Reschedule
                          </button>
                        )}
                        {['pending', 'confirmed'].includes(session.status) && (
                          <button
                            onClick={() => handleCancel(session.id)}
                            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                          >
                            Cancel Session
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModalOpen && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Rate Your Session</h3>
            <p className="text-gray-600 mb-6">
              How was your session with {selectedSession.tutor?.displayName || 'your tutor'}?
            </p>
            
            <div className="flex justify-center mb-6">
              {renderStars(rating, true, setRating)}
            </div>
            
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience (optional)..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none mb-4"
            />
            
            <div className="flex space-x-3">
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting || rating === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalOpen && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reschedule Session</h3>
            <p className="text-gray-600 mb-6">
              Select a new date and time for your session.
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setRescheduleModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={isSubmitting || !newDate || !newTime}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Rescheduling...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menus */}
      {actionMenuOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setActionMenuOpen(null)}
        />
      )}
    </div>
  );
};

export default MySessions;
