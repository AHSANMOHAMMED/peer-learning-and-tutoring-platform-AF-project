import { useState, useEffect, useCallback, useRef } from 'react';
import { moderationService } from '../services/moderationService';
import { userService } from '../services/userService';
import { Report } from '../models/Report';
import toast from 'react-hot-toast';

/**
 * useModerationController - Controller hook for safety & moderation CRUD
 * Handles reports, flagged content, and moderation actions
 * 
 * MVC Pattern: Controller (Business Logic Layer)
 */
export const useModerationController = () => {
  // State
  const [reports, setReports] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedToday: 0,
    averageResolutionTime: 0,
    flaggedContentCount: 0
  });
  const [filters, setFilters] = useState({
    status: 'pending', // pending, investigating, resolved, dismissed, all
    priority: '', // urgent, high, medium, low
    type: '', // user, material, session, review
    assignedToMe: false
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Auto-refresh interval ref
  const refreshIntervalRef = useRef(null);

  // Report reasons/options
  const reportReasons = [
    { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Content that violates community guidelines' },
    { value: 'harassment', label: 'Harassment or Bullying', description: 'Targeting someone with harmful behavior' },
    { value: 'spam', label: 'Spam or Misleading', description: 'Unwanted repetitive content or scams' },
    { value: 'fake_credentials', label: 'Fake Credentials', description: 'False qualifications or identity' },
    { value: 'copyright', label: 'Copyright Violation', description: 'Unauthorized use of copyrighted material' },
    { value: 'hate_speech', label: 'Hate Speech', description: 'Content promoting hatred or discrimination' },
    { value: 'violence', label: 'Violence or Threats', description: 'Content depicting or promoting violence' },
    { value: 'other', label: 'Other', description: 'Something else not covered above' }
  ];

  // Fetch all reports (moderator view)
  const fetchReports = useCallback(async (page = 1, customFilters = null) => {
    const activeFilters = customFilters || filters;
    setIsLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit: pagination.limit,
        status: activeFilters.status === 'all' ? '' : activeFilters.status,
        priority: activeFilters.priority,
        type: activeFilters.type,
        assignedToMe: activeFilters.assignedToMe
      };
      
      const response = await moderationService.getReports(params);
      
      if (response.success) {
        const reportsData = response.data?.reports || response.data || [];
        const paginationData = response.data?.pagination || {};
        
        setReports(reportsData.map(r => new Report(r)));
        setPagination({
          page,
          limit: pagination.limit,
          total: paginationData.total || reportsData.length,
          totalPages: paginationData.totalPages || Math.ceil(paginationData.total / pagination.limit)
        });
      } else {
        setError(response.message || 'Failed to fetch reports');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch reports');
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.limit]);

  // Fetch my submitted reports
  const fetchMyReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await moderationService.getReports({ reporterId: 'me' });
      
      if (response.success) {
        const reportsData = response.data?.reports || response.data || [];
        setMyReports(reportsData.map(r => new Report(r)));
      } else {
        setError(response.message || 'Failed to fetch your reports');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch your reports');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch single report by ID
  const fetchReportById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await moderationService.getReportById(id);
      
      if (response.success) {
        const report = new Report(response.data);
        setCurrentReport(report);
        return report;
      } else {
        setError(response.message || 'Failed to fetch report');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch report');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch flagged content
  const fetchFlaggedContent = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await moderationService.getFlaggedContent();
      
      if (response.success) {
        setFlaggedContent(response.data?.content || []);
      }
    } catch (err) {
      toast.error('Failed to load flagged content');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch moderation stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await moderationService.getModerationStats();
      
      if (response.success) {
        setStats(response.data || {
          totalReports: 0,
          pendingReports: 0,
          resolvedToday: 0,
          averageResolutionTime: 0,
          flaggedContentCount: 0
        });
      }
    } catch (err) {
      console.error('Failed to load moderation stats:', err);
    }
  }, []);

  // Create new report
  const createReport = useCallback(async (reportData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await moderationService.createReport(reportData);
      
      if (response.success) {
        const newReport = new Report(response.data);
        
        // Add to my reports
        setMyReports(prev => [newReport, ...prev]);
        
        toast.success('Report submitted successfully! We will review it shortly.');
        
        return { success: true, data: newReport };
      } else {
        toast.error(response.message || 'Failed to submit report');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit report');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Update report status
  const updateReportStatus = useCallback(async (reportId, status) => {
    setIsSubmitting(true);
    
    try {
      const response = await moderationService.updateReport(reportId, { status });
      
      if (response.success) {
        const updateReport = (report) => {
          if (report.id === reportId) {
            return new Report({ ...report, status });
          }
          return report;
        };
        
        setReports(prev => prev.map(updateReport));
        
        if (currentReport?.id === reportId) {
          setCurrentReport(updateReport(currentReport));
        }
        
        toast.success(`Report status updated to ${status}`);
        
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to update report');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update report');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [currentReport]);

  // Assign report to moderator
  const assignReport = useCallback(async (reportId, moderatorId) => {
    setIsSubmitting(true);
    
    try {
      const response = await moderationService.assignReport(reportId, moderatorId);
      
      if (response.success) {
        const updateReport = (report) => {
          if (report.id === reportId) {
            return new Report({ ...report, assignedTo: moderatorId, status: 'investigating' });
          }
          return report;
        };
        
        setReports(prev => prev.map(updateReport));
        
        toast.success('Report assigned');
        
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to assign report');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to assign report');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Resolve report with action
  const resolveReport = useCallback(async (reportId, action, notes = '') => {
    setIsSubmitting(true);
    
    try {
      const response = await moderationService.resolveReport(reportId, { action, notes });
      
      if (response.success) {
        const updateReport = (report) => {
          if (report.id === reportId) {
            return new Report({
              ...report,
              status: 'resolved',
              action,
              actionNotes: notes,
              resolvedAt: new Date().toISOString()
            });
          }
          return report;
        };
        
        setReports(prev => prev.map(updateReport));
        
        if (currentReport?.id === reportId) {
          setCurrentReport(updateReport(currentReport));
        }
        
        // Remove from main list if filtering by pending
        if (filters.status === 'pending') {
          setReports(prev => prev.filter(r => r.id !== reportId));
        }
        
        toast.success(`Report resolved with action: ${action}`);
        
        // Refresh stats
        fetchStats();
        
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to resolve report');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to resolve report');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [currentReport, filters.status, fetchStats]);

  // Dismiss report
  const dismissReport = useCallback(async (reportId, notes = '') => {
    setIsSubmitting(true);
    
    try {
      const response = await moderationService.dismissReport(reportId, { notes });
      
      if (response.success) {
        const updateReport = (report) => {
          if (report.id === reportId) {
            return new Report({
              ...report,
              status: 'dismissed',
              action: 'none',
              actionNotes: notes,
              resolvedAt: new Date().toISOString()
            });
          }
          return report;
        };
        
        setReports(prev => prev.map(updateReport));
        
        if (currentReport?.id === reportId) {
          setCurrentReport(updateReport(currentReport));
        }
        
        // Remove from main list if filtering by pending
        if (filters.status === 'pending') {
          setReports(prev => prev.filter(r => r.id !== reportId));
        }
        
        toast.success('Report dismissed');
        
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to dismiss report');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to dismiss report');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [currentReport, filters.status]);

  // Review flagged content
  const reviewFlaggedContent = useCallback(async (contentId, decision, notes = '') => {
    setIsSubmitting(true);
    
    try {
      const response = await moderationService.reviewFlaggedContent(contentId, { decision, notes });
      
      if (response.success) {
        // Remove from flagged content
        setFlaggedContent(prev => prev.filter(c => c.id !== contentId));
        
        toast.success(`Content ${decision === 'approve' ? 'approved' : 'removed'}`);
        
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to review content');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to review content');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Warn user
  const warnUser = useCallback(async (userId, message) => {
    setIsSubmitting(true);
    
    try {
      const response = await userService.warnUser(userId, { message });
      
      if (response.success) {
        toast.success('Warning sent to user');
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to warn user');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to warn user');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Delete reported content
  const deleteContent = useCallback(async (contentId, contentType) => {
    setIsSubmitting(true);
    
    try {
      let response;
      switch (contentType) {
        case 'material':
          const { materialService } = await import('../services/materialService');
          response = await materialService.deleteMaterial(contentId);
          break;
        case 'review':
          response = await reviewService.deleteReview(contentId);
          break;
        default:
          throw new Error('Unknown content type');
      }
      
      if (response.success) {
        toast.success('Content deleted');
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to delete content');
        return { success: false, error: response.message };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete content');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      status: 'pending',
      priority: '',
      type: '',
      assignedToMe: false
    });
  }, []);

  // Auto-refresh setup
  const startAutoRefresh = useCallback((intervalMs = 30000) => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = setInterval(() => {
      fetchReports(pagination.page);
      fetchStats();
    }, intervalMs);
  }, [fetchReports, fetchStats, pagination.page]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchReports();
    fetchStats();
    
    return () => {
      stopAutoRefresh();
    };
  }, []);

  // Refresh when filters change
  useEffect(() => {
    fetchReports(1);
  }, [filters.status, filters.priority, filters.type, filters.assignedToMe]);

  return {
    // State
    reports,
    myReports,
    flaggedContent,
    currentReport,
    stats,
    filters,
    pagination,
    isLoading,
    isSubmitting,
    error,
    reportReasons,
    
    // Actions
    fetchReports,
    fetchMyReports,
    fetchReportById,
    fetchFlaggedContent,
    fetchStats,
    createReport,
    updateReportStatus,
    assignReport,
    resolveReport,
    dismissReport,
    reviewFlaggedContent,
    warnUser,
    deleteContent,
    updateFilters,
    clearFilters,
    startAutoRefresh,
    stopAutoRefresh,
    
    // Pagination helpers
    goToPage: (page) => fetchReports(page),
    nextPage: () => fetchReports(Math.min(pagination.totalPages, pagination.page + 1)),
    prevPage: () => fetchReports(Math.max(1, pagination.page - 1))
  };
};

export default useModerationController;
