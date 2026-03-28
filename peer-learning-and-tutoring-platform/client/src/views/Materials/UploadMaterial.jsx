import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUpload, FiFile, FiX, FiCheck, FiLoader,
  FiBook, FiTag, FiAlignLeft, FiType
} from 'react-icons/fi';
import { useMaterialController } from '../../controllers/useMaterialController';
import toast from 'react-hot-toast';

/**
 * UploadMaterial - Material upload view with drag-drop
 * 
 * MVC Pattern: View (Pure UI - Logic in useMaterialController)
 */
const UploadMaterial = () => {
  const navigate = useNavigate();
  const { createMaterial, categories, isSubmitting } = useMaterialController();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    tags: [],
    isPublic: true
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    // Max 50MB
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }
    
    // Allowed types
    const allowedTypes = [
      'application/pdf', 'image/*', 'video/*',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return selectedFile.type.startsWith(type.replace('/*', ''));
      }
      return selectedFile.type === type;
    });
    
    if (!isAllowed) {
      toast.error('Please upload a valid file (PDF, Office, Image, or Video)');
      return;
    }
    
    setFile(selectedFile);
    
    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    if (!formData.subject) {
      toast.error('Please select a subject');
      return;
    }
    
    const submitData = new FormData();
    submitData.append('file', file);
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('subject', formData.subject);
    submitData.append('tags', JSON.stringify(formData.tags));
    submitData.append('isPublic', formData.isPublic);
    submitData.append('fileType', file.type);
    submitData.append('fileSize', file.size);
    
    // Simulate progress
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);
    
    const result = await createMaterial(submitData);
    
    clearInterval(progressInterval);
    setUploadProgress(100);
    
    if (result.success) {
      toast.success('Material uploaded successfully!');
      navigate('/materials');
    } else {
      setUploadProgress(0);
    }
  };

  const getFileIcon = () => {
    if (!file) return <FiUpload className="w-12 h-12 text-gray-400" />;
    
    if (file.type.startsWith('image/')) {
      return (
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
          {filePreview ? (
            <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiFile className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
        <FiFile className="w-10 h-10 text-blue-600" />
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Study Material</h1>
        <p className="text-gray-600">Share your knowledge with the community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          className={`
            border-2 border-dashed rounded-2xl p-8 text-center transition-all
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
            ${file ? 'border-solid' : ''}
          `}
        >
          {!file ? (
            <>
              <div className="mb-4 flex justify-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiUpload className="w-10 h-10 text-gray-400" />
                </div>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drag and drop your file here
              </p>
              <p className="text-gray-500 mb-4">or</p>
              <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                <FiUpload className="mr-2" />
                Browse Files
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*,video/*"
                />
              </label>
              <p className="text-sm text-gray-400 mt-4">
                Maximum file size: 50MB. Supported: PDF, Office, Images, Videos
              </p>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getFileIcon()}
                <div className="text-left">
                  <p className="font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2 w-48">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{uploadProgress}% uploaded</p>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiType className="inline mr-2" />
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a descriptive title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiAlignLeft className="inline mr-2" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what this material covers..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiBook className="inline mr-2" />
              Subject *
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a subject</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiTag className="inline mr-2" />
              Tags
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagAdd}
              placeholder="Add tags and press Enter (e.g., calculus, formulas)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              id="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
              Make this material public (visible to all users)
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/materials')}
            className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !file}
            className={`
              inline-flex items-center px-8 py-3 rounded-lg font-medium transition-colors
              ${isSubmitting || !file
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <FiLoader className="mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FiCheck className="mr-2" />
                Upload Material
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadMaterial;
