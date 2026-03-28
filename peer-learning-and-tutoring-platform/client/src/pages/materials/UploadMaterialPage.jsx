import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useMaterialController } from '../../controllers/useMaterialController';
import { FileUploader } from '../../components/materials/FileUploader';
import toast from 'react-hot-toast';

/**
 * UploadMaterialPage
 * Students/Tutors upload study materials
 */
const UploadMaterialPage = () => {
  const navigate = useNavigate();
  const { create, loading, error } = useMaterialController();

  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Computer Science',
  ];

  const suggestedTags = [
    'notes',
    'tutorial',
    'exam-prep',
    'exercise',
    'video',
    'solution',
    'syllabus',
  ];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (tag) => {
    if (!formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a subject');
      return;
    }

    setIsSubmitting(true);

    // Create FormData for multipart upload
    const uploadFormData = new FormData();
    uploadFormData.append('file', selectedFile);
    uploadFormData.append('title', formData.title);
    uploadFormData.append('description', formData.description);
    uploadFormData.append('category', formData.category);
    formData.tags.forEach(tag => {
      uploadFormData.append('tags', tag);
    });

    const result = await create(uploadFormData);
    setIsSubmitting(false);

    if (result) {
      // Reset form
      setSelectedFile(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        tags: [],
      });
      setTagInput('');

      // Redirect
      setTimeout(() => {
        navigate('/materials');
      }, 1500);
    }
  };

  return (
    <DashboardLayout pageTitle="Upload Study Material">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* File Upload Section */}
          <div>
            <h2 className="text-xl font-bold mb-4">Select File</h2>
            {selectedFile ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-green-900">{selectedFile.name}</p>
                  <p className="text-sm text-green-800">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Change
                </button>
              </div>
            ) : (
              <FileUploader
                onFileSelect={setSelectedFile}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
                maxSize={50}
              />
            )}
            <p className="text-xs text-gray-600 mt-2">
              Supported: PDF, Word, PowerPoint, Excel, ZIP (max 50MB)
            </p>
          </div>

          <hr />

          {/* Details Section */}
          <div>
            <h2 className="text-xl font-bold mb-4">Material Details</h2>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="e.g., Chapter 5 - Algebra Notes"
                maxLength="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-600 mt-1">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="What's in this material? Any important notes?"
                rows="4"
                maxLength="500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-600 mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Subject/Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Select Subject --</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional - max 5)
              </label>

              {/* Current Tags */}
              {formData.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Tags */}
              <p className="text-xs text-gray-600 mb-2">Quick tags:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    disabled={formData.tags.includes(tag) || formData.tags.length >= 5}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              {/* Custom Tag Input */}
              {formData.tags.length < 5 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value.toLowerCase())}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (tagInput.trim()) {
                          handleAddTag(tagInput.trim());
                        }
                      }
                    }}
                    placeholder="Type tag and press Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tagInput.trim()) {
                        handleAddTag(tagInput.trim());
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm">
            <p className="font-semibold text-blue-900">📋 Before You Submit:</p>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Materials will be reviewed by moderators before publishing</li>
              <li>Ensure the content is original or properly licensed</li>
              <li>Include relevant tags to help students find it</li>
              <li>Clear titles and descriptions improve visibility</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/materials')}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading || !selectedFile}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {isSubmitting || loading ? 'Uploading...' : 'Upload Material'}
            </button>
          </div>
        </form>

        {/* Tips Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-2xl mb-2">📝</p>
            <h3 className="font-bold mb-2">Study Notes</h3>
            <p className="text-sm text-gray-600">
              Share your class notes, summaries, and learning materials to help other students
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-2xl mb-2">🎯</p>
            <h3 className="font-bold mb-2">Practice Papers</h3>
            <p className="text-sm text-gray-600">
              Upload exam papers, assignments, and practice problems with solutions
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-2xl mb-2">🎓</p>
            <h3 className="font-bold mb-2">Earn Recognition</h3>
            <p className="text-sm text-gray-600">
              Get credit for sharing quality materials and build your tutor profile
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UploadMaterialPage;
