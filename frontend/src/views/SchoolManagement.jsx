import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  CreditCard,
  FileUp,
  Settings,
  ShieldCheck,
  Plus,
  ChevronRight,
  Database,
  ArrowUpRight,
  Activity,
  Calendar,
  Layers,
  MapPin,
  Clock,
  X,
  Search as SearchIcon,
  Trash2,
  RefreshCw
} from 'lucide-react';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';
import { useSchools } from '../controllers/useSchools';
import { useAuth } from '../controllers/useAuth';
import { toast } from 'react-hot-toast';

const SchoolManagement = () => {
  const { user } = useAuth();
  const { 
    schools, fetchSchools, createSchool, updateSchool, deleteSchool, loading 
  } = useSchools();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [newSchool, setNewSchool] = useState({
    name: '', code: '', email: '', type: 'government', district: 'Colombo'
  });

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);
  
  const handleProvision = async (e) => {
    e.preventDefault();
    try {
      await createSchool(newSchool);
      toast.success('Institution provisioned successfully');
      setIsCreateModalOpen(false);
      setNewSchool({ name: '', code: '', email: '', type: 'government', district: 'Colombo' });
    } catch (err) {
      toast.error(err.message || 'Failed to provision institution');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedSchool) return;
    try {
      await updateSchool(selectedSchool._id, newSchool);
      toast.success('Institution updated successfully');
      setIsUpdateModalOpen(false);
      setNewSchool({ name: '', code: '', email: '', type: 'government', district: 'Colombo' });
    } catch (err) {
      toast.error(err.message || 'Failed to update institution');
    }
  };

  const handleDecommission = async (id, name) => {
    if (!window.confirm(`Are you sure you want to decommission ${name}?`)) return;
    try {
      await deleteSchool(id);
      toast.success('Institution removed');
    } catch (err) {
      toast.error('Failed to decommission school');
    }
  };

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <Layout userRole={user?.role || 'schoolAdmin'}>
      <div className="min-h-screen bg-[#fafafc] p-6 md:p-8 font-sans">
        
        <motion.div 
          className="max-w-[1400px] mx-auto space-y-8"
          variants={containerVariants}
          initial="hidden" animate="visible"
        >
           {/* Header Section */}
           <motion.div variants={itemVariants} className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-10">
              <div>
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100 mb-4">
                    <Building2 size={14} /> Institutional Registry
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none mb-2">
                    School <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-600">Management</span>
                 </h1>
                 <p className="text-slate-500 font-medium">Manage and monitor all educational institutions across the platform.</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                 <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search institutions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 shadow-sm"
                    />
                 </div>
                 <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md border border-indigo-700 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                 >
                    <Plus size={18} /> Provision Institution
                 </button>
              </div>
           </motion.div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Users, label: 'Registered Institutions', val: schools.length, delta: 'Total active', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { icon: ShieldCheck, label: 'System Health', val: 'Operational', delta: 'All clusters up', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { icon: Activity, label: 'Active Students', val: schools.reduce((acc, s) => acc + (s.stats?.totalStudents || 0), 0), delta: 'Cross-institutional', color: 'text-blue-600', bg: 'bg-blue-50' },
                { icon: Layers, label: 'Platform Load', val: 'Low', delta: 'Optimized performance', color: 'text-rose-600', bg: 'bg-rose-50' }
              ].map((stat, i) => (
                 <motion.div key={i} variants={itemVariants} className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                       <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                          <stat.icon size={24} />
                       </div>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                    <h4 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-3">{stat.val}</h4>
                    <p className="text-xs font-bold text-slate-400">{stat.delta}</p>
                 </motion.div>
              ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Institutional Directory */}
              <motion.div variants={itemVariants} className="lg:col-span-8 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col h-full min-h-[600px]">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-100">
                    <div>
                       <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                          <Database className="text-indigo-500" size={24} /> Institution Registry
                       </h3>
                        <p className="text-slate-500 font-medium text-sm mt-1">Manage all registered educational institutions.</p>
                    </div>
                    <button className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2">
                       <FileUp size={16} /> Bulk Registry Import
                    </button>
                 </div>

                 <div className="space-y-4 flex-1">
                    {loading ? (
                        <div className="py-20 text-center">
                           <RefreshCw size={32} className="animate-spin text-indigo-500 mx-auto mb-4" />
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Accessing Registry...</p>
                        </div>
                    ) : filteredSchools.length === 0 ? (
                        <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                           <Building2 size={48} className="text-slate-200 mx-auto mb-4" />
                           <p className="text-slate-500 font-bold">No institutions found matching your criteria.</p>
                           <button onClick={() => setIsCreateModalOpen(true)} className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Provision First Institution</button>
                        </div>
                    ) : (
                        filteredSchools.map((school) => (
                           <div key={school._id} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between cursor-pointer hover:border-indigo-300 hover:bg-white transition-all group">
                              <div className="flex items-center gap-6 w-full">
                                 <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                                    {school.name[0]}
                                 </div>
                                 <div className="flex-1">
                                    <h4 className="font-black text-slate-800 text-lg mb-1">{school.name}</h4>
                                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                                       <span className="text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">ID: {school.code}</span>
                                       <span className="text-slate-400 flex items-center gap-1.5"><MapPin size={12}/> {school.address?.district}</span>
                                       <span className="text-emerald-600 flex items-center gap-1.5"><Layers size={12}/> {school.subscription?.plan}</span>
                                    </div>
                                 </div>
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedSchool(school);
                                        setNewSchool({
                                          name: school.name,
                                          code: school.code,
                                          email: school.email,
                                          type: school.type,
                                          district: school.address?.district || 'Colombo'
                                        });
                                        setIsUpdateModalOpen(true);
                                      }}
                                      className="p-3 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                                      title="Edit Registry"
                                    >
                                       <Activity size={20} />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDecommission(school._id, school.name);
                                      }}
                                      className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                      title="Decommission"
                                    >
                                       <Trash2 size={20} />
                                    </button>
                                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition shadow-sm group-hover:translate-x-1">
                                       <ChevronRight size={20} />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))
                    )}
                 </div>

                 <button className="w-full mt-6 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                    Export Registry Report <ChevronRight size={18} />
                 </button>
              </motion.div>

              {/* Sidebar Settings and Logs */}
              <motion.div variants={itemVariants} className="lg:col-span-4 space-y-8 flex flex-col h-full">
                 
                 {/* Billing Card */}
                 <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 -translate-y-8 translate-x-8 pointer-events-none">
                       <CreditCard size={140} />
                    </div>
                    <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                       <CreditCard className="text-indigo-400" size={24} /> Platform Licenses
                    </h3>
                    <div className="space-y-6 mb-8 relative z-10">
                       <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                          <div>
                              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Active Students</p>
                              <p className="text-3xl font-black text-white">{schools.reduce((acc, s) => acc + (s.stats?.totalStudents || 0), 0)}<span className="text-slate-600 text-lg ml-2">Total</span></p>
                          </div>
                       </div>
                    </div>
                    <button className="w-full py-4 bg-white text-slate-900 rounded-xl font-black text-sm transition-transform active:scale-95 flex justify-center items-center gap-2">
                       Global License Audit <ArrowUpRight size={18} />
                    </button>
                 </div>

                 {/* Activity log */}
                 <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex-1">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                       <Activity className="text-emerald-500" size={20} /> Registry Logs
                    </h3>
                    <div className="space-y-4">
                       {[
                         { action: 'Infrastructure healthy', time: 'Direct Sync' },
                         { action: 'Registry synced with database', time: 'Just Now' }
                       ].map((log, i) => (
                         <div key={i} className="flex items-start gap-4">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                            <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{log.time}</p>
                               <p className="text-sm font-medium text-slate-700 leading-tight">{log.action}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

              </motion.div>
           </div>
        </motion.div>

         {/* Modal: Provision / Update School */}
         <AnimatePresence>
            {(isCreateModalOpen || isUpdateModalOpen) && (
               <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-900/40">
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden"
                  >
                     <div className="p-10 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <div>
                           <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                              {isCreateModalOpen ? 'Provision Institution' : 'Update Configuration'}
                           </h2>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              {isCreateModalOpen ? 'Onboard a new educational entity' : `Modifying ${selectedSchool?.name}`}
                           </p>
                        </div>
                        <button onClick={() => { setIsCreateModalOpen(false); setIsUpdateModalOpen(false); }} className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={24}/></button>
                     </div>
                     
                     <form onSubmit={isCreateModalOpen ? handleProvision : handleUpdate} className="p-10 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Institution Name</label>
                              <input required type="text" placeholder="e.g., Royal College" value={newSchool.name} onChange={e => setNewSchool({...newSchool, name: e.target.value})} className="w-full bg-white border border-slate-200 px-6 py-3.5 rounded-2xl focus:border-indigo-600 outline-none font-bold text-slate-800" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Unique School Code</label>
                              <input required type="text" placeholder="e.g., ROYAL-COL" value={newSchool.code} onChange={e => setNewSchool({...newSchool, code: e.target.value})} className="w-full bg-white border border-slate-200 px-6 py-3.5 rounded-2xl focus:border-indigo-600 outline-none font-bold text-slate-800" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Contact Email</label>
                              <input required type="email" placeholder="admin@institute.lk" value={newSchool.email} onChange={e => setNewSchool({...newSchool, email: e.target.value})} className="w-full bg-white border border-slate-200 px-6 py-3.5 rounded-2xl focus:border-indigo-600 outline-none font-bold text-slate-800" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">District Jurisdiction</label>
                              <select value={newSchool.district} onChange={e => setNewSchool({...newSchool, district: e.target.value})} className="w-full bg-white border border-slate-200 px-6 py-3.5 rounded-2xl focus:border-indigo-600 outline-none font-bold text-slate-800">
                                 {['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'].map(d => <option key={d}>{d}</option>)}
                              </select>
                           </div>
                        </div>
                        
                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                           <button type="button" onClick={() => { setIsCreateModalOpen(false); setIsUpdateModalOpen(false); }} className="px-8 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                           <button type="submit" className="flex-1 py-4 bg-slate-900 text-white font-black text-sm rounded-xl shadow-xl hover:bg-slate-800 transition-all">
                              {isCreateModalOpen ? 'Provision Now' : 'Save Configuration'}
                           </button>
                        </div>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
    </Layout>
  );
};

export default SchoolManagement;