import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  ShieldCheck, 
  Search, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Zap
} from 'lucide-react';
import { useAuth } from '../controllers/useAuth';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const TutorPending = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isRejected = user?.verificationStatus === 'rejected';

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -left-24 w-[30rem] h-[30rem] bg-[#00a8cc]/5 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-white rounded-[3rem] shadow-premium z-10 overflow-hidden"
      >
        <div className="p-10 md:p-14 text-center">
          <div className="flex justify-center mb-8">
            <div className={cn(
              "w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl relative",
              isRejected ? "bg-rose-50 text-rose-600 shadow-rose-200" : "bg-indigo-50 text-indigo-600 shadow-indigo-200"
            )}>
              {isRejected ? <AlertCircle size={48} /> : <Clock size={48} className="animate-pulse" />}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-amber-500">
                <ShieldCheck size={16} />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            {isRejected ? "Application Rejected" : "Review in Progress"}
          </h1>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 border border-slate-200/50">
            <Zap size={10} className="text-amber-500" /> STATUS: {user?.verificationStatus?.toUpperCase() || 'PENDING'}
          </div>

          <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto mb-10">
            {isRejected 
              ? "We're sorry, but your tutor application does not meet our current quality standards or verification requirements. Please contact support for more details." 
              : "Our compliance team is currently reviewing your credentials, teaching history, and academic qualifications. This process usually takes 24-48 business hours."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Search size={16} /></div>
                <h3 className="font-bold text-slate-800 text-sm">Background Check</h3>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Verifying your university degrees and professional certifications.</p>
            </div>
            <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Mail size={16} /></div>
                <h3 className="font-bold text-slate-800 text-sm">Email Updates</h3>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">We'll notify you at {user?.email} as soon as your account is activated.</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-2"
            >
              Check Status Again <CheckCircle2 size={16} />
            </button>
            <button 
              onClick={logout}
              className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Sign Out <ArrowLeft size={16} />
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 opacity-60">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform Integrity Protected by Aura AI</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Helper for conditional classes
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default TutorPending;
