import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useMaterialController } from '../../controllers/useMaterialController';
import toast from 'react-hot-toast';

/**
 * MaterialListPage
 * Browse and filter study materials
 * Students can view, download, report
 * Moderators can approve/reject pending
 */
const MaterialListPage = () => {
  const { materials, loading, error, list } = useMaterialController();
  const [filters, setFilters] = useState({
    subject: '',
    tags: '',
    status: 'approved', // Show approved by default
    search: '',
  });
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch materials on mount and filter changes
  useEffect(() => {
    list(filters);
  }, [filters]);

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewDetail = (material) => {
    setSelectedMaterial(material);
    setShowDetailModal(true);
  };

  const handleDownload = (material) => {
    // Trigger download
    window.open(material.fileUrl, '_blank');
    toast.success('Download started!');
  };

  // Subject and tag options (from backend or hardcoded)
  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Computer Science',
  ];

  const tags = ['notes', 'tutorial', 'exam-prep', 'exercise', 'video', 'document'];

  return (
    <DashboardLayout pageTitle="Study Materials Library">
      <div className="max-w-7xl mx-auto">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filter Materials</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by title..."
                value={filters.search}
                onChange={(e) => handleFilter('search', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={filters.subject}
                onChange={(e) => handleFilter('subject', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <select
                value={filters.tags}
                onChange={(e) => handleFilter('tags', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All Tags</option>
                {tags.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilter('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading materials...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Materials Grid */}
        {!loading && !error && (
          <>
            {materials.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">No materials found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((material) => (
                  <div
                    key={material._id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                  >
                    {/* Material Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 flex-1">
                          {material.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            material.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : material.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {material.status?.charAt(0).toUpperCase() + material.status?.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {material.description}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="mb-4 text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Subject:</strong> {material.category || material.subject}
                      </p>
                      <p>
                        <strong>Uploaded by:</strong> {material.createdBy?.name || 'Unknown'}
                      </p>
                      <p>
                        <strong>Date:</strong>{' '}
                        {new Date(material.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Tags */}
                    {material.tags && material.tags.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {material.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(material)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View
                      </button>
                      {material.fileUrl && (
                        <button
                          onClick={() => handleDownload(material)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Download
                        </button>
                      )}
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                        Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedMaterial.title}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>

              <p className="text-gray-700 mb-4">{selectedMaterial.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <p className="text-gray-600">Subject</p>
                  <p className="font-semibold">{selectedMaterial.category}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-semibold">{selectedMaterial.status}</p>
                </div>
                <div>
                  <p className="text-gray-600">Uploaded By</p>
                  <p className="font-semibold">{selectedMaterial.createdBy?.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Date</p>
                  <p className="font-semibold">
                    {new Date(selectedMaterial.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedMaterial.tags && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMaterial.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {selectedMaterial.fileUrl && (
                  <button
                    onClick={() => {
                      handleDownload(selectedMaterial);
                      setShowDetailModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Download File
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MaterialListPage;
