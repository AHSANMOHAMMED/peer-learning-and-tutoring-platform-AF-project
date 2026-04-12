import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../controllers/useAuth';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, ArrowRight, ShieldCheck, Key } from 'lucide-react';
import { cn } from '../utils/cn';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student',
    profile: {
      firstName: '',
      lastName: ''
    }
  });
  const [otp, setOtp] = useState('');
  
  const { register, verifyOTP, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      setStep(2);
    } catch (err) {}
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      await verifyOTP(formData.email, otp, 'verify');
      navigate('/dashboard');
    } catch (err) {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] font-sans selection:bg-[#00a8cc]/20 p-6 py-12">
      
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="w-full max-w-5xl bg-white rounded-3xl shadow-soft overflow-hidden flex flex-col md:flex-row border border-slate-100"
      >
        {/* Left Side Branding */}
        <div className="md:w-5/12 bg-[#2b2d42] p-12 text-white flex flex-col justify-between hidden md:flex relative overflow-hidden">
           <div className="absolute bottom-[-10%] left-[-20%] w-[400px] h-[400px] bg-[#00a8cc]/20 rounded-full blur-3xl pointer-events-none" />
           
           <div className="relative z-10">
              <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-white">Join the Aura <br/>Network Today.</h2>
              <p className="text-white/70 font-medium leading-relaxed">
                 Create your free account to track your academic progress, join expert tutoring sessions, and unlock premium practice materials.
              </p>
           </div>
           
           <div className="relative z-10 space-y-4">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                 <h4 className="font-bold text-white mb-1 flex items-center gap-2"><ShieldCheck size={18} className="text-[#00a8cc]"/> Secure Environment</h4>
                 <p className="text-sm text-white/50">Your data is fully encrypted and securely vetted against academic standards.</p>
              </div>
           </div>
        </div>

        {/* Right Side Form */}
        <div className="md:w-7/12 p-10 md:p-14">
           
           <div className="mb-8 text-center md:text-left">
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                 {step === 1 ? 'Create an account' : 'Verify Email'}
              </h3>
              <p className="text-slate-500 font-medium mt-2">
                 {step === 1 ? 'Fill in your details below to get started.' : 'We sent a verification code to your email.'}
              </p>
           </div>

           {error && (
             <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600">
               <AlertCircle size={20} className="shrink-0" />
               <p className="text-sm font-bold">{error}</p>
             </div>
           )}

           <AnimatePresence mode="wait">
             {step === 1 ? (
               <motion.form
                 key="register-step-1"
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 10 }}
                 onSubmit={handleInitialSubmit}
                 className="space-y-5"
               >
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">First Name</label>
                       <input
                         type="text" required name="profile.firstName" value={formData.profile.firstName} onChange={handleChange}
                         className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00a8cc] focus:bg-white outline-none transition-all font-medium text-slate-800"
                         placeholder="John" 
                       />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Last Name</label>
                       <input
                         type="text" required name="profile.lastName" value={formData.profile.lastName} onChange={handleChange}
                         className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00a8cc] focus:bg-white outline-none transition-all font-medium text-slate-800"
                         placeholder="Doe" 
                       />
                    </div>
                 </div>

                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Username</label>
                   <div className="relative group">
                     <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00a8cc] transition-colors" size={18} />
                     <input
                       type="text" required name="username" value={formData.username} onChange={handleChange}
                       className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00a8cc] focus:bg-white outline-none transition-all font-medium text-slate-800"
                       placeholder="john_doe_99" 
                     />
                   </div>
                 </div>

                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Email Address</label>
                   <div className="relative group">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00a8cc] transition-colors" size={18} />
                     <input
                       type="email" required name="email" value={formData.email} onChange={handleChange}
                       className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00a8cc] focus:bg-white outline-none transition-all font-medium text-slate-800"
                       placeholder="johndoe@example.com" 
                     />
                   </div>
                 </div>

                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Password</label>
                   <div className="relative group">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00a8cc] transition-colors" size={18} />
                     <input
                       type="password" required name="password" value={formData.password} onChange={handleChange}
                       className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00a8cc] focus:bg-white outline-none transition-all font-medium text-slate-800"
                       placeholder="••••••••" 
                     />
                   </div>
                 </div>

                 <div className="pt-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">I am a</label>
                   <div className="grid grid-cols-3 gap-3">
                     {['student', 'tutor', 'parent'].map((role) => (
                       <button
                         key={role} type="button" onClick={() => setFormData({...formData, role})}
                         className={cn(
                           "py-3 rounded-xl border font-bold text-sm capitalize transition-colors",
                           formData.role === role 
                             ? 'border-[#00a8cc] bg-blue-50 text-[#00a8cc]' 
                             : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                         )}
                       >
                         {role}
                       </button>
                     ))}
                   </div>
                 </div>

                 {formData.role === 'student' && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Grade</label>
                       <select
                         name="grade" required value={formData.grade} onChange={handleChange}
                         className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00a8cc] focus:bg-white outline-none transition-all font-medium text-slate-800 appearance-none"
                       >
                         <option value="">Select Grade</option>
                         {[6,7,8,9,10,11].map(g => <option key={g} value={`Grade ${g}`}>Grade {g}</option>)}
                         <option value="A/L">A/L</option>
                         <option value="University">University</option>
                       </select>
                     </div>
                     <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Stream</label>
                       <select
                         name="stream" required value={formData.stream} onChange={handleChange}
                         className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00a8cc] focus:bg-white outline-none transition-all font-medium text-slate-800 appearance-none"
                       >
                         <option value="">Select Stream</option>
                         <option value="O/L">O/L (General)</option>
                         <option value="Maths">Maths</option>
                         <option value="Science">Science</option>
                         <option value="Arts">Arts</option>
                         <option value="Commerce">Commerce</option>
                         <option value="Tech">Technology</option>
                       </select>
                     </div>
                   </motion.div>
                 )}

                 <button
                   type="submit" disabled={loading}
                   className="w-full py-4 mt-6 bg-slate-900 hover:bg-[#00a8cc] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
                 >
                   {loading ? <Loader2 className="animate-spin" size={20} /> : (
                     <>Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                   )}
                 </button>
               </motion.form>
             ) : (
               <motion.form
                 key="register-step-2"
                 initial={{ opacity: 0, x: 10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -10 }}
                 onSubmit={handleVerifyOTP}
                 className="space-y-6 pt-4"
               >
                 <div>
                   <label className="text-sm font-bold text-slate-700 block mb-2 text-center">Verification Code</label>
                   <div className="relative group max-w-sm mx-auto">
                     <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00a8cc] transition-colors" size={20} />
                     <input
                       type="text" required maxLength={6}
                       value={otp} onChange={(e) => setOtp(e.target.value)}
                       className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00a8cc] focus:bg-white outline-none transition-all font-bold tracking-widest text-2xl text-slate-800 text-center"
                       placeholder="000000" 
                     />
                   </div>
                 </div>

                 <div className="max-w-sm mx-auto space-y-4 pt-4">
                    <button
                      type="submit" disabled={loading}
                      className="w-full py-4 bg-[#00a8cc] hover:bg-[#008ba8] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <>Verify & Complete <ShieldCheck size={18} /></>}
                    </button>
                    <button
                      type="button" onClick={() => setStep(1)}
                      className="w-full py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors text-sm"
                    >
                      Go back
                    </button>
                 </div>
               </motion.form>
             )}
           </AnimatePresence>

           {step === 1 && (
              <>
                 <div className="relative my-8 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                    <div className="relative text-xs font-bold text-slate-400 bg-white px-4 inline-block uppercase tracking-widest">Or join with</div>
                 </div>

                 <button
                    type="button"
                    onClick={() => {
                        const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                        window.location.href = `${backendUrl}/api/auth/google?role=${formData.role}`;
                    }}
                    className="w-full py-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-all flex items-center justify-center gap-3 shadow-soft group"
                 >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.91 3.22-2 4.28-1.27 1.27-3.23 2.1-6.32 2.1-5.12 0-9.13-4.13-9.13-9.25s4.01-9.25 9.13-9.25c2.8 0 4.94.98 6.48 2.35l2.32-2.32C18.21 1.03 15.1 0 12.48 0 5.86 0 .3 5.39.3 12s5.56 12 12.18 12c3.58 0 6.28-1.18 8.39-3.4 2.14-2.14 2.82-5.15 2.82-7.58 0-.58-.05-1.13-.15-1.66h-11.06z"/>
                    </svg>
                    Continue with Google
                 </button>
              </>
            )}

           <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center">
             <p className="text-sm font-medium text-slate-500">
               Already have an account?{' '}
               <Link to="/login" className="font-bold text-[#00a8cc] hover:underline">Log in here</Link>
             </p>
           </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Register;