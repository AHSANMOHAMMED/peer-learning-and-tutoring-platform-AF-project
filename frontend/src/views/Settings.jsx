import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Bell, MapPin, GraduationCap, CheckCircle2, Save, Lock, Mail, Loader2, AlertCircle, Info, Unlock, Users, X, Check } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../controllers/useAuth';
import { useParentLinks } from '../controllers/useParentLinks';
import { useTutors } from '../controllers/useTutors';
import { cn } from '../utils/cn';
import { toast } from 'react-hot-toast';
import { Briefcase, Plus, Trash2 } from 'lucide-react';

const Settings = () => {
  const { user, updateProfile, changePassword, loading } = useAuth();
  const { linkRequests, fetchStudentLinkRequests, studentRespondToLink, loading: linksLoading } = useParentLinks();
  const { getTutorByUserId, updateTutorProfile, loading: tutorLoading } = useTutors();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [tutorData, setTutorData] = useState(null);
  const [isTutorLoading, setIsTutorLoading] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'professional' && user?.role === 'tutor') {
      setIsTutorLoading(true);
      getTutorByUserId(user._id).then(data => {
        setTutorData(data);
        setIsTutorLoading(false);
      });
    }
  }, [activeTab, user, getTutorByUserId]);

  React.useEffect(() => {
    if (activeTab === 'family' && user?.role === 'student') {
      fetchStudentLinkRequests();
    }
  }, [activeTab, user, fetchStudentLinkRequests]);

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

  const [saveStatus, setSaveStatus] = useState('idle');

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      if (activeTab === 'security') {
        if (!securityData.newPassword || !securityData.currentPassword) {
           toast.error("Both current and new passwords are required");
           setSaveStatus('idle');
           return;
        }
        await changePassword(securityData.currentPassword, securityData.newPassword);
        setSecurityData({ currentPassword: '', newPassword: '' });
      } else if (activeTab === 'professional') {
        await updateTutorProfile(tutorData._id, tutorData);
      } else {
        const payload = {
          profile: { firstName: formData.firstName, lastName: formData.lastName, bio: formData.bio },
          district: formData.district,
          stream: formData.stream,
          grade: formData.grade
        };
        await updateProfile(payload);
      }
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(user?.role === 'student' ? [{ id: 'family', label: 'Family', icon: Users }] : []),
    ...(user?.role === 'tutor' ? [{ id: 'professional', label: 'Tutor Profile', icon: Briefcase }] : [])
  ];

  return (
    <Layout userRole={user?.role || 'student'}>
      <div className="max-w-[1200px] mx-auto w-full font-sans">
        
        {/* Header */}
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Account Settings</h1>
           <p className="text-slate-500 font-medium text-sm mt-1">Manage your account preferences, security, and identity.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
           {/* Sidebar */}
           <div className="lg:col-span-3 space-y-2 relative h-fit lg:sticky lg:top-8 bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
              <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
                 <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-800 line-clamp-1">{user?.username || 'User'}</h4>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user?.role || 'Student'} Role</span>
                 </div>
              </div>
              
              {tabs.map((tab) => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors text-left",
                       activeTab === tab.id 
                         ? "bg-[#f8f9fc] text-[#00a8cc]" 
                         : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                    )}
                 >
                    <tab.icon size={18} /> {tab.label}
                 </button>
              ))}
           </div>

           {/* Content Area */}
           <div className="lg:col-span-9 bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm relative min-h-[500px] flex flex-col">
              <AnimatePresence mode="wait">
                 {activeTab === 'profile' && (
                   <motion.div key="profile" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex-1 space-y-8">
                      <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {[
                           { id: 'firstName', label: 'First Name', val: formData.firstName, icon: User },
                           { id: 'lastName', label: 'Last Name', val: formData.lastName, icon: User }
                         ].map((field) => (
                           <div key={field.id}>
                               <label className="text-sm font-bold text-slate-700 mb-2 block">{field.label}</label>
                              <div className="relative">
                                 <field.icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                 <input
                                   type="text"
                                   value={field.val}
                                   onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                   className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-[15px] font-medium text-slate-800 outline-none focus:bg-white focus:border-[#00a8cc] transition-colors" 
                                 />
                              </div>
                           </div>
                         ))}
                         
                         <div>
                             <label className="text-sm font-bold text-slate-700 mb-2 block">Email Address</label>
                            <div className="relative">
                               <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                               <input
                                 type="email"
                                 className="w-full bg-slate-100 border border-transparent rounded-xl py-3 pl-12 pr-10 text-[15px] font-medium text-slate-500 cursor-not-allowed"
                                 defaultValue={user?.email || 'N/A'}
                                 disabled 
                               />
                               <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                         </div>
                         
                         <div>
                             <label className="text-sm font-bold text-slate-700 mb-2 block">District</label>
                            <div className="relative">
                               <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                               <select
                                 value={formData.district}
                                 onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-[15px] font-medium text-slate-800 outline-none focus:bg-white focus:border-[#00a8cc] transition-colors appearance-none"
                               >
                                  {['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                  ))}
                               </select>
                            </div>
                         </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100">
                         <h2 className="text-xl font-bold text-slate-800 mb-6">Academic Details</h2>
                         <div>
                              <label className="text-sm font-bold text-slate-700 mb-2 block">Academic Stream</label>
                            <div className="relative">
                               <GraduationCap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                               <select
                                 value={formData.stream}
                                 onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-[15px] font-medium text-slate-800 outline-none focus:bg-white focus:border-[#00a8cc] transition-colors appearance-none"
                               >
                                  <option value="Combined Mathematics">Combined Mathematics</option>
                                  <option value="Biological Sciences">Biological Sciences</option>
                                  <option value="Commercial Stream">Commercial Stream</option>
                                  <option value="Physical Sciences">Physical Sciences</option>
                                  <option value="Arts Stream">Arts Stream</option>
                                  <option value="Technology Stream">Technology Stream</option>
                                  <option value="O/L General">O/L General</option>
                               </select>
                            </div>
                         </div>
                      </div>
                   </motion.div>
                 )}

                 {activeTab === 'security' && (
                   <motion.div key="security" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex-1 space-y-8">
                      <h2 className="text-xl font-bold text-slate-800">Change Password</h2>
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
                         <Info size={24} className="text-[#00a8cc] shrink-0" />
                         <p className="text-sm font-medium text-slate-700">Make sure to use a strong password with at least 8 characters, numbers, and special symbols to keep your account secure.</p>
                      </div>

                      <div className="space-y-6 max-w-lg">
                         <div>
                             <label className="text-sm font-bold text-slate-700 mb-2 block">Current Password</label>
                            <div className="relative">
                               <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                               <input
                                 type="password" placeholder="••••••••"
                                 value={securityData.currentPassword}
                                 onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-[15px] font-medium text-slate-800 outline-none focus:bg-white focus:border-[#00a8cc] transition-colors" 
                               />
                            </div>
                         </div>
                         <div>
                             <label className="text-sm font-bold text-slate-700 mb-2 block">New Password</label>
                            <div className="relative">
                               <Unlock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                               <input
                                 type="password" placeholder="••••••••"
                                 value={securityData.newPassword}
                                 onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-[15px] font-medium text-slate-800 outline-none focus:bg-white focus:border-[#00a8cc] transition-colors" 
                               />
                            </div>
                         </div>
                      </div>
                   </motion.div>
                 )}

                 {activeTab === 'notifications' && (
                   <motion.div key="notifications" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex-1 space-y-8">
                      <h2 className="text-xl font-bold text-slate-800">Notification Preferences</h2>
                      <div className="space-y-4">
                         {[
                           { label: 'Session Reminders', desc: 'Get notified 30 minutes before a session starts.', status: true },
                           { label: 'New Material Alerts', desc: 'Alerts when new resources are added to your stream.', status: true },
                           { label: 'Direct Messages', desc: 'Receive emails when a tutor or peer sends you a message.', status: false }
                         ].map((item, i) => (
                           <div key={i} className="flex items-center justify-between p-6 rounded-2xl border border-slate-100 hover:border-[#00a8cc] transition-colors cursor-pointer">
                              <div>
                                 <h4 className="font-bold text-slate-800 mb-1">{item.label}</h4>
                                 <p className="text-sm font-medium text-slate-500">{item.desc}</p>
                              </div>
                              <div className={cn("w-12 h-6 rounded-full transition-colors flex items-center px-1 relative shrink-0", item.status ? "bg-[#00a8cc]" : "bg-slate-200")}>
                                 <motion.div animate={{ x: item.status ? '100%' : '0%' }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                              </div>
                           </div>
                         ))}
                      </div>
                   </motion.div>
                 )}
                  {activeTab === 'family' && user?.role === 'student' && (
                    <motion.div key="family" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex-1 space-y-8">
                       <h2 className="text-xl font-bold text-slate-800">Family Management</h2>
                       <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-start gap-4 mb-8">
                          <Users size={24} className="text-[#00a8cc] shrink-0" />
                          <div>
                             <p className="text-sm font-bold text-slate-800 mb-1">Parental Monitoring</p>
                             <p className="text-sm font-medium text-slate-600 leading-relaxed">Respond to requests from parents or guardians who want to monitor your academic progress and session activity.</p>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pending Requests</h3>
                          {linksLoading ? (
                             <div className="py-12 flex flex-col items-center gap-3 opacity-40">
                                <Loader2 size={32} className="animate-spin text-[#00a8cc]" />
                                <p className="text-xs font-bold uppercase tracking-widest">Fetching Requests...</p>
                             </div>
                          ) : linkRequests.length > 0 ? (
                             <div className="grid grid-cols-1 gap-4">
                                {linkRequests.map((req) => (
                                   <div key={req._id} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-[#00a8cc] transition-all">
                                      <div className="flex items-center gap-4">
                                         <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg">
                                            {req.parent?.username?.[0]?.toUpperCase() || 'P'}
                                         </div>
                                         <div>
                                            <h4 className="font-bold text-slate-800">{req.parent?.username}</h4>
                                            <p className="text-xs font-medium text-slate-400">{req.parent?.email}</p>
                                         </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-3 w-full md:w-auto">
                                         <button 
                                            onClick={() => studentRespondToLink(req._id, { approve: false })}
                                            className="flex-1 md:flex-none px-6 py-2.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border border-transparent hover:border-rose-100 flex items-center justify-center gap-2"
                                         >
                                            <X size={14} /> Decline
                                         </button>
                                         <button 
                                            onClick={() => studentRespondToLink(req._id, { approve: true })}
                                            className="flex-1 md:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-[#00a8cc] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                                         >
                                            <Check size={14} /> Approve
                                         </button>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          ) : (
                             <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl opacity-50 flex flex-col items-center gap-4">
                                <Users size={40} className="text-slate-200" />
                                <p className="text-sm font-medium text-slate-400">No pending family link requests.</p>
                             </div>
                          )}
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'professional' && user?.role === 'tutor' && tutorData && (
                    <motion.div key="professional" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex-1 space-y-8">
                       <div className="flex justify-between items-center">
                          <h2 className="text-xl font-bold text-slate-800">Professional Profile</h2>
                          <span className={cn(
                             "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                             tutorData.verificationStatus === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                          )}>
                             {tutorData.verificationStatus}
                          </span>
                       </div>

                       <div className="space-y-6">
                          <div>
                             <label className="text-sm font-bold text-slate-700 mb-2 block">Professional Bio</label>
                             <textarea 
                               value={tutorData.bio}
                               onChange={(e) => setTutorData({...tutorData, bio: e.target.value})}
                               rows={4}
                               className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[15px] font-medium text-slate-800 outline-none focus:bg-white focus:border-[#00a8cc] transition-colors resize-none"
                             />
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                             <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">Hourly Rate (LKR)</label>
                                <input 
                                  type="number"
                                  value={tutorData.hourlyRate}
                                  onChange={(e) => setTutorData({...tutorData, hourlyRate: Number(e.target.value)})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800"
                                />
                             </div>
                             <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">Years of Experience</label>
                                <input 
                                  type="number"
                                  value={tutorData.experience}
                                  onChange={(e) => setTutorData({...tutorData, experience: Number(e.target.value)})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800"
                                />
                             </div>
                          </div>

                          <div>
                             <div className="flex justify-between items-center mb-4">
                                <label className="text-sm font-bold text-slate-700">Areas of Expertise</label>
                                <button 
                                  onClick={() => setTutorData({...tutorData, expertise: [...tutorData.expertise, { stream: 'Combined Mathematics', grades: ['12', '13'] }]})}
                                  className="text-xs font-black text-[#00a8cc] flex items-center gap-1 hover:underline"
                                >
                                   <Plus size={14} /> Add Expertise
                                </button>
                             </div>
                             <div className="space-y-4">
                                {tutorData.expertise?.map((exp, idx) => (
                                   <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4">
                                      <div className="flex justify-between items-start">
                                         <div className="flex-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Stream</label>
                                            <select 
                                               value={exp.stream}
                                               onChange={(e) => {
                                                  const newExp = [...tutorData.expertise];
                                                  newExp[idx].stream = e.target.value;
                                                  setTutorData({...tutorData, expertise: newExp});
                                               }}
                                               className="w-full bg-white border border-slate-200 rounded-xl p-2 text-sm font-bold"
                                            >
                                               {['Combined Mathematics', 'Biological Sciences', 'Commercial Stream', 'Physical Sciences', 'Arts Stream', 'Technology Stream', 'O/L General', 'London A/L'].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                         </div>
                                         <button 
                                           onClick={() => {
                                              const newExp = tutorData.expertise.filter((_, i) => i !== idx);
                                              setTutorData({...tutorData, expertise: newExp});
                                           }}
                                           className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                         >
                                            <Trash2 size={18} />
                                         </button>
                                      </div>
                                      <div>
                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Target Grades</label>
                                         <div className="flex flex-wrap gap-2">
                                            {['6', '7', '8', '9', '10', '11', '12', '13'].map(g => (
                                               <button
                                                  key={g}
                                                  onClick={() => {
                                                     const newExp = [...tutorData.expertise];
                                                     const grades = newExp[idx].grades;
                                                     if (grades.includes(g)) {
                                                        newExp[idx].grades = grades.filter(gr => gr !== g);
                                                     } else {
                                                        newExp[idx].grades = [...grades, g];
                                                     }
                                                     setTutorData({...tutorData, expertise: newExp});
                                                  }}
                                                  className={cn(
                                                     "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                                                     exp.grades.includes(g) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-[#00a8cc]"
                                                  )}
                                               >
                                                  Grade {g}
                                               </button>
                                            ))}
                                         </div>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  )}
               </AnimatePresence>

              {/* Footer Actions */}
              <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-end gap-6 h-[88px]">
                 {saveStatus === 'success' && <span className="text-emerald-500 font-bold flex items-center gap-2 text-sm"><CheckCircle2 size={18} /> Saved</span>}
                 {saveStatus === 'error' && <span className="text-rose-500 font-bold flex items-center gap-2 text-sm"><AlertCircle size={18} /> Error saving</span>}
                 <button onClick={handleSave} disabled={saveStatus === 'saving'} className="bg-slate-900 hover:bg-[#00a8cc] disabled:bg-slate-400 text-white px-8 py-3.5 rounded-xl font-bold transition-colors flex items-center gap-2 min-w-[140px] justify-center">
                    {saveStatus === 'saving' ? <Loader2 size={18} className="animate-spin" /> : <>Save Changes <Save size={18}/></>}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;