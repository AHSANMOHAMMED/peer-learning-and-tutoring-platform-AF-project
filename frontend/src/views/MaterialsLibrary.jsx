import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Download, FileText, ChevronRight, Filter, ShieldCheck, Box, RefreshCw } from 'lucide-react';
import Layout from '../components/Layout';
import { useMaterials } from '../controllers/useMaterials';
import { useAuth } from '../controllers/useAuth';
import { cn } from '../utils/cn';

const MaterialsLibrary = () => {
  const { user } = useAuth();
  const { materials, loading, fetchMaterials } = useMaterials();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const SUBJECTS = ['All Subjects', 'Combined Maths', 'Physics', 'Chemistry', 'Biology', 'ICT', 'Accounting', 'Science', 'History'];

  const filteredMaterials = materials.filter((material) => {
    const title = material.title || '';
    const description = material.description || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All Subjects' || material.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <Layout userRole="student">
      <div className="max-w-[1400px] mx-auto w-full font-sans">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Resource Center</h1>
                 {user?.grade && (
                    <span className="bg-[#00a8cc] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#00a8cc]/20 shadow-sm">
                       Grade {user.grade} Optimized
                    </span>
                 )}
              </div>
              <p className="text-slate-500 font-medium text-sm">
                Access verified past papers and notes tailored for your {user?.grade ? `Grade ${user.grade}` : 'curriculum'}.
              </p>
           </div>
           <button onClick={fetchMaterials} className="bg-white border border-slate-200 text-slate-600 hover:text-[#00a8cc] px-4 py-2.5 rounded-xl font-bold text-sm shadow-soft transition-colors flex items-center gap-2">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync Resources
           </button>
        </div>

        {/* Global Search and Filter Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-soft border border-slate-100 flex flex-col md:flex-row gap-4 mb-8">
           <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                 type="text" placeholder="Search across all resources..." 
                 value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-100 py-3 pl-12 pr-4 rounded-xl text-slate-800 focus:outline-none focus:border-[#00a8cc] font-medium transition-colors"
              />
           </div>
           
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
             {SUBJECTS.map((subj) => (
                <button
                   key={subj}
                   onClick={() => setSelectedSubject(subj)}
                   className={cn(
                       "px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-colors border shrink-0",
                      selectedSubject === subj 
                        ? "bg-slate-900 text-white border-slate-900" 
                        : "bg-white text-slate-500 border-slate-200 hover:border-[#00a8cc] hover:text-slate-800"
                   )}
                >
                   {subj}
                </button>
             ))}
           </div>
        </div>

        {/* Results Metadata */}
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-xl font-bold text-slate-800">Available Materials</h3>
           <p className="text-sm font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{filteredMaterials.length} Documents</p>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
           {loading ? (
              <div className="col-span-full py-24 text-center text-slate-400 font-medium flex flex-col items-center">
                 <RefreshCw className="animate-spin mb-4 text-[#00a8cc]" size={32} />
                 Loading materials repository...
              </div>
           ) : filteredMaterials.length === 0 ? (
              <div className="col-span-full py-24 bg-white border border-slate-100 rounded-3xl text-center text-slate-400 flex flex-col items-center shadow-sm">
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                    <Box size={24} className="text-slate-300" />
                 </div>
                 <h4 className="text-lg font-bold text-slate-700 mb-1">No artifacts found</h4>
                 <p className="text-sm font-medium">Try adjusting your search criteria or changing the subject.</p>
              </div>
           ) : (
              <AnimatePresence>
                 {filteredMaterials.map((res) => (
                    <motion.div
                      key={res._id}
                      layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-soft hover:border-[#00a8cc] transition-all flex flex-col group relative"
                    >
                       <div className="flex justify-between items-start mb-6">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#00a8cc] flex items-center justify-center group-hover:bg-[#00a8cc] group-hover:text-white transition-colors">
                             <FileText size={24} />
                          </div>
                          <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 border border-emerald-100">
                             <ShieldCheck size={12}/> Verified
                          </span>
                       </div>
                       
                       <div className="flex-1 space-y-2 mb-6">
                          <span className="text-xs font-bold text-[#00a8cc] uppercase tracking-widest">{res.subject || 'General'}</span>
                          <h4 className="text-lg font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-[#00a8cc] transition-colors">{res.title}</h4>
                          <p className="text-sm font-medium text-slate-500 line-clamp-2">{res.description}</p>
                       </div>

                       <div className="pt-4 border-t border-slate-100">
                          <button className="w-full py-3.5 bg-slate-50 hover:bg-slate-900 text-slate-600 hover:text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 group/btn">
                             Download Asset <Download size={16} className="group-hover/btn:translate-y-0.5 transition-transform" />
                          </button>
                       </div>
                    </motion.div>
                 ))}
              </AnimatePresence>
           )}
        </div>

      </div>
    </Layout>
  );
};

export default MaterialsLibrary;