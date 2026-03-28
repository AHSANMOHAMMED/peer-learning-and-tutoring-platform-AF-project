import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useModerationController } from '../../controllers/useModerationController';
import toast from 'react-hot-toast';

/**
 * ModerationDashboardPage
 * Moderators review and act on reports
 * Actions: delete content, ban users, warn, dismiss
 */
const ModerationDashboardPage = () => {
  const {
    reports,
    loading,
    error,
    listReports,
    getReportById,
    approveReport,
    dismissReport,
    banUser,
    suspendUser,
    warnUser,
  } = useModerationController();

  const [filters, setFilters] = useState({ status: 'pending' });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'delete', 'ban', 'suspend', 'warn', 'dismiss'
  const [actionReason, setActionReason] = useState('');
  const [suspendDays, setSuspendDays] = useState(7);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch reports on mount and filter changes
  useEffect(() => {
    listReports(filters);
  }, [filters]);

  const handleViewReport = async (report) => {
    const fetched = await getReportById(report._id);
    if (fetched) {
      setSelectedReport(fetched);
      setShowDetailModal(true);
    }
  };

  const handleAction = async () => {
    if (!selectedReport || !actionType) {
      toast.error('Invalid selection');
      return;
    }

    setIsProcessing(true);

    try {
      if (actionType === 'dismiss') {
        await dismissReport(selectedReport._id, actionReason);
      } else if (actionType === 'delete') {
        await approveReport(selectedReport._id, {
          action: 'delete_content',
          reason: actionReason,
          contentId: selectedReport.contentId,
          contentType: selectedReport.contentType,
        });
      } else if (actionType === 'ban') {
        await approveReport(selectedReport._id, {
          action: 'ban_user',
          reason: actionReason,
          userId: selectedReport.reportedUserId || selectedReport.userId,
        });
      } else if (actionType === 'suspend') {
        await approveReport(selectedReport._id, {
          action: 'suspend_user',
          reason: actionReason,
          userId: selectedReport.reportedUserId || selectedReport.userId,
        });
      } else if (actionType === 'warn') {
        await approveReport(selectedReport._id, {
          action: 'warn_user',
          reason: actionReason,
          userId: selectedReport.reportedUserId || selectedReport.userId,
        });
      }

      // Reset and close
      setActionType(null);
      setActionReason('');
      setSuspendDays(7);
      setShowDetailModal(false);
      setSelectedReport(null);

      // Refresh reports
      listReports(filters);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || styles.pending;
  };

  const getReportTypeBadge = (type) => {
    const styles = {
      spam: 'bg-red-100 text-red-800',
      harassment: 'bg-orange-100 text-orange-800',
      inappropriate: 'bg-purple-100 text-purple-800',
      abuse: 'bg-red-100 text-red-800',
      copyright: 'bg-pink-100 text-pink-800',
    };
    return styles[type] || 'bg-blue-100 text-blue-800';
  };

  return (
    <DashboardLayout pageTitle="Moderation Dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Pending Reports</p>
            <p className="text-3xl font-bold text-yellow-600">
              {reports.filter((r) => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Approved</p>
            <p className="text-3xl font-bold text-green-600">
              {reports.filter((r) => r.status === 'approved').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Dismissed</p>
            <p className="text-3xl font-bold text-gray-600">
              {reports.filter((r) => r.status === 'dismissed').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-3xl font-bold text-blue-600">{reports.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <select
            value={filters.type || ''}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Types</option>
            <option value="spam">Spam</option>
            <option value="harassment">Harassment</option>
            <option value="inappropriate">Inappropriate</option>
            <option value="abuse">Abuse</option>
            <option value="copyright">Copyright</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Reports Table */}
        {!loading && !error && (
          <>
            {reports.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600">No reports found</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Report ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Content
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Reporter
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {reports.map((report) => (
                        <tr key={report._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">
                            {report._id.substring(0, 8)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getReportTypeBadge(
                                report.type
                              )}`}
                            >
                              {report.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <p className="font-medium">{report.contentType}</p>
                            <p className="text-gray-600 text-xs">{report.contentId}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {report.reportedBy?.name || 'Anonymous'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                report.status
                              )}`}
                            >
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleViewReport(report)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Report Review</h2>
                  <p className="text-sm text-gray-600">
                    ID: {selectedReport._id}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setActionType(null);
                  }}
                  className="text-gray-600 hover:text-gray-900 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Report Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Report Type</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getReportTypeBadge(selectedReport.type)}`}>
                    {selectedReport.type}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Content Type</p>
                  <p className="font-semibold">{selectedReport.contentType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reporter</p>
                  <p className="font-semibold">{selectedReport.reportedBy?.name || 'Anonymous'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date Reported</p>
                  <p className="font-semibold">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Report Description</p>
                <p className="text-gray-900 p-4 bg-gray-50 rounded-lg">
                  {selectedReport.description || 'No description provided'}
                </p>
              </div>

              {/* Action Selection */}
              {selectedReport.status === 'pending' && (
                <div className="mb-6 border-t pt-6">
                  <p className="text-lg font-semibold mb-4">Take Action</p>

                  {!actionType ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setActionType('delete')}
                        className="px-4 py-3 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium"
                      >
                        Delete Content
                      </button>
                      <button
                        onClick={() => setActionType('warn')}
                        className="px-4 py-3 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg font-medium"
                      >
                        Warn User
                      </button>
                      <button
                        onClick={() => setActionType('suspend')}
                        className="px-4 py-3 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg font-medium"
                      >
                        Suspend User
                      </button>
                      <button
                        onClick={() => setActionType('ban')}
                        className="px-4 py-3 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-medium"
                      >
                        Ban User
                      </button>
                      <button
                        onClick={() => setActionType('dismiss')}
                        className="px-4 py-3 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-medium col-span-2"
                      >
                        Dismiss Report
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="font-medium">
                        Action: <span className="text-blue-600">{actionType.toUpperCase()}</span>
                      </p>

                      {/* Suspend Days Input */}
                      {actionType === 'suspend' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Suspension Duration (days)
                          </label>
                          <input
                            type="number"
                            value={suspendDays}
                            onChange={(e) => setSuspendDays(parseInt(e.target.value))}
                            min="1"
                            max="365"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      )}

                      {/* Reason Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason/Notes
                        </label>
                        <textarea
                          value={actionReason}
                          onChange={(e) => setActionReason(e.target.value)}
                          placeholder="Explain your action..."
                          rows="4"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      {/* Confirm/Cancel */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleAction}
                          disabled={isProcessing}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isProcessing ? 'Processing...' : 'Confirm Action'}
                        </button>
                        <button
                          onClick={() => {
                            setActionType(null);
                            setActionReason('');
                          }}
                          className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* If already processed */}
              {selectedReport.status !== 'pending' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <span className="text-2xl">ℹ️</span>
                  <div>
                    <p className="font-semibold text-blue-900">Already Processed</p>
                    <p className="text-sm text-blue-800">
                      Status: {selectedReport.status}
                    </p>
                    {selectedReport.moderatorAction && (
                      <p className="text-sm text-blue-800">
                        Action: {selectedReport.moderatorAction}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ModerationDashboardPage;
