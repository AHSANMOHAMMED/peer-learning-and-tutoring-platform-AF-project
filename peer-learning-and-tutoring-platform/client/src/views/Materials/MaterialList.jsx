import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiFilter, FiGrid, FiList, FiPlus,
  FiDownload, FiStar, FiEye, FiMoreVertical,
  FiCheck, FiX, FiClock, FiLoader
} from 'react-icons/fi';
import { useMaterialController } from '../../controllers/useMaterialController';
import { useAuthViewModel } from '../../viewmodels/AuthViewModel';
import toast from 'react-hot-toast';

/**
 * MaterialList - Grid/List view of study materials with filters
 * 
 * MVC Pattern: View (Pure UI - Logic in useMaterialController)
 */
const MaterialList = () => {
  const navigate = useNavigate();
  const { user } = useAuthViewModel();
  const { 
    materials, 
    pendingMaterials,
    categories,
    filters,
    pagination,
    isLoading,
    isSubmitting,
    fetchMaterials,
    fetchPendingMaterials,
    approveMaterial,
    rejectMaterial,
    downloadMaterial,
    rateMaterial,
    updateFilters,
    clearFilters,
    goToPage
  } = useMaterialController();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'my'
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const isModerator = user?.role === 'admin' || user?.role === 'moderator';

  useEffect(() => {
    fetchMaterials();
    if (isModerator) {
      fetchPendingMaterials();
    }
  }, [isModerator]);

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ search: searchQuery });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'pending' && isModerator) {
      updateFilters({ status: 'pending' });
    } else if (tab === 'my') {
      // Filter for current user's materials
      updateFilters({ uploaderId: user?.id });
    } else {
      updateFilters({ status: 'approved', uploaderId: '' });
    }
  };

  const handleApprove = async (id) => {
    const result = await approveMaterial(id);
    if (result.success) {
      toast.success('Material approved!');
    }
  };

  const handleReject = async (id) => {
    const result = await rejectMaterial(id, 'Does not meet quality standards');
    if (result.success) {
      toast.success('Material rejected');
    }
  };

  const handleDownload = async (id) => {
    await downloadMaterial(id);
  };

  const openRatingModal = (material) => {
    setSelectedMaterial(material);
    setUserRating(0);
    setRatingModalOpen(true);
  };

  const submitRating = async () => {
    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    const result = await rateMaterial(selectedMaterial.id, userRating);
    if (result.success) {
      setRatingModalOpen(false);
      setSelectedMaterial(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-emerald-100 text-emerald-800',
      pending: 'bg-amber-100 text-amber-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return styles[status] || styles.pending;
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate && onRate(star)}
            className={`
              ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              transition-transform
            `}
            disabled={!interactive}
          >
            <FiStar
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-amber-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const displayMaterials = activeTab === 'pending' && isModerator
    ? pendingMaterials
    : materials;

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Materials</h1>
          <p className="text-gray-600">Browse and download learning resources</p>
        </div>
        <Link
          to="/materials/upload"
          className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2" />
          Upload Material
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Materials
        </button>
        <button
          onClick={() => handleTabChange('my')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'my' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Uploads
        </button>
        {isModerator && (
          <button
            onClick={() => handleTabChange('pending')}
            className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center ${
              activeTab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending
            {pendingMaterials.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                {pendingMaterials.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search materials..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>

          {/* Subject Filter */}
          <select
            value={filters.subject}
            onChange={(e) => updateFilters({ subject: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Subjects</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilters({ sortBy: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="mostDownloaded">Most Downloaded</option>
            <option value="highestRated">Highest Rated</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Clear filters"
          >
            <FiFilter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <FiLoader className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && displayMaterials.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiSearch className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No materials found</h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'pending' 
              ? 'No pending materials to review'
              : 'Try adjusting your filters or search query'
            }
          </p>
          {activeTab !== 'pending' && (
            <Link
              to="/materials/upload"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              <FiPlus className="mr-2" />
              Upload First Material
            </Link>
          )}
        </div>
      )}

      {/* Grid View */}
      {!isLoading && viewMode === 'grid' && displayMaterials.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayMaterials.map(material => (
            <div
              key={material.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Thumbnail */}
              <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative">
                <span className="text-4xl">{material.getFileIcon?.() || '📄'}</span>
                <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(material.status)}`}>
                  {material.status}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1" title={material.title}>
                  {material.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{material.description}</p>

                {/* Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span className="bg-gray-100 px-2 py-1 rounded">{material.subject}</span>
                  <span>{material.fileSizeDisplay || material.getFormattedFileSize?.()}</span>
                </div>

                {/* Rating & Downloads */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    <FiStar className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="text-sm font-medium">{material.averageRating?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-gray-400">({material.downloads || 0} downloads)</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {isModerator && material.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApprove(material.id)}
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                      >
                        <FiCheck className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(material.id)}
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <FiX className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate(`/materials/${material.id}`)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <FiEye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(material.id)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FiDownload className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {!isLoading && viewMode === 'list' && displayMaterials.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {displayMaterials.map((material, index) => (
            <div
              key={material.id}
              className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${
                index !== displayMaterials.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">{material.getFileIcon?.() || '📄'}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{material.title}</h3>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span>{material.subject}</span>
                  <span>{material.fileSizeDisplay || material.getFormattedFileSize?.()}</span>
                  <span className="flex items-center">
                    <FiStar className="w-4 h-4 text-amber-400 fill-current mr-1" />
                    {material.averageRating?.toFixed(1) || '0.0'}
                  </span>
                  <span>{material.downloads || 0} downloads</span>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`px-3 py-1 text-xs font-medium rounded-full mr-4 ${getStatusBadge(material.status)}`}>
                {material.status}
              </span>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {isModerator && material.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleApprove(material.id)}
                      disabled={isSubmitting}
                      className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                    >
                      <FiCheck className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleReject(material.id)}
                      disabled={isSubmitting}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate(`/materials/${material.id}`)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <FiEye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDownload(material.id)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                    >
                      <FiDownload className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <p className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} materials
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Rate this Material</h3>
            <p className="text-gray-600 mb-6">How helpful was this resource?</p>
            
            <div className="flex justify-center mb-6">
              {renderStars(userRating, true, setUserRating)}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setRatingModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialList;
