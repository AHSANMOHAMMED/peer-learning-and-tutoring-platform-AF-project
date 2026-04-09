import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
  Activity,
  Check
} from 'lucide-react';
import { authService } from '../services/authService';

const PasswordSettingsView = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const hasMinLength = formData.newPassword.length >= 8;
  const hasUpperLower = /[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword);
  const hasNumber = /\d/.test(formData.newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(formData.newPassword);

  const strengthScore = [hasMinLength, hasUpperLower, hasNumber, hasSymbol].filter(Boolean).length;

  const strength = useMemo(() => {
    if (!formData.newPassword) {
      return { label: 'Not set', color: 'text-slate-500', bar: 'bg-slate-300', width: '0%' };
    }

    if (strengthScore <= 1) {
      return { label: 'Weak', color: 'text-rose-600', bar: 'bg-rose-500', width: '33%' };
    }

    if (strengthScore <= 3) {
      return { label: 'Medium', color: 'text-amber-600', bar: 'bg-amber-500', width: '66%' };
    }

    return { label: 'Strong', color: 'text-emerald-600', bar: 'bg-emerald-500', width: '100%' };
  }, [formData.newPassword, strengthScore]);

  const fieldErrors = useMemo(() => {
    const nextErrors = {};

    if (!formData.currentPassword.trim()) {
      nextErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword.trim()) {
      nextErrors.newPassword = 'New password is required';
    } else {
      if (formData.newPassword.length < 8) {
        nextErrors.newPassword = 'New password must be at least 8 characters';
      } else if (formData.currentPassword && formData.currentPassword === formData.newPassword) {
        nextErrors.newPassword = 'New password must be different from current password';
      }
    }

    if (!formData.confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'New passwords do not match';
    }

    return nextErrors;
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setMessage('');
  };

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const inputClass = (field) => {
    const hasError = showValidation && fieldErrors[field];
    return `w-full rounded-2xl border bg-white py-3 pl-11 pr-12 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 ${
      hasError
        ? 'border-rose-300 ring-2 ring-rose-100 focus:border-rose-400'
        : 'border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'
    }`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidation(true);

    const firstError = Object.values(fieldErrors)[0];
    if (firstError) {
      setError(firstError);
      return;
    }

    try {
      setIsSaving(true);
      const res = await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (!res.success) {
        throw new Error(res.message || 'Failed to change password');
      }

      setMessage('Password changed successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowValidation(false);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-r from-blue-100 via-cyan-50 to-emerald-100 p-5 shadow-[0_26px_44px_-30px_rgba(14,116,144,0.45)] sm:p-6">
        <div className="pointer-events-none absolute -left-10 -top-8 h-28 w-28 rounded-full bg-blue-200/60 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 right-0 h-28 w-28 rounded-full bg-emerald-200/60 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-cyan-700 shadow ring-1 ring-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700"><Sparkles className="h-3.5 w-3.5" /> Security Center</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Password and Login Settings</h1>
              <p className="mt-1 text-sm text-slate-600">Keep your account secure with a strong, unique password.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/profile')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_34px_-24px_rgba(15,23,42,0.45)] sm:p-7">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Change Password</h2>
              <p className="mt-1 text-sm text-slate-600">Update your password to keep your account secure</p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Current Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword.currentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={inputClass('currentPassword')}
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility('currentPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                  aria-label="Toggle current password visibility"
                >
                  {showPassword.currentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {showValidation && fieldErrors.currentPassword && <p className="mt-1 text-xs text-rose-600">{fieldErrors.currentPassword}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">New Password</label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword.newPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={inputClass('newPassword')}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility('newPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                  aria-label="Toggle new password visibility"
                >
                  {showPassword.newPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {showValidation && fieldErrors.newPassword && <p className="mt-1 text-xs text-rose-600">{fieldErrors.newPassword}</p>}

              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em]">
                  <span className="text-slate-500">Password strength</span>
                  <span className={strength.color}>{strength.label}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.bar}`} style={{ width: strength.width }} />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm New Password</label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword.confirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={inputClass('confirmPassword')}
                  placeholder="Re-enter your new password"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility('confirmPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                  aria-label="Toggle confirm password visibility"
                >
                  {showPassword.confirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {showValidation && fieldErrors.confirmPassword && <p className="mt-1 text-xs text-rose-600">{fieldErrors.confirmPassword}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-300/35 transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60"
              >
                <ShieldCheck className="h-4 w-4" />
                {isSaving ? 'Updating...' : 'Update Password'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setShowValidation(false);
                  setError('');
                  setMessage('');
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_34px_-24px_rgba(15,23,42,0.45)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Login Activity</h3>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <span>Last login</span>
                <span className="font-semibold text-slate-700">Just now</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <span>Security status</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Protected</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-[0_18px_34px_-24px_rgba(15,23,42,0.45)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Info className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Password Tips and Security Guidelines</h3>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-start gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /><span>Use at least 8 characters with uppercase, lowercase, numbers, and symbols.</span></div>
              <div className="flex items-start gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /><span>Avoid using your name, email, or common words.</span></div>
              <div className="flex items-start gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /><span>Never reuse this password on other websites.</span></div>
              <div className="flex items-start gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /><span>Change your password immediately if you suspect unauthorized access.</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordSettingsView;
