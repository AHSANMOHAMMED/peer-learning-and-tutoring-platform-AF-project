import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useMaterialController } from '../../controllers/useMaterialController';
import toast from 'react-hot-toast';

/**
 * ApprovalQueuePage
 * Moderator interface for reviewing and approving pending study materials
 */
const ApprovalQueuePage = () => {
  const navigate = useNavigate();
  const { listPending, approve, reject, loading, error } = useMaterialController();

  const [materials, setMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState(new Set());
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [action, setAction] = useState(null); // 'approve' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const rejectionReasons = [
    'Inappropriate content',
    'Copyright violation',
    'Poor quality',
    'Spam or duplicate',
    'Incomplete material',
    'Misleading information',
    'Other (explain in notes)',
  ];

  useEffect(() => {
    loadPendingMaterials();
  }, []);

  const loadPendingMaterials = async () => {
    try {
      const result = await listPending();
      setMaterials(result || []);
    } catch (err) {
      toast.error('Failed to load pending materials');
    }
  };

  const handleSelectMaterial = (materialId) => {
    const newSelected = new Set(selectedMaterials);
    if (newSelected.has(materialId)) {
      newSelected.delete(materialId);
    } else {
      newSelected.add(materialId);
    }
    setSelectedMaterials(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMaterials.size === materials.length) {
      setSelectedMaterials(new Set());
    } else {
      setSelectedMaterials(new Set(materials.map((m) => m._id)));
    }
  };

  const handleOpenDetail = (material) => {
    setSelectedMaterial(material);
    setShowDetailModal(true);
  };

  const handleOpenActionModal = (actionType, material = null) => {
    if (material) {
      setSelectedMaterial(material);
    }
    setAction(actionType);
    setRejectionReason('');
    setShowActionModal(true);
  };

  const handleApprove = async () => {
    if (!selectedMaterial) return;

    setIsProcessing(true);
    try {
      await approve(selectedMaterial._id);
      setMaterials(materials.filter((m) => m._id !== selectedMaterial._id));
      setShowActionModal(false);
      setShowDetailModal(false);
      setSelectedMaterial(null);
      toast.success('Material approved');
    } catch (err) {
      toast.error('Failed to approve material');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedMaterial) return;
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      await reject(selectedMaterial._id, rejectionReason);
      setMaterials(materials.filter((m) => m._id !== selectedMaterial._id));
      setShowActionModal(false);
      setShowDetailModal(false);
      setSelectedMaterial(null);
      toast.success('Material rejected');
    } catch (err) {
      toast.error('Failed to reject material');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedMaterials.size === 0) {
      toast.error('Please select materials');
      return;
    }

    setIsProcessing(true);
    try {
      let approved = 0;
      for (const materialId of selectedMaterials) {
        try {
          await approve(materialId);
          approved++;
        } catch (err) {
          console.error(`Failed to approve material ${materialId}:`, err);
        }
      }
      setMaterials(materials.filter((m) => !selectedMaterials.has(m._id)));
      setSelectedMaterials(new Set());
      toast.success(`${approved} material(s) approved`);
    } catch (err) {
      toast.error('Bulk approve failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedMaterials.size === 0) {
      toast.error('Please select materials');
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      let rejected = 0;
      for (const materialId of selectedMaterials) {
        try {
          await reject(materialId, rejectionReason);
          rejected++;
        } catch (err) {
          console.error(`Failed to reject material ${materialId}:`, err);
        }
      }
      setMaterials(materials.filter((m) => !selectedMaterials.has(m._id)));
      setSelectedMaterials(new Set());
      setRejectionReason('');
      toast.success(`${rejected} material(s) rejected`);
    } catch (err) {
      toast.error('Bulk reject failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Material Approval Queue">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Pending Materials</h2>
            <p className="text-gray-600">{materials.length} material(s) awaiting review</p>
          </div>
          <button
            onClick={() => navigate('/materials')}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Materials
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Bulk Action Bar */}
        {selectedMaterials.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-blue-900">
                {selectedMaterials.size} material(s) selected
              </p>
              <button
                onClick={() => setSelectedMaterials(new Set())}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear Selection
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Rejection Reason (if rejecting):
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Example: Multiple materials contain copyright-protected content"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBulkApprove}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {isProcessing ? 'Processing...' : `✓ Approve All (${selectedMaterials.size})`}
                </button>
                <button
                  onClick={handleBulkReject}
                  disabled={isProcessing || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  {isProcessing ? 'Processing...' : `✕ Reject All (${selectedMaterials.size})`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Materials Table */}
        {materials.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedMaterials.size === materials.length && materials.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Uploader
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {materials.map((material) => (
                  <tr key={material._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedMaterials.has(material._id)}
                        onChange={() => handleSelectMaterial(material._id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenDetail(material)}
                        className="text-blue-600 hover:text-blue-800 font-medium max-w-xs truncate"
                      >
                        {material.title}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {material.uploadedBy?.firstName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        {material.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(material.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenActionModal('approve', material)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleOpenActionModal('reject', material)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-4xl mb-4">🎉</p>
            <h3 className="text-xl font-bold text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-600">
              There are no pending materials to review right now. All materials have been approved or dismissed.
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedMaterial.title}</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedMaterial(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Uploaded By</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedMaterial.uploadedBy?.firstName} {selectedMaterial.uploadedBy?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Subject</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedMaterial.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Submitted Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedMaterial.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedMaterial.description && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                    {selectedMaterial.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedMaterial.tags && selectedMaterial.tags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMaterial.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* File Info */}
              <div>
                <p className="text-sm text-gray-600 mb-2">File</p>
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-900">{selectedMaterial.fileName}</p>
                  <p className="text-sm text-gray-600">
                    {(selectedMaterial.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenActionModal('approve');
                  }}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  ✓ Approve This Material
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenActionModal('reject');
                  }}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  ✕ Reject This Material
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold">
                {action === 'approve' ? 'Approve Material?' : 'Reject Material?'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                <strong>{selectedMaterial.title}</strong>
              </p>

              {action === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason *
                  </label>
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none mb-3"
                  >
                    <option value="">-- Select Reason --</option>
                    {rejectionReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>

                  {rejectionReason && (
                    <textarea
                      value={rejectionReason === 'Other (explain in notes)' ? '' : rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Detailed notes (if needed)..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  )}
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  {action === 'approve'
                    ? 'This material will be published and visible to all students.'
                    : 'The uploader will be notified about this rejection.'}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={action === 'approve' ? handleApprove : handleReject}
                  disabled={isProcessing || (action === 'reject' && !rejectionReason.trim())}
                  className={`flex-1 px-4 py-2 text-white rounded-lg font-medium disabled:opacity-50 ${
                    action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isProcessing ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ApprovalQueuePage;
