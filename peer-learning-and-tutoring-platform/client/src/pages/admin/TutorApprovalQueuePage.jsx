import React, { useState, useEffect } from 'react';
import tutorService from '../../services/tutorService';

const TutorApprovalQueuePage = () => {
  const [pendingTutors, setPendingTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPendingTutors();
  }, []);

  const fetchPendingTutors = async () => {
    try {
      setLoading(true);
      const data = await tutorService.getPendingTutors();
      setPendingTutors(data);
    } catch (error) {
      console.error('Error fetching pending tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tutorId) => {
    try {
      await tutorService.approveTutor(tutorId);
      setPendingTutors(pendingTutors.filter(t => t._id !== tutorId));
      setShowModal(false);
      setSelectedTutor(null);
    } catch (error) {
      console.error('Error approving tutor:', error);
      alert('Failed to approve tutor');
    }
  };

  const handleReject = async (tutorId, reason) => {
    try {
      await tutorService.rejectTutor(tutorId, reason);
      setPendingTutors(pendingTutors.filter(t => t._id !== tutorId));
      setShowModal(false);
      setSelectedTutor(null);
    } catch (error) {
      console.error('Error rejecting tutor:', error);
      alert('Failed to reject tutor');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending tutors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tutor Approval Queue 👨‍🏫
          </h1>
          <p className="text-lg text-gray-600">
            Review and approve tutor applications ({pendingTutors.length} pending)
          </p>
        </div>

        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-purple-100 text-sm">Pending Review</p>
              <p className="text-3xl font-bold">{pendingTutors.length}</p>
            </div>
            <div>
              <p className="text-purple-100 text-sm">Avg Response Time</p>
              <p className="text-3xl font-bold">2.5 hrs</p>
            </div>
            <div>
              <p className="text-purple-100 text-sm">Approval Rate</p>
              <p className="text-3xl font-bold">87%</p>
            </div>
          </div>
        </div>

        {/* Tutor Cards Grid */}
        {pendingTutors.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No pending tutor applications at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingTutors.map((tutor) => (
              <div key={tutor._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6">
                {/* Tutor Avatar */}
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {tutor.userId?.profile?.firstName?.charAt(0) || 'T'}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      {tutor.userId?.profile?.firstName} {tutor.userId?.profile?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{tutor.userId?.email}</p>
                  </div>
                </div>

                {/* Subjects */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Subjects:</p>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects?.slice(0, 3).map((subject, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {subject}
                      </span>
                    ))}
                    {tutor.subjects?.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        +{tutor.subjects.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Bio Preview */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {tutor.bio || 'No bio provided'}
                  </p>
                </div>

                {/* Hourly Rate */}
                <div className="mb-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Hourly Rate:</span> ${tutor.hourlyRate || 0}/hr
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedTutor(tutor);
                      setShowModal(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 font-medium transition-all"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => handleApprove(tutor._id)}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-medium transition-all"
                  >
                    ✓ Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {showModal && selectedTutor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Review Tutor Application</h2>
                    <p className="text-gray-600 mt-1">
                      {selectedTutor.userId?.profile?.firstName} {selectedTutor.userId?.profile?.lastName}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedTutor(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h3>
                    <p className="text-gray-900">{selectedTutor.userId?.email}</p>
                    <p className="text-gray-600">{selectedTutor.userId?.profile?.phone || 'No phone provided'}</p>
                  </div>

                  {/* Subjects */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Subjects to Teach</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTutor.subjects?.map((subject, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Bio</h3>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedTutor.bio || 'No bio provided'}
                    </p>
                  </div>

                  {/* Qualifications */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Qualifications</h3>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedTutor.qualifications || 'No qualifications provided'}
                    </p>
                  </div>

                  {/* Experience */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Experience</h3>
                    <p className="text-gray-900">
                      {selectedTutor.experience || 'No experience information provided'}
                    </p>
                  </div>

                  {/* Hourly Rate */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Proposed Hourly Rate</h3>
                    <p className="text-2xl font-bold text-gray-900">${selectedTutor.hourlyRate || 0}/hour</p>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => handleApprove(selectedTutor._id)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 font-medium transition-all"
                  >
                    ✓ Approve Tutor
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason (optional):');
                      handleReject(selectedTutor._id, reason || 'Application not approved');
                    }}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-pink-600 font-medium transition-all"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorApprovalQueuePage;
