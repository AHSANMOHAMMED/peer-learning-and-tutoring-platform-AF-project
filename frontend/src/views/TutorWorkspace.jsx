import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  BookOpen,
  Plus,
  ShieldCheck,
  Award,
  Upload,
  CheckCircle2,
  Lock,
  FileText,
  Activity,
  ArrowUpRight,
  Trash2,
  Users,
  Settings,
  UserCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import { useAuth } from '../controllers/useAuth';
import { useBookings } from '../controllers/useBookings';
import { useMaterials } from '../controllers/useMaterials';
import { useTutors } from '../controllers/useTutors';
import { cn } from '../utils/cn';

const TutorWorkspace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, fetchBookings } = useBookings();
  const { materials, fetchMaterials } = useMaterials();
  const { registerTutor, getTutorByUserId, loading: tutorLoading } = useTutors();
  
  const [activeTab, setActiveTab] = useState('pipeline');
  
  // Tutor Profile Form State
  const [tutorProfile, setTutorProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
     subjects: '',
     bio: '',
     education: '',
     alStream: 'Combined Mathematics',
     experience: '',
     hourlyRate: '',
     availability: ''
  });

  useEffect(() => {
    fetchBookings();
    fetchMaterials();
    // Attempt to load existing tutor profile if the user context provides it
    if (user?._id) {
       getTutorByUserId(user._id).then(data => {
          setTutorProfile(data);
          if (data) {
             setProfileForm({
                subjects: Array.isArray(data.subjects) ? data.subjects.join(', ') : data.subjects || '',
                bio: data.bio || '',
                education: data.education || '',
                alStream: data.alStream || 'Combined Mathematics',
                experience: data.experience || '',
                hourlyRate: data.hourlyRate || '',
                availability: data.availability ? JSON.stringify(data.availability) : ''
             });
          }
       }).catch(() => {
          // It's normal if they aren't a registered tutor yet (404)
       });
    }
  }, [fetchBookings, fetchMaterials, getTutorByUserId, user]);

  const tutorBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'in_progress');
  const tutorMaterials = materials.filter((m) => m.uploaderId && typeof m.uploaderId === 'object' && m.uploaderId._id === user?._id);

  const handleProfileSubmit = async (e) => {
     e.preventDefault();
     try {
        const payload = {
           ...profileForm,
           subjects: profileForm.subjects.split(',').map(s => s.trim()),
           hourlyRate: Number(profileForm.hourlyRate),
           availability: profileForm.availability ? JSON.parse(profileForm.availability) : {}
        };
        await registerTutor(payload);
        toast.success("Tutor Profile successfully registered/updated!");
     } catch (err) {
        toast.error(err.message || "Failed to update tutor profile. Check fields.");
     }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <Layout userRole="tutor">
      <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/10 overflow-x-hidden relative p-6 md:p-8">

        <motion.div 
          className="relative z-10 max-w-[1440px] mx-auto space-y-8"
          variants={containerVariants}
          initial="hidden" animate="visible"
        >
          {/* Header Dashboard Workspace Area */}
          <motion.div 
            variants={itemVariants} 
            className="relative overflow-hidden rounded-3xl bg-indigo-600 p-8 md:p-12 text-white shadow-2xl"
          >
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
             <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12">
                <div className="flex-1 max-w-4xl space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-sm text-center shrink-0">
                         <BookOpen className="text-white" size={24} />
                      </div>
                      <div>
                         <span className="text-xs font-bold tracking-widest uppercase text-indigo-200">Tutor Management Area</span>
                         <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-glow-emerald" />
                            <span className="text-xs font-bold uppercase text-white/70">Workspace Online</span>
                         </div>
                      </div>
                   </div>
                   <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none text-white">
                      Educator Workspace.
                   </h1>
                   <p className="text-indigo-100 text-base font-medium leading-relaxed max-w-xl">
                      Manage your upcoming learning sessions, upload scholastic materials, and manage your public tutor profile and rate settings.
                   </p>

                   <div className="flex flex-wrap gap-4 justify-start shrink-0 pt-4">
                      <button onClick={() => navigate('/materials')} className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl border border-white/20 transition-all font-bold text-sm flex items-center gap-2 shadow-sm">
                         <Plus size={16} /> Upload Material
                      </button>
                      <button onClick={() => setActiveTab('profile')} className="px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-800">
                         <Settings size={16} /> Profile Settings
                      </button>
                   </div>
                </div>
             </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap bg-white border border-slate-200 p-1.5 rounded-2xl w-fit shadow-sm">
             {[
               { id: 'pipeline', label: 'Upcoming Sessions', icon: Clock },
               { id: 'assets', label: 'Materials Library', icon: BookOpen },
               { id: 'profile', label: 'Tutor Settings', icon: UserCircle },
               { id: 'qa', label: 'QA Forum', icon: FileText } // Link to QA Page
             ].map((tab) => (
                <button
                  key={tab.id}
                   onClick={() => {
                      if(tab.id === 'qa') {
                         navigate('/tutor/qa');
                      } else {
                         setActiveTab(tab.id);
                      }
                   }}
                   className={cn(
                      "px-6 py-2.5 rounded-xl flex items-center gap-2.5 transition-all",
                      activeTab === tab.id 
                        ? "bg-indigo-600 text-white shadow-md font-bold" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
                   )}
                >
                   <tab.icon size={18} />
                   <span className="text-sm">{tab.label}</span>
                </button>
             ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'pipeline' && (
              <motion.div 
                key="pipeline"
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {tutorBookings.length > 0 ? tutorBookings.map((booking, i) => (
                   <div key={i} className="p-8 bg-white border border-slate-200 rounded-3xl hover:border-indigo-300 transition-all shadow-sm h-full flex flex-col">
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xl border border-indigo-200">
                            {booking.studentId?.username?.[0] || 'S'}
                         </div>
                         <div>
                            <h4 className="text-lg font-bold text-slate-800 line-clamp-1">{booking.studentId?.username}</h4>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{booking.subject}</p>
                         </div>
                      </div>
                      
                      <div className="flex-1 space-y-6">
                         <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                               <Clock size={18} className="text-indigo-500" /> SCHEDULE
                            </div>
                            <span className="text-sm font-bold text-slate-800">{booking.startTime} • {booking.endTime}</span>
                         </div>
                      </div>

                      <button onClick={() => navigate(`/session/${booking._id}`)} className="w-full mt-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2">
                         Start Session <ArrowUpRight size={16} />
                      </button>
                   </div>
                )) : (
                   <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 bg-white rounded-3xl flex flex-col items-center gap-4 shadow-sm">
                     <Clock className="text-slate-300" size={64} />
                     <p className="text-lg font-bold text-slate-400">No upcoming sessions scheduled.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'assets' && (
              <motion.div 
                key="assets"
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm"
              >
                 <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="text-sm font-bold text-slate-400 border-b border-slate-200">
                             <th className="px-6 py-4">Title</th>
                             <th className="px-6 py-4">Subject</th>
                             <th className="px-6 py-4 text-center">Status</th>
                             <th className="px-6 py-4 text-right">Actions</th>
                       </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {tutorMaterials.map((mat, i) => (
                             <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-5">
                                   <div className="flex items-center gap-4">
                                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><FileText size={18} /></div>
                                      <h4 className="font-bold text-slate-800 text-base">{mat.title}</h4>
                                   </div>
                                </td>
                                <td className="px-6 py-5">
                                   <p className="text-sm font-bold text-slate-600">{mat.subject}</p>
                                   <p className="text-xs font-semibold text-indigo-500">Grade {mat.grade}</p>
                                </td>
                                <td className="px-6 py-5 text-center">
                                  <span className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold",
                                    mat.moderationStatus === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                  )}>
                                    {mat.moderationStatus === 'approved' ? 'Active' : 'Pending'}
                                  </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                   <div className="flex justify-end gap-3">
                                      <button className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"><ArrowUpRight size={16} /></button>
                                      <button className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors shadow-sm"><Trash2 size={16} /></button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                          {tutorMaterials.length === 0 && (
                            <tr>
                               <td colSpan={4} className="py-20 text-center text-sm font-bold text-slate-400">No materials uploaded in your library.</td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 xl:grid-cols-12 gap-8"
              >
                 <div className="xl:col-span-4 space-y-6">
                    <div className="p-8 bg-indigo-600 rounded-3xl text-white shadow-lg flex flex-col justify-between">
                       <div className="space-y-4 mb-8">
                          <div className="p-3 bg-white/20 w-fit rounded-xl backdrop-blur-md border border-white/10"><ShieldCheck size={28} /></div>
                          <h3 className="text-2xl font-bold">Public Tutor Profile</h3>
                          <p className="text-indigo-100 font-medium text-sm leading-relaxed">
                             Completing this profile makes you discoverable by students across the platform. Set your rates, bio, and subjects for the SmartMatch engine to rank you high.
                          </p>
                       </div>
                       <div className="flex items-center gap-3 font-bold text-sm bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                          <Activity size={18} className="text-emerald-300" /> API Synchronized
                       </div>
                    </div>
                 </div>

                 <div className="xl:col-span-8 bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
                    <div className="mb-8">
                       <h3 className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                          <Settings className="text-indigo-600" size={24} /> Configuration Form
                       </h3>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-sm font-bold text-slate-700">Subjects Taught (comma separated)</label>
                             <input 
                               required
                               placeholder="e.g. Math, Physics, Logic" 
                               className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-slate-50"
                               value={profileForm.subjects}
                               onChange={(e) => setProfileForm({...profileForm, subjects: e.target.value})}
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-sm font-bold text-slate-700">Hourly Rate (Rs)</label>
                             <input 
                               required
                               type="number"
                               placeholder="e.g. 1500" 
                               className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-slate-50"
                               value={profileForm.hourlyRate}
                               onChange={(e) => setProfileForm({...profileForm, hourlyRate: e.target.value})}
                             />
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Biography / Introduction</label>
                          <textarea 
                             required
                             placeholder="Write a brief introduction about yourself to students..." 
                             className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-slate-50 min-h-[120px]"
                             value={profileForm.bio}
                             onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                          />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-sm font-bold text-slate-700">Education Details</label>
                             <input 
                               required
                               placeholder="e.g. BSc Computer Science, UOC" 
                               className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-slate-50"
                               value={profileForm.education}
                               onChange={(e) => setProfileForm({...profileForm, education: e.target.value})}
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-sm font-bold text-slate-700">A/L Stream</label>
                             <select 
                               required
                               className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-slate-50 text-slate-900"
                               value={profileForm.alStream}
                               onChange={(e) => setProfileForm({...profileForm, alStream: e.target.value})}
                             >
                                {[
                                    'Combined Mathematics', 
                                    'Biological Sciences', 
                                    'Commercial Stream', 
                                    'Physical Sciences', 
                                    'Arts Stream', 
                                    'Technology Stream', 
                                    'O/L General',
                                    'London A/L', 
                                    'Other'
                                 ].map(stream => (
                                    <option key={stream} value={stream}>{stream}</option>
                                 ))}
                             </select>
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Experience Highlights</label>
                          <input 
                            required
                            placeholder="e.g. 3 years tutoring A/L ICT" 
                            className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-slate-50"
                            value={profileForm.experience}
                            onChange={(e) => setProfileForm({...profileForm, experience: e.target.value})}
                          />
                       </div>

                       <div className="pt-6 border-t border-slate-100 flex justify-end">
                          <button 
                             disabled={tutorLoading}
                             type="submit" 
                             className="px-8 py-4 bg-indigo-600 border border-indigo-700 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                             {tutorLoading ? <Activity className="animate-spin" /> : <Upload size={18} />} Activate / Update Profile
                          </button>
                       </div>
                    </form>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </Layout>
  );
};

export default TutorWorkspace;