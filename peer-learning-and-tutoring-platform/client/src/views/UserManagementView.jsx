import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { toast } from 'react-hot-toast';

const UserManagementView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    role: '',
    isActive: '',
    search: ''
  });

  const fetchUsers = async (overridePage) => {
    try {
      setLoading(true);
      const currentPage = overridePage || page;
      const params = {
        page: currentPage,
        limit: 10
      };

      if (filters.role) params.role = filters.role;
      if (filters.isActive) params.isActive = filters.isActive;
      if (filters.search) params.search = filters.search;

      const response = await userService.getAllUsers(params);
      if (response.success) {
        const payload = response.data?.data || response.data;
        setUsers(payload.users || []);
        setTotalPages(payload.pagination?.totalPages || 1);
        setPage(payload.pagination?.page || currentPage);
      } else {
        toast.error(response.message || 'Failed to load users');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchUsers(1);
  };

  const handleClearFilters = () => {
    setFilters({ role: '', isActive: '', search: '' });
    fetchUsers(1);
  };

  const handleUserAction = async (userId, action) => {
    try {
      const payload = action === 'activate'
        ? { isActive: true }
        : action === 'suspend'
        ? { isActive: false }
        : {};

      const response = await userService.updateUser(userId, payload);
      if (response.success) {
        toast.success(`User ${action}d successfully`);
        fetchUsers();
      } else {
        toast.error(response.message || `Failed to ${action} user`);
      }
    } catch (error) {
      toast.error(error.message || `Failed to ${action} user`);
    }
  };

  const handleChangeGrade = async (user) => {
    const currentGrade = user.profile?.grade ? String(user.profile.grade) : '';
    const input = window.prompt('Enter new grade (6-13):', currentGrade);
    if (input === null) return;

    const gradeNumber = Number(input);
    if (!Number.isInteger(gradeNumber) || gradeNumber < 6 || gradeNumber > 13) {
      toast.error('Grade must be a number between 6 and 13');
      return;
    }

    try {
      const response = await userService.updateUser(user._id, {
        profile: { grade: gradeNumber }
      });
      if (response.success) {
        toast.success('Grade updated successfully');
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to update grade');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update grade');
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.role === 'admin') {
      toast.error('Cannot delete admin users');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete user "${user.username}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const response = await userService.deleteUser(user._id);
      if (response.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to delete user');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            View and manage all users in the platform.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="mt-1 input-field"
            >
              <option value="">All</option>
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
              <option value="parent">Parent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="isActive"
              value={filters.isActive}
              onChange={handleFilterChange}
              className="mt-1 input-field"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Name, email, username..."
              className="mt-1 input-field"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApplyFilters}
              className="btn-primary px-4 py-2 text-sm"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email / Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {u.profile?.avatar ? (
                            <img
                              src={u.profile.avatar}
                              alt={`${u.profile.firstName} ${u.profile.lastName}`}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-600 text-sm font-medium">
                              {(u.profile?.firstName?.[0] || u.username?.[0] || '').toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {u.profile?.firstName || u.profile?.lastName
                              ? `${u.profile?.firstName || ''} ${u.profile?.lastName || ''}`.trim()
                              : u.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {u.profile?.school || u.profile?.grade ? (
                              <>
                                {u.profile?.school}
                                {u.profile?.grade ? ` • Grade ${u.profile.grade}` : ''}
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div>{u.email}</div>
                      <div className="text-xs text-gray-500">@{u.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : u.role === 'tutor'
                            ? 'bg-green-100 text-green-800'
                            : u.role === 'parent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {u.role === 'student' && u.profile?.grade
                        ? `Grade ${u.profile.grade}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-3">
                        {u.role === 'student' && (
                          <button
                            type="button"
                            onClick={() => handleChangeGrade(u)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Change grade
                          </button>
                        )}
                        {!u.isActive && (
                          <button
                            type="button"
                            onClick={() => handleUserAction(u._id, 'activate')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Activate
                          </button>
                        )}
                        {u.isActive && u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleUserAction(u._id, 'suspend')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Suspend
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </p>
              <div className="space-x-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => fetchUsers(page - 1)}
                  className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => fetchUsers(page + 1)}
                  className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementView;

