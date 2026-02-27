import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUser, FiCheck, FiX, FiFileText, FiStar, FiClock,
  FiBook, FiAward, FiMessageSquare, FiLoader, FiRefreshCw,
  FiChevronLeft, FiChevronRight, FiSearch, FiFilter,
  FiEye, FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import { useAdminController } from '../../controllers/useAdminController';
import toast from 'react-hot-toast';

/**
 * TutorApprovalQueue - Admin view for approving tutor applications
 * 
 * MVC Pattern: View (Pure UI - Logic in useAdminController)
 */
const TutorApprovalQueue = () => {
  const { 
    pendingTutors,
    isLoading,
    isSubmitting,
    fetchPendingTutors,
    approveTutor,
    rejectTutor
  } = useAdminController();

  const [selectedTutor, setSelectedTutor] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

  useEffect(() => {
    fetchPendingTutors();
  }, [fetchPendingTutors]);

  const handleApprove = async () => {
    if (!selectedTutor) return;

    const result = await approveTutor(selectedTutor.id || selectedTutor._id, approvalNotes);
    if (result.success) {
      setApproveModalOpen(false);
      setSelectedTutor(null);
      setApprovalNotes('');
      toast.success('Tutor approved successfully!');
    }
  };

  const handleReject = async () => {
    if (!selectedTutor) return;

    const result = await rejectTutor(selectedTutor.id || selectedTutor._id, rejectionReason);
    if (result.success) {
      setRejectModalOpen(false);
      setSelectedTutor(null);
      setRejectionReason('');
      toast.success('Tutor application rejected');
    }
  };

  const openApproveModal = (tutor) => {
    setSelectedTutor(tutor);
    setApprovalNotes('');
    setApproveModalOpen(true);
    setViewMode('list');
  };

  const openRejectModal = (tutor) => {
    setSelectedTutor(tutor);
    setRejectionReason('');
    setRejectModalOpen(true);
    setViewMode('list');
  };

  const viewTutorDetails = (tutor) => {
    setSelectedTutor(tutor);
    setViewMode('detail');
  };

  const renderStars = (rating) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FiLoader className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tutor Approval Queue</h1>
            <p className="text-emerald-100">
              {pendingTutors.length} tutor application{pendingTutors.length !== 1 ? 's' : ''} pending review
            </p>
          </div>
          <button
            onClick={fetchPendingTutors}
            className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            <FiRefreshCw className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {!isLoading && pendingTutors.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600">No pending tutor applications to review.</p>
        </div>
      )}

      {/* List View */}
      {!isLoading && viewMode === 'list' && pendingTutors.length > 0 && (
        <div className="space-y-4">
          {pendingTutors.map((tutor) => (
            <div
              key={tutor.id || tutor._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                {/* Left: Tutor Info */}
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                    {tutor.user?.profile?.avatar ? (
                      <img
                        src={tutor.user.profile.avatar}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-8 h-8 text-emerald-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tutor.user?.displayName || 'Unknown'}
                      </h3>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        Pending
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tutor.bio || 'No bio provided'}</p>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center">
                        <FiBook className="w-4 h-4 mr-1" />
                        {(tutor.subjects || []).length} subjects
                      </span>
                      <span className="flex items-center">
                        <FiAward className="w-4 h-4 mr-1" />
                        {tutor.experience || 0} years experience
                      </span>
                      <span className="flex items-center">
                        <FiClock className="w-4 h-4 mr-1" />
                        Applied {formatDate(tutor.createdAt)}
                      </span>
                      <span className="flex items-center font-medium text-emerald-600">
                        <FiStar className="w-4 h-4 mr-1" />
                        ${tutor.hourlyRate || 30}/hour
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="mt-4 md:mt-0 flex items-center space-x-2">
                  <button
                    onClick={() => viewTutorDetails(tutor)}
                    className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiEye className="w-4 h-4 mr-2" />
                    Review
                  </button>
                  <button
                    onClick={() => openApproveModal(tutor)}
                    disabled={isSubmitting}
                    className="flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                  >
                    <FiCheck className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(tutor)}
                    disabled={isSubmitting}
                    className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <FiX className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail View */}
      {viewMode === 'detail' && selectedTutor && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setViewMode('list')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <FiChevronLeft className="mr-1" />
                Back to queue
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openApproveModal(selectedTutor)}
                  disabled={isSubmitting}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  <FiCheck className="w-4 h-4 mr-2" />
                  Approve Tutor
                </button>
                <button
                  onClick={() => openRejectModal(selectedTutor)}
                  disabled={isSubmitting}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <FiX className="w-4 h-4 mr-2" />
                  Reject
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left: Profile */}
              <div className="md:col-span-1">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {selectedTutor.user?.profile?.avatar ? (
                      <img
                        src={selectedTutor.user.profile.avatar}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-12 h-12 text-emerald-600" />
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {selectedTutor.user?.displayName}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {selectedTutor.user?.email}
                  </p>
                  <div className="flex justify-center mb-4">
                    {renderStars(selectedTutor.averageRating || 0)}
                  </div>
                  <p className="text-sm text-gray-500">
                    Applied on {formatDate(selectedTutor.createdAt)}
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Hourly Rate</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      ${selectedTutor.hourlyRate || 30}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Experience</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedTutor.experience || 0} years
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Details */}
              <div className="md:col-span-2 space-y-6">
                {/* Bio */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FiMessageSquare className="w-5 h-5 mr-2" />
                    Bio
                  </h3>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-4">
                    {selectedTutor.bio || 'No bio provided'}
                  </p>
                </div>

                {/* Subjects */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FiBook className="w-5 h-5 mr-2" />
                    Teaching Subjects
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedTutor.subjects || []).map((subject) => (
                      <span
                        key={subject}
                        className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium"
                      >
                        {subject}
                      </span>
                    ))}
                    {(selectedTutor.subjects || []).length === 0 && (
                      <p className="text-gray-500">No subjects specified</p>
                    )}
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FiAward className="w-5 h-5 mr-2" />
                    Qualifications
                  </h3>
                  <ul className="space-y-2">
                    {(selectedTutor.qualifications || []).map((qual, index) => (
                      <li
                        key={index}
                        className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3"
                      >
                        <FiCheckCircle className="w-5 h-5 text-emerald-500 mr-3" />
                        {qual}
                      </li>
                    ))}
                    {(selectedTutor.qualifications || []).length === 0 && (
                      <p className="text-gray-500 bg-gray-50 rounded-lg p-4">
                        No qualifications listed
                      </p>
                    )}
                  </ul>
                </div>

                {/* Documents */}
                {selectedTutor.verificationDocuments?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <FiFileText className="w-5 h-5 mr-2" />
                      Verification Documents
                    </h3>
                    <div className="space-y-2">
                      {selectedTutor.verificationDocuments.map((doc, index) => (
                        <a
                          key={index}
                          href={doc.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <FiFileText className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="flex-1 text-gray-700">{doc.name || `Document ${index + 1}`}</span>
                          <FiEye className="w-4 h-4 text-gray-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModalOpen && selectedTutor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Approve Tutor Application?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              You are about to approve <strong>{selectedTutor.user?.displayName}</strong> as a tutor on the platform.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Notes (Optional)
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setApproveModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                {isSubmitting ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedTutor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiXCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Reject Tutor Application?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              You are about to reject <strong>{selectedTutor.user?.displayName}</strong>'s application.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this application is being rejected..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isSubmitting || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorApprovalQueue;
