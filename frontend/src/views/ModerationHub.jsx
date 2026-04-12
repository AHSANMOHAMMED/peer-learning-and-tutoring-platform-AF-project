import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Users,
  ArrowRight,
  ShieldOff,
  CheckCircle2,
  XCircle,
  BookOpen,
  Zap,
  Cpu,
  Fingerprint,
  Binary,
  Signal,
  Activity,
  Shield,
  ArrowUpRight,
  Search,
  ChevronDown,
  RefreshCw,
  Terminal,
  Database,
  Lock,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useMaterials } from '../controllers/useMaterials';
import { useTutors } from '../controllers/useTutors';
import { cn } from '../utils/cn';

const ModerationHub = () => {
  const navigate = useNavigate();
  const { tutors, fetchTutors, moderateTutor } = useTutors();
  const { materials, fetchMaterials, moderateMaterial } = useMaterials();
  const [filterType, setFilterType] = useState('tutors');
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

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <Layout userRole="admin">
      <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-500/10 overflow-x-hidden relative text-left p-6 md:p-8">
        {/* Luminous System Overlays Architecture display protocol logic architecture */}
        <div className="fixed inset-0 pointer-events-none z-[1001] text-left">
           <div className="absolute inset-0 bg-gradient-to-tr from-white/90 via-transparent to-white/90 pointer-events-none" />
        </div>

        <motion.div 
          className="relative z-10 max-w-[1440px] mx-auto space-y-8 text-left"
          variants={containerVariants}
          initial="hidden" animate="visible"
        >
          {/* Command Bar */}
          <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-2.5 bg-white/60 backdrop-blur-3xl rounded-xl border border-blue-50 shadow-sm text-left">
             <div className="flex items-center gap-6 text-left">
                <div className="flex items-center gap-2.5 text-left text-left">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.4)] text-left" />
                   <span className="text-xs font-medium uppercase tracking-widest text-slate-950 leading-none text-left">Sentinel OVERSIGHT COMMAND α-ACTIVE</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400 text-left">
                   <Shield size={12} className="text-indigo-500 text-left" />
                   <span className="text-xs font-medium uppercase tracking-widest leading-none text-left">Master Protocol Integrity Grid::OK</span>
                </div>
                <div className="hidden lg:flex items-center gap-2.5 text-slate-400 text-left">
                   <Activity size={12} className="text-emerald-500 text-left" />
                   <span className="text-xs font-medium uppercase tracking-widest leading-none text-left">Node_Oversight::GLOBAL</span>
                </div>
             </div>
              <div className="flex items-center gap-4 text-center">
                 <button 
                   onClick={() => { fetchTutors(); fetchMaterials(); }}
                   className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 hover:rotate-180 transition-transform duration-700 text-center shadow-inner active:scale-95"
                 >
                    <RefreshCw size={12} className="text-left" />
                 </button>
                 <div className="px-3.5 py-1.5 bg-slate-950 text-white rounded-lg text-xs font-medium uppercase tracking-widest shadow-lg text-center border border-white/5">
                    SENTINEL::
                 </div>
              </div>
          </div>

          {/* Moderation Hero Hub Central Protocol Architecture display logic terminal interface */}
          <motion.div 
            variants={itemVariants} 
            className="relative overflow-hidden rounded-2xl bg-indigo-600 p-6 md:p-12 text-white shadow-4xl text-left group"
          >
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none text-right" />
            
            <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12 text-left">
              <div className="flex-1 max-w-4xl space-y-8 text-left">
                <div className="flex items-center gap-5 text-left">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-4xl transition-all duration-1000 text-center shrink-0 group-hover:rotate-6">
                    <ShieldCheck size={28} className="text-white text-left filter drop-shadow-glow" />
                  </div>
                  <div className="text-left text-left">
                     <span className="text-xs font-medium tracking-widest uppercase text-indigo-100 leading-none text-left">Security & Integrity Sovereign Bureau Command Station Sector IX</span>
                     <div className="flex items-center gap-3 mt-2 text-left">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white] text-left" />
                        <span className="text-xs font-medium uppercase text-white/40 tracking-widest text-left">Oversight_Node_Active_Grid::</span>
                     </div>
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-medium tracking-tighter leading-none uppercase px-0 text-white text-left">
                   Sovereign <br />
                   <span className="text-blue-200">Sentinel Hub.</span>
                </h1>
                <p className="text-indigo-100 text-base font-bold leading-relaxed max-w-lg px-0 text-left underline decoration-white/10 underline-offset-8">
                   Master enforcement module active. Verify scholastic identities and moderate asset intake within the sovereign Aura network. High-fidelity integrity oversight calibrated.
                </p>
              </div>

               {/* Action Matrix & Switcher Interface UI Logic protocol architecture display */}
               <div className="w-full xl:max-w-xl space-y-5 text-left pt-2">
                  <div className="relative group/search text-left">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-200 group-focus-within/search:text-white transition-colors pointer-events-none text-left" size={18} />
                     <input
                       type="text"
                       placeholder="IDENTIFY_SOURCE_OR_ASSET..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full bg-white/10 backdrop-blur-3xl border border-white/10 rounded-2xl pl-16 pr-8 py-5.5 text-base font-medium text-white hover:bg-white/20 focus:bg-white focus:text-slate-900 transition-all placeholder:text-indigo-100 shadow-4xl uppercase tracking-normal text-left outline-none"
                     />
                  </div>
                  
                  <div className="flex gap-2.5 p-2 bg-white/10 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-4xl text-center">
                     <button
                       onClick={() => setFilterType('tutors')}
                       className={cn(
                         "flex-1 py-4.5 rounded-xl font-medium text-xs uppercase tracking-widest transition-all duration-1000 text-center active:scale-95",
                         filterType === 'tutors' ? "bg-white text-slate-950 shadow-4xl scale-[1.02]" : "text-white/40 hover:text-white hover:bg-white/5"
                       )}
                     >
                        Tutor_Nodes ({(pendingTutors.length).toString().padStart(2, '0')})
                     </button>
                     <button
                       onClick={() => setFilterType('materials')}
                       className={cn(
                         "flex-1 py-4.5 rounded-xl font-medium text-xs uppercase tracking-widest transition-all duration-1000 text-center active:scale-95",
                         filterType === 'materials' ? "bg-white text-slate-950 shadow-4xl scale-[1.02]" : "text-white/40 hover:text-white hover:bg-white/5"
                       )}
                     >
                        Asset_Stack ({(pendingMaterials.length).toString().padStart(2, '0')})
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Verification Pipeline Display Matrix UI Architecture protocol architecture display */}
          <div className="grid grid-cols-1 gap-10 text-left pb-20">
             <motion.div variants={itemVariants} className="bg-white border border-blue-50 rounded-3xl p-8 md:p-12 shadow-4xl space-y-10 text-left relative overflow-hidden group border border-slate-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10 text-left">
                   <div className="space-y-2.5 text-left">
                      <h3 className="text-2xl md:text-3xl font-medium tracking-tighter text-slate-950 uppercase flex items-center gap-4 px-0 leading-none text-left">
                        {filterType === 'tutors' ? <Users className="text-indigo-600 text-left" size={24} /> : <BookOpen className="text-indigo-600 text-left" size={24} />}
                        {filterType === 'tutors' ? 'Node Verification Queue' : 'Asset Moderation Grid Matrix'}
                      </h3>
                      <p className="text-xs font-medium uppercase tracking-widest text-slate-300 leading-none text-left">
                         Protocol Execution  :: HIGH-FIDELITY OVERSIGHT PIPELINE α-ACTIVE
                      </p>
                   </div>
                   <div className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner flex items-center gap-6 text-center">
                      <div className="flex items-center gap-3 text-left">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981] text-left shadow-glow" />
                         <span className="text-xs font-medium uppercase tracking-widest text-slate-300 leading-none pt-0.5 text-left">Sentinel Nominal</span>
                      </div>
                      <div className="h-5 w-px bg-slate-200" />
                      <span className="text-xs font-medium uppercase tracking-widest text-indigo-600 tabular-nums leading-none pt-0.5 text-left">PENDING: {(filterType === 'tutors' ? pendingTutors.length : pendingMaterials.length).toString().padStart(2, '0')}</span>
                   </div>
                </div>

                <AnimatePresence mode="wait">
                   <motion.div 
                     key={filterType + searchTerm}
                     initial={{ opacity: 0, y: 15 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="space-y-5 relative z-10 text-left"
                   >
                      {(filterType === 'tutors' ? filteredTutors : filteredMaterials).map((node) => (
                        <motion.div 
                          key={node._id}
                          layout
                          className="p-6 bg-slate-50 border border-slate-50 rounded-2xl flex flex-col xl:flex-row items-center justify-between gap-10 group hover:border-indigo-100 hover:shadow-4xl hover:bg-white transition-all duration-1000 text-left cursor-pointer shadow-md"
                        >
                           <div className="flex items-center gap-8 text-left flex-1 overflow-hidden">
                              <div className="shrink-0 relative text-left">
                                 <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center text-white font-medium text-xl shadow-4xl transition-all duration-1000 group-hover:rotate-12 text-center border border-white/10",
                                    filterType === 'tutors' ? "bg-indigo-600" : "bg-slate-950"
                                 )}>
                                    {filterType === 'tutors' ? (node.userId?.username?.[0] || 'T') : (node.fileType?.[0].toUpperCase() || 'P')}
                                 </div>
                                 <div className="absolute -bottom-1.5 -right-1.5 w-6.5 h-6.5 bg-amber-500 border-2 border-white rounded-xl flex items-center justify-center text-center shadow-4xl">
                                    <Zap size={12} className="text-white fill-white text-center" />
                                 </div>
                              </div>
                              <div className="space-y-3.5 text-left overflow-hidden">
                                 <div className="space-y-1.5 text-left overflow-hidden">
                                    <h4 className="text-xl font-medium text-slate-950 uppercase tracking-tight leading-none px-0 text-left line-clamp-1">{filterType === 'tutors' ? node.userId?.username : node.title}</h4>
                                    <div className="flex items-center gap-4 text-left overflow-hidden">
                                       <span className="text-sm font-medium text-indigo-400 uppercase tracking-widest leading-none text-left shrink-0 underline decoration-indigo-100 underline-offset-4">{node._id.slice(-12).toUpperCase()}</span>
                                       <div className="w-1.5 h-1.5 bg-slate-200 rounded-full text-left" />
                                       <span className="text-sm font-medium text-slate-300 uppercase tracking-widest leading-none pt-0.5 text-left shrink-0">{new Date(node.createdAt).toLocaleDateString()}</span>
                                    </div>
                                 </div>
                                 <div className="flex flex-wrap items-center gap-3 text-left">
                                    <span className="px-4 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-medium text-slate-300 uppercase tracking-widest leading-none group-hover:border-indigo-100 transition-all duration-1000 text-left shadow-inner">
                                       {filterType === 'tutors' ? `${node.alStream || 'GENERAL'} CORE_STREAM` : `${node.subject || 'GENERAL'} ASSET`}
                                    </span>
                                    {filterType === 'tutors' && (
                                       <span className="px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-medium text-indigo-600 uppercase tracking-widest leading-none text-left shadow-inner">
                                          {node.hourlyRate || '0'} LKR/HR FLUX
                                       </span>
                                    )}
                                    <span className="px-4 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-medium text-slate-200 uppercase tracking-widest leading-none text-left shadow-inner">
                                       {filterType === 'tutors' ? 'PEDAGOGICAL_' : `TIER_${node.grade || 'GRAD'}I`}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-wrap items-center gap-5 text-left w-full xl:w-auto xl:justify-end shrink-0">
                              <div className="flex gap-3 text-left">
                                 <button
                                   onClick={() => filterType === 'tutors' ? moderateTutor(node._id, 'rejected') : moderateMaterial(node._id, 'rejected')}
                                   className="w-12 h-12 rounded-xl bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-100 transition-all active:scale-95 flex items-center justify-center shadow-inner group/btn text-center"
                                 >
                                    <XCircle size={20} className="group-hover/btn:rotate-90 transition-transform duration-1000 text-center" />
                                 </button>
                                 <button
                                   onClick={() => filterType === 'tutors' ? moderateTutor(node._id, 'approved') : moderateMaterial(node._id, 'approved')}
                                   className="w-12 h-12 rounded-xl bg-emerald-50 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-100 transition-all active:scale-95 flex items-center justify-center shadow-inner group/btn text-center"
                                 >
                                    <CheckCircle2 size={20} className="group-hover/btn:scale-110 transition-transform duration-1000 text-center" />
                                 </button>
                              </div>
                              <button className="px-8 py-4.5 bg-slate-950 hover:bg-indigo-600 font-medium text-sm text-white uppercase tracking-normal rounded-xl shadow-4xl flex items-center justify-center gap-4 active:scale-95 group transition-all duration-1000 text-center border border-white/5">
                                 {filterType === 'tutors' ? 'DEEP_AUDIT_EXECUTION' : 'REVIEW_SOURCE_INTEGRITY'} 
                                 <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-1000 text-center" />
                              </button>
                           </div>
                        </motion.div>
                      ))}

                      {((filterType === 'tutors' && filteredTutors.length === 0) || (filterType === 'materials' && filteredMaterials.length === 0)) && (
                        <div className="py-32 text-center flex flex-col items-center gap-10 bg-slate-50 border border-dashed border-slate-200 rounded-3xl opacity-40 group hover:opacity-100 transition-all duration-1000 text-center shadow-inner">
                            <div className="w-24 h-24 bg-white border border-slate-100 rounded-3xl flex items-center justify-center text-slate-100 shadow-4xl text-center shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000">
                               <ShieldOff size={40} className="text-center" />
                            </div>
                            <div className="space-y-4 text-center px-10">
                               <h4 className="text-2xl font-medium text-slate-950 uppercase tracking-tighter leading-none px-0 text-center">Hub Pipeline Integrity Clear.</h4>
                                <p className="text-sm font-medium uppercase tracking-widest text-slate-300 leading-none px-0 text-center underline decoration-slate-100 underline-offset-8">All pending scholastic nodes and assets have been successfully synchronized across the state grid matrix   node .</p>
                            </div>
                        </div>
                      )}
                   </motion.div>
                </AnimatePresence>
             </motion.div>
          </div>
        </motion.div>

        {/* Global Hub Authority terminal indicator UI Architecture Matrix display logic protocol terminal logic architecture */}
        <div className="fixed bottom-8 right-8 group z-50 opacity-40 hover:opacity-100 transition-all duration-1000 text-left">
           <div className="flex items-center gap-8 py-5 px-10 bg-white/60 backdrop-blur-3xl rounded-full border border-blue-50 shadow-4xl cursor-default text-left">
              <div className="relative text-left">
                 <Terminal size={24} className="text-indigo-600 animate-pulse text-left shadow-glow" />
                 <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 text-left" />
              </div>
               <div className="flex flex-col text-left text-left">
                  <p className="text-sm font-medium uppercase tracking-widest text-slate-950 leading-none text-left h-3">SENTINEL_OVERSIGHT</p>
                  <div className="flex items-center gap-4 mt-2.5 text-xs font-medium uppercase text-indigo-600 tracking-widest leading-none text-left h-4">
                     <Database size={14} className="text-left" /> Status: OK :: HI_FIDELITY_OVERSIGHT :: Sovereign Hub master node
                  </div>
               </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default ModerationHub;