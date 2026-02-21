import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ResourceLibrary = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    subject: '',
    grade: '',
    type: '',
    tags: '',
    categories: '',
    sortBy: 'createdAt',
    sortOrder: '-1',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'link'
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, [filters, pagination.page]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });

      const response = await axios.get(`/api/materials?${params}`);
      setMaterials(response.data.data.materials);
      setPagination(response.data.data.pagination);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load materials');
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMaterials();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    // Check file sizes
    const oversizedFiles = acceptedFiles.filter(file => file.size > 100 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Some files are larger than 100MB limit');
      return;
    }

    // Check file types
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'video/mp4', 'video/avi', 'video/quicktime',
      'application/zip', 'application/x-rar-compressed'
    ];

    const invalidFiles = acceptedFiles.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error('Some file types are not allowed');
      return;
    }

    uploadFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'video/*': ['.mp4', '.avi', '.mov'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: true,
    maxFiles: 5
  });

  const uploadFiles = async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    // Add form data
    formData.append('subject', filters.subject || 'General');
    formData.append('grade', filters.grade || '6');
    formData.append('tags', filters.tags || '');
    formData.append('categories', filters.categories || '');

    try {
      const response = await axios.post('/api/materials/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(`${response.data.data.length} material(s) uploaded successfully`);
      setShowUploadModal(false);
      fetchMaterials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload materials');
    }
  };

  const uploadLink = async (linkData) => {
    try {
      const response = await axios.post('/api/materials/upload-link', linkData);
      toast.success('Link material uploaded successfully');
      setShowUploadModal(false);
      fetchMaterials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload link');
    }
  };

  const downloadMaterial = async (materialId) => {
    try {
      const response = await axios.get(`/api/materials/${materialId}/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', materials.find(m => m._id === materialId)?.originalFileName || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download material');
    }
  };

  const addReview = async (materialId, rating, comment) => {
    try {
      await axios.post(`/api/materials/${materialId}/reviews`, {
        rating,
        comment
      });
      
      toast.success('Review added successfully');
      fetchMaterials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getTypeIcon = (type) => {
    const icons = {
      pdf: '📄',
      document: '📝',
      video: '🎥',
      image: '🖼️',
      link: '🔗',
      presentation: '📊',
      spreadsheet: '📈',
      archive: '📦'
    };
    return icons[type] || '📄';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Resource Library</h1>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Upload Material
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <input
              type="text"
              placeholder="Search materials..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              <option value="Math">Math</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
            </select>

            <select
              value={filters.grade}
              onChange={(e) => handleFilterChange('grade', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Grades</option>
              {[6, 7, 8, 9, 10, 11, 12, 13].map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>

            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="pdf">PDF</option>
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
              <option value="link">Link</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Date Added</option>
              <option value="downloadCount">Most Downloaded</option>
              <option value="viewCount">Most Viewed</option>
              <option value="rating.average">Highest Rated</option>
            </select>

            <button
              type="submit"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Apply Filters
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading materials...</div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-4 text-gray-600">
              Showing {materials.length} of {pagination.total} materials
            </div>

            {/* Materials grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((material) => (
                <div key={material._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getTypeIcon(material.type)}</span>
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {material.title}
                        </h3>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {material.grade ? `Grade ${material.grade}` : 'All Grades'}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {material.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{material.subject}</span>
                      {material.fileSize && (
                        <span>{formatFileSize(material.fileSize)}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm">
                          {material.rating.average.toFixed(1)} ({material.rating.count})
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span>📥 {material.downloadCount}</span>
                        <span>👁️ {material.viewCount}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {material.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {material.tags.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          +{material.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadMaterial(material._id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMaterial(material);
                          setShowDetailsModal(true);
                        }}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded text-sm font-medium"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(pagination.totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded border ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upload Material</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setUploadType('file')}
                className={`flex-1 py-2 rounded ${uploadType === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Upload Files
              </button>
              <button
                onClick={() => setUploadType('link')}
                className={`flex-1 py-2 rounded ${uploadType === 'link' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Add Link
              </button>
            </div>

            {uploadType === 'file' ? (
              <div>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="text-gray-600">
                    {isDragActive ? (
                      <p>Drop the files here...</p>
                    ) : (
                      <div>
                        <p className="text-lg mb-2">📁 Drag & drop files here</p>
                        <p className="text-sm">or click to select files</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Maximum 5 files, 100MB each. Supported: PDF, DOC, PPT, XLS, Images, Videos, Archives
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                uploadLink({
                  title: formData.get('title'),
                  description: formData.get('description'),
                  subject: formData.get('subject'),
                  url: formData.get('url'),
                  grade: formData.get('grade'),
                  tags: formData.get('tags'),
                  categories: formData.get('categories')
                });
              }}>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    name="description"
                    placeholder="Description"
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="url"
                    name="url"
                    placeholder="https://example.com"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="subject"
                      placeholder="Subject"
                      required
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      name="grade"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Grade</option>
                      {[6, 7, 8, 9, 10, 11, 12, 13].map(grade => (
                        <option key={grade} value={grade}>Grade {grade}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    name="tags"
                    placeholder="Tags (comma-separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="categories"
                    placeholder="Categories (comma-separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
                  >
                    Add Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceLibrary;
