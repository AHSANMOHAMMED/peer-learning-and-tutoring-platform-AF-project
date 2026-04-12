import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  ArrowRight,
  User,
  BookOpen,
  GraduationCap,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Eye,
  FileText,
  BadgeCheck,
  Zap,
  Fingerprint,
  Activity,
  Award,
  Info,
  Signal,
  X,
  Lock,
  Target,
  Binary,
  Cpu,
  Shield,
  ArrowUpRight,
  Terminal,
  RefreshCw,
  Database,
  ArrowRightCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { useTutors } from '../controllers/useTutors';
import { cn } from '../utils/cn';

const AdminApprovals = () => {
  const { t } = useTranslation();
  const { tutors, fetchAllTutors, moderateTutor } = useTutors();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showAuditSpecs, setShowAuditSpecs] = useState(false);

  useEffect(() => {
    fetchAllTutors();
  }, [fetchAllTutors]);

  const pendingTutors = tutors.filter(t => 
    t.verificationStatus === 'pending' || t.verificationStatus === 'rejected'
  ).filter(t => 
    t.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  const handleAuditSpec = (tutor) => {
    setSelectedTutor(tutor);
    setShowAuditSpecs(true);
  };

  const calculateTrustScore = (tutor) => {
    let score = 70; 
    if (tutor.bio?.length > 100) score += 10;
    if (tutor.education?.some(e => e.includes('University'))) score += 15;
    if (tutor.experience?.length > 2) score += 5;
    return Math.min(100, score);
  };

  return (
    <Layout userRole="admin">
      <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-500/10 overflow-x-hidden relative text-left p-6 md:p-8">
        {/* Dashboard Background */}
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
                   <span className="text-xs font-medium uppercase tracking-widest text-slate-950 leading-none text-left">Scholastic Verification Matrix α-ACTIVE </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400 text-left">
                   <ShieldCheck size={12} className="text-indigo-500 text-left" />
                   <span className="text-xs font-medium uppercase tracking-widest leading-none text-left">Audit_Queue</span>
                </div>
                <div className="hidden lg:flex items-center gap-2.5 text-slate-400 text-left">
                   <Activity size={12} className="text-emerald-500 text-left" />
                   <span className="text-xs font-medium uppercase tracking-widest leading-none text-left">Flow_Status::OK</span>
                </div>
             </div>
              <div className="flex items-center gap-4 text-left">
                 <div className="px-3.5 py-1.5 bg-slate-950 text-white rounded-lg text-xs font-medium uppercase tracking-widest shadow-lg text-center border border-white/5">
                    VERIFICATION_TERMINAL :: 
                 </div>
              </div>
          </div>

          {/* Verification HUB Hero HUB Architecture Display Matrix architecture Display central matrix protocol display */}
          <motion.div 
            variants={itemVariants} 
            className="relative overflow-hidden rounded-2xl bg-indigo-600 p-6 md:p-12 text-white shadow-4xl text-left group"
          >
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none text-right" />
            
            <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12 text-left">
              <div className="flex-1 max-w-4xl space-y-8 text-left">
                <div className="flex items-center gap-5 text-left">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-4xl transition-all duration-1000 text-center shrink-0 group-hover:rotate-6">
                    <Fingerprint size={28} className="text-white text-left filter drop-shadow-glow" />
                  </div>
                  <div className="text-left text-left">
                     <span className="text-xs font-medium tracking-widest uppercase text-indigo-100 leading-none text-left">Sovereign Identity Provisioning Base Central Command </span>
                     <div className="flex items-center gap-3 mt-2 text-left">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white] text-left" />
                        <span className="text-xs font-medium uppercase text-white/40 tracking-widest text-left">GLOBAL_AUDIT::</span>
                     </div>
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-medium tracking-tighter leading-none uppercase px-0 text-white text-left">
                   Identity <br />
                   <span className="text-blue-200">Verification.</span>
                </h1>
                <p className="text-indigo-100 text-base font-bold leading-relaxed max-w-lg px-0 text-left underline decoration-white/10 underline-offset-8">
                   Orchestrating national identity nodes, scholastic verification protocols, and role-based authority matrix with hyper-density overseen by the   Sentinel.
                </p>
              </div>

               {/* Search & Action Matrix Interface UI Logic terminal interface logic display */}
               <div className="w-full xl:max-w-xl space-y-5 text-left pt-2">
                  <div className="relative group/search text-left">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-200 group-focus-within/search:text-white transition-colors pointer-events-none text-left" size={18} />
                     <input
                       type="text"
                       placeholder="IDENTIFY_IDENTITY_SOURCE..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full bg-white/10 backdrop-blur-3xl border border-white/10 rounded-2xl pl-16 pr-8 py-5.5 text-base font-medium text-white hover:bg-white/20 focus:bg-white focus:text-slate-900 transition-all placeholder:text-indigo-100 shadow-4xl uppercase tracking-normal text-left outline-none"
                     />
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-3xl border border-white/10 rounded-2xl text-left">
                     <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-center shrink-0 shadow-inner">
                        <ShieldAlert size={18} className="text-white text-center" />
                     </div>
                     <div className="space-y-1 text-left overflow-hidden">
                        <p className="text-xs font-medium uppercase text-white tracking-widest leading-none text-left">Active_Audit_Backlog_</p>
                        <p className="text-sm font-medium text-indigo-200 uppercase tracking-widest leading-none text-left truncate">{pendingTutors.length.toString().padStart(2, '0')} Identity Nodes awaiting provisioning audit sync nominal IX.</p>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Audit Queue Manifest Matrix Architecture UI display logic protocol  */}
          <div className="space-y-6 text-left pb-20">
             <div className="flex items-center justify-between px-2 text-left">
                <h2 className="text-lg md:text-xl font-medium uppercase tracking-tighter flex items-center gap-4 leading-none text-slate-950 px-0 text-left">
                   <Clock className="text-indigo-600 text-left" size={24} /> QUEUE_MANIFEST
                </h2>
                <div className="px-5 py-2 bg-white border border-blue-50 rounded-xl shadow-4xl flex items-center gap-3 text-center border border-slate-100">
                   <Activity size={14} className="text-indigo-600 animate-pulse text-center" />
                   <span className="text-xs font-medium uppercase tracking-widest text-slate-300 leading-none pt-0.5">{pendingTutors.length} ACTIVE_AUDITS</span>
                </div>
             </div>

             <AnimatePresence mode="popLayout">
                {pendingTutors.map((tutor) => (
                   <motion.div 
                     key={tutor._id}
                     layout
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.98 }}
                     className="bg-white border border-slate-100 rounded-2xl p-6 shadow-4xl hover:border-indigo-100 transition-all duration-[1000ms] relative overflow-hidden group text-left cursor-default group/node"
                   >
                      <div className="flex flex-col xl:flex-row justify-between items-center gap-10 relative z-10 text-left">
                         <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left flex-1 text-left">
                            <div className="relative group/avatar shrink-0">
                               <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-50 p-1.5 shadow-inner group-hover/avatar:rotate-12 transition-transform duration-[1000ms] text-center">
                                  <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center text-white font-medium text-2xl text-center border border-white/5">
                                     {tutor.userId?.username?.[0]?.toUpperCase() || 'N'}
                                  </div>
                               </div>
                               {tutor.verificationStatus === 'rejected' && (
                                 <div className="absolute -top-2 -right-2 p-1.5 bg-rose-500 rounded-full border-2 border-white shadow-4xl text-center filter drop-shadow-glow">
                                    <X size={10} className="text-white text-center" />
                                 </div>
                               )}
                            </div>

                            <div className="space-y-3 text-left overflow-hidden">
                               <div className="text-left">
                                  <h4 className="text-xl font-medium text-slate-950 uppercase tracking-tighter mb-2 leading-none px-0 text-left line-clamp-1 group-hover/node:text-indigo-600 transition-colors duration-700 underline decoration-indigo-50/20 underline-offset-4">{tutor.userId?.username}</h4>
                                  <div className="flex items-center gap-4 text-left">
                                     <p className="text-xs font-medium text-indigo-500 uppercase tracking-widest leading-none mb-0 pt-0.5 text-left underline underline-offset-2 decoration-indigo-500/10">{tutor.userId?.email}</p>
                                     <span className="text-xs font-medium text-slate-200 uppercase tracking-widest leading-none pt-0.5 text-left">NODE_ID: {tutor._id.slice(-8).toUpperCase()}</span>
                                  </div>
                               </div>
                               <div className="flex flex-wrap justify-center md:justify-start gap-3 text-left">
                                  <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-50 text-xs font-medium text-slate-300 uppercase tracking-normal text-left hover:bg-white hover:border-indigo-100 transition-all duration-700">
                                     <MapPin size={12} className="text-indigo-600 text-left" /> {tutor.location?.toUpperCase() || 'COLOMBO'}
                                  </div>
                                  <div className="flex items-center gap-2.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-50 text-xs font-medium text-emerald-600 uppercase tracking-normal text-left shadow-inner filter drop-shadow-glow-emerald">
                                     <BadgeCheck size={12} className="text-left" /> IDENTITY_LOGIC_PASS
                                  </div>
                               </div>
                            </div>
                         </div>

                         {/* Performance Matrix Rating Command Terminal architecture display logic */}
                         <div className="flex items-center gap-10 shrink-0 text-right font-medium">
                            <div className="text-right space-y-3 text-right font-medium">
                               <p className="text-xs font-medium text-slate-200 uppercase tracking-widest mb-0 leading-none text-right">TRUST_INDEX_RATING</p>
                               <div className="flex items-center gap-3.5 text-right font-medium">
                                  <span className="text-3xl font-medium text-slate-950 tabular-nums leading-none tracking-tighter text-right underline decoration-slate-950/10 underline-offset-4">{calculateTrustScore(tutor)}%</span>
                                  <div className="w-20 h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner text-left group-hover:border-indigo-100 transition-colors">
                                     <motion.div initial={{ width: 0 }} animate={{ width: `${calculateTrustScore(tutor)}%` }} className="h-full bg-indigo-600 shadow-4xl filter drop-shadow-glow" />
                                  </div>
                                </div>
                            </div>
                            <div className="h-12 w-px bg-slate-100 hidden md:block" />
                            <div className="flex gap-3 text-right">
                               <button 
                                 onClick={() => handleAuditSpec(tutor)}
                                 className="px-6 py-4 bg-slate-950 hover:bg-indigo-600 text-white font-medium text-sm uppercase tracking-widest rounded-2xl shadow-4xl transition-all flex items-center gap-3 active:scale-95 group/btn text-center border border-white/5"
                               >
                                  <Terminal size={16} className="group-hover/btn:rotate-12 transition-transform text-center shadow-glow" /> AUDIT_ROOT
                                </button>
                               <button onClick={() => moderateTutor(tutor._id, 'approved')} className="w-12 h-12 rounded-2xl bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-50 transition-all flex items-center justify-center shadow-4xl group text-center active:scale-95 border border-emerald-100">
                                  <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform text-center shadow-glow-emerald" />
                               </button>
                               <button onClick={() => moderateTutor(tutor._id, 'rejected')} className="w-12 h-12 rounded-2xl bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-50 transition-all flex items-center justify-center shadow-4xl group text-center active:scale-95 border border-rose-100">
                                  <X size={24} className="group-hover:rotate-90 transition-transform text-center filter drop-shadow-glow-rose" />
                               </button>
                            </div>
                         </div>
                      </div>
                   </motion.div>
                ))}
             </AnimatePresence>

             {pendingTutors.length === 0 && (
                <div className="py-32 text-center border-2 border-dashed border-slate-100 bg-slate-50/20 rounded-3xl opacity-60 flex flex-col items-center gap-8 shadow-inner text-center">
                   <div className="p-8 bg-white rounded-2xl shadow-4xl border border-slate-50 text-center">
                      <BadgeCheck size={64} className="text-slate-100 text-center animate-pulse" />
                   </div>
                   <p className="text-sm font-medium uppercase tracking-normal text-slate-300 text-center">ALL MASTERS SYNCHRONIZED • BUREAU MANIFEST VACANT</p>
                </div>
             )}
          </div>
        </motion.div>

        {/* Audit Intelligence Command Modal UI Architecture Display Matrix protocol display logic */}
        <AnimatePresence>
           {showAuditSpecs && selectedTutor && (
             <div className="fixed inset-0 z-[10001] flex items-center justify-center p-6 md:p-8">
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowAuditSpecs(false)}
                  className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" 
                />

                <motion.div 
                   initial={{ scale: 0.98, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 0.98, opacity: 0 }}
                   className="relative w-full max-w-6xl bg-white border border-slate-100 rounded-3xl shadow-4xl overflow-hidden flex flex-col max-h-[92vh] z-10 text-left"
                >
                   {/* Modal Header Command Terminal Interface Display protocol  */}
                   <div className="p-8 md:p-10 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-3xl relative z-20 text-left">
                      <div className="flex items-center gap-6 text-left">
                         <div className="p-4 bg-indigo-600 rounded-2xl shadow-4xl relative overflow-hidden group text-center border border-white/10">
                            <Fingerprint size={28} className="text-white group-hover:scale-110 transition-transform text-center shadow-glow" />
                            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full duration-[2000ms] transition-transform text-right" />
                         </div>
                         <div className="text-left">
                            <h3 className="text-2xl font-medium uppercase tracking-tighter text-slate-950 mb-1 leading-none text-left underline decoration-indigo-50/20 underline-offset-4">{selectedTutor.userId?.username?.toUpperCase()}</h3>
                            <div className="flex items-center gap-3 text-left">
                               <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-glow text-left" />
                               <p className="text-sm font-medium text-slate-300 uppercase tracking-widest leading-none text-left">AUDIT_SEQUENCE ::_{selectedTutor._id.slice(-6).toUpperCase()} ACTIVE</p>
                            </div>
                         </div>
                      </div>
                      <button onClick={() => setShowAuditSpecs(false)} className="p-4 bg-slate-50 hover:bg-rose-500 text-slate-200 hover:text-white rounded-2xl transition-all shadow-inner group text-center active:scale-95 border border-slate-100">
                         <X size={24} className="group-hover:rotate-90 transition-transform text-center" />
                      </button>
                   </div>

                   {/* Audit Scrollable Terminal Container UI Display Matrix logic protocol */}
                   <div className="flex-1 overflow-y-auto no-scrollbar p-8 md:p-14 space-y-12 scroll-smooth bg-slate-50/20 text-left">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left items-start">
                         {/* Artifact Manifest Sub-Sector Architecture display protocol */}
                         <div className="lg:col-span-7 space-y-10 text-left">
                            <div className="space-y-5 text-left">
                               <h5 className="text-sm font-medium uppercase tracking-widest text-slate-200 px-2 text-left">EVIDENCE_MANIFEST_PROTOCOL</h5>
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                                  <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-4xl hover:bg-slate-50 transition-all duration-[1000ms] group/item text-left cursor-pointer">
                                     <div className="flex items-center gap-4 mb-6 text-left">
                                        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-50 text-indigo-600 group-hover/item:bg-slate-950 group-hover/item:text-white transition-all shadow-inner text-center shrink-0">
                                           <FileText size={20} className="text-center" />
                                        </div>
                                        <h6 className="font-black text-base uppercase tracking-tight text-slate-950 leading-none text-left">NIC_ARTIFACT</h6>
                                     </div>
                                     <p className="text-xs text-slate-300 font-medium uppercase tracking-widest mb-6 px-0 leading-none text-left">STATUS: SECURE</p>
                                     <button className="w-full py-4 bg-slate-950 text-white rounded-xl text-sm font-medium uppercase tracking-widest shadow-4xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 text-center border border-white/5 active:scale-95">
                                        VIEW_AUDIT_PROTOCOL <ArrowUpRight size={14} className="text-center" />
                                     </button>
                                  </div>
                                  <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-4xl hover:bg-slate-50 transition-all duration-[1000ms] group/item text-left cursor-pointer">
                                     <div className="flex items-center gap-4 mb-6 text-left">
                                        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-50 text-indigo-600 group-hover/item:bg-slate-950 group-hover/item:text-white transition-all shadow-inner text-center shrink-0">
                                           <GraduationCap size={20} className="text-center" />
                                        </div>
                                        <h6 className="font-black text-base uppercase tracking-tight text-slate-950 leading-none text-left">SCHOLASTIC_ARTIFACT</h6>
                                     </div>
                                     <p className="text-xs text-slate-300 font-medium uppercase tracking-widest mb-6 px-0 leading-none text-left">DOMAIN: {selectedTutor.subjects?.[0]?.toUpperCase() || 'GENERAL_SECTOR_ROOT'}</p>
                                     <button className="w-full py-4 bg-slate-950 text-white rounded-xl text-sm font-medium uppercase tracking-widest shadow-4xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 text-center border border-white/5 active:scale-95">
                                        AUDIT_SYLLABI <Binary size={14} className="text-center" />
                                     </button>
                                  </div>
                               </div>
                            </div>

                            <div className="space-y-5 text-left">
                               <h5 className="text-sm font-medium uppercase tracking-widest text-slate-200 px-2 text-left">PROVISIONING_PIPELINE_STATUS</h5>
                               <div className="space-y-3.5 text-left">
                                  {[
                                    { step: 'Identity Protocol Initiated ', time: '24H_CYCLE_AGO', status: 'PASS' },
                                    { step: 'Scholastic Evidence Provisioned IX', time: '18H_CYCLE_AGO', status: 'PASS' },
                                    { step: 'Neuro-Trust Verification ACTIVE', time: 'SYNC', status: 'SYNC', pulse: true },
                                    { step: 'Master Node Authorization SAFE', time: 'LOCKED_WAITING', status: 'WAITING' }
                                  ].map((s, i) => (
                                    <div key={i} className="flex items-center gap-5 p-5 bg-white border border-slate-100 rounded-2xl shadow-4xl text-left hover:border-indigo-100 transition-colors">
                                       <div className={cn(
                                          "w-2 h-2 rounded-full shadow-glow relative text-left",
                                          s.status === 'PASS' ? "bg-emerald-500 shadow-glow-emerald" : s.status === 'SYNC' ? "bg-indigo-500 shadow-glow" : "bg-slate-100 shadow-none",
                                          s.pulse && "animate-pulse"
                                       )} />
                                       <div className="flex-1 flex justify-between items-center text-left">
                                          <p className="text-sm font-medium uppercase tracking-widest text-slate-950 leading-none text-left">{s.step?.toUpperCase()}</p>
                                          <span className="text-xs font-medium uppercase tracking-widest text-slate-200 text-right tabular-nums">{s.time}</span>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>

                         {/* Trust Metrics Analytics Command Section UI Matrix Display central logic protocol */}
                         <div className="lg:col-span-5 space-y-10 text-left">
                            <div className="bg-indigo-600 rounded-3xl p-10 text-white shadow-4xl relative overflow-hidden group text-center cursor-default border border-white/10">
                               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-[2000ms] text-right pointer-events-none"><Zap size={140} /></div>
                               <div className="relative z-10 space-y-8 text-center">
                                  <div className="text-center">
                                     <p className="text-sm font-medium uppercase tracking-widest mb-3 opacity-60 text-center font-medium">TRUST_INDEX_COMMAND</p>
                                     <h4 className="text-8xl font-medium tracking-tighter tabular-nums leading-none text-center filter drop-shadow-glow">{calculateTrustScore(selectedTutor)}<span className="text-2xl ml-1 text-center">%</span></h4>
                                  </div>
                                  <div className="p-6 bg-white/5 backdrop-blur-3xl rounded-2xl border border-white/5 shadow-inner text-center border border-white/10 group-hover:bg-white/10 transition-colors duration-700">
                                     <p className="text-sm font-bold opacity-80 uppercase tracking-widest leading-relaxed text-center">
                                        Candidate passed the <span className="text-white underline decoration-white/20 underline-offset-4">Accreditation Threshold</span> matrix. Nodes synchronized as per <span className="text-white border-b border-white/20">Protocol_</span>.
                                     </p>
                                  </div>
                               </div>
                            </div>

                            <div className="space-y-6 px-1 text-left">
                               <h5 className="text-sm font-medium uppercase tracking-widest text-slate-200 text-left">SPECTRUM_ANALYSIS_MAPPING</h5>
                               <div className="space-y-6 text-left">
                                  {[
                                     { label: 'PEDAGOGICAL_REACH', val: 78, color: 'bg-indigo-500 shadow-glow' },
                                     { label: 'CONTENT_ACCURACY', val: 92, color: 'bg-indigo-600 shadow-glow' },
                                     { label: 'NETWORK_ENGAGEMENT_SAFE', val: 84, color: 'bg-slate-950 shadow-none' }
                                  ].map((stat, i) => (
                                    <div key={i} className="space-y-3 text-left">
                                       <div className="flex justify-between text-xs font-medium uppercase tracking-widest text-slate-300 text-left">
                                          <span className="text-left">{stat.label} node</span>
                                          <span className="text-slate-950 text-right tabular-nums underline underline-offset-2 decoration-slate-950/10">{stat.val}%</span>
                                       </div>
                                       <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner text-left group-hover:border-indigo-100 transition-colors">
                                          <motion.div initial={{ width: 0 }} animate={{ width: `${stat.val}%` }} className={cn("h-full rounded-full transition-all duration-[2000ms]", stat.color)} />
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Modal Footer Command Controls terminal display logic protocol display */}
                   <div className="p-8 md:p-10 border-t border-slate-50 bg-white/80 backdrop-blur-3xl flex flex-col md:flex-row justify-between items-center gap-10 relative z-30 shadow-inner text-left">
                      <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-slate-200 text-left">
                         <Signal size={16} className="text-indigo-600 text-left animate-pulse shadow-glow" /> USER RATING: ABSOLUTE :: INFRASTRUCTURE_SHA-512 SECURED
                      </div>
                      <div className="flex gap-6 text-right font-medium">
                         <button onClick={() => setShowAuditSpecs(false)} className="px-8 py-4 text-sm font-medium uppercase tracking-widest text-slate-300 hover:text-slate-950 transition-all text-center active:scale-95">DISMISS_AUDIT</button>
                         <button 
                            onClick={() => {
                               moderateTutor(selectedTutor._id, 'approved');
                               setShowAuditSpecs(false);
                            }}
                             className="px-10 py-5 bg-slate-950 hover:bg-emerald-600 text-white font-medium text-sm uppercase tracking-widest rounded-2xl shadow-4xl transition-all flex items-center gap-4 active:scale-95 group/btn text-center border border-white/5"
                         >
                            EXECUTE_PROVISIONING_ <ArrowRight size={18} className="group-hover/btn:translate-x-1.5 transition-transform text-center shadow-glow" />
                         </button>
                      </div>
                   </div>
                </motion.div>
             </div>
           )}
        </AnimatePresence>

        {/* Global Hub Authority terminal indicator UI Matrix Architecture Display protocol  display */}
        <div className="fixed bottom-10 right-10 group z-50 opacity-40 hover:opacity-100 transition-all duration-1000 text-left">
           <div className="flex items-center gap-10 py-4 px-10 bg-white/60 backdrop-blur-3xl rounded-full border border-blue-50 shadow-4xl cursor-default text-left shadow-glow">
              <div className="relative text-left">
                 <Terminal size={24} className="text-indigo-600 animate-pulse text-left shadow-glow" />
                 <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 text-left" />
              </div>
               <div className="flex flex-col text-left">
                  <p className="text-sm font-medium uppercase tracking-normal text-slate-950 leading-none text-left h-3">ACCREDITATION_BUREAU</p>
                  <div className="flex items-center gap-4 mt-2.5 text-xs font-medium uppercase text-indigo-600 tracking-widest leading-none text-left h-4">
                     <Database size={14} className="text-left" /> Sync: Sovereign :: Bureau Audit Verified Repository
                  </div>
               </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminApprovals;
