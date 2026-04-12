import { useState, useCallback } from 'react';
import api from '../services/api';

export const useParentLinks = () => {
  const [linkRequests, setLinkRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Parent Side ---

  const linkParentToStudent = useCallback(async ({ studentEmail, relationship }) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/parent/link-student', {
        studentEmail,
        relationship
      });
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send link request');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchParentLinkRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/parent/link-requests');
      if (data.success) {
        setLinkRequests(data.data.requests);
      }
      return data.data?.requests || [];
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch parent link requests');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Student Side ---

  const fetchStudentLinkRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/parent/student/link-requests');
      if (data.success) {
        setLinkRequests(data.data.requests);
      }
      return data.data?.requests || [];
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch student link requests');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const studentRespondToLink = useCallback(async (linkId, { approve, permissions }) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post(`/parent/student/respond-link/${linkId}`, {
        approve,
        permissions
      });
      if (data.success) {
        setLinkRequests((prev) => prev.filter((r) => r._id !== linkId));
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to respond to link request');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    linkRequests, 
    loading, 
    error, 
    linkParentToStudent, 
    fetchParentLinkRequests, 
    fetchStudentLinkRequests, 
    studentRespondToLink 
  };
};
