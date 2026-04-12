import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Edit2, Trash2, ArrowRight, ShieldCheck, Mail, Calendar, RefreshCw } from 'lucide-react';
import Layout from '../components/Layout';
import { useUsers } from '../controllers/useUsers';
import { cn } from '../utils/cn';

const UserManagement = () => {
  const { fetchUsers, bulkAction, users, loading } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchUsers({ limit: 100 });
  }, [fetchUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || user.role === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <Layout userRole="admin">
      <div className="max-w-[1400px] mx-auto w-full font-sans">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
           <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Directory</h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Manage user accounts, roles, and platform access.</p>
           </div>
           <button onClick={() => fetchUsers({limit: 100})} className="bg-white border border-slate-200 text-slate-600 hover:text-[#00a8cc] px-4 py-2.5 rounded-xl font-bold text-sm shadow-soft transition-colors flex items-center gap-2">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh List
           </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-2xl shadow-soft border border-slate-100 flex flex-col xl:flex-row justify-between gap-4 mb-6">
           <div className="relative w-full xl:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                 type="text"
                 placeholder="Search by name or email..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-100 py-3 pl-12 pr-4 rounded-xl text-slate-800 focus:outline-none focus:border-[#00a8cc] font-medium transition-colors"
              />
           </div>
           
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 xl:pb-0">
             {['all', 'student', 'tutor', 'parent'].map((role) => (
                <button
                   key={role}
                   onClick={() => setActiveTab(role)}
                   className={cn(
                       "px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-colors border shrink-0 capitalize",
                      activeTab === role 
                        ? "bg-slate-900 text-white border-slate-900" 
                        : "bg-white text-slate-500 border-slate-200 hover:border-[#00a8cc] hover:text-slate-800"
                   )}
                >
                   {role}s
                </button>
             ))}
           </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                       <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">User</th>
                       <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">Role</th>
                       <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap hidden md:table-cell">Joined</th>
                       <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap hidden lg:table-cell">Status</th>
                       <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody>
                    <AnimatePresence>
                       {loading ? (
                          <tr>
                             <td colSpan="5" className="py-24 text-center">
                                <RefreshCw className="animate-spin text-[#00a8cc] mx-auto mb-4" size={32} />
                                <p className="text-slate-500 font-medium">Fetching directory...</p>
                             </td>
                          </tr>
                       ) : filteredUsers.length === 0 ? (
                          <tr>
                             <td colSpan="5" className="py-24 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                   <Users className="text-slate-300" size={24} />
                                </div>
                                <p className="text-slate-500 font-bold">No users match your criteria.</p>
                             </td>
                          </tr>
                       ) : (
                          filteredUsers.map((user) => (
                             <motion.tr
                               key={user._id}
                               layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                               className="border-b border-slate-50 hover:bg-[#f8f9fc] transition-colors"
                             >
                                <td className="p-6 flex items-center gap-4">
                                   <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                                      {user.username?.[0]?.toUpperCase() || 'U'}
                                   </div>
                                   <div>
                                      <h4 className="font-bold text-slate-800 line-clamp-1">{user.username}</h4>
                                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mt-1">
                                         <Mail size={12} /> {user.email}
                                      </div>
                                   </div>
                                </td>
                                <td className="p-6">
                                   <span className={cn(
                                     "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest inline-block",
                                     user.role === 'admin' ? "bg-slate-900 text-white" : 
                                     user.role === 'tutor' ? "bg-[#e8f6fa] text-[#00a8cc]" : 
                                     "bg-emerald-50 text-emerald-600"
                                   )}>
                                      {user.role}
                                   </span>
                                </td>
                                <td className="p-6 hidden md:table-cell text-sm font-medium text-slate-600">
                                   <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-400"/> {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}</div>
                                </td>
                                <td className="p-6 hidden lg:table-cell">
                                   <div className={cn("flex items-center gap-2 text-sm font-bold", user.isActive !== false ? "text-emerald-600" : "text-rose-500")}>
                                      <ShieldCheck size={16} /> {user.isActive !== false ? "Active" : "Suspended"}
                                   </div>
                                </td>
                                <td className="p-6 text-right">
                                   <div className="flex justify-end gap-2">
                                      <button className="p-2 text-slate-400 hover:text-[#00a8cc] hover:bg-blue-50 rounded-lg transition-colors">
                                         <Edit2 size={18} />
                                      </button>
                                      <button onClick={() => bulkAction([user._id], 'delete')} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                         <Trash2 size={18} />
                                      </button>
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

      </div>
    </Layout>
  );
};

export default UserManagement;