import React, { useState } from 'react';
import {
  User,
  Phone,
  School,
  GraduationCap,
  Save,
  X,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  Briefcase
} from 'lucide-react';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import { userManagementApi } from '../services/api';
import { cn } from '../utils/cn';

const ProfileView = () => {
  const { user, refreshUser } = useAuth();
  const [targetRole] = useState(user?.role || 'student');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    phone: user?.profile?.phone || '',
    school: user?.profile?.school || '',
    grade: user?.profile?.grade?.toString() || '',
    bio: user?.profile?.bio || ''
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = 'First name is required';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      setIsSaving(true);
      const response = await userManagementApi.updateProfile({
        profile: { ...form, grade: form.grade ? parseInt(form.grade) : undefined }
      });      if (response.data.success) {
        toast.success('Profile updated successfully');
        await refreshUser();
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      phone: user?.profile?.phone || '',
      school: user?.profile?.school || '',
      grade: user?.profile?.grade?.toString() || '',
      bio: user?.profile?.bio || ''
    });
    setFieldErrors({});
    setIsEditing(false);
  };

  return (
    <Layout userRole={targetRole}>
      <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-inner">
                   {user?.profile?.firstName?.[0] || user?.username?.[0] || 'U'}
                </div>
                <div>
                   <h1 className="text-2xl font-bold text-slate-800">
                      {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user?.username}
                   </h1>
                   <div className="flex gap-2 items-center mt-1">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase border border-blue-100">
                         {user?.role || 'Member'}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                         <ShieldCheck size={14} className="text-emerald-500" /> Verified Account
                      </span>
                   </div>
                </div>
             </div>
             {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="mt-4 md:mt-0 px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2">
                   Edit Profile
                </button>
             )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* Left Column: Form */}
             <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                   <div className="p-6 border-b border-slate-100">
                      <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
                      <p className="text-sm text-slate-500 mt-1">Update your basic profile information and preferences.</p>
                   </div>
                   <div className="p-6">
                      <form onSubmit={onSubmit} className="space-y-5">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                                  <User size={14} className="text-slate-400" /> First Name
                               </label>
                               <input type="text" value={form.firstName} onChange={e => onChange('firstName', e.target.value)} disabled={!isEditing} className={`w-full p-2.5 bg-slate-50 border rounded-lg text-sm transition-colors ${fieldErrors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-75 disabled:bg-slate-100'}`} />
                               {fieldErrors.firstName && <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>}
                            </div>
                            <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                                  <User size={14} className="text-slate-400" /> Last Name
                               </label>
                               <input type="text" value={form.lastName} onChange={e => onChange('lastName', e.target.value)} disabled={!isEditing} className={`w-full p-2.5 bg-slate-50 border rounded-lg text-sm transition-colors ${fieldErrors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-75 disabled:bg-slate-100'}`} />
                               {fieldErrors.lastName && <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName}</p>}
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                                  <Phone size={14} className="text-slate-400" /> Contact Number
                               </label>
                               <input type="tel" value={form.phone} onChange={e => onChange('phone', e.target.value)} disabled={!isEditing} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-75 disabled:bg-slate-100" />
                            </div>
                            <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                                  <School size={14} className="text-slate-400" /> Institution
                               </label>
                               <input type="text" value={form.school} onChange={e => onChange('school', e.target.value)} disabled={!isEditing} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-75 disabled:bg-slate-100" />
                            </div>
                         </div>

                         <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                               <Briefcase size={14} className="text-slate-400" /> About You (Bio)
                            </label>
                            <textarea rows={4} value={form.bio} onChange={e => onChange('bio', e.target.value)} disabled={!isEditing} placeholder="Tell us a little bit about yourself..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-75 disabled:bg-slate-100 resize-none"></textarea>
                         </div>

                         {isEditing && (
                            <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
                               <button type="button" onClick={resetForm} disabled={isSaving} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm rounded-lg transition-colors flex items-center gap-2">
                                  <X size={16} /> Cancel
                               </button>
                               <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70">
                                  <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
                               </button>
                            </div>
                         )}
                      </form>
                   </div>
                </div>
             </div>

             {/* Right Column: Gamification Stats */}
             <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                   <h2 className="text-lg font-bold text-slate-800 mb-4">Milestones & Activity</h2>
                   <div className="space-y-4">
                      
                      <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                         <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                            <Zap size={20} />
                         </div>
                         <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Experience</p>
                            <p className="text-xl font-bold text-slate-800 leading-none mt-1">{user?.gamification?.experience || 0} XP</p>
                         </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                         <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                            <TrendingUp size={20} />
                         </div>
                         <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Global Rank</p>
                            <p className="text-xl font-bold text-slate-800 leading-none mt-1">#{user?.gamification?.ranking?.global || 'Unranked'}</p>
                         </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                         <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <Award size={20} />
                         </div>
                         <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Badges Earned</p>
                            <p className="text-xl font-bold text-slate-800 leading-none mt-1">{user?.gamification?.badges?.length || 0}</p>
                         </div>
                      </div>

                   </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-blue-900">
                   <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                      <GraduationCap size={16} /> Platform Guidelines
                   </h3>
                   <p className="text-xs text-blue-700 leading-relaxed mt-2">
                      Keep your profile information accurate to ensure you get correctly matched with the best educational resources and tutors aligned to your curriculum.
                   </p>
                </div>

             </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileView;