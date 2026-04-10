import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  ArrowRight,
  ShieldOff,
  CheckCircle2,
  XCircle,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../controllers/useAuth';
import { useMaterials } from '../controllers/useMaterials';
import { useTutors } from '../controllers/useTutors';
import { cn } from '../utils/cn';

const ModerationHub: React.FC = () => {
  const navigate = useNavigate();
  const { tutors, fetchTutors, moderateTutor } = useTutors();
  const { materials, fetchMaterials, moderateMaterial } = useMaterials();
  const [filterType, setFilterType] = useState<'tutors' | 'materials'>('tutors');

  useEffect(() => {
    fetchTutors();
    fetchMaterials();
  }, [fetchTutors, fetchMaterials]);

  const pendingTutors = tutors.filter(t => t.verificationStatus === 'pending');
  const pendingMaterials = materials.filter(m => m.moderationStatus === 'pending');

  return (
    <Layout userRole="admin">
      <div className="min-h-screen space-y-8 p-4 md:p-8 bg-gray-50/50 dark:bg-gray-950/50">
        <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
                    <ShieldCheck className="text-teal-400" size={32} />
                  </div>
                  <span className="text-xs font-black tracking-[0.4em] uppercase text-slate-400">Security & Integrity Base</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 leading-tight">
                  Moderation <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-white underline decoration-white/30 underline-offset-8">Sentinel.</span>
                </h1>
                <p className="text-slate-400 text-lg font-medium leading-relaxed">
                  Platform oversight and policy enforcement module for the Sri Lankan educational ecosystem. Verify nodes for high-fidelity peer learning.
                </p>
             </div>
             <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
                <button 
                  onClick={() => setFilterType('tutors')}
                  className={cn(
                    "px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                    filterType === 'tutors' ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" : "text-slate-400 hover:text-white"
                  )}
                >
                  Tutors ({pendingTutors.length})
                </button>
                <button 
                   onClick={() => setFilterType('materials')}
                   className={cn(
                     "px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                     filterType === 'materials' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-white"
                   )}
                >
                  Materials ({pendingMaterials.length})
                </button>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
           <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white uppercase flex items-center gap-3">
                   {filterType === 'tutors' ? <Users className="text-teal-500" size={32} /> : <BookOpen className="text-indigo-600" size={32} />}
                   {filterType === 'tutors' ? 'Node Verification Queue' : 'Asset Moderation Stack'}
                 </h3>
              </div>

              <div className="space-y-4">
                 {filterType === 'tutors' ? pendingTutors.map((tutor, i) => (
                   <div key={i} className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-teal-500/30 transition-all">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-3xl bg-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-teal-500/20">
                            {(tutor.userId as any)?.username?.[0] || 'T'}
                         </div>
                         <div>
                            <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{(tutor.userId as any)?.username}</h4>
                            <p className="text-sm font-medium text-gray-500">{tutor.alStream} • {tutor.hourlyRate} LKR/hr</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <button 
                           onClick={() => moderateTutor(tutor._id, 'rejected')}
                           className="p-4 rounded-2xl bg-white dark:bg-gray-800 text-red-500 border border-red-100 dark:border-red-900/30 hover:bg-red-500 hover:text-white transition-all"
                         >
                            <XCircle size={20} />
                         </button>
                         <button 
                           onClick={() => moderateTutor(tutor._id, 'approved')}
                           className="p-4 rounded-2xl bg-white dark:bg-gray-800 text-teal-600 border border-teal-100 dark:border-teal-900/30 hover:bg-teal-600 hover:text-white transition-all"
                         >
                            <CheckCircle2 size={20} />
                         </button>
                         <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
                           Deep Audit <ArrowRight size={14} />
                         </button>
                      </div>
                   </div>
                 )) : pendingMaterials.map((mat, i) => (
                   <div key={i} className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-indigo-500/30 transition-all">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-indigo-600/20">
                            {mat.fileType?.[0].toUpperCase() || 'P'}
                         </div>
                         <div>
                            <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{mat.title}</h4>
                            <p className="text-sm font-medium text-gray-500">{mat.subject} • {mat.grade}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <button 
                           onClick={() => moderateMaterial(mat._id, 'rejected')}
                           className="p-4 rounded-2xl bg-white dark:bg-gray-800 text-red-500 border border-red-100 dark:border-red-900/30 hover:bg-red-500 hover:text-white transition-all"
                         >
                            <XCircle size={20} />
                         </button>
                         <button 
                           onClick={() => moderateMaterial(mat._id, 'approved')}
                           className="p-4 rounded-2xl bg-white dark:bg-gray-800 text-teal-600 border border-teal-100 dark:border-teal-900/30 hover:bg-teal-600 hover:text-white transition-all"
                         >
                            <CheckCircle2 size={20} />
                         </button>
                         <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-black transition-all shadow-xl flex items-center gap-2">
                           Review Source <ArrowRight size={14} />
                         </button>
                      </div>
                   </div>
                 ))}

                 {((filterType === 'tutors' && pendingTutors.length === 0) || (filterType === 'materials' && pendingMaterials.length === 0)) && (
                   <div className="py-24 text-center">
                      <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center text-gray-300 mx-auto mb-6">
                        <ShieldOff size={40} />
                      </div>
                      <h4 className="text-Lg font-black text-gray-400 uppercase tracking-widest">Clean Status: All {filterType} Verified</h4>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default ModerationHub;
