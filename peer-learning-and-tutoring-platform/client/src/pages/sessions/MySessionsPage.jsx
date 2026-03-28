import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useTutoringController } from '../../controllers/useTutoringController';
import { useAuthContext } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * MySessionsPage
 * Students: View bookings, joinVideo, cancel
 * Tutors: View/manage requests, accept/reject
 */
const MySessionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const {
    sessions,
    requests,
    loading,
    error,
    list,
    getRequests,
    acceptRequest,
    rejectRequest,
  } = useTutoringController();

  const [activeTab, setActiveTab] = useState('sessions');
  const [filters, setFilters] = useState({ status: 'all' });
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Fetch sessions/requests
  useEffect(() => {
    if (user?.role === 'tutor') {
      getRequests();
    } else {
      list(filters);
    }
  }, [filters, user?.role]);

  const handleAccept = async (requestId) => {
    const result = await acceptRequest(requestId);
    if (result) {
      getRequests();
    }
  };

  const handleRejectClick = (requestId) => {
    setRejectingId(requestId);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    const result = await rejectRequest(rejectingId, rejectReason);
    if (result) {
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectReason('');
      getRequests();
    }
  };

  const handleJoinSession = (session) => {
    if (session.status !== 'confirmed' && session.status !== 'in_progress') {
      toast.error('Session not yet confirmed');
      return;
    }
    navigate(`/sessions/${session._id}/room`);
  };

  // Get sessions to display based on status filter
  const filteredSessions = sessions.filter(s => {
    if (filters.status === 'all') return true;
    return s.status === filters.status;
  });

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.pending;
  };

  return (
    <DashboardLayout pageTitle="My Sessions">
      <div className="max-w-6xl mx-auto">
        {/* Tabs (for Tutors) */}
        {user?.role === 'tutor' && (
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => {
                setActiveTab('requests');
                getRequests();
              }}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'requests'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Incoming Requests ({requests.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('sessions');
                list();
              }}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'sessions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              My Sessions ({sessions.length})
            </button>
          </div>
        )}

        {/* Filter Buttons (for Students) */}
        {user?.role === 'student' && (
          <div className="flex gap-2 mb-6">
            {['all', 'pending', 'confirmed', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilters({ status })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filters.status === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* TUTOR: Incoming Requests */}
            {user?.role === 'tutor' && activeTab === 'requests' && (
              <>
                {requests.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg">
                    <p className="text-gray-600 text-lg">No pending requests</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requests.map((request) => (
                      <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
                        {/* Student Info */}
                        <div className="mb-4">
                          <p className="text-lg font-bold">
                            {request.studentId?.profile?.firstName}{' '}
                            {request.studentId?.profile?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {request.studentId?.email}
                          </p>
                        </div>

                        {/* Session Details */}
                        <div className="space-y-2 mb-6 text-sm border-y py-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subject</span>
                            <span className="font-semibold">{request.subject}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date</span>
                            <span className="font-semibold">
                              {new Date(request.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Time</span>
                            <span className="font-semibold">
                              {request.startTime} - {request.endTime}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        {request.description && (
                          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{request.description}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAccept(request._id)}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectClick(request._id)}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Ongoing Sessions */}
            {(user?.role === 'student' || (user?.role === 'tutor' && activeTab === 'sessions')) && (
              <>
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg">
                    <p className="text-gray-600 text-lg">No sessions found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSessions.map((session) => (
                      <div key={session._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        {/* Status Badge */}
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-bold">{session.subject}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                              session.status
                            )}`}
                          >
                            {session.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Session Info */}
                        <div className="space-y-2 text-sm mb-6 border-y py-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              {user?.role === 'student' ? 'Tutor' : 'Student'}
                            </span>
                            <span className="font-semibold">
                              {user?.role === 'student'
                                ? `${session.tutorId?.profile?.firstName} ${session.tutorId?.profile?.lastName}`
                                : `${session.studentId?.profile?.firstName} ${session.studentId?.profile?.lastName}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date</span>
                            <span className="font-semibold">
                              {new Date(session.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Time</span>
                            <span className="font-semibold">
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>
                        </div>

                        {/* Feedback (if completed) */}
                        {session.feedback && (
                          <div className="mb-6 p-4 bg-green-50 rounded-lg">
                            <p className="text-sm font-semibold text-green-900 mb-2">
                              Rating: {'★'.repeat(session.feedback.rating)}
                            </p>
                            {session.feedback.comment && (
                              <p className="text-sm text-green-800">
                                "{session.feedback.comment}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {session.status === 'confirmed' && (
                            <button
                              onClick={() => handleJoinSession(session)}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                            >
                              Join Video
                            </button>
                          )}
                          {session.status === 'pending' && user?.role === 'student' && (
                            <button
                              onClick={() => {
                                navigate('/sessions/my-sessions');
                                toast.info('Waiting for tutor confirmation...');
                              }}
                              className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium text-sm cursor-default"
                            >
                              Pending
                            </button>
                          )}
                          <button
                            onClick={() =>
                              navigate(
                                `/sessions/${session._id}`,
                                { state: { session } }
                              )
                            }
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium text-sm"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Reject Request</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject this request?
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Let the student know why..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRejectConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingId(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MySessionsPage;
