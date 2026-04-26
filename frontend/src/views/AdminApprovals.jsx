import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Eye,
  FileText,
  BadgeCheck,
  Ban,
  Archive,
  Activity,
  AlertTriangle
} from 'lucide-react';
import Layout from '../components/Layout';
import { useTutors } from '../controllers/useTutors';
import { cn } from '../utils/cn';
import { toast } from 'react-hot-toast';

const AdminApprovals = () => {
  const { tutors, fetchAllTutors, moderateTutor } = useTutors();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTutor, setSelectedTutor] = useState(null);

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

  const calculateTrustScore = (tutor) => {
    let score = 70; 
    if (tutor.bio?.length > 100) score += 10;
    if (tutor.education?.some(e => e.includes('University'))) score += 15;
    if (tutor.experience?.length > 2) score += 5;
    return Math.min(100, score);
  };

  const handleAction = async (tutorId, action) => {
    try {
      await moderateTutor(tutorId, action);
      toast.success(`Application has been ${action}.`);
      setSelectedTutor(null);
    } catch (err) {
      toast.error(`Failed to process application.`);
    }
  };

  return (
    <Layout userRole="admin">
      <div className="min-h-screen bg-[#fafafc] pb-12 w-full font-sans">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">Tutor Applications</h1>
              <p className="text-slate-500 font-medium mt-2">Review, trust-verify, and approve incoming tutor registration requests.</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input
                   type="text"
                   placeholder="Search applications..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm w-64 md:w-80 transition-all font-medium text-slate-700"
                 />
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Main Application Queue */}
            <div className="xl:col-span-8 flex flex-col gap-6">
               <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex-1">
                  <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                     <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                       <ShieldCheck className="text-indigo-500" /> Pending Queue
                     </h3>
                     <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 font-bold text-xs uppercase tracking-widest rounded-lg">
                       {pendingTutors.length} Total
                     </span>
                  </div>

                  <AnimatePresence>
                     {pendingTutors.map((tutor) => (
                       <motion.div 
                          key={tutor._id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => setSelectedTutor(tutor)}
                          className={cn(
                            "group p-6 rounded-2xl border transition-all cursor-pointer mb-4",
                            selectedTutor?._id === tutor._id 
                              ? "bg-indigo-50/50 border-indigo-200 shadow-md" 
                              : "bg-white border-slate-100 hover:border-indigo-100 hover:shadow-sm"
                          )}
                       >
                          <div className="flex items-center justify-between gap-6">
                             <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-lg shadow-sm">
                                   {tutor.userId?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                   <div className="flex items-center gap-3 mb-1">
                                      <h4 className="text-lg font-bold text-slate-800">{tutor.userId?.username}</h4>
                                      {tutor.verificationStatus === 'rejected' && <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-bold rounded-lg uppercase">Denied</span>}
                                   </div>
                                   <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                                      {tutor.userId?.email} • <MapPin size={12}/> {tutor.location || 'Local'}
                                   </p>
                                </div>
                             </div>
                             <div className="hidden md:flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                   Trust Score: <span className="text-indigo-600">{calculateTrustScore(tutor)}%</span>
                                </div>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                   <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${calculateTrustScore(tutor)}%` }} />
                                </div>
                             </div>
                          </div>
                       </motion.div>
                     ))}
                  </AnimatePresence>

                  {pendingTutors.length === 0 && (
                     <div className="py-24 text-center">
                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                           <BadgeCheck size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No Pending Applications</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Profile Review Sidebar */}
            <div className="xl:col-span-4 h-full">
               <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm h-full sticky top-8">
                  {!selectedTutor ? (
                     <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center opacity-50">
                        <FileText size={48} className="text-slate-300 mb-4" />
                        <p className="text-slate-500 font-bold">Select an application to review details</p>
                     </div>
                  ) : (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                        <div className="text-center mb-8">
                           <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto flex items-center justify-center text-2xl font-black text-slate-600 mb-4 shadow-sm border border-slate-200">
                              {selectedTutor.userId?.username?.[0]?.toUpperCase()}
                           </div>
                           <h3 className="text-2xl font-black text-slate-800">{selectedTutor.userId?.username}</h3>
                           <p className="text-slate-500 font-medium">{selectedTutor.userId?.email}</p>
                        </div>

                        <div className="space-y-6 flex-1">
                           <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Professional Bio</p>
                              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                 {selectedTutor.bio || 'No bio provided.'}
                              </p>
                           </div>

                           <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Academic Snapshot</p>
                              <div className="space-y-2">
                                 <div className="flex justify-between items-center text-sm font-medium text-slate-700">
                                    <span>Stream</span>
                                    <span className="font-bold text-indigo-600">{selectedTutor.alStream || 'General'}</span>
                                 </div>
                                 <div className="flex justify-between items-center text-sm font-medium text-slate-700">
                                    <span>Base Rate</span>
                                    <span className="font-bold">LKR {selectedTutor.hourlyRate || '0'}/hr</span>
                                 </div>
                              </div>
                           </div>
                           
                           {/* Trust Engine Output */}
                           <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Trust Analysis Engine</p>
                              <div className="flex items-center gap-4 mb-2">
                                 <Activity className="text-indigo-500" size={24} />
                                 <div className="flex-1 w-full bg-white rounded-full h-3 overflow-hidden border border-indigo-100">
                                    <div className="h-full bg-indigo-500" style={{ width: `${calculateTrustScore(selectedTutor)}%`}} />
                                 </div>
                                 <span className="font-bold text-indigo-700">{calculateTrustScore(selectedTutor)}%</span>
                              </div>
                              <p className="text-[11px] font-bold text-indigo-600/70 leading-relaxed mt-2 uppercase">
                                 Candidate profile analytics complete. Academic rigor assessed.
                              </p>
                           </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex gap-3">
                           <button 
                             onClick={() => handleAction(selectedTutor._id, 'rejected')}
                             className="flex-1 py-4 bg-white border-2 border-rose-100 text-rose-500 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
                           >
                              <Ban size={16} /> Decline
                           </button>
                           <button 
                             onClick={() => handleAction(selectedTutor._id, 'approved')}
                             className="flex-1 py-4 bg-slate-900 border-2 border-slate-900 text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                           >
                              <CheckCircle2 size={16} /> Approve
                           </button>
                        </div>
                     </motion.div>
                  )}
               </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminApprovals;
