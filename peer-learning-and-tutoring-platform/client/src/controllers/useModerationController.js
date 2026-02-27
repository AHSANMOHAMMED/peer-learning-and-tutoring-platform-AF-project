import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as reportService from '../services/reportService';
import * as userService from '../services/userService';

/**
 * Moderation Controller Hook
 * Handles: Submit reports, list reports, take actions (ban, delete, dismiss)
 * Returns: data state, loading, error, and moderation functions
 */
export const useModerationController = () => {
  const [data, setData] = useState({
    reports: [],        // List of all reports
    report: null,       // Current report detail
    pendingReports: [], // Count for quick stats
    actions: [],        // Log of mod actions taken
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * ANY USER: Submit report for content/user
   * @param {Object} reportData - { type, contentId, userId, description, contentType }
   *   type: 'inappropriate', 'spam', 'harassment', 'abuse', 'copyright'
   *   contentType: 'material', 'session', 'message', 'user'
   */
  const submitReport = async (reportData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportService.createReport(reportData);
      if (response.success) {
        toast.success('Report submitted! Moderators will review it soon.');
        return response.data?.report || true;
      } else {
        throw new Error(response.message || 'Failed to submit report');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error submitting report';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * MODERATOR: Fetch all reports (with filters)
   * @param {Object} filters - { status, type, contentType, sortBy }
   */
  const listReports = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportService.getReports(filters);
      if (response.success) {
        setData(prev => ({
          ...prev,
          reports: response.data?.reports || [],
          pendingReports: response.data?.reports?.filter(r => r.status === 'pending') || [],
        }));
        return response.data?.reports || [];
      } else {
        throw new Error(response.message || 'Failed to fetch reports');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error fetching reports';
      setError(msg);
      toast.error(msg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * MODERATOR: Get single report detail
   * @param {string} id
   */
  const getReportById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportService.getReportById(id);
      if (response.success) {
        setData(prev => ({ ...prev, report: response.data?.report || null }));
        return response.data?.report || null;
      } else {
        throw new Error(response.message || 'Failed to fetch report');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error fetching report';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * MODERATOR: Approve report & take action (delete content)
   * @param {string} id
   * @param {Object} actionData - { action, reason, contentId, contentType }
   *   action: 'delete_content', 'warn_user', 'ban_user', 'suspend_user'
   */
  const approveReport = async (id, actionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportService.updateReportStatus(id, {
        status: 'approved',
        action: actionData.action,
        reason: actionData.reason,
      });

      if (response.success) {
        // If action requires content deletion or user ban, execute it
        if (actionData.action === 'delete_content' && actionData.contentId) {
          await deleteContent(actionData.contentType, actionData.contentId);
        }
        if (actionData.action === 'ban_user' && actionData.userId) {
          await banUser(actionData.userId, actionData.reason);
        }
        if (actionData.action === 'suspend_user' && actionData.userId) {
          await suspendUser(actionData.userId, actionData.reason);
        }

        // Update local state
        setData(prev => ({
          ...prev,
          reports: prev.reports.map(r =>
            r._id === id
              ? { ...r, status: 'approved', moderatorAction: actionData.action }
              : r
          ),
        }));
        toast.success('Report approved & action taken!');
        return true;
      } else {
        throw new Error(response.message || 'Failed to approve report');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error approving report';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * MODERATOR: Dismiss/reject report (no action taken)
   * @param {string} id
   * @param {string} reason
   */
  const dismissReport = async (id, reason = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportService.updateReportStatus(id, {
        status: 'dismissed',
        reason: reason,
      });

      if (response.success) {
        setData(prev => ({
          ...prev,
          reports: prev.reports.map(r =>
            r._id === id ? { ...r, status: 'dismissed' } : r
          ),
        }));
        toast.success('Report dismissed!');
        return true;
      } else {
        throw new Error(response.message || 'Failed to dismiss report');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error dismissing report';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helper: Delete reported content (material, message, etc)
   * @param {string} contentType - 'material', 'message', 'session'
   * @param {string} contentId
   */
  const deleteContent = async (contentType, contentId) => {
    try {
      const deleteMap = {
        material: `/api/materials/${contentId}`,
        message: `/api/messages/${contentId}`,
        session: `/api/sessions/${contentId}`,
      };
      const url = deleteMap[contentType];
      if (!url) throw new Error('Unknown content type');

      await axios.delete(url);
      toast.success(`${contentType} deleted!`);
    } catch (err) {
      toast.error(`Failed to delete ${contentType}`);
    }
  };

  /**
   * MODERATOR: Ban user (permanent)
   * @param {string} userId
   * @param {string} reason
   */
  const banUser = async (userId, reason = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.banUser(userId, reason);
      if (response.success) {
        toast.success('User banned!');
        return true;
      } else {
        throw new Error(response.message || 'Failed to ban user');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error banning user';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * MODERATOR: Suspend user (temporary)
   * @param {string} userId
   * @param {string} reason
   * @param {number} days - suspension duration (default 7)
   */
  const suspendUser = async (userId, reason = '', days = 7) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.suspendUser(userId, reason, days);
      if (response.success) {
        toast.success(`User suspended for ${days} days!`);
        return true;
      } else {
        throw new Error(response.message || 'Failed to suspend user');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error suspending user';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * MODERATOR: Warn user (soft warning)
   * @param {string} userId
   * @param {string} reason
   */
  const warnUser = async (userId, reason = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.warnUser(userId, reason);
      if (response.success) {
        toast.success('User warned!');
        return true;
      } else {
        throw new Error(response.message || 'Failed to warn user');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error warning user';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * MODERATOR: Get stats (dashboard widget)
   */
  const getStats = async () => {
    try {
      const response = await reportService.getReportStats();
      if (response.success) {
        return response.data?.stats || {};
      }
      return {};
    } catch (err) {
      return {};
    }
  };

  return {
    // State
    reports: data.reports,
    report: data.report,
    pendingReports: data.pendingReports,
    loading,
    error,
    
    // Functions
    submitReport,
    listReports,
    getReportById,
    approveReport,
    dismissReport,
    deleteContent,
    banUser,
    suspendUser,
    warnUser,
    getStats,
  };
};
