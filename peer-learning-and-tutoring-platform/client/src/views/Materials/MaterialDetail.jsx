import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiDownload, FiStar, FiEye, FiCalendar,
  FiUser, FiTag, FiEdit2, FiTrash2, FiCheck, FiX,
  FiFile, FiLoader, FiShare2, FiFlag
} from 'react-icons/fi';
import { useMaterialController } from '../../controllers/useMaterialController';
import { useAuthViewModel } from '../../viewmodels/AuthViewModel';
import toast from 'react-hot-toast';

/**
 * MaterialDetail - Detailed view of a study material with PDF viewer
 * 
 * MVC Pattern: View (Pure UI - Logic in useMaterialController)
 */
const MaterialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthViewModel();
  const {
    currentMaterial,
    isLoading,
    isSubmitting,
    fetchMaterialById,
    downloadMaterial,
    rateMaterial,
    deleteMaterial,
    approveMaterial,
    rejectMaterial
  } = useMaterialController();

  const [userRating, setUserRating] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isModerator = user?.role === 'admin' || user?.role === 'moderator';
  const isOwner = currentMaterial?.uploaderId === user?.id;

  useEffect(() => {
    if (id) {
      fetchMaterialById(id);
    }
  }, [id, fetchMaterialById]);

  const handleDownload = async () => {
    await downloadMaterial(id);
  };

  const handleRate = async (rating) => {
    setUserRating(rating);
    const result = await rateMaterial(id, rating);
    if (result.success) {
      toast.success('Thank you for your rating!');
    }
  };

  const handleDelete = async () => {
    const result = await deleteMaterial(id);
    if (result.success) {
      navigate('/materials');
    }
  };

  const handleApprove = async () => {
    const result = await approveMaterial(id);
    if (result.success) {
      fetchMaterialById(id);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    const result = await rejectMaterial(id, rejectReason);
    if (result.success) {
      setShowRejectModal(false);
      fetchMaterialById(id);
    }
  };

  const renderStars = (rating, interactive = false) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && handleRate(star)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          disabled={!interactive}
        >
          <FiStar
            className={`w-6 h-6 ${
              star <= rating
                ? 'text-amber-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-emerald-100 text-emerald-800',
      pending: 'bg-amber-100 text-amber-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return styles[status] || styles.pending;
  };

  const getFileIcon = (material) => {
    if (!material) return '📄';
    
    const type = material.fileType || material.fileFormat || '';
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎬';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📊';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📈';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FiLoader className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!currentMaterial) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Material not found</h2>
        <p className="text-gray-600 mb-6">The material you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/materials"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          <FiArrowLeft className="mr-2" />
          Back to Materials
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      {/* Back Button */}
      <Link
        to="/materials"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Back to Materials
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Material Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Material Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-3xl">
                  {getFileIcon(currentMaterial)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{currentMaterial.title}</h1>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(currentMaterial.status)}`}>
                      {currentMaterial.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {currentMaterial.fileSizeDisplay || currentMaterial.getFormattedFileSize?.()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {isModerator && currentMaterial.status === 'pending' && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={isSubmitting}
                      className="flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                    >
                      <FiCheck className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={isSubmitting}
                      className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <FiX className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </>
                )}
                
                {(isOwner || isModerator) && currentMaterial.status !== 'pending' && (
                  <>
                    <Link
                      to={`/materials/${id}/edit`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-600 mb-6">{currentMaterial.description}</p>

            {/* File Preview Area */}
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              {currentMaterial.fileType?.includes('pdf') ? (
                <div className="h-96 bg-white rounded-lg overflow-hidden">
                  <iframe
                    src={currentMaterial.fileUrl}
                    title={currentMaterial.title}
                    className="w-full h-full"
                  />
                </div>
              ) : currentMaterial.fileType?.includes('image') ? (
                <img
                  src={currentMaterial.fileUrl}
                  alt={currentMaterial.title}
                  className="max-h-96 mx-auto rounded-lg"
                />
              ) : (
                <div className="py-12">
                  <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <span className="text-5xl">{getFileIcon(currentMaterial)}</span>
                  </div>
                  <p className="text-gray-500 mb-4">Preview not available for this file type</p>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    <FiDownload className="mr-2" />
                    Download to View
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Rating Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate this Material</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">How helpful was this resource?</p>
                {renderStars(userRating, true)}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {currentMaterial.averageRating?.toFixed(1) || '0.0'}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FiStar className="w-4 h-4 text-amber-400 fill-current mr-1" />
                  {currentMaterial.ratings?.length || 0} ratings
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Download Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
            <h3 className="font-semibold mb-4">Download Material</h3>
            <p className="text-blue-100 text-sm mb-6">
              {currentMaterial.downloads || 0} downloads so far
            </p>
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              <FiDownload className="mr-2" />
              Download Now
            </button>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Material Info</h3>
            
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <FiUser className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-500">Uploaded by</span>
                <span className="ml-auto font-medium text-gray-900">
                  {currentMaterial.uploader?.displayName || 'Unknown'}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <FiCalendar className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-500">Uploaded on</span>
                <span className="ml-auto font-medium text-gray-900">
                  {currentMaterial.formattedDate || currentMaterial.getFormattedDate?.()}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <FiEye className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-500">Views</span>
                <span className="ml-auto font-medium text-gray-900">
                  {currentMaterial.views || 0}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <FiDownload className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-500">Downloads</span>
                <span className="ml-auto font-medium text-gray-900">
                  {currentMaterial.downloads || 0}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <FiFile className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-500">File Size</span>
                <span className="ml-auto font-medium text-gray-900">
                  {currentMaterial.fileSizeDisplay || currentMaterial.getFormattedFileSize?.()}
                </span>
              </div>
            </div>
          </div>

          {/* Tags Card */}
          {currentMaterial.tags?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {currentMaterial.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Subject Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Subject</h3>
            <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
              <FiTag className="mr-2" />
              {currentMaterial.subject}
            </span>
          </div>

          {/* Report Button */}
          <button
            onClick={() => navigate(`/report?type=material&id=${id}`)}
            className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiFlag className="mr-2" />
            Report Issue
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Material?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{currentMaterial.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Material</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this material.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

export default MaterialDetail;
