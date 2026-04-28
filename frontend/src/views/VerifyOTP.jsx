import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../controllers/useAuth';
import { Key, ShieldCheck, Loader2, ArrowRight, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getDefaultRouteForUser } from '../utils/roleRouting';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const { user, verifyOTP, sendOTP, refreshUser, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.isVerified) {
      navigate(getDefaultRouteForUser(user), { replace: true });
    }
  }, [user, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await verifyOTP(user.email, otp, 'verify');
      toast.success('Account verified successfully!');
      const latestUser = await refreshUser();
      navigate(getDefaultRouteForUser(latestUser), { replace: true });
    } catch (err) {
      toast.error(err.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    try {
      await sendOTP(user.email);
      toast.success('New OTP sent to your email');
    } catch (err) {
      toast.error(err.message || 'Failed to resend OTP');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-soft border border-slate-100 p-8 md:p-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#00a8cc]/10 text-[#00a8cc] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Verify Your Email</h2>
          <p className="text-slate-500 font-medium mt-2">
            We've sent a 6-digit code to <br/>
            <span className="text-slate-800 font-bold">{user.email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">
              Enter Verification Code
            </label>
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00a8cc] transition-colors" size={20} />
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00a8cc] focus:bg-white outline-none transition-all font-bold tracking-[0.5em] text-2xl text-center text-slate-800 placeholder:text-slate-300"
                placeholder="000000"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-4 bg-slate-900 hover:bg-[#00a8cc] text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>Verify Account <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm font-medium text-slate-500">
            Didn't receive the code?{' '}
            <button 
              onClick={handleResend}
              className="text-[#00a8cc] font-bold hover:underline"
            >
              Resend OTP
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
