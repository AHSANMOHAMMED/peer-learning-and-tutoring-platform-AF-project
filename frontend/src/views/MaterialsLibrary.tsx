import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Download, 
  Star, 
  Filter, 
  FileText, 
  Zap, 
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Tag
} from 'lucide-react';
import Layout from '../components/Layout';
import { useMaterials } from '../controllers/useMaterials';
import { cn } from '../utils/cn';

const MaterialsLibrary: React.FC = () => {
  const { materials, loading, fetchMaterials } = useMaterials();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const SUBJECTS = ['All Subjects', 'Combined Maths', 'Physics', 'Chemistry', 'Biology', 'ICT', 'Accounting'];

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          material.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All Subjects' || material.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <Layout userRole="student">
      <div className="min-h-screen space-y-8 p-4 md:p-8 bg-gray-50/50 dark:bg-gray-950/50">
        {/* Resource Hero */}
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-teal-600 to-emerald-700 p-8 md:p-16 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
                  <BookOpen className="text-teal-200" size={28} />
                </div>
                <span className="text-xs font-black tracking-[0.3em] uppercase text-teal-100">Premium Repository</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
                Master the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-white underline decoration-white/30 underline-offset-8">Curriculum.</span>
              </h1>
              <p className="text-teal-100/80 text-lg md:text-xl leading-relaxed mb-10">
                Access over 5,000+ verified A/L notes, past papers, and organic chemistry charts curated by top Sri Lankan mentors.
              </p>
              <div className="relative group max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-teal-300 group-focus-within:text-white transition-colors" size={24} />
                <input 
                  type="text"
                  placeholder="Search repository (e.g. 2023 Physics P1...)"
                  className="w-full bg-white/10 backdrop-blur-xl border border-white/20 py-6 pl-16 pr-8 rounded-[2rem] outline-none text-white font-bold placeholder:text-teal-200/50 focus:bg-white/20 transition-all shadow-2xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-6">
               <div className="p-8 bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-xl">
                 <p className="text-4xl font-black mb-1">12k+</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-teal-100">Downloads Today</p>
               </div>
               <div className="p-8 bg-teal-400/20 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-xl mt-12">
                 <p className="text-4xl font-black mb-1">98%</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-teal-100">Trust Rating</p>
               </div>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar px-4 grayscale hover:grayscale-0 transition-all duration-700">
           {SUBJECTS.map(subj => (
             <button 
               key={subj}
               onClick={() => setSelectedSubject(subj)}
               className={cn(
                 "px-8 py-4 rounded-2xl text-sm font-black whitespace-nowrap transition-all border shrink-0",
                 selectedSubject === subj 
                   ? "bg-teal-600 text-white border-teal-600 shadow-xl shadow-teal-500/20" 
                   : "bg-white dark:bg-gray-900 text-gray-500 border-gray-100 dark:border-gray-800 hover:border-teal-500"
               )}
             >
               {subj}
             </button>
           ))}
        </div>

        {/* Content Grid */}
        <div className="space-y-8">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white uppercase flex items-center gap-3">
                <TrendingUp size={28} className="text-teal-500" />
                Featured Resources
              </h3>
              <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                Sort <ChevronRight size={14} /> <span className="text-teal-600 cursor-pointer hover:underline">Most Popular</span>
              </div>
           </div>

           {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="h-64 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-[2.5rem]" />
               ))}
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-20">
               {filteredMaterials.map((res) => (
                 <motion.div 
                   layout
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   key={res._id} 
                   className="group bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative flex flex-col"
                 >
                   <div className="absolute top-6 right-6 p-2 bg-teal-500/10 rounded-xl text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Tag size={16} />
                   </div>
                   
                   <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-teal-500 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                     <FileText size={32} />
                   </div>
                   
                   <div className="flex-1">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 mb-2">{res.subject}</p>
                     <h4 className="text-xl font-black text-gray-950 dark:text-white mb-3 line-clamp-2 leading-tight">{res.title}</h4>
                     <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed">{res.description}</p>
                   </div>

                   <div className="space-y-6 pt-6 border-t border-gray-50 dark:border-gray-800">
                     <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                        <span className="flex items-center gap-1"><Zap size={14} className="text-yellow-500" /> {res.trustScore || 95}% Trust</span>
                        <span className="flex items-center gap-1 uppercase tracking-widest">{res.fileType} • 4.2MB</span>
                     </div>
                     <button className="w-full py-4 bg-gray-50 dark:bg-gray-800 group-hover:bg-teal-600 group-hover:text-white text-gray-950 dark:text-gray-200 font-bold rounded-2xl transition-all flex items-center justify-center gap-3">
                        Secure Download <Download size={18} />
                     </button>
                   </div>
                 </motion.div>
               ))}
             </div>
           )}

           {!loading && filteredMaterials.length === 0 && (
            <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
              <BookOpen className="mx-auto text-teal-200 mb-6" size={80} />
              <h4 className="text-3xl font-black text-gray-900 dark:text-gray-400 mb-4 tracking-tight">Empty Repository</h4>
              <p className="text-gray-500 max-w-sm mx-auto text-lg leading-relaxed">We couldn't find any resources matching your criteria. Try looking for more common keywords.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MaterialsLibrary;
