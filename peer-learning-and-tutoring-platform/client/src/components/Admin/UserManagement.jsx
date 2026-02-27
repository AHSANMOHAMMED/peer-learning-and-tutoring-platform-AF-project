import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiFilter, 
  FiCheck, 
  FiX,
  FiUserX,
  FiUserCheck,
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiMail,
  FiCalendar
} from 'react-icons/fi';
import { useAdminController } from '../../controllers/useAdminController';
import toast from 'react-hot-toast';

/**
 * UserManagement - Admin view for managing platform users
 * 
 * MVC Pattern: View (Pure UI - Logic in useAdminController)
 */
const UserManagement = () => {
  const { 
    users, 
    usersPagination,
    fetchUsers, 
    banUser,
    unbanUser,
    suspendUser,
    activateUser,
    isLoading 
  } = useAdminController();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState(null); // 'ban', 'suspend', 'view'
  const [actionReason, setActionReason] = useState('');
  const [suspendDays, setSuspendDays] = useState(7);

  useEffect(() => {
    fetchUsers(1, searchQuery, roleFilter);
  }, [fetchUsers, searchQuery, roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, searchQuery, roleFilter);
  };

  const handlePageChange = (newPage) => {
    fetchUsers(newPage, searchQuery, roleFilter);
  };

  const openActionModal = (user, action) => {
    setSelectedUser(user);
    setActionModal(action);
    setActionReason('');
    setSuspendDays(7);
  };

  const handleBan = async () => {
    if (!selectedUser) return;

    const result = await banUser(selectedUser.id, actionReason);
    if (result.success) {
      toast.success(`User ${selectedUser.displayName} has been banned`);
      setActionModal(null);
      setSelectedUser(null);
    } else {
      toast.error('Failed to ban user');
    }
  };

  const handleUnban = async (user) => {
    const result = await unbanUser(user.id);
    if (result.success) {
      toast.success(`User ${user.displayName} has been unbanned`);
    } else {
      toast.error('Failed to unban user');
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser) return;

    const result = await suspendUser(selectedUser.id, suspendDays, actionReason);
    if (result.success) {
      toast.success(`User ${selectedUser.displayName} suspended for ${suspendDays} days`);
      setActionModal(null);
      setSelectedUser(null);
    } else {
      toast.error('Failed to suspend user');
    }
  };

  const handleActivate = async (user) => {
    const result = await activateUser(user.id);
    if (result.success) {
      toast.success(`User ${user.displayName} has been activated`);
    } else {
      toast.error('Failed to activate user');
    }
  };

  const getStatusBadge = (user) => {
    if (user.isBanned) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FiUserX className="w-3 h-3 mr-1" />
          Banned
        </span>
      );
    }
    if (user.isSuspended) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FiAlertTriangle className="w-3 h-3 mr-1" />
          Suspended
        </span>
      );
    }
    if (!user.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Inactive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
        <FiUserCheck className="w-3 h-3 mr-1" />
        Active
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800',
      tutor: 'bg-emerald-100 text-emerald-800',
      parent: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
      moderator: 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100 text-gray-800'}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-slate-300">
          Manage platform users, view profiles, and take moderation actions.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
              <option value="parent">Parent</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-500">No users match your search criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {user.profile?.avatar ? (
                              <img 
                                src={user.profile.avatar} 
                                alt={user.displayName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              user.initials || user.displayName?.charAt(0) || '?'
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.displayName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleDateString() 
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openActionModal(user, 'view')}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="View Profile"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          
                          {user.isBanned ? (
                            <button
                              onClick={() => handleUnban(user)}
                              className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                              title="Unban User"
                            >
                              <FiUserCheck className="w-4 h-4" />
                            </button>
                          ) : user.isSuspended ? (
                            <button
                              onClick={() => handleActivate(user)}
                              className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                              title="Activate User"
                            >
                              <FiUserCheck className="w-4 h-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => openActionModal(user, 'suspend')}
                                className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                                title="Suspend User"
                              >
                                <FiAlertTriangle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openActionModal(user, 'ban')}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Ban User"
                              >
                                <FiUserX className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {usersPagination.page} of {usersPagination.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(usersPagination.page - 1)}
                  disabled={usersPagination.page === 1}
                  className="p-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handlePageChange(usersPagination.page + 1)}
                  disabled={usersPagination.page === usersPagination.totalPages}
                  className="p-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* View User Modal */}
      {actionModal === 'view' && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-slide-up">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                {selectedUser.initials || selectedUser.displayName?.charAt(0) || '?'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedUser.displayName}</h3>
                <p className="text-gray-500">{selectedUser.email}</p>
                {getRoleBadge(selectedUser.role)}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <FiMail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{selectedUser.email}</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <FiCalendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <FiUserCheck className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedUser)}</div>
                </div>
              </div>
              {selectedUser.banReason && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-sm text-red-600">
                    <strong>Reason:</strong> {selectedUser.banReason}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setActionModal(null)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {actionModal === 'ban' && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <FiUserX className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Ban User</h3>
            </div>

            <p className="text-gray-600 mb-4">
              Are you sure you want to ban <strong>{selectedUser.displayName}</strong>? 
              This will prevent them from accessing the platform.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (required)
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Provide a reason for banning this user..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={3}
                required
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
                onClick={handleBan}
                disabled={!actionReason.trim()}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {actionModal === 'suspend' && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <FiAlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Suspend User</h3>
            </div>

            <p className="text-gray-600 mb-4">
              Suspend <strong>{selectedUser.displayName}</strong> temporarily.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (days)
              </label>
              <select
                value={suspendDays}
                onChange={(e) => setSuspendDays(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value={1}>1 day</option>
                <option value={3}>3 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Provide a reason for suspension..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
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
                onClick={handleSuspend}
                className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
              >
                Suspend User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
