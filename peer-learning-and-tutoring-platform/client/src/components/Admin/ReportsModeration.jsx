import React, { useState, useEffect } from 'react';
import { 
  FiFilter, 
  FiEye, 
  FiCheck, 
  FiX, 
  FiAlertTriangle,
  FiTrash2,
  FiUserX,
  FiMessageSquare,
  FiSearch,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { useAdminController } from '../../controllers/useAdminController';
import toast from 'react-hot-toast';

/**
 * ReportsModeration - Admin view for managing user reports
 * 
 * MVC Pattern: View (Pure UI - Logic in useAdminController)
 */
const ReportsModeration = () => {
  const { 
    reports, 
    reportsFilter, 
    reportsPagination,
    fetchReports, 
    updateReportsFilter,
    resolveReport,
    dismissReport,
    isLoading 
  } = useAdminController();

  const [selectedReport, setSelectedReport] = useState(null);
  const [actionModal, setActionModal] = useState(null); // 'resolve', 'dismiss'
  const [actionNotes, setActionNotes] = useState('');
  const [selectedAction, setSelectedAction] = useState('');

  useEffect(() => {
    fetchReports();
  }, [fetchReports, reportsFilter]);

  const handleFilterChange = (filter) => {
    updateReportsFilter(filter);
  };

  const openActionModal = (report, action) => {
    setSelectedReport(report);
    setActionModal(action);
    setActionNotes('');
    setSelectedAction('');
  };

  const handleResolve = async () => {
    if (!selectedReport || !selectedAction) return;

    const result = await resolveReport(selectedReport.id, selectedAction, actionNotes);
    if (result.success) {
      toast.success(`Report resolved with action: ${selectedAction}`);
      setActionModal(null);
      setSelectedReport(null);
    } else {
      toast.error('Failed to resolve report');
    }
  };

  const handleDismiss = async () => {
    if (!selectedReport) return;

    const result = await dismissReport(selectedReport.id, actionNotes);
    if (result.success) {
      toast.success('Report dismissed');
      setActionModal(null);
      setSelectedReport(null);
    } else {
      toast.error('Failed to dismiss report');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[priority] || colors.low;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800',
      investigating: 'bg-blue-100 text-blue-800',
      resolved: 'bg-emerald-100 text-emerald-800',
      dismissed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.pending;
  };

  const actionOptions = [
    { value: 'warn', label: 'Warn User', icon: FiMessageSquare, color: 'text-amber-600' },
    { value: 'delete_content', label: 'Delete Content', icon: FiTrash2, color: 'text-red-600' },
    { value: 'suspend', label: 'Suspend User (7 days)', icon: FiAlertTriangle, color: 'text-orange-600' },
    { value: 'ban', label: 'Ban User', icon: FiUserX, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Reports & Moderation</h1>
        <p className="text-red-100">
          Review and take action on user reports. {reports.filter(r => r.status === 'pending').length} pending reports.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <FiFilter className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'investigating', 'resolved', 'dismissed'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  reportsFilter === filter
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex-1"></div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-500">All caught up! No reports matching your filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Report</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reporter</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Target</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{report.reason}</p>
                          <p className="text-sm text-gray-500">{report.reportedItemDisplay}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-2">
                            {report.reporter?.displayName?.charAt(0) || '?'}
                          </div>
                          <span className="text-sm text-gray-700">{report.reporter?.displayName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{report.reportedUser?.displayName || 'Unknown'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(report.priority)}`}>
                          {report.priority?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {report.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openActionModal(report, 'resolve')}
                              className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                              title="Resolve"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openActionModal(report, 'dismiss')}
                              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                              title="Dismiss"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {report.status !== 'pending' && (
                          <span className="text-sm text-gray-500">
                            {report.action === 'none' ? 'Dismissed' : `Action: ${report.action}`}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((reportsPagination.page - 1) * reportsPagination.limit) + 1} - {Math.min(reportsPagination.page * reportsPagination.limit, reportsPagination.total)} of {reportsPagination.total} reports
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchReports(reportsPagination.page - 1)}
                  disabled={reportsPagination.page === 1}
                  className="p-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => fetchReports(reportsPagination.page + 1)}
                  disabled={reportsPagination.page === reportsPagination.totalPages}
                  className="p-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Resolve Modal */}
      {actionModal === 'resolve' && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-slide-up">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                <FiCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Resolve Report</h3>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                <strong>Report:</strong> {selectedReport.reason}<br />
                <strong>Reported User:</strong> {selectedReport.reportedUser?.displayName || 'Unknown'}
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Action
              </label>
              <div className="space-y-2">
                {actionOptions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.value}
                      onClick={() => setSelectedAction(action.value)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg border-2 transition-all ${
                        selectedAction === action.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${action.color}`} />
                      <span className="font-medium text-gray-900">{action.label}</span>
                      {selectedAction === action.value && (
                        <FiCheck className="w-5 h-5 text-emerald-500 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Add notes about this action..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActionModal(null)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={!selectedAction}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resolve Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dismiss Modal */}
      {actionModal === 'dismiss' && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <FiX className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Dismiss Report</h3>
            </div>

            <p className="text-gray-600 mb-4">
              This will mark the report as dismissed with no action taken.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Reason for dismissing..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActionModal(null)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Dismiss Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsModeration;
