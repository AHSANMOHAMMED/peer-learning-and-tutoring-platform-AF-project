import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Edit2, Trash2, ArrowRight, ShieldCheck, Mail, Calendar, 
  RefreshCw, MoreVertical, ShieldAlert, BadgeCheck, X, Plus, UserCircle,
  GraduationCap, MapPin, Eye, AlertCircle, Laptop, Briefcase
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../controllers/useAuth';
import { useUsers } from '../controllers/useUsers';
import { schoolApi } from '../services/api';
import { cn } from '../utils/cn';
import { toast } from 'react-hot-toast';

const ROLES = ['student', 'tutor', 'parent', 'admin', 'superadmin', 'moderator', 'schoolAdmin'];
const PROTECTED_ROLES = ['admin', 'superadmin', 'websiteAdmin'];
const DISTRICTS = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'];
const STREAMS = ['Combined Mathematics', 'Biological Sciences', 'Commercial Stream', 'Physical Sciences', 'Arts Stream', 'Technology Stream', 'O/L General'];

const isProtectedRole = (role) => PROTECTED_ROLES.includes(role);

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const { 
    fetchUsers, toggleUserStatus, createUser, updateUser, deleteUser, getUserById, 
    users, loading 
  } = useUsers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [schools, setSchools] = useState([]);
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // State for forms
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', role: 'student', district: '', stream: '', grade: '',
    firstName: '', lastName: '', school: '',
    permissions: {
      canUseQA: true, canUseGames: true, canUseAI: true, canUseMarketplace: true, canPostResources: true,
      canManageUsers: false, canVerifyTutors: false, canModerateForum: false
    }
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailedUser, setDetailedUser] = useState(null);

  useEffect(() => {
    fetchUsers({ limit: 100 });
    // Fetch schools for selection
    schoolApi.getAll({ limit: 100 }).then(res => {
      if (res.success) setSchools(res.data.schools);
    });
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    if (isProtectedRole(user.role)) {
      return toast.error(`Cannot suspend ${user.role} accounts. Administrator accounts are protected.`);
    }
    try {
      await toggleUserStatus(user._id, !user.isActive, 'Admin action via User Management');
      toast.success(`User ${!user.isActive ? 'activated' : 'suspended'} successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Action failed');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        district: formData.district,
        stream: formData.stream,
        grade: formData.grade,
        role: formData.role,
        school: formData.school || undefined,
        profile: { firstName: formData.firstName, lastName: formData.lastName },
        permissions: formData.permissions
      });
      toast.success('User created successfully');
      setIsCreateModalOpen(false);
      setFormData({ username: '', email: '', password: '', role: 'student', district: '', stream: '', grade: '', firstName: '', lastName: '', school: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await updateUser(selectedUser._id, {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        district: formData.district,
        stream: formData.stream,
        grade: formData.grade,
        school: formData.school || undefined,
        profile: { firstName: formData.firstName, lastName: formData.lastName },
        permissions: formData.permissions
      });
      toast.success('User updated successfully');
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (user) => {
    if (isProtectedRole(user.role)) {
      return toast.error(`Cannot delete ${user.role} accounts. Administrator accounts are protected.`);
    }
    if (window.confirm(`Are you sure you want to permanently delete user "${user.username}"? This action cannot be undone.`)) {
      try {
        await deleteUser(user._id);
        toast.success('User deleted successfully');
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Failed to delete user');
      }
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      district: user.district || '',
      stream: user.stream || '',
      grade: user.grade || '',
      school: user.school?._id || user.school || '',
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      permissions: user.permissions || {
        canUseQA: true, canUseGames: true, canUseAI: true, canUseMarketplace: true, canPostResources: true,
        canManageUsers: false, canVerifyTutors: false, canModerateForum: false
      }
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = async (user) => {
    try {
      const data = await getUserById(user._id);
      setDetailedUser(data.data);
      setIsViewModalOpen(true);
    } catch (err) {
      toast.error('Failed to load user details');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || user.role === activeTab;
    return matchesSearch && matchesTab;
  });

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin':
      case 'superadmin': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'tutor': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'student': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'moderator': return 'bg-amber-50 text-amber-600 border-amber-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <Layout userRole={currentUser?.role || 'admin'}>
      <div className="max-w-[1400px] mx-auto w-full font-sans pb-12">
        
        {/* Header Region */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                 <ShieldCheck className="text-indigo-400" size={32} />
                 <h1 className="text-2xl font-bold text-slate-800 tracking-tight">User Management</h1>
              </div>
              <p className="text-slate-500 font-medium text-sm">Manage platform users, configure roles, and monitor accounts.</p>
           </div>
           
           <div className="flex gap-4 relative z-10 w-full md:w-auto">
              <button onClick={() => fetchUsers({limit: 100})} className="flex-1 md:flex-none justify-center bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2">
                 <RefreshCw size={16} className={loading && !isViewModalOpen ? "animate-spin" : ""} /> Refresh
              </button>
              <button onClick={() => {
                setFormData({ 
                    username: '', email: '', password: '', role: 'student', district: '', stream: '', grade: '', firstName: '', lastName: '', school: '',
                    permissions: { canUseQA: true, canUseGames: true, canUseAI: true, canUseMarketplace: true, canPostResources: true, canManageUsers: false, canVerifyTutors: false, canModerateForum: false }
                });
                setIsCreateModalOpen(true);
              }} className="flex-1 md:flex-none justify-center bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all flex items-center gap-2">
                 <Plus size={18} /> Add User
              </button>
           </div>
        </div>

        {/* Filters Region */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row justify-between gap-4 mb-6">
           <div className="relative w-full xl:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                 type="text"
                 placeholder="Search by system ID or email..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 py-3 pl-12 pr-4 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium transition-all"
              />
           </div>
           
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 xl:pb-0">
             {['all', 'student', 'tutor', 'parent', 'admin', 'moderator', 'schoolAdmin'].map((role) => (
                <button
                   key={role}
                   onClick={() => setActiveTab(role)}
                   className={cn(
                       "px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all border shrink-0 capitalize",
                      activeTab === role 
                        ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                   )}
                >
                   {role}s
                </button>
             ))}
           </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                       <th className="p-5 pl-8 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Identity</th>
                       <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Role Status</th>
                       <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap hidden lg:table-cell">Institution</th>
                       <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap hidden lg:table-cell">Region / Data</th>
                       <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap hidden xl:table-cell">System Status</th>
                       <th className="p-5 pr-8 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody>
                    <AnimatePresence>
                       {loading && !isViewModalOpen ? (
                          <tr>
                             <td colSpan="5" className="py-24 text-center">
                                <RefreshCw className="animate-spin text-indigo-500 mx-auto mb-4" size={32} />
                                <p className="text-slate-500 font-bold">Loading users...</p>
                             </td>
                          </tr>
                       ) : filteredUsers.length === 0 ? (
                          <tr>
                             <td colSpan="5" className="py-32 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                                   <Users className="text-slate-300" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No users found</h3>
                                <p className="text-slate-500 font-medium">Clear your search criteria or add a new user.</p>
                             </td>
                          </tr>
                       ) : (
                          filteredUsers.map((user) => (
                             <motion.tr
                               key={user._id}
                               layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                               className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group"
                             >
                                <td className="p-5 pl-8 flex items-center gap-4">
                                   <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 border border-slate-200">
                                      {user.username?.[0]?.toUpperCase() || 'U'}
                                   </div>
                                   <div>
                                      <h4 className="font-bold text-slate-800 text-base">{user.username}</h4>
                                      <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium mt-0.5">
                                         <Mail size={14} /> {user.email}
                                      </div>
                                   </div>
                                </td>
                                <td className="p-5">
                                   <span className={cn(
                                     "px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider inline-block border",
                                     getRoleColor(user.role)
                                   )}>
                                      {user.role}
                                   </span>
                                </td>
                                <td className="p-5 hidden lg:table-cell">
                                   {user.school ? (
                                      <div>
                                         <p className="font-bold text-slate-800 text-sm whitespace-nowrap">{typeof user.school === 'object' ? user.school.name : 'School linked'}</p>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{typeof user.school === 'object' ? user.school.code : 'VALID-CODE'}</p>
                                      </div>
                                   ) : (
                                      <span className="text-slate-400 italic text-xs">No school</span>
                                   )}
                                </td>
                                <td className="p-5 hidden lg:table-cell text-sm font-medium text-slate-600">
                                   {user.district && <div className="flex items-center gap-2 mb-1"><MapPin size={14} className="text-slate-400"/> {user.district}</div>}
                                   <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-400"/> Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}</div>
                                </td>
                                <td className="p-5 hidden xl:table-cell">
                                   <button 
                                      onClick={() => handleToggleStatus(user)}
                                      className={cn(
                                         "flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all active:scale-95 hover:shadow-md", 
                                         user.isActive !== false ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" : "text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100"
                                      )}
                                   >
                                      {user.isActive !== false ? <BadgeCheck size={16} /> : <ShieldAlert size={16} />}
                                      {user.isActive !== false ? "Active" : "Suspended"}
                                   </button>
                                </td>
                                <td className="p-5 pr-8 text-right">
                                   <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => openViewModal(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-xl transition-all" title="View Profile">
                                         <Eye size={18} />
                                      </button>
                                      <button onClick={() => openEditModal(user)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-100 rounded-xl transition-all" title="Edit User">
                                         <Edit2 size={18} />
                                      </button>
                                      {!isProtectedRole(user.role) && (
                                        <button onClick={() => handleDeleteUser(user)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all" title="Delete User">
                                         <Trash2 size={18} />
                                        </button>
                                      )}
                                   </div>
                                </td>
                             </motion.tr>
                          ))
                       )}
                    </AnimatePresence>
                 </tbody>
              </table>
           </div>
        </div>

        {/* --- MODALS --- */}
        
        {/* Create / Edit User Modal */}
        <AnimatePresence>
           {(isCreateModalOpen || isEditModalOpen) && (
              <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-slate-900/60 overflow-y-auto">
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-100 overflow-hidden my-auto"
                 >
                    <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                       <div>
                          <h2 className="text-2xl font-bold text-slate-800">
                             {isCreateModalOpen ? 'Provision Add User' : 'Edit User'}
                          </h2>
                          <p className="text-slate-500 font-medium text-sm mt-1">
                             {isCreateModalOpen ? 'Create a new user account on the platform.' : `Editing ${selectedUser?.username}`}
                          </p>
                       </div>
                       <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"><X size={24}/></button>
                    </div>
                    
                    <form onSubmit={isCreateModalOpen ? handleCreateUser : handleUpdateUser} className="p-6 md:p-8 space-y-6">
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Username</label>
                             <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Email</label>
                             <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" />
                          </div>
                          
                          {isCreateModalOpen && (
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Password</label>
                                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" />
                             </div>
                          )}
                          
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Role</label>
                             <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium appearance-none">
                                {ROLES.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                             </select>
                          </div>
                          
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">First Name</label>
                             <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Last Name</label>
                             <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" />
                          </div>

                          {(formData.role === 'student' || formData.role === 'tutor') && (
                             <>
                                <div className="space-y-2">
                                   <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">District</label>
                                   <select value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium appearance-none">
                                      <option value="">Select District</option>
                                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                   </select>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Academic Stream</label>
                                   <select value={formData.stream} onChange={e => setFormData({...formData, stream: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium appearance-none">
                                      <option value="">Select Stream</option>
                                      {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                                   </select>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Linked Institution</label>
                                   <select value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium appearance-none">
                                      <option value="">Global (No School)</option>
                                      {schools.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                                   </select>
                                </div>
                             </>
                          )}
                       </div>

                       {/* Permissions Section */}
                       <div className="pt-6 border-t border-slate-100">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Feature Access Control</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                             {Object.entries(formData.permissions).map(([key, value]) => (
                                <label key={key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-white hover:border-indigo-200 transition-all">
                                   <input 
                                      type="checkbox" 
                                      checked={value} 
                                      onChange={(e) => setFormData({
                                         ...formData, 
                                         permissions: { ...formData.permissions, [key]: e.target.checked }
                                      })}
                                      className="w-5 h-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                   />
                                   <span className="text-[11px] font-bold text-slate-700 capitalize">
                                      {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                                   </span>
                                </label>
                             ))}
                          </div>
                       </div>

                       <div className="flex gap-4 pt-4 border-t border-slate-100">
                          <button type="button" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                          <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center">
                             {loading ? <RefreshCw className="animate-spin" size={20} /> : (isCreateModalOpen ? 'Create User' : 'Save Changes')}
                          </button>
                       </div>
                    </form>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>

        {/* View Details Drawer/Modal */}
        <AnimatePresence>
           {isViewModalOpen && detailedUser && (
              <div className="fixed inset-0 z-[1000] flex justify-end bg-slate-900/60 backdrop-blur-sm">
                 <motion.div 
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200"
                 >
                    <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                       <h2 className="text-xl font-bold text-slate-800">User Details</h2>
                       <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar bg-white">
                       
                       {/* Profile Header */}
                       <div className="flex gap-6 items-center">
                          <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center text-4xl font-black shadow-inner">
                             {detailedUser.user.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                             <h3 className="text-2xl font-black text-slate-800 tracking-tight">{detailedUser.user.username}</h3>
                             <p className="text-slate-500 font-medium text-sm flex items-center gap-1.5 mt-1"><Mail size={14}/> {detailedUser.user.email}</p>
                             <div className="mt-3 flex gap-2">
                                <span className={cn("px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border", getRoleColor(detailedUser.user.role))}>
                                   {detailedUser.user.role}
                                </span>
                                <span className={cn("px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border", detailedUser.user.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200")}>
                                   {detailedUser.user.isActive ? 'Active' : 'Suspended'}
                                </span>
                             </div>
                          </div>
                       </div>

                       {/* Metrics Grid */}
                       <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Platform Engagement Metrics</h4>
                          <div className="grid grid-cols-3 gap-4">
                             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sessions</p>
                                <p className="text-2xl font-black text-slate-800 tabular-nums">{detailedUser.stats.bookings || 0}</p>
                             </div>
                             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Questions</p>
                                <p className="text-2xl font-black text-slate-800 tabular-nums">{detailedUser.stats.questions || 0}</p>
                             </div>
                             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Answers</p>
                                <p className="text-2xl font-black text-slate-800 tabular-nums">{detailedUser.stats.answers || 0}</p>
                             </div>
                          </div>
                       </div>

                       {/* Detailed Profile Info */}
                       <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Onboarding Data</h4>
                          <div className="space-y-4">
                             <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                <div className="flex items-center gap-3 text-slate-600"><UserCircle size={18}/> <span className="font-bold">Full Name</span></div>
                                <span className="font-medium text-slate-800">{detailedUser.user.profile?.firstName} {detailedUser.user.profile?.lastName}</span>
                             </div>
                             <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                <div className="flex items-center gap-3 text-slate-600"><MapPin size={18}/> <span className="font-bold">District</span></div>
                                <span className="font-medium text-slate-800">{detailedUser.user.district || 'Unspecified'}</span>
                             </div>
                             <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                <div className="flex items-center gap-3 text-slate-600"><GraduationCap size={18}/> <span className="font-bold">Target Stream</span></div>
                                <span className="font-medium text-slate-800">{detailedUser.user.stream || 'Unspecified'}</span>
                             </div>
                             <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                <div className="flex items-center gap-3 text-slate-600"><Laptop size={18}/> <span className="font-bold">Gamification</span></div>
                                <span className="font-medium text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">Lvl {detailedUser.user.gamification?.level || 1} • {detailedUser.user.gamification?.points || 0} pts</span>
                             </div>
                             <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                <div className="flex items-center gap-3 text-slate-600"><Calendar size={18}/> <span className="font-bold">System Entry</span></div>
                                <span className="font-medium text-slate-800">{detailedUser.user.createdAt ? new Date(detailedUser.user.createdAt).toLocaleString() : 'Unknown'}</span>
                             </div>
                          </div>
                       </div>

                       {detailedUser.tutorProfile && (
                          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-10"><Briefcase size={80} /></div>
                             <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-4">Tutor Verification Data</h4>
                             <p className="font-bold text-indigo-900 mb-1">Status: {detailedUser.tutorProfile.verificationStatus.toUpperCase()}</p>
                             <p className="text-sm font-medium text-indigo-700 mt-2"><span className="font-bold">Expertise:</span> {detailedUser.tutorProfile.subjects?.join(', ')}</p>
                             <p className="text-sm font-medium text-indigo-700 mt-2"><span className="font-bold">Hourly Rate:</span> LKR {detailedUser.tutorProfile.hourlyRate}</p>
                          </div>
                       )}
                    </div>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>

      </div>
    </Layout>
  );
};

export default UserManagement;