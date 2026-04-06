import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const ParentLinkRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/api/parent/admin/link-requests');
      if (response.data?.success) {
        setRequests(response.data.data?.requests || []);
      } else {
        toast.error(response.data?.message || 'Failed to load requests');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const reviewRequest = async (linkId, approve) => {
    try {
      setProcessingId(linkId);
      const response = await api.post(`/api/parent/admin/review-link/${linkId}`, {
        approve,
      });

      if (response.data?.success) {
        toast.success(approve ? 'Request approved' : 'Request rejected');
        setRequests((prev) => prev.filter((request) => request.id !== linkId));
      } else {
        toast.error(response.data?.message || 'Failed to review request');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to review request');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <p className="text-gray-500">Loading parent link requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Parent Link Requests</h1>
        <p className="text-gray-600 mt-1">Review and approve parent access to student performance data.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        {requests.length === 0 ? (
          <p className="text-gray-500">No pending parent link requests.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-xl p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {request.parent?.name || request.parent?.username || 'Parent'} -> {request.student?.name || request.student?.username || 'Student'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Parent: {request.parent?.email || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Student: {request.student?.email || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Relationship: {request.relationship || 'parent'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Requested: {new Date(request.requestedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => reviewRequest(request.id, true)}
                    disabled={processingId === request.id}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => reviewRequest(request.id, false)}
                    disabled={processingId === request.id}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentLinkRequests;
