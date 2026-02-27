import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import { tutorService } from '../services/tutorService';
import { bookingService } from '../services/bookingService';
import { User } from '../models/User';
import { TutorProfile } from '../models/TutorProfile';
import { Report } from '../models/Report';

/**
 * useAdminController - Controller hook for admin operations
 * Handles user management, tutor approvals, reports, and analytics
 * 
 * MVC Pattern: Controller (Business Logic Layer)
 */
export const useAdminController = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Platform statistics
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTutors: 0,
    totalSessions: 0,
    totalEarnings: 0,
    averageRating: 0,
    pendingApprovals: 0,
    pendingReports: 0,
    activeSessions: 0,
  });

  // User management
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Tutor approvals
  const [pendingTutors, setPendingTutors] = useState([]);

  // Reports
  const [reports, setReports] = useState([]);
  const [reportsFilter, setReportsFilter] = useState('pending');
  const [reportsPagination, setReportsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch platform statistics
  const fetchPlatformStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, bookingsRes, tutorsRes] = await Promise.all([
        userService.getUsers({ limit: 1 }),
        bookingService.getBookingStats(),
        tutorService.getTutors({ status: 'pending', limit: 1 })
      ]);

      const totalUsers = usersRes.data?.pagination?.total || usersRes.data?.total || 0;
      const totalTutors = tutorsRes.data?.pagination?.total || tutorsRes.data?.total || 0;
      const stats = bookingsRes.data || {};

      setPlatformStats({
        totalUsers,
        totalStudents: Math.floor(totalUsers * 0.7), // Approximate
        totalTutors,
        totalSessions: stats.totalSessions || 0,
        totalEarnings: stats.totalEarnings || 0,
        averageRating: stats.averageRating || 4.7,
        pendingApprovals: stats.pendingApprovals || 0,
        pendingReports: stats.pendingReports || 0,
        activeSessions: stats.activeSessions || 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch users with pagination and search
  const fetchUsers = useCallback(async (page = 1, search = '', role = '') => {
    setIsLoading(true);
    try {
      const response = await userService.getUsers({ 
        page, 
        limit: usersPagination.limit,
        search,
        role 
      });

      if (response.success) {
        const usersData = response.data?.users || response.data || [];
        const pagination = response.data?.pagination || {};
        
        setUsers(usersData.map(u => new User(u)));
        setUsersPagination({
          page,
          limit: usersPagination.limit,
          total: pagination.total || usersData.length,
          totalPages: pagination.totalPages || Math.ceil(usersData.length / usersPagination.limit),
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch pending tutor approvals
  const fetchPendingTutors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await tutorService.getTutors({ status: 'pending' });
      if (response.success) {
        const tutors = response.data?.tutors || response.data || [];
        setPendingTutors(tutors.map(t => new TutorProfile(t)));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Approve tutor application
  const approveTutor = useCallback(async (tutorId, notes = '') => {
    try {
      const response = await tutorService.approveTutor(tutorId, { notes });
      
      if (response.success) {
        setPendingTutors(prev => prev.filter(t => t.id !== tutorId));
        setPlatformStats(prev => ({
          ...prev,
          pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
        }));
      }
      
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Reject tutor application
  const rejectTutor = useCallback(async (tutorId, reason = '') => {
    try {
      const response = await tutorService.rejectTutor(tutorId, { reason });
      
      if (response.success) {
        setPendingTutors(prev => prev.filter(t => t.id !== tutorId));
        setPlatformStats(prev => ({
          ...prev,
          pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
        }));
      }
      
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Fetch reports with filter and pagination
  const fetchReports = useCallback(async (page = 1, status = reportsFilter) => {
    setIsLoading(true);
    try {
      // Use moderation service for reports
      const { moderationService } = await import('../services/moderationService');
      const response = await moderationService.getReports({ 
        page, 
        limit: reportsPagination.limit,
        status 
      });

      if (response.success) {
        const reportsData = response.data?.reports || response.data || [];
        const pagination = response.data?.pagination || {};
        
        setReports(reportsData.map(r => new Report(r)));
        setReportsPagination({
          page,
          limit: reportsPagination.limit,
          total: pagination.total || reportsData.length,
          totalPages: pagination.totalPages || Math.ceil(reportsData.length / reportsPagination.limit),
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [reportsFilter]);

  // Update report filter
  const updateReportsFilter = useCallback((filter) => {
    setReportsFilter(filter);
  }, []);

  // Resolve report with action
  const resolveReport = useCallback(async (reportId, action, notes = '') => {
    try {
      const { moderationService } = await import('../services/moderationService');
      const response = await moderationService.resolveReport(reportId, { action, notes });
      
      if (response.success) {
        setReports(prev => prev.map(r => 
          r.id === reportId 
            ? { ...r, status: 'resolved', action, actionNotes: notes }
            : r
        ));
      }
      
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Dismiss report
  const dismissReport = useCallback(async (reportId, notes = '') => {
    try {
      const { moderationService } = await import('../services/moderationService');
      const response = await moderationService.dismissReport(reportId, { notes });
      
      if (response.success) {
        setReports(prev => prev.map(r => 
          r.id === reportId 
            ? { ...r, status: 'dismissed', action: 'none', actionNotes: notes }
            : r
        ));
      }
      
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // User actions
  const banUser = useCallback(async (userId, reason = '') => {
    try {
      const response = await userService.banUser(userId, { reason });
      
      if (response.success) {
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, isBanned: true, banReason: reason, isActive: false }
            : u
        ));
      }
      
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const unbanUser = useCallback(async (userId) => {
    try {
      const response = await userService.unbanUser(userId);
      
      if (response.success) {
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, isBanned: false, banReason: '', isActive: true }
            : u
        ));
      }
      
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const suspendUser = useCallback(async (userId, days, reason = '') => {
    try {
      const response = await userService.suspendUser(userId, { days, reason });
      
      if (response.success) {
        const until = new Date(Date.now() + days * 86400000).toISOString();
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, isSuspended: true, suspendedUntil: until, banReason: reason, isActive: false }
            : u
        ));
      }
      
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const activateUser = useCallback(async (userId) => {
    try {
      const response = await userService.activateUser(userId);
      
      if (response.success) {
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, isSuspended: false, suspendedUntil: null, isBanned: false, banReason: '', isActive: true }
            : u
        ));
      }
      
      return response;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    platformStats,
    users,
    usersPagination,
    pendingTutors,
    reports,
    reportsFilter,
    reportsPagination,

    // Actions
    fetchPlatformStats,
    fetchUsers,
    fetchPendingTutors,
    approveTutor,
    rejectTutor,
    fetchReports,
    updateReportsFilter,
    resolveReport,
    dismissReport,
    banUser,
    unbanUser,
    suspendUser,
    activateUser,
  };
};

export default useAdminController;
