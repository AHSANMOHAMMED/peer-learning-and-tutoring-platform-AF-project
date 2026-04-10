import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Shield, 
  ShieldCheck,
  Bell, 
  MapPin, 
  GraduationCap, 
  CheckCircle2, 
  Save, 
  Lock,
  Mail,
  Smartphone,
  Globe,
  Settings as SettingsIcon,
  ChevronRight,
  BookOpen,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../controllers/useAuth';
import { cn } from '../utils/cn';

const Settings: React.FC = () => {
  const { user, updateProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  
  // Local state for profile CRUD
  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    bio: user?.profile?.bio || '',
    district: user?.district || 'Colombo',
    stream: user?.stream || 'Combined Mathematics (A/L)',
    grade: user?.grade || '2025'
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: ''
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const payload: any = {
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: formData.bio
        },
        district: formData.district,
        stream: formData.stream,
        grade: formData.grade
      };

      if (activeTab === 'security' && securityData.newPassword) {
        payload.password = securityData.newPassword;
        payload.currentPassword = securityData.currentPassword;
      }

      await updateProfile(payload);
      setSaveStatus('success');
      setSecurityData({ currentPassword: '', newPassword: '' });
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Mastery', icon: User },
    { id: 'security', label: 'Security Core', icon: Shield },
    { id: 'notifications', label: 'Alert Center', icon: Bell },
  ];

  return (
    <Layout userRole={user?.role || 'student'}>
      <div className="min-h-screen space-y-8 p-4 md:p-8 bg-gray-50/50 dark:bg-gray-950/50">
        {/* Settings Header */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-8 md:p-12 text-white shadow-2xl border border-white/10">
           <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="max-w-xl">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                       <SettingsIcon className="text-indigo-100" size={24} />
                    </div>
                    <span className="text-xs font-bold tracking-[0.3em] uppercase text-indigo-100">Identity Governance</span>
                 </div>
                 <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 leading-tight">
                    System <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-white underline decoration-white/20 underline-offset-8">Configuration.</span>
                 </h1>
                 <p className="text-indigo-100/90 text-lg">
                    Manage your localized profile, security credentials, and session notification preferences in one central vault.
                 </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl min-w-[280px]">
                 <div className="w-20 h-20 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-3xl font-bold text-white shadow-2xl mb-4 border-4 border-indigo-500/20">
                    {user?.username?.[0] || 'A'}
                 </div>
                 <h4 className="text-lg font-bold">{user?.username}</h4>
                 <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mt-1">{user?.role} Portal</p>
              </div>
           </div>
        </div>

        {/* Settings Hub Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Sidebar Tabs */}
           <div className="lg:col-span-3 space-y-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "w-full p-6 rounded-[2rem] flex items-center gap-4 transition-all duration-300 border font-bold text-sm uppercase tracking-widest",
                    activeTab === tab.id 
                      ? "bg-white dark:bg-gray-900 border-indigo-500 shadow-xl shadow-indigo-500/10 text-indigo-600 scale-[1.02]" 
                      : "bg-transparent border-transparent text-gray-500 hover:bg-white dark:hover:bg-gray-900 hover:border-gray-100 dark:hover:border-gray-800"
                  )}
                >
                  <tab.icon className={cn("transition-colors", activeTab === tab.id ? "text-indigo-600" : "text-gray-400")} size={20} />
                  {tab.label}
                </button>
              ))}
           </div>

           {/* Panels Content */}
           <div className="lg:col-span-9 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-sm min-h-[500px] flex flex-col">
              <div className="flex-1">
                 {activeTab === 'profile' && (
                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                               <User size={14} /> First Name
                            </label>
                            <input 
                              type="text" 
                              value={formData.firstName}
                              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                               <User size={14} /> Last Name
                            </label>
                            <input 
                              type="text" 
                              value={formData.lastName}
                              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                               <Mail size={14} /> Email Identity
                            </label>
                            <input 
                              type="email" 
                              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-5 text-sm font-bold opacity-50 cursor-not-allowed"
                              defaultValue={user?.email}
                              disabled
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                               <MapPin size={14} /> District focus (SL)
                            </label>
                            <select 
                              value={formData.district}
                              onChange={(e) => setFormData({...formData, district: e.target.value})}
                              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                            >
                               <option>Colombo</option>
                               <option>Kandy</option>
                               <option>Gampaha</option>
                               <option>Galle</option>
                               <option>Kurunegala</option>
                            </select>
                         </div>
                         <div className="md:col-span-2 space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                               <GraduationCap size={14} /> Academic Stream
                            </label>
                            <select 
                              value={formData.stream}
                              onChange={(e) => setFormData({...formData, stream: e.target.value})}
                              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                            >
                               <option>Combined Mathematics (A/L)</option>
                               <option>Biological Sciences (A/L)</option>
                               <option>Commercial Stream (A/L)</option>
                               <option>Physical Sciences (A/L)</option>
                            </select>
                         </div>
                      </div>
                   </motion.div>
                 )}

                  {activeTab === 'security' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Security Form */}
                          <div className="space-y-8">
                             <div className="p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800/50 flex flex-col sm:flex-row items-center gap-6">
                                <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl text-indigo-600 shadow-lg">
                                   <ShieldCheck size={32} />
                                </div>
                                <div>
                                   <h4 className="text-lg font-bold mb-1">Security Vault Core</h4>
                                   <p className="text-sm font-medium text-gray-500">Ensure your account is protected with 2FA and rotated credentials.</p>
                                </div>
                             </div>

                             <div className="space-y-6">
                                <div className="space-y-3">
                                   <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                                      <Lock size={14} /> Current Password
                                   </label>
                                   <div className="relative">
                                      <input 
                                        type="password" 
                                        placeholder="••••••••••••"
                                        value={securityData.currentPassword}
                                        onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                      />
                                   </div>
                                </div>

                                <div className="space-y-3">
                                   <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                                      <Shield size={14} /> New Strong Password
                                   </label>
                                   <input 
                                     type="password" 
                                     placeholder="Enter secure password"
                                     value={securityData.newPassword}
                                     onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                                     className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                   />
                                   
                                   {/* Strength Meter Integration */}
                                   <div className="mt-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                      <div className="flex justify-between items-center mb-2">
                                         <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Credential Strength</span>
                                         <span className={`text-[10px] font-bold uppercase ${securityData.newPassword.length > 8 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {securityData.newPassword.length > 8 ? 'Strong' : 'Weak'}
                                         </span>
                                      </div>
                                      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                         <motion.div 
                                           initial={{ width: 0 }}
                                           animate={{ width: `${Math.min((securityData.newPassword.length / 12) * 100, 100)}%` }}
                                           className={`h-full ${securityData.newPassword.length > 8 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                         />
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* Security Info Panel */}
                          <div className="space-y-6">
                             <div className="p-8 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
                                <h4 className="text-lg font-bold mb-4 flex items-center gap-3">
                                   <Bell size={20} className="text-amber-500" /> Security Protocol
                                </h4>
                                <ul className="space-y-4">
                                   {[
                                     'Use at least 8 characters with varying cases.',
                                     'Avoid using name, email, or birthday.',
                                     'Update your credentials every 90 days.',
                                     'Never share your login tokens with others.'
                                   ].map((tip, i) => (
                                     <li key={i} className="flex gap-3 text-xs font-medium text-gray-500 leading-relaxed">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                        {tip}
                                     </li>
                                   ))}
                                </ul>
                             </div>

                             <div className="p-8 bg-emerald-500/5 rounded-[2.5rem] border border-emerald-500/10">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-2">
                                   <CheckCircle2 size={16} /> Data Encryption
                                </h4>
                                <p className="text-xs font-medium text-emerald-800/60 leading-relaxed">
                                   Your password is hashed using industry-standard BCRYPT before committing to our encrypted neural vault.
                                </p>
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  )}

                 {activeTab === 'notifications' && (
                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                      <div className="space-y-4">
                         {[
                           { label: 'Session Reminders', desc: 'Alerts 15 mins before a live room starts.', icon: Bell },
                           { label: 'Marketplace Insights', desc: 'New materials uploaded for your subject.', icon: BookOpen },
                           { label: 'Mentor Direct Chat', desc: 'Real-time alerts for mentor responses.', icon: Smartphone },
                           { label: 'Platform Global News', desc: 'Critical infrastructure updates and maintenance.', icon: Globe }
                         ].map((item, i) => (
                           <div key={i} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group transition-all hover:border-indigo-500/30">
                              <div className="flex items-center gap-6">
                                 <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl text-gray-400 group-hover:text-indigo-600 transition-colors">
                                    <item.icon size={20} />
                                 </div>
                                 <div className="max-w-md">
                                    <h4 className="text-base font-bold">{item.label}</h4>
                                    <p className="text-xs font-medium text-gray-400 mt-0.5">{item.desc}</p>
                                 </div>
                              </div>
                              <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center px-1 cursor-pointer relative shadow-lg shadow-indigo-500/20">
                                 <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
                              </div>
                           </div>
                         ))}
                      </div>
                   </motion.div>
                 )}
              </div>

              <div className="pt-8 border-t border-gray-50 dark:border-gray-800 mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                    {saveStatus === 'saving' && <span className="text-indigo-500 flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Synchronizing...</span>}
                    {saveStatus === 'success' && <span className="text-teal-600 flex items-center gap-2"><CheckCircle2 size={16} /> Saved Successfully</span>}
                    {saveStatus === 'error' && <span className="text-red-500 flex items-center gap-2"><AlertCircle size={16} /> Update Failed</span>}
                    {saveStatus === 'idle' && <span className="text-gray-400">Ready for configuration</span>}
                 </div>
                 <button 
                   onClick={handleSave}
                   disabled={saveStatus === 'saving'}
                   className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3 group active:scale-95"
                 >
                    {saveStatus === 'saving' ? 'Processing...' : 'Save Configuration'}
                    <Save size={20} className="group-hover:rotate-6 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
