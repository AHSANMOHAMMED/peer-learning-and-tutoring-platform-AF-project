import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FiFlag, FiUser, FiFileText, FiClock, FiMessageSquare,
  FiAlertTriangle, FiCheck, FiArrowLeft, FiUpload,
  FiX, FiLoader
} from 'react-icons/fi';
import { useModerationController } from '../../controllers/useModerationController';
import { useMaterialController } from '../../controllers/useMaterialController';
import { useTutoringController } from '../../controllers/useTutoringController';
import { useAuthViewModel } from '../../viewmodels/AuthViewModel';
import toast from 'react-hot-toast';

/**
 * ReportForm - Modal/View for submitting reports
 * 
 * MVC Pattern: View (Pure UI - Logic in useModerationController)
 */
const ReportForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthViewModel();
  const { createReport, reportReasons, isSubmitting } = useModerationController();
  const { fetchMaterialById } = useMaterialController();
  const { fetchSessionById } = useTutoringController();

  // Get pre-filled data from URL params
  const targetType = searchParams.get('type') || 'user';
  const targetId = searchParams.get('id') || '';

  const [formData, setFormData] = useState({
    reportedType: targetType,
    reportedContentId: targetId,
    reason: '',
    description: '',
    priority: 'medium',
    evidence: []
  });
  const [targetInfo, setTargetInfo] = useState(null);
  const [step, setStep] = useState(1); // 1: Select target, 2: Report details
  const [evidenceFiles, setEvidenceFiles] = useState([]);

  // Fetch target info if provided
  useEffect(() => {
    const fetchTargetInfo = async () => {
      if (!targetId) return;

      try {
        let info = null;
        switch (targetType) {
          case 'material':
            info = await fetchMaterialById(targetId);
            break;
          case 'session':
            info = await fetchSessionById(targetId);
            break;
          default:
            break;
        }
        setTargetInfo(info);
      } catch (err) {
        console.error('Failed to fetch target info:', err);
      }
    };

    fetchTargetInfo();
  }, [targetType, targetId, fetchMaterialById, fetchSessionById]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max size is 5MB.`);
        return false;
      }
      return true;
    });

    setEvidenceFiles(prev => [...prev, ...validFiles]);
  };

  const removeEvidenceFile = (index) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.reason) {
      toast.error('Please select a reason for your report');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please provide a detailed description');
      return;
    }

    const reportData = {
      ...formData,
      evidence: evidenceFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }))
    };

    const result = await createReport(reportData);
    
    if (result.success) {
      navigate(-1);
    }
  };

  const getTargetIcon = () => {
    const icons = {
      user: <FiUser className="w-6 h-6" />,
      material: <FiFileText className="w-6 h-6" />,
      session: <FiClock className="w-6 h-6" />,
      review: <FiMessageSquare className="w-6 h-6" />
    };
    return icons[formData.reportedType] || <FiFlag className="w-6 h-6" />;
  };

  const getTargetLabel = () => {
    const labels = {
      user: 'User',
      material: 'Material',
      session: 'Session',
      review: 'Review'
    };
    return labels[formData.reportedType] || 'Content';
  };

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <FiFlag className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report Content</h1>
            <p className="text-gray-600">Help us keep our community safe</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center mb-8">
        <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className="w-8" />
        <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Target Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
              1
            </span>
            What are you reporting?
          </h2>

          {/* Target Type */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {['user', 'material', 'session', 'review'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, reportedType: type }))}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  formData.reportedType === type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`mx-auto mb-2 ${formData.reportedType === type ? 'text-blue-600' : 'text-gray-400'}`}>
                  {type === 'user' && <FiUser className="w-6 h-6 mx-auto" />}
                  {type === 'material' && <FiFileText className="w-6 h-6 mx-auto" />}
                  {type === 'session' && <FiClock className="w-6 h-6 mx-auto" />}
                  {type === 'review' && <FiMessageSquare className="w-6 h-6 mx-auto" />}
                </div>
                <span className={`font-medium capitalize ${formData.reportedType === type ? 'text-blue-700' : 'text-gray-700'}`}>
                  {type}
                </span>
              </button>
            ))}
          </div>

          {/* Target Info (if pre-filled) */}
          {targetInfo && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Reporting {getTargetLabel().toLowerCase()}:</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  {getTargetIcon()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{targetInfo.title || targetInfo.subject || targetInfo.displayName}</p>
                  <p className="text-sm text-gray-500">
                    {targetInfo.description || targetInfo.notes || targetInfo.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Report Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
              2
            </span>
            Report Details
          </h2>

          {/* Priority */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <div className="flex space-x-3">
              {[
                { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-700 border-blue-300' },
                { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
                { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-300' },
                { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-300' }
              ].map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                    formData.priority === priority.value
                      ? priority.color
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Report *
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a reason...</option>
              {reportReasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
            {formData.reason && (
              <p className="mt-2 text-sm text-gray-500">
                {reportReasons.find(r => r.value === formData.reason)?.description}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Please provide specific details about the issue..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Include specific details, dates, and any relevant information
            </p>
          </div>

          {/* Evidence Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidence (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload screenshots or files as evidence
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Max 5MB per file (images, PDFs)
              </p>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer">
                <FiUpload className="w-4 h-4 mr-2" />
                Choose Files
                <input
                  type="file"
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*,.pdf"
                  className="hidden"
                />
              </label>
            </div>

            {/* Evidence Files List */}
            {evidenceFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {evidenceFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <FiFileText className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEvidenceFile(index)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 rounded-xl p-4 flex items-start">
          <FiAlertTriangle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">False Reporting</h4>
            <p className="text-sm text-blue-700">
              Submitting false reports is a violation of our terms of service and may result in account suspension.
              Please ensure your report is accurate and truthful.
            </p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              inline-flex items-center px-8 py-3 rounded-lg font-medium transition-colors
              ${isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <FiLoader className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FiFlag className="mr-2" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
