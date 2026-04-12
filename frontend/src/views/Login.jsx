import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../controllers/useAuth';
import { LogIn, Mail, Lock, AlertCircle, Loader2, Key, Globe2, Signal, ArrowRight } from 'lucide-react';
import { cn } from '../utils/cn';

const Login = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useOTP, setUseOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  
  const { login, sendOTP, verifyOTP, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      redirectUser();
    } catch (err) {
      // If the error suggests using OTP, auto-switch to OTP mode
      const msg = err.message || '';
      if (msg.includes('OTP') || msg.includes('Incorrect password')) {
        // Keep the error visible but hint at OTP
      }
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      await sendOTP(email);
      setOtpSent(true);
    } catch (err) {}
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      await verifyOTP(email, otp);
      redirectUser();
    } catch (err) {}
  };

  const redirectUser = () => {
    const from = location.state?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] font-sans selection:bg-[#00a8cc]/20 p-6">
      
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="w-full max-w-5xl bg-white rounded-3xl shadow-soft overflow-hidden flex flex-col md:flex-row border border-slate-100"
      >
        {/* Left Side Branding */}
        <div className="md:w-5/12 bg-[#00a8cc] p-12 text-white flex flex-col justify-between hidden md:flex relative overflow-hidden">
           <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
           
           <div className="relative z-10">
              <h2 className="text-3xl font-extrabold tracking-tight mb-4">Welcome back to <br/>Aura Platform.</h2>
              <p className="text-white/80 font-medium leading-relaxed">
                 Access your personalized dashboard, continue your learning streaks, and connect with elite mentors.
              </p>
           </div>
           
           <div className="relative z-10 bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm">
              <div className="flex gap-4">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#00a8cc] font-bold">12k+</div>
                 <div>
                    <h4 className="font-bold">Active Learners</h4>
                    <p className="text-sm text-white/80">Joining sessions daily</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Side Form */}
        <div className="md:w-7/12 p-10 md:p-14">
           
           <div className="mb-10 text-center md:text-left">
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Sign in to your account</h3>
              <p className="text-slate-500 font-medium mt-2">Enter your details below to securely log in.</p>
           </div>

           {error && (
             <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600">
               <AlertCircle size={20} className="shrink-0" />
               <p className="text-sm font-bold">{error}</p>
             </div>
           )}

           <AnimatePresence mode="wait">
             {!useOTP ? (
               <motion.form
                 key="password-login"
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 10 }}
                 onSubmit={handleStandardLogin}
                 className="space-y-5"
               >
                 <div>
                   <label className="text-sm font-bold text-slate-700 block mb-2">Email Address</label>
                   <div className="relative group">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00a8cc] transition-colors" size={20} />
                     <input
                       type="email" required
                       value={email} onChange={(e) => setEmail(e.target.value)}
                       className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00a8cc] focus:bg-white outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                       placeholder="student@school.edu" 
                     />
                   </div>
                 </div>

                 <div>
                   <div className="flex justify-between items-center mb-2">
                     <label className="text-sm font-bold text-slate-700">Password</label>
                     <Link to="/forgot-password" className="text-xs font-bold text-[#00a8cc] hover:underline">Forgot password?</Link>
                   </div>
                   <div className="relative group">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00a8cc] transition-colors" size={20} />
                     <input
                       type="password" required
                       value={password} onChange={(e) => setPassword(e.target.value)}
                       className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00a8cc] focus:bg-white outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                       placeholder="••••••••" 
                     />
                   </div>
                 </div>

                 <button
                   type="submit" disabled={loading}
                   className="w-full py-4 mt-2 bg-slate-900 hover:bg-[#00a8cc] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
                 >
                   {loading ? <Loader2 className="animate-spin" size={20} /> : (
                     <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                   )}
                 </button>
               </motion.form>
             ) : (
               <motion.form
                 key="otp-login"
                 initial={{ opacity: 0, x: 10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -10 }}
                 onSubmit={otpSent ? handleVerifyOTP : handleSendOTP}
                 className="space-y-5"
               >
                 <div>
                   <label className="text-sm font-bold text-slate-700 block mb-2">Email Address</label>
                   <div className="relative group">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00a8cc] transition-colors" size={20} />
                     <input
                       type="email" required disabled={otpSent}
                       value={email} onChange={(e) => setEmail(e.target.value)}
                       className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00a8cc] focus:bg-white outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
                       placeholder="student@school.edu" 
                     />
                   </div>
                 </div>

                 {otpSent && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     <label className="text-sm font-bold text-slate-700 block mb-2">Verification Code</label>
                     <div className="relative group">
                       <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00a8cc] transition-colors" size={20} />
                       <input
                         type="text" required maxLength={6}
                         value={otp} onChange={(e) => setOtp(e.target.value)}
                         className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00a8cc] focus:bg-white outline-none transition-all font-bold text-lg tracking-widest text-slate-800 placeholder:text-slate-300"
                         placeholder="000000" 
                       />
                     </div>
                   </motion.div>
                 )}

                 <button
                   type="submit" disabled={loading}
                   className="w-full py-4 mt-2 bg-[#00a8cc] hover:bg-[#008ba8] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                   {loading ? <Loader2 className="animate-spin" size={20} /> : <>{otpSent ? 'Submit Code' : 'Send Verification Code'}</>}
                 </button>
               </motion.form>
             )}
           </AnimatePresence>

           <div className="relative my-8 text-center">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
             <div className="relative text-xs font-bold text-slate-400 bg-white px-4 inline-block">OR CONTINUE WITH</div>
           </div>

           <div className="grid grid-cols-2 gap-4 mb-8">
             <button
               onClick={handleGoogleLogin} type="button"
               className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-sm text-slate-700"
             >
               <Globe2 className="text-[#ea4335]" size={18} /> Google
             </button>
             <button
               type="button" onClick={() => { setUseOTP(!useOTP); setOtpSent(false); }}
               className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-sm text-slate-700"
             >
               {useOTP ? <><Lock className="text-slate-400" size={18} /> Password</> : <><Signal className="text-[#00a8cc]" size={18} /> Send OTP</>}
             </button>
           </div>

           <p className="text-center text-sm font-medium text-slate-500">
             Don't have an account?{' '}
             <Link to="/register" className="font-bold text-[#00a8cc] hover:underline">Sign up for free</Link>
           </p>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;