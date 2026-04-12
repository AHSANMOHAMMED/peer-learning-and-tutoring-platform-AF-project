import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  MapPin, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  User,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../controllers/useAuth';
import api from '../services/api';
import { cn } from '../utils/cn';

const ProfileSetup = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    grade: '',
    stream: '',
    district: '',
    role: 'student'
  });

  const DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  const STREAMS = ['Combined Maths', 'Biology', 'Commerce', 'Arts', 'Tech', 'O/L', 'Other'];
  const GRADES = ['6', '7', '8', '9', '10', '11', '12', '13'];

  // Check if profile is already complete
  useEffect(() => {
    if (user && user.grade && user.district) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
    if (!form.grade || !form.district || (parseInt(form.grade) >= 11 && !form.stream)) {
      toast.error('Please complete all selection fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/auth/profile', {
        grade: form.grade,
        stream: form.stream || 'Other',
        district: form.district,
        role: form.role
      });

      if (response.data.success) {
        toast.success('Profile setup complete!');
        await refreshUser();
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#00a8cc]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-24 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-premium overflow-hidden z-10"
      >
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-[#00a8cc] text-white rounded-2xl shadow-lg shadow-[#00a8cc]/20">
                <Sparkles size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Complete Profile</h1>
            </div>
            <p className="text-slate-500 font-medium">Hello {user?.profile?.firstName || user?.username}! Please provide a few more details to customize your learning environment.</p>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2 mb-10">
             {[1, 2, 3].map((s) => (
                <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= s ? "bg-[#00a8cc]" : "bg-slate-100")} />
             ))}
          </div>

          {/* Steps */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-6 flex items-center gap-2">
                      <GraduationCap size={14} /> Select Your Grade Level
                   </label>
                   <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                      {GRADES.map((g) => (
                        <button
                          key={g}
                          onClick={() => setForm({...form, grade: g})}
                          className={cn(
                            "h-12 rounded-xl font-bold transition-all border",
                            form.grade === g 
                              ? "bg-slate-900 text-white border-slate-900 shadow-lg scale-105" 
                              : "bg-white text-slate-500 border-slate-100 hover:border-[#00a8cc]"
                          )}
                        >
                          {g}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="flex justify-end pt-6">
                   <button 
                    disabled={!form.grade}
                    onClick={nextStep}
                    className="group bg-[#00a8cc] hover:bg-[#008ba8] disabled:opacity-50 text-white py-4 px-8 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#00a8cc]/20 active:scale-95"
                   >
                     Continue <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                      <MapPin size={14} /> Your District
                   </label>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {DISTRICTS.map((d) => (
                        <button
                          key={d}
                          onClick={() => setForm({...form, district: d})}
                          className={cn(
                            "p-4 rounded-2xl text-left font-bold border transition-all flex items-center justify-between",
                            form.district === d 
                              ? "bg-[#00a8cc]/5 border-[#00a8cc] text-[#00a8cc]" 
                              : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                          )}
                        >
                          {d}
                          {form.district === d && <CheckCircle2 size={18} />}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="flex justify-between pt-6">
                   <button onClick={prevStep} className="text-slate-400 font-bold hover:text-slate-600 transition-colors">Go Back</button>
                   <button 
                    disabled={!form.district}
                    onClick={nextStep}
                    className="group bg-[#00a8cc] hover:bg-[#008ba8] disabled:opacity-50 text-white py-4 px-8 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#00a8cc]/20"
                   >
                     Next Step <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                      <BookOpen size={14} /> Academic Stream
                   </label>
                   <p className="text-sm text-slate-400 mb-6">Required for O/L and A/L students to provide specialized content.</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {STREAMS.map((s) => (
                        <button
                          key={s}
                          onClick={() => setForm({...form, stream: s})}
                          className={cn(
                            "p-4 rounded-2xl text-left font-bold border transition-all flex items-center justify-between",
                            form.stream === s 
                              ? "bg-slate-900 border-slate-900 text-white shadow-soft" 
                              : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                          )}
                        >
                          {s}
                          {form.stream === s && <CheckCircle2 size={18} />}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="flex justify-between pt-6">
                   <button onClick={prevStep} className="text-slate-400 font-bold hover:text-slate-600 transition-colors">Go Back</button>
                   <button 
                    disabled={!form.stream && parseInt(form.grade) >= 11}
                    onClick={handleSubmit}
                    className="group bg-[#00a8cc] hover:bg-[#008ba8] disabled:opacity-50 text-white py-4 px-10 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#00a8cc]/20"
                   >
                     {loading ? "Saving Profile..." : "Complete Setup"} 
                     {!loading && <CheckCircle2 size={20} />}
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social Proof Footer */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between opacity-60">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <ShieldCheck size={14} /> End-to-End Encrypted Selection
             </div>
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                   <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                ))}
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;
