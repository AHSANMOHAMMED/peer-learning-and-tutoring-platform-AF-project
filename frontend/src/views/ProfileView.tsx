import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Award, 
  Zap, 
  TrendingUp, 
  Settings as SettingsIcon,
  ArrowLeft,
  GraduationCap,
  School,
  FileText,
  Save,
  X,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  Flame,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../controllers/useAuth';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const ProfileView: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  
  const [form, setForm] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    phone: user?.profile?.phone || '',
    school: user?.profile?.school || '',
    grade: user?.profile?.grade?.toString() || '',
    bio: user?.profile?.bio || ''
  });

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!form.firstName.trim()) errors.firstName = 'First name is required';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required';
    if (form.grade && (parseInt(form.grade) < 6 || parseInt(form.grade) > 13)) {
      errors.grade = 'Grade must be between 6 and 13';
    }
    if (form.bio.length > 500) errors.bio = 'Bio is too long (max 500 characters)';
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    
    if (!validate()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    try {
      setIsSaving(true);
      const response = await api.put('/api/users/profile', {
        profile: {
          ...form,
          grade: form.grade ? parseInt(form.grade) : undefined
        }
      });

      if (response.data.success) {
        toast.success('Profile updated successfully');
        await refreshUser();
        setIsEditing(false);
        setShowValidation(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToCurrent = () => {
    setForm({
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      phone: user?.profile?.phone || '',
      school: user?.profile?.school || '',
      grade: user?.profile?.grade?.toString() || '',
      bio: user?.profile?.bio || ''
    });
    setFieldErrors({});
    setShowValidation(false);
    setIsEditing(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const inputClass = (field: string) => `
    w-full rounded-2xl border bg-white py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition-all
    ${fieldErrors[field] && showValidation 
      ? 'border-rose-300 ring-4 ring-rose-500/10' 
      : 'border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10'}
  `;

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              User Profile
            </h1>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
              Manage your structural academic identity and platform settings.
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-6 py-3.5 text-sm font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-gray-900"
            >
              <SettingsIcon size={18} />
              Customize Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Profile Info */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div
                  key="view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Glassmorphism Card */}
                  <div className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-white dark:bg-gray-900 p-8 shadow-2xl shadow-indigo-500/10">
                    <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
                    
                    <div className="relative flex flex-col items-center gap-8 sm:flex-row">
                      <div className="relative">
                        <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 p-1">
                          <div className="flex h-full w-full items-center justify-center rounded-[1.4rem] bg-white dark:bg-gray-900 text-4xl font-bold text-gray-900 dark:text-white">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 rounded-full border-4 border-white bg-emerald-500 px-3 py-1 text-[10px] font-bold text-white shadow-lg dark:border-gray-900 uppercase tracking-widest">
                          LVL {user?.gamification?.level || 1}
                        </div>
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                          {user?.profile?.firstName && user?.profile?.lastName 
                            ? `${user.profile.firstName} ${user.profile.lastName}`
                            : user?.username || 'Peer Learner'}
                        </h2>
                        <p className="mt-1 flex items-center justify-center gap-2 font-bold text-indigo-500 sm:justify-start uppercase tracking-widest text-sm">
                          <Award size={16} /> Elite Scholar
                        </p>
                        
                        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm sm:justify-start text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-400" />
                            {user?.profile?.school || 'University of PeerLearn'}
                          </div>
                          <div className="flex items-center gap-2">
                            <GraduationCap size={16} className="text-gray-400" />
                            Grade {user?.profile?.grade || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            Joined {formatDate(user?.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative mt-10 grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-white/5 pt-8 sm:grid-cols-4">
                      {[
                        { label: 'Platform XP', value: user?.gamification?.experience || 0, icon: Zap, color: 'text-amber-500' },
                        { label: 'Rank Points', value: user?.gamification?.points || 0, icon: TrendingUp, color: 'text-cyan-500' },
                        { label: 'Daily Streak', value: user?.gamification?.streak || 0, icon: Flame, color: 'text-orange-500' },
                        { label: 'Acknowledge', value: user?.gamification?.badges?.length || 0, icon: Star, color: 'text-purple-500' }
                      ].map((stat) => (
                        <div key={stat.label} className="text-center group">
                          <div className={`flex justify-center mb-1 ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={20} />
                          </div>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bio & Details Section */}
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="rounded-[2rem] border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-900 p-8 shadow-xl">
                      <h3 className="mb-6 flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
                        <FileText size={22} className="text-indigo-500" />
                        About Me
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 italic">
                        {user?.profile?.bio || 'No bio integrated yet. Share something about your academic journey!'}
                      </p>
                    </div>

                    <div className="rounded-[2rem] border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-900 p-8 shadow-xl">
                      <h3 className="mb-6 flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
                        <Mail size={22} className="text-cyan-500" />
                        Credentials
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</span>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{user?.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Security Vault</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-1 text-[10px] font-bold text-teal-500 uppercase tracking-widest">
                            <ShieldCheck size={12} /> Encrypted
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Member Status</span>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <form onSubmit={onSubmit} className="rounded-[2.5rem] border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-900 p-8 shadow-2xl">
                    <div className="mb-8 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={resetToCurrent}
                        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <ArrowLeft size={18} /> Back to profile
                      </button>
                      <h2 className="text-xl font-bold">Edit Platform Identity</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                           <User size={14} /> First Name
                        </label>
                        <input
                          value={form.firstName}
                          onChange={(e) => onChange('firstName', e.target.value)}
                          className={inputClass('firstName')}
                          placeholder="Ahsan"
                        />
                        {showValidation && fieldErrors.firstName && <p className="text-[10px] font-bold text-rose-500">{fieldErrors.firstName}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                           <User size={14} /> Last Name
                        </label>
                        <input
                          value={form.lastName}
                          onChange={(e) => onChange('lastName', e.target.value)}
                          className={inputClass('lastName')}
                          placeholder="Mohammed"
                        />
                        {showValidation && fieldErrors.lastName && <p className="text-[10px] font-bold text-rose-500">{fieldErrors.lastName}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                           <Phone size={14} /> Phone Vault
                        </label>
                        <input
                          value={form.phone}
                          onChange={(e) => onChange('phone', e.target.value)}
                          className={inputClass('phone')}
                          placeholder="+94 7X XXX XXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                           <School size={14} /> Institution
                        </label>
                        <input
                          value={form.school}
                          onChange={(e) => onChange('school', e.target.value)}
                          className={inputClass('school')}
                          placeholder="School or University"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                           <GraduationCap size={14} /> Grade Level
                        </label>
                        <input
                          type="number"
                          value={form.grade}
                          onChange={(e) => onChange('grade', e.target.value)}
                          className={inputClass('grade')}
                          placeholder="6-13"
                        />
                        {showValidation && fieldErrors.grade && <p className="text-[10px] font-bold text-rose-500">{fieldErrors.grade}</p>}
                      </div>
                    </div>

                    <div className="mt-6 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                         <FileText size={14} /> Academic Bio
                      </label>
                      <textarea
                        rows={4}
                        value={form.bio}
                        onChange={(e) => onChange('bio', e.target.value)}
                        className={`${inputClass('bio')} h-32 resize-none pt-4`}
                        placeholder="Integrate your mission statement here..."
                      />
                      <div className="flex justify-between mt-1">
                        <p className="text-[10px] text-gray-400">{form.bio.length}/500 chars</p>
                        {showValidation && fieldErrors.bio && <p className="text-[10px] font-bold text-rose-500">{fieldErrors.bio}</p>}
                      </div>
                    </div>

                    <div className="mt-10 flex gap-4 border-t border-gray-100 dark:border-white/5 pt-8">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-500/20 transition hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isSaving ? 'Synchronizing...' : 'Save Configuration'}
                      </button>
                      <button
                        type="button"
                        onClick={resetToCurrent}
                        className="rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 px-8 py-4 text-sm font-bold transition hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Stats/Presence */}
          <div className="space-y-8">
            <section className="rounded-[2rem] border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-900 p-8 shadow-xl">
              <h3 className="mb-6 flex items-center gap-3 text-xl font-bold">
                <ShieldCheck size={22} className="text-indigo-500" />
                Network Presence
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <Clock3 size={16} className="text-gray-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Last Active</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Active Now</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-teal-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Verification</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-1 bg-teal-500/10 text-teal-600 rounded-lg">Verified</span>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-gray-100 dark:border-white/5 bg-gradient-to-br from-indigo-500 to-purple-600 p-8 shadow-2xl text-white">
              <h3 className="mb-4 text-xl font-bold flex items-center gap-3">
                <Award size={22} /> Global Ranking
              </h3>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-extrabold tracking-tighter">#42</span>
                <span className="text-sm font-bold opacity-80 mb-2 uppercase tracking-widest">Global Rank</span>
              </div>
              <p className="mt-4 text-xs font-medium opacity-80 leading-relaxed">
                You are in the top 5% of learners this week. Keep up the structural academic progress!
              </p>
              <button className="mt-6 w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-black/10 hover:scale-105 transition-transform">
                View Leaderboard
              </button>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileView;
