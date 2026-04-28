import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  BookOpen, 
  Award, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  GraduationCap,
  ChevronRight,
  User
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../controllers/useAuth';
import api from '../services/api';
import { cn } from '../utils/cn';

const TutorOnboarding = () => {
  const { user, refreshUser, applyUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    bio: '',
    subjects: [],
    hourlyRate: 2000,
    experience: 1,
    education: [{ institution: '', degree: '', year: new Date().getFullYear() }],
    expertise: [{ stream: 'Combined Mathematics', grades: ['12', '13'] }]
  });

  const STREAMS = [
    'Combined Mathematics', 
    'Biological Sciences', 
    'Commercial Stream', 
    'Physical Sciences', 
    'Arts Stream', 
    'Technology Stream', 
    'O/L General',
    'London A/L'
  ];

  const GRADES = ['6', '7', '8', '9', '10', '11', '12', '13'];

  const handleSubmit = async () => {
    if (!form.bio || form.subjects.length === 0) {
      toast.error('Please fill in your bio and select at least one subject');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/tutors/profile', form);
      const submittedTutor = data?.tutor || data?.data || data;

      if (data?.user) {
        applyUser(data.user);
      } else {
        const refreshedUser = await refreshUser();
        if (refreshedUser?.verificationStatus !== 'pending' && submittedTutor?.verificationStatus === 'pending') {
          applyUser({ ...refreshedUser, verificationStatus: 'pending', isPendingApproval: true });
        }
      }

      toast.success(data?.message || 'Application submitted successfully!');
      navigate('/tutor-pending', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-[#00a8cc]/5 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-white/80 backdrop-blur-xl border border-white rounded-[3rem] shadow-premium z-10 overflow-hidden"
      >
        <div className="p-10 md:p-14">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200">
                <Briefcase size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tutor Application</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Professional Verification Required</p>
              </div>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed">Join our elite network of educators. Complete your profile to begin the background verification process.</p>
          </div>

          <div className="flex gap-3 mb-12">
            {[1, 2, 3].map(s => (
              <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-all duration-700", step >= s ? "bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]" : "bg-slate-100")} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <User size={14} /> Professional Biography
                  </label>
                  <textarea 
                    value={form.bio}
                    onChange={(e) => setForm({...form, bio: e.target.value})}
                    placeholder="Describe your teaching philosophy, experience, and academic background..."
                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-600 min-h-[180px] resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <BookOpen size={14} /> Primary Subjects
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics', 'ICT', 'Accounting', 'English'].map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          const subs = form.subjects.includes(s) 
                            ? form.subjects.filter(x => x !== s) 
                            : [...form.subjects, s];
                          setForm({...form, subjects: subs});
                        }}
                        className={cn(
                          "px-6 py-3 rounded-xl font-bold text-sm transition-all border",
                          form.subjects.includes(s)
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                            : "bg-white text-slate-500 border-slate-100 hover:border-indigo-200"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <button onClick={nextStep} className="group px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                    Next Step <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <DollarSign size={14} /> Hourly Rate (LKR)
                    </label>
                    <input 
                      type="number"
                      value={form.hourlyRate}
                      onChange={(e) => setForm({...form, hourlyRate: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Clock size={14} /> Years Experience
                    </label>
                    <input 
                      type="number"
                      value={form.experience}
                      onChange={(e) => setForm({...form, experience: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <GraduationCap size={14} /> Highest Education
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      placeholder="University / Institution"
                      value={form.education[0].institution}
                      onChange={(e) => {
                        const edu = [...form.education];
                        edu[0].institution = e.target.value;
                        setForm({...form, education: edu});
                      }}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold text-sm"
                    />
                    <input 
                      placeholder="Degree / Qualification"
                      value={form.education[0].degree}
                      onChange={(e) => {
                        const edu = [...form.education];
                        edu[0].degree = e.target.value;
                        setForm({...form, education: edu});
                      }}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button onClick={prevStep} className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">Go Back</button>
                  <button onClick={nextStep} className="group px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                    Next Step <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Zap size={14} /> Expertise Stream
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {STREAMS.map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          const exp = [...form.expertise];
                          exp[0].stream = s;
                          setForm({...form, expertise: exp});
                        }}
                        className={cn(
                          "p-4 rounded-xl text-left font-bold text-xs transition-all border",
                          form.expertise[0].stream === s
                            ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                            : "bg-white text-slate-500 border-slate-100 hover:border-indigo-200"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <ShieldCheck size={14} /> Target Grades
                  </label>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                    {GRADES.map(g => (
                      <button
                        key={g}
                        onClick={() => {
                          const exp = [...form.expertise];
                          const grades = exp[0].grades.includes(g)
                            ? exp[0].grades.filter(x => x !== g)
                            : [...exp[0].grades, g];
                          exp[0].grades = grades;
                          setForm({...form, expertise: exp});
                        }}
                        className={cn(
                          "h-10 rounded-lg font-bold text-xs transition-all border",
                          form.expertise[0].grades.includes(g)
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-500 border-slate-100 hover:border-indigo-200"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button onClick={prevStep} className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">Go Back</button>
                  <button 
                    disabled={loading}
                    onClick={handleSubmit} 
                    className="group px-12 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100"
                  >
                    {loading ? "Submitting..." : "Complete Application"} <CheckCircle2 size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between opacity-50">
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={14} /> Background Check Required
             </div>
             <div className="flex items-center gap-4">
                <Zap size={16} className="text-amber-400" />
                <Award size={16} className="text-indigo-400" />
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TutorOnboarding;
