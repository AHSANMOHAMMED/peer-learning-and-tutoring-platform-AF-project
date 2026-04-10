import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  UserPlus, 
  Filter, 
  MoreVertical, 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  Calendar,
  ChevronDown,
  Activity,
  UserCheck,
  CheckCircle2,
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: 'Student' | 'Tutor' | 'SchoolAdmin' | 'Moderator' | 'Admin';
  status: 'active' | 'pending' | 'suspended';
  joined: string;
}

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  const users: UserRecord[] = [
    { id: 1, name: 'Imeth Perera', email: 'imeth@peerlearn.com', role: 'Student', status: 'active', joined: 'Mar 12, 2024' },
    { id: 2, name: 'Lakshani Koda', email: 'lakshani@univ.edu.lk', role: 'Tutor', status: 'pending', joined: 'Apr 02, 2024' },
    { id: 3, name: 'Priyantha Raj', email: 'admin@royal.college', role: 'SchoolAdmin', status: 'active', joined: 'Jan 15, 2024' },
    { id: 4, name: 'Anura Kumara', email: 'mod@peerlearn.com', role: 'Moderator', status: 'suspended', joined: 'May 10, 2023' }
  ];

  return (
    <Layout userRole="admin">
      <div className="min-h-screen p-4 md:p-8 space-y-8 bg-gray-50/50 dark:bg-gray-950/50">
        {/* User Admin Hero */}
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-10 md:p-14 text-white shadow-2xl border border-white/5">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="max-w-2xl">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
                       <Users className="text-blue-400" size={32} />
                    </div>
                    <span className="text-xs font-black tracking-[0.4em] uppercase text-slate-400">Governance • Global User Base</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                    User <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Inventory</span>
                 </h1>
                 <p className="text-slate-400 text-xl font-medium leading-relaxed">
                    Account orchestration, role promotion, and institutional access management.
                 </p>
              </div>
              <div className="flex gap-4">
                 <button className="px-8 py-5 bg-blue-600 hover:bg-blue-700 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3">
                    <UserPlus size={20} /> Provision User
                 </button>
              </div>
           </div>
        </div>

        {/* Filters & Actions Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
           <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-2xl">
              {['all', 'students', 'tutors', 'admins'].map(tab => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-950 dark:hover:text-white"
                  )}
                 >
                  {tab}
                 </button>
              ))}
           </div>
           
           <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input 
                    className="pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl w-full md:w-64 focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                    placeholder="Search UID, Email..."
                 />
              </div>
              <button className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-transparent hover:border-gray-200 text-gray-400">
                 <Filter size={20} />
              </button>
           </div>
        </div>

        {/* User Data Matrix */}
        <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-800 pb-8">
                       <th className="px-6 py-4">Account Profile</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4">Role Path</th>
                       <th className="px-6 py-4">Onboarding Date</th>
                       <th className="px-4 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {users.map((user) => (
                       <tr key={user.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                          <td className="px-6 py-8">
                             <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white font-black shadow-xl shadow-blue-500/10">
                                   {user.name[0]}
                                </div>
                                <div>
                                   <h4 className="font-bold text-gray-950 dark:text-white uppercase text-xs tracking-widest">{user.name}</h4>
                                   <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold mt-1">
                                      <Mail size={12} /> {user.email}
                                   </div>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-8">
                             <span className={cn(
                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                user.status === 'active' ? "bg-green-100 text-green-600" : user.status === 'pending' ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"
                             )}>
                                {user.status}
                             </span>
                          </td>
                          <td className="px-6 py-8">
                             <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className={cn(
                                   user.role === 'Admin' ? "text-indigo-500" : user.role === 'Tutor' ? "text-teal-500" : "text-slate-400"
                                )} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">{user.role}</span>
                                <ChevronDown size={14} className="text-gray-300" />
                             </div>
                          </td>
                          <td className="px-6 py-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
                             {user.joined}
                          </td>
                          <td className="px-4 py-8 text-right">
                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:text-blue-500 text-gray-400 shadow-sm transition-all">
                                   <CheckCircle2 size={16} />
                                </button>
                                <button className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:text-red-500 text-gray-400 shadow-sm transition-all">
                                   <XCircle size={16} />
                                </button>
                                <button className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-400 shadow-sm hover:text-gray-950 transition-all">
                                   <MoreHorizontal size={16} />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserManagement;
