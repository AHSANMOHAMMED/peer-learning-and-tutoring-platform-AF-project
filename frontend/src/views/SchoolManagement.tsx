import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  CreditCard, 
  FileUp, 
  BarChart3, 
  Settings,
  ShieldCheck,
  Plus,
  ArrowRight,
  ChevronRight,
  School
} from 'lucide-react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { cn } from '../utils/cn';

interface SchoolData {
  name: string;
  subscription: string;
  members: number;
  activeTeachers: number;
  upcomingBills: string;
}

interface Member {
  name: string;
  role: 'Student' | 'Teacher';
  date: string;
}

const SchoolManagement: React.FC = () => {
  const schoolData: SchoolData = {
    name: 'Royal College Colombo',
    subscription: 'Enterprise',
    members: 1240,
    activeTeachers: 45,
    upcomingBills: 'Rs. 25,000'
  };

  const recentMembers: Member[] = [
    { name: 'Arjun Kumar', role: 'Student', date: 'Today' },
    { name: 'Nimali Siri', role: 'Teacher', date: 'Yesterday' },
    { name: 'Sunil Perera', role: 'Student', date: '2 days ago' }
  ];

  return (
    <Layout userRole="schoolAdmin">
      <div className="min-h-screen p-4 md:p-8 space-y-8 bg-gray-50/50 dark:bg-gray-950/50">
        {/* School Admin Hero */}
        <div className="relative overflow-hidden rounded-[3rem] bg-indigo-950 p-10 md:p-14 text-white shadow-2xl border border-white/5">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="max-w-2xl">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
                       <Building2 className="text-indigo-400" size={32} />
                    </div>
                    <span className="text-xs font-black tracking-[0.4em] uppercase text-indigo-400">Phase 6 • Institutional Control</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
                    {schoolData.name}
                 </h1>
                 <div className="flex items-center gap-6">
                    <span className="px-4 py-2 bg-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">{schoolData.subscription} Plan</span>
                    <span className="text-indigo-300 font-bold text-sm">Managing Grade 6-13 •  Sri Lanka</span>
                 </div>
              </div>
              <div className="flex gap-4">
                 <button className="px-8 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-[1.5rem] border border-white/10 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-3">
                    <Settings size={20} /> Configure
                 </button>
                 <button className="px-8 py-5 bg-indigo-600 hover:bg-indigo-700 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3">
                    <Plus size={20} /> Add Student
                 </button>
              </div>
           </div>
        </div>

        {/* School Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard title="Total Students" value={schoolData.members.toString()} icon={Users} color="primary" />
           <StatCard title="Verified Faculty" value={schoolData.activeTeachers.toString()} icon={ShieldCheck} color="secondary" />
           <StatCard title="Active Subs" value="98%" icon={BarChart3} color="accent" />
           <StatCard title="Next Invoice" value={schoolData.upcomingBills} icon={CreditCard} color="primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Member Management Sidebar */}
           <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-12">
                 <div>
                    <h3 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white">Member Pipeline</h3>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Reviewing institutional memberships</p>
                 </div>
                 <button className="px-6 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-xs font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
                    Bulk Import <FileUp className="inline ml-2" size={16} />
                 </button>
              </div>

              <div className="space-y-4">
                 {recentMembers.map((member, i) => (
                    <div key={i} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700 flex items-center justify-between group cursor-pointer hover:border-indigo-500 transition-all">
                       <div className="flex items-center gap-6">
                          <div className={cn(
                             "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white",
                             member.role === 'Teacher' ? "bg-teal-500" : "bg-indigo-600"
                          )}>
                             {member.name[0]}
                          </div>
                          <div>
                             <h4 className="font-bold text-gray-950 dark:text-white uppercase text-xs tracking-widest">{member.name}</h4>
                             <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{member.role} • Joined {member.date}</p>
                          </div>
                       </div>
                       <ChevronRight size={20} className="text-gray-300 group-hover:text-indigo-600" />
                    </div>
                 ))}
              </div>

              <button className="w-full mt-8 py-5 text-indigo-600 font-black text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all">
                 View Global Directory
              </button>
           </div>

           {/* Quick Config / Billing Dashboard */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CreditCard size={100} />
                 </div>
                 <h3 className="text-xl font-black tracking-tight mb-8 flex items-center gap-3">
                    <CreditCard className="text-indigo-400" /> Billing Center
                 </h3>
                 <div className="space-y-6 mb-8">
                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                       <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Enterprise Usage</span>
                       <span className="text-2xl font-black">92%</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                       <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Seats</span>
                       <span className="text-2xl font-black">{schoolData.members}/1500</span>
                    </div>
                 </div>
                 <button className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">
                    Upgrade Capacity
                 </button>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                 <h3 className="text-lg font-black tracking-tight mb-6 flex items-center gap-3">
                    <ShieldCheck className="text-teal-500" /> Security Log
                 </h3>
                 <div className="space-y-4">
                    {[
                       'Bulk import complete',
                       'New teacher verified',
                       'Subscription renewed'
                    ].map((log, i) => (
                       <p key={i} className="text-[10px] font-bold text-gray-500 flex items-center gap-3 border-l-2 border-gray-100 pl-4">
                          {log}
                       </p>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default SchoolManagement;
