import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  BookOpen,
  Search,
  FileText,
  AlertTriangle,
  BadgeCheck,
  Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useMaterials } from '../controllers/useMaterials';
import { useTutors } from '../controllers/useTutors';
import { cn } from '../utils/cn';
import { toast } from 'react-hot-toast';

const ModerationHub = () => {
  const { tutors, fetchTutors, moderateTutor } = useTutors();
  const { materials, fetchMaterials, moderateMaterial } = useMaterials();
  const [filterType, setFilterType] = useState('materials');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTutors();
    fetchMaterials();
  }, [fetchTutors, fetchMaterials]);

  const pendingTutors = tutors.filter((t) => t.verificationStatus === 'pending');
  const pendingMaterials = materials.filter((m) => m.moderationStatus === 'pending');

  const filteredTutors = pendingTutors.filter(t => 
    t.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMaterials = pendingMaterials.filter(m => 
    m.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const activeArray = filterType === 'tutors' ? filteredTutors : filteredMaterials;

  const handleAction = async (id, action) => {
    try {
      if (filterType === 'tutors') {
         await moderateTutor(id, action);
      } else {
         await moderateMaterial(id, action);
      }
      toast.success(`Action processed successfully.`);
    } catch (err) {
      toast.error('Failed to process moderation action.');
    }
  };

  return (
    <Layout userRole="admin">
      <div className="min-h-screen bg-[#fafafc] pb-12 w-full font-sans">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">Moderation Hub</h1>
              <p className="text-slate-500 font-medium mt-2">Oversee platform integrity, review flagged assets, and enforce community standards.</p>
            </div>
            <div className="flex bg-white shadow-soft rounded-xl p-1 border border-slate-200">
               <span className="px-4 py-2 bg-rose-50 text-rose-600 font-bold text-xs uppercase tracking-widest rounded-lg flex items-center gap-2">
                 <ShieldCheck size={14} className="text-rose-500" /> Security Enforced
               </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             
             {/* Left Column: Toggles & Search */}
             <div className="lg:col-span-3 space-y-6">
                <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm sticky top-8 space-y-6">
                   <div className="relative group">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                     <input
                       type="text"
                       placeholder="Search queue..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all font-medium text-slate-700"
                     />
                   </div>

                   <div className="space-y-3">
                      <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-2">Work Queues</p>
                      
                      <button
                        onClick={() => setFilterType('materials')}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-xl transition-all font-bold text-sm",
                          filterType === 'materials' 
                            ? "bg-slate-900 text-white shadow-md" 
                            : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                        )}
                      >
                         <div className="flex items-center gap-3">
                           <BookOpen size={18} className={filterType === 'materials' ? "text-indigo-400" : "text-slate-400"} />
                           <span>Content Assets</span>
                         </div>
                         {pendingMaterials.length > 0 && (
                            <span className={cn("px-2.5 py-1 rounded-md text-[10px]", filterType === 'materials' ? "bg-white/20" : "bg-white border border-slate-200")}>
                              {pendingMaterials.length}
                            </span>
                         )}
                      </button>

                      <button
                        onClick={() => setFilterType('tutors')}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-xl transition-all font-bold text-sm",
                          filterType === 'tutors' 
                            ? "bg-slate-900 text-white shadow-md" 
                            : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                        )}
                      >
                         <div className="flex items-center gap-3">
                           <Users size={18} className={filterType === 'tutors' ? "text-indigo-400" : "text-slate-400"} />
                           <span>Tutor Reports</span>
                         </div>
                         {pendingTutors.length > 0 && (
                            <span className={cn("px-2.5 py-1 rounded-md text-[10px]", filterType === 'tutors' ? "bg-white/20" : "bg-white border border-slate-200")}>
                              {pendingTutors.length}
                            </span>
                         )}
                      </button>
                   </div>
                </div>
             </div>

             {/* Right Column: Active Queue */}
             <div className="lg:col-span-9">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm min-h-[600px]">
                   <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                      <div>
                         <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                           <AlertTriangle className="text-amber-500" /> Pending Review
                         </h3>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Take action on flagged items to maintain quality.</p>
                      </div>
                   </div>

                   <AnimatePresence>
                      {activeArray.map((item) => (
                        <motion.div 
                          key={item._id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 mb-4 hover:border-slate-300 hover:bg-white transition-all shadow-sm flex flex-col md:flex-row justify-between items-center gap-6"
                        >
                           <div className="flex items-center gap-5 w-full md:w-auto overflow-hidden">
                              <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-sm text-white shrink-0", filterType === 'tutors' ? "bg-indigo-500" : "bg-emerald-500")}>
                                 {filterType === 'tutors' ? (item.userId?.username?.[0]?.toUpperCase() || 'U') : <FileText size={24} />}
                              </div>
                              <div className="flex-1 overflow-hidden">
                                 <h4 className="text-lg font-bold text-slate-800 truncate mb-1">
                                    {filterType === 'tutors' ? item.userId?.username : item.title}
                                 </h4>
                                 <div className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold rounded uppercase tracking-widest">
                                       ID: {item._id.slice(-6)}
                                    </span>
                                    <span className="text-sm text-slate-500 font-medium">
                                       {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                              <button 
                                onClick={() => handleAction(item._id, 'rejected')}
                                className="flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-3 bg-white border border-rose-200 text-rose-500 font-bold text-sm rounded-xl hover:bg-rose-50 transition-colors shadow-sm"
                              >
                                 <Ban size={16} /> Block/Deny
                              </button>
                              <button 
                                onClick={() => handleAction(item._id, 'approved')}
                                className="flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-3 bg-slate-900 border border-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                              >
                                 <CheckCircle2 size={16} /> Mark Safe
                              </button>
                           </div>
                        </motion.div>
                      ))}
                   </AnimatePresence>

                   {activeArray.length === 0 && (
                      <div className="py-32 text-center">
                         <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck size={40} className="text-emerald-500" />
                         </div>
                         <h4 className="text-xl font-bold text-slate-700 mb-2">All Clear!</h4>
                         <p className="text-slate-500 font-medium text-sm">No pending items require moderation action at this time.</p>
                      </div>
                   )}
                </motion.div>
             </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ModerationHub;