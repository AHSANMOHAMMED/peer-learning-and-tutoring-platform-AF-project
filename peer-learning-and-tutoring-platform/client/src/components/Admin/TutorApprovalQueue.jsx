import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiCheck, 
  FiX, 
  FiFileText, 
  FiClock, 
  FiStar, 
  FiDollarSign,
  FiBook,
  FiAlertCircle
} from 'react-icons/fi';
import { useAdminController } from '../../controllers/useAdminController';
import toast from 'react-hot-toast';

/**
 * TutorApprovalQueue - Admin view for approving/rejecting tutor applications
 * 
 * MVC Pattern: View (Pure UI - Logic in useAdminController)
 */
const TutorApprovalQueue = () => {
  const { 
    pendingTutors, 
    fetchPendingTutors, 
    approveTutor, 
    rejectTutor,
    isLoading 
  } = useAdminController();

  const [selectedTutor, setSelectedTutor] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchPendingTutors();
  }, [fetchPendingTutors]);

  const handleApprove = async (tutorId) => {
    const result = await approveTutor(tutorId);
    if (result.success) {
      toast.success('Tutor approved successfully');
      setSelectedTutor(null);
    } else {
      toast.error('Failed to approve tutor');
    }
  };

  const handleRejectClick = (tutor) => {
    setSelectedTutor(tutor);
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedTutor) return;
    
    const result = await rejectTutor(selectedTutor.id, rejectionReason);
    if (result.success) {
      toast.success('Tutor application rejected');
      setShowRejectModal(false);
      setSelectedTutor(null);
      setRejectionReason('');
    } else {
      toast.error('Failed to reject tutor');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Tutor Approval Queue</h1>
        <p className="text-emerald-100">
          Review and verify tutor applications. {pendingTutors.length} pending approval{pendingTutors.length !== 1 ? 's' : ''}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingTutors.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <FiClock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved Today</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FiCheck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Response Time</p>
              <p className="text-2xl font-bold text-gray-900">4.2 hrs</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiClock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tutor Applications List */}
      {pendingTutors.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-500">No pending tutor applications at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingTutors.map((tutor) => (
            <div key={tutor.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Header */}
              <div className="h-20 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
              
              <div className="px-6 pb-6">
                {/* Avatar & Basic Info */}
                <div className="relative -mt-10 mb-4 flex items-end">
                  <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg">
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {tutor.user?.displayName?.charAt(0) || 'T'}
                    </div>
                  </div>
                  <div className="ml-4 mb-1">
                    <h3 className="text-xl font-bold text-gray-900">{tutor.user?.displayName}</h3>
                    <p className="text-gray-500">{tutor.user?.email}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-sm">
                    <FiDollarSign className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-semibold text-gray-900">${tutor.hourlyRate}/hr</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FiClock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{tutor.experience} years exp.</span>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-start">
                      <FiBook className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {tutor.subjects?.map((subject, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Bio</h4>
                  <p className="text-sm text-gray-600">{tutor.bio}</p>
                </div>

                {/* Qualifications */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Qualifications</h4>
                  <ul className="space-y-1">
                    {tutor.qualifications?.map((qual, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center">
                        <FiCheck className="w-4 h-4 text-emerald-500 mr-2" />
                        {qual}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Documents */}
                {tutor.verificationDocuments?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Documents</h4>
                    <div className="flex gap-2">
                      {tutor.verificationDocuments.map((doc, idx) => (
                        <a 
                          key={idx}
                          href="#"
                          className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          <FiFileText className="w-4 h-4 mr-2" />
                          Document {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleApprove(tutor.id)}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    <FiCheck className="w-5 h-5 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectClick(tutor)}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-white text-red-600 border-2 border-red-200 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                  >
                    <FiX className="w-5 h-5 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <FiAlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Reject Application</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              You are about to reject <strong>{selectedTutor?.user?.displayName}</strong>'s tutor application.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason (optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorApprovalQueue;
