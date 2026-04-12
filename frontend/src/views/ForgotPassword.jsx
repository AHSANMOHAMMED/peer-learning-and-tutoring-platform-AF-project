import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] font-sans p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-soft p-10 border border-slate-100"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#00a8cc] transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        {!sent ? (
          <>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Reset your password</h2>
            <p className="text-slate-500 font-medium mb-8">
              Enter your email address and we'll send you instructions to reset your password.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00a8cc] transition-colors" size={20} />
                  <input
                    type="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00a8cc] focus:bg-white outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-4 bg-slate-900 hover:bg-[#00a8cc] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Check your email</h2>
            <p className="text-slate-500 font-medium mb-6 leading-relaxed">
              If an account exists for <span className="font-bold text-slate-700">{email}</span>, you'll receive a password reset link shortly.
            </p>
            <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl border border-slate-100">
              💡 <strong>Dev mode:</strong> Check your terminal console for the reset link if email isn't configured.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
