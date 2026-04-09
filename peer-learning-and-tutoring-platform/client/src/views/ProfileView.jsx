import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  School,
  GraduationCap,
  FileText,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  ArrowLeft,
  Sparkles,
  Shield,
  BookOpen,
  Users,
  BarChart3,
  Activity,
  Clock3,
  Trophy,
  Flame,
  Star,
  ChevronRight,
  PencilLine
} from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext.jsx';

const initialForm = {
  firstName: '',
  lastName: '',
  phone: '',
  school: '',
  grade: '',
  bio: ''
};

const ProfileView = () => {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  const fullName = `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim() || user?.username || 'User';
  const initials = `${user?.profile?.firstName?.[0] || ''}${user?.profile?.lastName?.[0] || ''}`.toUpperCase() || 'U';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Colombo';

  useEffect(() => {
    setForm({
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      phone: user?.profile?.phone || '',
      school: user?.profile?.school || '',
      grade: user?.profile?.grade ? String(user.profile.grade) : '',
      bio: user?.profile?.bio || ''
    });
  }, [user]);

  const fieldErrors = useMemo(() => {
    const nextErrors = {};

    if (!form.firstName.trim()) nextErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required';

    if (form.grade !== '') {
      const gradeNum = Number(form.grade);
      if (!Number.isInteger(gradeNum) || gradeNum < 6 || gradeNum > 13) {
        nextErrors.grade = 'Grade must be between 6 and 13';
      }
    }

    if (form.bio.length > 500) nextErrors.bio = 'Bio should be 500 characters or less';
    return nextErrors;
  }, [form]);

  const validationError = useMemo(() => Object.values(fieldErrors)[0] || '', [fieldErrors]);

  const formatDate = (value) => {
    if (!value) return 'Not available';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not available';
    return date.toLocaleString();
  };

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
    setMessage('');
  };

  const resetToCurrent = () => {
    setForm({
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      phone: user?.profile?.phone || '',
      school: user?.profile?.school || '',
      grade: user?.profile?.grade ? String(user.profile.grade) : '',
      bio: user?.profile?.bio || ''
    });
    setError('');
    setMessage('');
    setIsEditing(false);
    setShowValidation(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (validationError) {
      setShowValidation(true);
      setError(validationError);
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        school: form.school.trim(),
        bio: form.bio.trim()
      };

      if (form.grade !== '') payload.grade = Number(form.grade);

      const res = await userService.updateProfile(payload);
      if (!res.success) throw new Error(res.message || 'Profile update failed');

      await checkAuth();
      setMessage('Profile updated successfully');
      setIsEditing(false);
      setShowValidation(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const levelLabel = user?.gamification?.levelName || user?.profile?.level || 'Beginner';
  const points = Number(user?.gamification?.points || user?.points || 0);
  const streak = Number(user?.gamification?.currentStreak || user?.streak || 0);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const inputClass = (field) => {
    const hasError = showValidation && fieldErrors[field];
    return `w-full rounded-2xl border bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 shadow-sm transition-all duration-200 outline-none ${
      hasError
        ? 'border-rose-300 ring-2 ring-rose-100 focus:border-rose-400'
        : 'border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'
    }`;
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-r from-blue-100 via-cyan-50 to-emerald-100 p-5 shadow-[0_26px_44px_-30px_rgba(14,116,144,0.45)] sm:p-6">
        <div className="pointer-events-none absolute -left-10 -top-8 h-28 w-28 rounded-full bg-blue-200/60 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 right-0 h-28 w-28 rounded-full bg-emerald-200/60 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/75 text-2xl font-bold text-cyan-700 shadow-md ring-1 ring-white/80">
              {initials}
            </div>
            <div>
              <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700"><Sparkles className="h-3.5 w-3.5" /> Profile</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">{fullName}</h1>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-600"><Mail className="h-4 w-4 text-cyan-600" /> {user?.email || 'Not available'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetToCurrent}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            Reset to saved data
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {!isEditing ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 shadow-sm">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700"><Star className="h-3.5 w-3.5" /> Level</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{levelLabel}</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-emerald-50 p-4 shadow-sm">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700"><Trophy className="h-3.5 w-3.5" /> Points</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{points}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-lime-50 p-4 shadow-sm">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700"><Flame className="h-3.5 w-3.5" /> Streak</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{streak}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <section className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_30px_-24px_rgba(15,23,42,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_38px_-24px_rgba(14,116,144,0.42)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <User className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">User Details</h2>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p><span className="font-medium text-slate-700">Name:</span> {fullName}</p>
                <p><span className="font-medium text-slate-700">Email:</span> {user?.email || 'Not available'}</p>
                <p><span className="font-medium text-slate-700">Timezone:</span> {timezone}</p>
                <p><span className="font-medium text-slate-700">Grade:</span> {user?.profile?.grade || 'Not set'}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:brightness-110"
              >
                <PencilLine className="h-4 w-4" />
                Edit profile
              </button>
            </section>

            <section className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_30px_-24px_rgba(15,23,42,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_38px_-24px_rgba(14,116,144,0.42)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                  <Shield className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Account Security</h2>
              </div>
              <div className="space-y-2">
                <button type="button" onClick={() => handleNavigation('/dashboard/settings/password')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-rose-200 hover:bg-rose-50">
                  <span>Password and login settings</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
                <button type="button" onClick={() => handleNavigation('/dashboard/settings/notifications')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-rose-200 hover:bg-rose-50">
                  <span>Notification preferences</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </section>

            <section className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_30px_-24px_rgba(15,23,42,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_38px_-24px_rgba(14,116,144,0.42)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Learning Workspace</h2>
              </div>
              <div className="space-y-2">
                <button type="button" onClick={() => handleNavigation('/dashboard/materials')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50"><span>Study Materials</span><ChevronRight className="h-4 w-4 text-slate-400" /></button>
                <button type="button" onClick={() => handleNavigation('/dashboard/student/tutors')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50"><span>Browse Tutors</span><ChevronRight className="h-4 w-4 text-slate-400" /></button>
                <button type="button" onClick={() => handleNavigation('/qa')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50"><span>Q&amp;A Forum</span><ChevronRight className="h-4 w-4 text-slate-400" /></button>
                <button type="button" onClick={() => handleNavigation('/dashboard/games')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50"><span>Learning Games</span><ChevronRight className="h-4 w-4 text-slate-400" /></button>
              </div>
            </section>

            <section className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_30px_-24px_rgba(15,23,42,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_38px_-24px_rgba(14,116,144,0.42)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <Users className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Community</h2>
              </div>
              <div className="space-y-2">
                <button type="button" onClick={() => handleNavigation('/dashboard/community/forum-posts')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"><span>My forum posts</span><ChevronRight className="h-4 w-4 text-slate-400" /></button>
                <button type="button" onClick={() => handleNavigation('/dashboard/community/discussions')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"><span>My discussions</span><ChevronRight className="h-4 w-4 text-slate-400" /></button>
                <button type="button" onClick={() => handleNavigation('/dashboard/community/reviews')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"><span>My session reviews</span><ChevronRight className="h-4 w-4 text-slate-400" /></button>
              </div>
            </section>

            <section className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_30px_-24px_rgba(15,23,42,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_38px_-24px_rgba(14,116,144,0.42)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Progress Reports</h2>
              </div>
              <div className="space-y-2">
                <button type="button" onClick={() => handleNavigation('/dashboard/progress/learning')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"><span>Learning progress</span><ChevronRight className="h-4 w-4 text-slate-400" /></button>
                <button type="button" onClick={() => handleNavigation('/dashboard/progress/sessions')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"><span>Session history</span><ChevronRight className="h-4 w-4 text-slate-400" /></button>
                <button type="button" onClick={() => handleNavigation('/dashboard/progress/achievements')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"><span>Achievement summary</span><ChevronRight className="h-4 w-4 text-slate-400" /></button>
              </div>
            </section>

            <section className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_30px_-24px_rgba(15,23,42,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_38px_-24px_rgba(14,116,144,0.42)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Activity className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Login Activity</h2>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"><Clock3 className="h-3.5 w-3.5" /> First access</p>
                  <p className="mt-1 font-medium text-slate-700">{formatDate(user?.createdAt)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"><Clock3 className="h-3.5 w-3.5" /> Last access</p>
                  <p className="mt-1 font-medium text-slate-700">{formatDate(user?.lastLogin)}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.5)] sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to profile
            </button>
            <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">Edit profile</h2>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Basic Details</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">First Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={form.firstName} onChange={(e) => onChange('firstName', e.target.value)} className={inputClass('firstName')} required />
                </div>
                {showValidation && fieldErrors.firstName && <p className="mt-1 text-xs text-rose-600">{fieldErrors.firstName}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Last Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={form.lastName} onChange={(e) => onChange('lastName', e.target.value)} className={inputClass('lastName')} required />
                </div>
                {showValidation && fieldErrors.lastName && <p className="mt-1 text-xs text-rose-600">{fieldErrors.lastName}</p>}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4 rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Contact</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={form.phone} onChange={(e) => onChange('phone', e.target.value)} className={inputClass('phone')} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">School</label>
                <div className="relative">
                  <School className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={form.school} onChange={(e) => onChange('school', e.target.value)} className={inputClass('school')} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Grade</label>
                <div className="relative">
                  <GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="number" min="6" max="13" value={form.grade} onChange={(e) => onChange('grade', e.target.value)} className={inputClass('grade')} placeholder="6 to 13" />
                </div>
                {showValidation && fieldErrors.grade && <p className="mt-1 text-xs text-rose-600">{fieldErrors.grade}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={user?.email || ''} readOnly className="w-full rounded-2xl border border-slate-200 bg-slate-100 py-3.5 pl-11 pr-4 text-sm text-slate-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3 rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">About</p>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Bio</label>
              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <textarea rows={4} maxLength={500} value={form.bio} onChange={(e) => onChange('bio', e.target.value)} className={inputClass('bio').replace('pl-11', 'pl-11 pt-3.5')} placeholder="Tell others a little about you" />
              </div>
              <div className="mt-1 flex items-center justify-between">
                <p className={`text-xs ${form.bio.length > 460 ? 'text-amber-600' : 'text-slate-500'}`}>{form.bio.length}/500</p>
                {showValidation && fieldErrors.bio && <p className="text-xs text-rose-600">{fieldErrors.bio}</p>}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">Changes are saved securely to your account profile.</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={resetToCurrent} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-300/35 transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60">
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileView;
