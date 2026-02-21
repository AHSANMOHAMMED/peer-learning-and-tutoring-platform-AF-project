import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ModeratorDashboard = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [actions, setActions] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [filters, setFilters] = useState({
    status: 'pending',
    timeframe: '30d'
  });

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab, filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'reports') {
        await fetchReports();
      } else if (activeTab === 'actions') {
        await fetchActions();
      } else if (activeTab === 'appeals') {
        await fetchAppeals();
      } else if (activeTab === 'statistics') {
        await fetchStatistics();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Fetch dashboard data error:', error);
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get(`/api/moderation/reports?status=${filters.status}`);
      setReports(response.data.data.reports);
    } catch (error) {
      toast.error('Failed to fetch reports');
    }
  };

  const fetchActions = async () => {
    try {
      const response = await axios.get('/api/moderation/actions');
      setActions(response.data.data.actions);
    } catch (error) {
      toast.error('Failed to fetch actions');
    }
  };

  const fetchAppeals = async () => {
    try {
      const response = await axios.get('/api/moderation/appeals/pending');
      setAppeals(response.data.data.actions);
    } catch (error) {
      toast.error('Failed to fetch appeals');
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`/api/moderation/statistics?timeframe=${filters.timeframe}`);
      setStatistics(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    }
  };

  const handleReportAction = async (reportId, action, notes) => {
    try {
      if (action === 'dismiss') {
        await axios.put(`/api/moderation/reports/${reportId}/dismiss`, { notes });
      } else {
        await axios.put(`/api/moderation/reports/${reportId}/resolve`, { action, notes });
      }
      
      toast.success(`Report ${action}d successfully`);
      fetchReports();
      setShowReportDetails(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process report');
    }
  };

  const handleAppealReview = async (appealId, status, notes) => {
    try {
      await axios.put(`/api/moderation/appeals/${appealId}/review`, { status, notes });
      toast.success(`Appeal ${status} successfully`);
      fetchAppeals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to review appeal');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Moderation Dashboard</h1>
            <div className="flex items-center space-x-4">
              <select
                value={filters.timeframe}
                onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['reports', 'actions', 'appeals', 'statistics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'reports' && reports.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {reports.length}
                  </span>
                )}
                {tab === 'appeals' && appeals.length > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {appeals.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <>
            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>

                <div className="bg-white shadow rounded-lg">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reason
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reporter
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reports.map((report) => (
                          <tr key={report._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">
                                {report.reportedType}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">
                                {report.reason}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                                {report.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">
                                {report.reporterId?.profile?.firstName} {report.reporterId?.profile?.lastName}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatTimeAgo(report.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => {
                                  setSelectedReport(report);
                                  setShowReportDetails(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-3"
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
              </div>
            )}

            {/* Actions Tab */}
            {activeTab === 'actions' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Moderator Actions</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {actions.map((action) => (
                    <div key={action._id} className="bg-white p-6 rounded-lg shadow">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold text-gray-900">
                          {action.actionType.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(action.reviewStatus)}`}>
                          {action.reviewStatus}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-4">
                        <p><strong>Target:</strong> {action.targetType}</p>
                        <p><strong>Reason:</strong> {action.reason}</p>
                        <p><strong>Date:</strong> {new Date(action.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      {action.notes && (
                        <div className="text-sm text-gray-500 italic">
                          "{action.notes.substring(0, 100)}..."
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appeals Tab */}
            {activeTab === 'appeals' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Pending Appeals</h2>
                
                <div className="space-y-4">
                  {appeals.map((appeal) => (
                    <div key={appeal._id} className="bg-white p-6 rounded-lg shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Appeal for {appeal.actionType}
                          </h3>
                          <p className="text-sm text-gray-600">
                            By: {appeal.appeal?.appealedBy?.profile?.firstName} {appeal.appeal?.appealedBy?.profile?.lastName}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(appeal.appeal?.appealedAt)}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Appeal Reason:</p>
                        <p className="text-sm text-gray-600">{appeal.appeal?.appealReason}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAppealReview(appeal._id, 'accepted', 'Appeal accepted after review')}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleAppealReview(appeal._id, 'rejected', 'Appeal rejected after review')}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'statistics' && statistics && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Moderation Statistics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-2xl font-bold text-blue-600">{statistics.reports.total}</div>
                    <div className="text-sm text-gray-600">Total Reports</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-2xl font-bold text-yellow-600">{statistics.reports.pending}</div>
                    <div className="text-sm text-gray-600">Pending Reports</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-2xl font-bold text-green-600">{statistics.reports.resolved}</div>
                    <div className="text-sm text-gray-600">Resolved Reports</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-2xl font-bold text-purple-600">{statistics.overdue}</div>
                    <div className="text-sm text-gray-600">Overdue Reports</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Type</h3>
                    <div className="space-y-2">
                      {statistics.reports.byType.map((item) => (
                        <div key={item._id} className="flex justify-between">
                          <span className="text-sm text-gray-600 capitalize">{item._id}</span>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Reason</h3>
                    <div className="space-y-2">
                      {statistics.reports.byReason.map((item) => (
                        <div key={item._id} className="flex justify-between">
                          <span className="text-sm text-gray-600 capitalize">{item._id}</span>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Report Details Modal */}
      {showReportDetails && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Report Details</h2>
              <button
                onClick={() => setShowReportDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Report Information</h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>Type:</strong> {selectedReport.reportedType}</p>
                  <p><strong>Reason:</strong> {selectedReport.reason}</p>
                  <p><strong>Priority:</strong> 
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedReport.priority)}`}>
                      {selectedReport.priority}
                    </span>
                  </p>
                  <p><strong>Description:</strong> {selectedReport.description}</p>
                  <p><strong>Created:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Action</h3>
                <div className="mt-2 space-y-2">
                  <textarea
                    placeholder="Add notes for this action..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    id="actionNotes"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const notes = document.getElementById('actionNotes').value;
                        handleReportAction(selectedReport._id, 'content_removed', notes);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Remove Content
                    </button>
                    <button
                      onClick={() => {
                        const notes = document.getElementById('actionNotes').value;
                        handleReportAction(selectedReport._id, 'user_suspended', notes);
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                      Suspend User
                    </button>
                    <button
                      onClick={() => {
                        const notes = document.getElementById('actionNotes').value;
                        handleReportAction(selectedReport._id, 'dismiss', notes);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeratorDashboard;
