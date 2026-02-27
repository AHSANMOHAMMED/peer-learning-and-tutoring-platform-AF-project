import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiFilter, FiEye, FiCheck, FiX, FiAlertTriangle,
  FiTrash2, FiUserX, FiMessageSquare, FiSearch,
  FiChevronLeft, FiChevronRight, FiClock, FiUser,
  FiFlag, FiLoader, FiRefreshCw
} from 'react-icons/fi';
import { useModerationController } from '../../controllers/useModerationController';
import { useAuthViewModel } from '../../viewmodels/AuthViewModel';
import toast from 'react-hot-toast';

/**
 * ModerationQueue - Admin view for managing user reports
 * 
 * MVC Pattern: View (Pure UI - Logic in useModerationController)
 */
const ModerationQueue = () => {
  const { user } = useAuthViewModel();
  const { 
    reports,
    stats,
    filters,
    pagination,
    isLoading,
    isSubmitting,
    reportReasons,
    fetchReports,
    fetchStats,
    resolveReport,
    dismissReport,
    updateFilters
  } = useModerationController();

  const [selectedReport, setSelectedReport] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [fetchReports, fetchStats]);

  const handleResolve = async () => {
    if (!selectedReport || !actionType) return;

    const result = await resolveReport(selectedReport.id, actionType, actionNotes);
    if (result.success) {
      setActionModalOpen(false);
      setSelectedReport(null);
      setActionType('');
      setActionNotes('');
    }
  };

  const handleDismiss = async () => {
    if (!selectedReport) return;

    const result = await dismissReport(selectedReport.id, actionNotes);
    if (result.success) {
      setActionModalOpen(false);
      setSelectedReport(null);
      setActionNotes('');
    }
  };

  const openActionModal = (report, action) => {
    setSelectedReport(report);
    setActionType(action);
    setActionNotes('');
    setActionModalOpen(true);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[priority] || colors.low;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800',
      investigating: 'bg-blue-100 text-blue-800',
      resolved: 'bg-emerald-100 text-emerald-800',
      dismissed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  const getTypeIcon = (type) => {
    const icons = {
      user: <FiUser className="w-4 h-4" />,
      material: <FiTrash2 className="w-4 h-4" />,
      session: <FiClock className="w-4 h-4" />,
      review: <FiMessageSquare className="w-4 h-4" />
    };
    return icons[type] || <FiFlag className="w-4 h-4" />;
  };

  const actionOptions = [
    { value: 'warn', label: 'Warn User', icon: FiMessageSquare, color: 'text-amber-600', description: 'Send a warning message to the user' },
    { value: 'delete_content', label: 'Delete Content', icon: FiTrash2, color: 'text-red-600', description: 'Remove the reported content' },
    { value: 'suspend', label: 'Suspend User (7 days)', icon: FiClock, color: 'text-orange-600', description: 'Temporarily suspend the user' },
    { value: 'ban', label: 'Ban User', icon: FiUserX, color: 'text-red-600', description: 'Permanently ban the user from the platform' }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reports & Moderation</h1>
            <p className="text-red-100">
              {stats.pendingReports} pending reports require attention
            </p>
          </div>
          <button
            onClick={() => { fetchReports(); fetchStats(); }}
            className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            <FiRefreshCw className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiFlag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pendingReports}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <FiClock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved Today</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.resolvedToday}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FiCheck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Resolution</p>
              <p className="text-2xl font-bold text-purple-600">{stats.averageResolutionTime}h</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiClock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <FiFilter className="w-5 h-5" />
            <span className="font-medium">Filters:</span>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => updateFilters({ priority: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => updateFilters({ type: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="user">User</option>
            <option value="material">Material</option>
            <option value="session">Session</option>
            <option value="review">Review</option>
          </select>

          <label className="flex items-center space-x-2 ml-auto">
            <input
              type="checkbox"
              checked={filters.assignedToMe}
              onChange={(e) => updateFilters({ assignedToMe: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Assigned to me</span>
          </label>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <FiLoader className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && reports.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No reports found</h3>
          <p className="text-gray-600">All reports have been handled. Great job!</p>
        </div>
      )}

      {/* Reports Table */}
      {!isLoading && reports.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Reported</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Reporter</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-900">
                        {getTypeIcon(report.reportedType)}
                        <span className="ml-2 capitalize">{report.reportedType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                          <FiUser className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {report.reportedUser?.displayName || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 max-w-xs truncate" title={report.reason}>
                        {report.reason}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {report.reporter?.displayName || 'Anonymous'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      {report.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openActionModal(report, 'warn')}
                            disabled={isSubmitting}
                            className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
                            title="Warn User"
                          >
                            <FiMessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openActionModal(report, 'delete_content')}
                            disabled={isSubmitting}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            title="Delete Content"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openActionModal(report, 'suspend')}
                            disabled={isSubmitting}
                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg"
                            title="Suspend User"
                          >
                            <FiClock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openActionModal(report, 'ban')}
                            disabled={isSubmitting}
                            className="p-2 text-red-700 hover:bg-red-100 rounded-lg"
                            title="Ban User"
                          >
                            <FiUserX className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openActionModal(report, 'dismiss')}
                            disabled={isSubmitting}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="Dismiss Report"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {report.status !== 'pending' && (
                        <Link
                          to={`/reports/${report.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg inline-flex"
                        >
                          <FiEye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reports
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchReports(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchReports(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Modal */}
      {actionModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {actionType === 'dismiss' ? 'Dismiss Report' : 'Take Action'}
            </h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Report</p>
              <p className="font-medium text-gray-900">{selectedReport.reason}</p>
              <p className="text-sm text-gray-600 mt-2">
                Reported by: {selectedReport.reporter?.displayName || 'Anonymous'}
              </p>
            </div>

            {actionType !== 'dismiss' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                <div className="space-y-2">
                  {actionOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setActionType(option.value)}
                      className={`w-full flex items-center p-3 rounded-lg border-2 transition-all ${
                        actionType === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <option.icon className={`w-5 h-5 mr-3 ${option.color}`} />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes {actionType === 'dismiss' && '(Optional)'}
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={actionType === 'dismiss' ? 'Reason for dismissing...' : 'Add notes about this action...'}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setActionModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              {actionType === 'dismiss' ? (
                <button
                  onClick={handleDismiss}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  {isSubmitting ? 'Dismissing...' : 'Dismiss Report'}
                </button>
              ) : (
                <button
                  onClick={handleResolve}
                  disabled={isSubmitting || !actionType}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Action'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationQueue;
