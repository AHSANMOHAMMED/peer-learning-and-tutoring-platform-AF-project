import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Users, Check, X, AlertCircle, Info, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useParentLinks } from '../controllers/useParentLinks';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

const ParentLinkManager = () => {
  const navigate = useNavigate();
  const { linkRequests, loading, error, fetchLinkRequests, reviewLinkRequest } = useParentLinks();

  useEffect(() => {
    fetchLinkRequests();
  }, [fetchLinkRequests]);

  const handleReview = async (linkId, approve) => {
    try {
      const res = await reviewLinkRequest(linkId, {
        approve,
        reviewNote: approve ? 'Verified by Admin' : 'Rejected by Admin',
        permissions: {
          viewProgress: true,
          viewGrades: true,
          viewSchedule: true,
          receiveNotifications: true
        }
      });
      if (res.success) {
        toast.success(approve ? 'Link approved' : 'Link rejected');
      }
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  return (
    <Layout userRole="admin">
      <div className="max-w-6xl mx-auto w-full font-sans pb-20">
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Family Link Supervision</h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Review and approve parent-student account linking requests.</p>
           </div>
           <div className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2">
              <ShieldCheck size={18} className="text-amber-600" />
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">{linkRequests.length} Pending Requests</span>
           </div>
        </div>

        {error && (
           <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-start gap-4 mb-8">
              <AlertCircle size={24} className="text-rose-500 shrink-0" />
              <div>
                 <h4 className="font-bold text-rose-800">Error fetching requests</h4>
                 <p className="text-sm text-rose-600">{error}</p>
              </div>
           </div>
        )}

        <div className="grid grid-cols-1 gap-6">
           {loading && linkRequests.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
              </div>
           ) : linkRequests.length > 0 ? (
              linkRequests.map((req, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={req._id} 
                  className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft hover:shadow-xl transition-all group"
                >
                   <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                         <div className="flex -space-x-4">
                            <div className="w-16 h-16 rounded-2xl bg-[#f0f9ff] text-[#00a8cc] flex items-center justify-center border-4 border-white shadow-sm font-black text-xl">
                               {req.parent?.username?.[0]?.toUpperCase() || 'P'}
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-[#fdf2f8] text-[#db2777] flex items-center justify-center border-4 border-white shadow-sm font-black text-xl">
                               {req.student?.username?.[0]?.toUpperCase() || 'S'}
                            </div>
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className="font-black text-slate-800 text-lg uppercase tracking-tight">{req.parent?.username}</span>
                               <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-widest">Parent</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                               <Users size={14} />
                               <span>Requesting link to student: <span className="text-slate-600">{req.student?.username}</span></span>
                            </div>
                            <div className="mt-2 flex items-center gap-3">
                               <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">Role: {req.relationship || 'Guardian'}</span>
                               <span className="text-[10px] font-bold text-slate-400">Date: {new Date(req.createdAt).toLocaleDateString()}</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                         <button 
                           onClick={() => handleReview(req._id, false)}
                           className="px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all flex items-center gap-2"
                         >
                            <X size={18} /> Reject
                         </button>
                         <button 
                           onClick={() => handleReview(req._id, true)}
                           className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-[#00a8cc] shadow-lg shadow-slate-900/10 transition-all flex items-center gap-2"
                         >
                            <Check size={18} /> Approve Link
                         </button>
                      </div>
                   </div>

                   <div className="mt-8 pt-8 border-t border-slate-50 flex items-start gap-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                         <Info size={18} />
                      </div>
                      <p className="text-xs font-medium text-slate-500 leading-relaxed">
                         Approving this link will grant the parent account permission to view the student's academic progress, 
                         grades, and upcoming session schedule. The student has already initiated or consented to this request.
                      </p>
                   </div>
                </motion.div>
              ))
           ) : (
              <div className="bg-white rounded-3xl p-16 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                    <Users size={40} />
                 </div>
                 <h3 className="text-xl font-black text-slate-800 mb-2">No pending link requests</h3>
                 <p className="text-slate-400 font-medium max-w-sm">All family supervision requests have been processed. New requests will appear here for review.</p>
              </div>
           )}
        </div>
      </div>
    </Layout>
  );
};

export default ParentLinkManager;
