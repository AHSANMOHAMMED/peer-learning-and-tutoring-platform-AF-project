import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Calendar as CalendarIcon, Clock, AlertTriangle, MessageCircle, Video, 
  DollarSign, User, BookOpen, CheckCircle, Star, FileText, Send, X, Plus, 
  Edit2, Trash2, Zap, BarChart3, RefreshCw, ShoppingBag, Brain, Layout as LayoutIcon
} from 'lucide-react';
import { format } from 'date-fns';
import DashboardShell from '../components/ui/DashboardShell';
import MetricCard from '../components/ui/MetricCard';
import { useAuth } from '../controllers/useAuth';
import { useBookings } from '../controllers/useBookings';
import { useTutors } from '../controllers/useTutors';
import { homeworkApi, questionApi, qaApi, tutorApi, materialApi, bookingApi, notificationApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { cn } from '../utils/cn';

const toArray = (response, key) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.[key])) return response[key];
  if (Array.isArray(response?.data?.[key])) return response.data[key];
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const TutorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bookings, fetchBookings } = useBookings();
  const { tutors, fetchTutors, getTutorByUserId, loading: tutorLoading } = useTutors();
  
  const [activeTab, setActiveTab] = useState('Calendar');
  const [tutorProfile, setTutorProfile] = useState(null);
  const [availability, setAvailability] = useState({
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
  });
  
  const [myStudents, setMyStudents] = useState([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [myMaterials, setMyMaterials] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [pendingHomework, setPendingHomework] = useState([]);
  
  const [loadingQA, setLoadingQA] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);

  // Modals
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialData, setMaterialData] = useState({ title: '', description: '', fileUrl: '', fileType: 'pdf', subject: 'Mathematics', grade: '10', price: 0 });
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const emptyChallenge = { title: '', content: '', subject: 'Mathematics', grade: '10', type: 'structured', difficulty: 'Easy', points: 5, correctAnswer: '', explanation: '' };
  const [challengeData, setChallengeData] = useState(emptyChallenge);
  const [editingChallengeId, setEditingChallengeId] = useState(null);
  
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ title: '', message: '', targetRole: 'student', targetGrade: '10' });
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Initial Data Fetching
  useEffect(() => {
    fetchBookings();
    if (user?._id) {
      getTutorByUserId(user._id)
        .then(data => {
          setTutorProfile(data);
          if (data?.availability) setAvailability(data.availability);
        })
        .catch(() => console.log("Tutor profile not found"));
      fetchUnansweredQuestions();
    }
  }, [fetchBookings, getTutorByUserId, user?._id]);

  // Tab-specific data fetching
  useEffect(() => {
    if (activeTab === 'Students') fetchMyStudents();
    if (activeTab === 'Materials') fetchMyMaterials();
    if (activeTab === 'Challenges') fetchMyChallenges();
    if (activeTab === 'Homework') fetchPendingHomework();
  }, [activeTab]);

  const fetchMyStudents = async () => {
    const uniqueStudents = [];
    const studentIds = new Set();
    bookings.forEach(b => {
      if (b.studentId && !studentIds.has(b.studentId._id)) {
        studentIds.add(b.studentId._id);
        uniqueStudents.push({
          ...b.studentId,
          lastSession: b.date,
          totalSessions: bookings.filter(sb => sb.studentId?._id === b.studentId._id).length,
          subject: b.subject
        });
      }
    });
    setMyStudents(uniqueStudents);
  };

  const fetchMyMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const res = await materialApi.getMyMaterials();
      setMyMaterials(toArray(res, 'materials'));
    } catch (err) { console.error(err); } finally { setLoadingMaterials(false); }
  };

  const fetchMyChallenges = async () => {
    try {
      setLoadingChallenges(true);
      const res = await qaApi.getAll({ mine: true, limit: 100 });
      setMyChallenges(toArray(res, 'questions'));
    } catch (err) { console.error(err); } finally { setLoadingChallenges(false); }
  };

  const fetchPendingHomework = async () => {
    try {
      const res = await homeworkApi.getTutorPending();
      setPendingHomework(toArray(res, 'homework'));
    } catch (err) { console.error(err); }
  };

  const handleBroadcast = async () => {
    if (!broadcastData.title.trim() || !broadcastData.message.trim()) {
      toast.error('Headline and message are required');
      return;
    }

    try {
      setIsBroadcasting(true);
      const response = await notificationApi.broadcast({
        title: broadcastData.title,
        message: broadcastData.message,
        targetRole: broadcastData.targetRole,
        targetGrade: broadcastData.targetGrade,
        type: 'info',
        priority: 'normal',
        data: {
          senderId: user?._id,
          senderRole: user?.role,
          source: 'tutor-dashboard'
        }
      });

      toast.success(response?.message || 'Broadcast sent');
      setBroadcastData({ title: '', message: '', targetRole: 'student', targetGrade: '10' });
      setShowBroadcastModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const fetchUnansweredQuestions = async () => {
    try {
      setLoadingQA(true);
      const res = await questionApi.getAll({ unanswered: true, limit: 3 });
      setUnansweredQuestions(toArray(res, 'questions'));
    } catch (err) { console.error(err); } finally { setLoadingQA(false); }
  };

  // Availability
  const addTimeSlot = (day) => {
    setAvailability(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), { start: '09:00', end: '10:00' }]
    }));
  };

  const removeTimeSlot = (day, index) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (day, index, field, value) => {
    const newDaySlots = [...availability[day]];
    newDaySlots[index][field] = value;
    setAvailability(prev => ({ ...prev, [day]: newDaySlots }));
  };

  const handleUpdateAvailability = async () => {
    if (!tutorProfile?._id) return;
    setIsUpdatingAvailability(true);
    try {
      await tutorApi.updateProfile(tutorProfile._id, { availability });
      toast.success('Availability saved!');
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const handleBookingAction = async (id, status) => {
    try {
      await bookingApi.updateStatus(id, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (err) {
      toast.error('Failed to update booking');
    }
  };

  const handleSaveMaterial = async () => {
    if (!materialData.title || !materialData.fileUrl) return toast.error('Please provide title and file');
    setMaterialLoading(true);
    try {
      if (editingMaterialId) {
        await materialApi.update(editingMaterialId, materialData);
        toast.success('Material updated!');
      } else {
        await materialApi.upload(materialData);
        toast.success('Material uploaded!');
      }
      setShowMaterialModal(false);
      fetchMyMaterials();
    } catch (err) { toast.error('Save failed'); } finally { setMaterialLoading(false); }
  };

  const handleMaterialFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('files', file);

    const token = localStorage.getItem('token');
    toast.loading('Uploading file...', { id: 'upload' });
    
    try {
      const response = await fetch('/api/materials/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setMaterialData({ ...materialData, fileUrl: data.url, fileType: data.type });
        toast.success('File uploaded!', { id: 'upload' });
      } else {
        toast.error('Upload failed', { id: 'upload' });
      }
    } catch (err) {
      toast.error('Upload error', { id: 'upload' });
    }
  };

  const [materialLoading, setMaterialLoading] = useState(false);

  const handleSaveChallenge = async () => {
    try {
      if (editingChallengeId) {
        await qaApi.update(editingChallengeId, challengeData);
        toast.success('Challenge updated!');
      } else {
        await qaApi.create(challengeData);
        toast.success('Challenge posted!');
      }
      setChallengeData(emptyChallenge);
      setEditingChallengeId(null);
      setShowChallengeModal(false);
      fetchMyChallenges();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  // Stats
  const activeSessions = bookings.filter(b => b.status === 'scheduled').length;
  const totalEarnings = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.price || 0), 0);

  if (tutorLoading) return <DashboardShell userRole="tutor"><div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="animate-spin text-[#00a8cc]" size={40} /></div></DashboardShell>;

  if (!tutorProfile || tutorProfile.verificationStatus !== 'approved') {
    return (
      <DashboardShell userRole="tutor">
        <div className="max-w-4xl mx-auto py-20 px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 text-center">
            <div className="w-24 h-24 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
               <AlertTriangle size={48} className="text-amber-500" />
            </div>
            <h1 className="text-4xl font-black text-slate-800 mb-4">{tutorProfile ? 'Verification Pending' : 'Profile Incomplete'}</h1>
            <p className="text-slate-500 font-medium mb-12 max-w-lg mx-auto leading-relaxed">
              {tutorProfile ? "Your tutor application is being reviewed. You'll be notified once you're approved to teach." : "Welcome to Aura! Please set up your professional profile to start tutoring."}
            </p>
            {!tutorProfile && <button onClick={() => navigate('/settings')} className="bg-[#00a8cc] text-white px-12 py-4 rounded-2xl font-black transition-all shadow-xl">Complete Setup</button>}
          </motion.div>
        </div>
      </DashboardShell>
    );
  }

  const tabs = ['Calendar', 'Upcoming', 'Students', 'Challenges', 'Materials', 'Homework', 'Availability'];

  return (
    <DashboardShell 
      userRole="tutor"
      title={`Hello, ${user?.profile?.firstName || user?.username}`}
      subtitle="Here's what's happening in your classroom today."
      headerActions={
        <button onClick={() => setShowBroadcastModal(true)} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
           <Send size={16} /> Broadcast Update
        </button>
      }
    >
      <div className="w-full pb-20">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           <MetricCard 
              label="Active Sessions" 
              value={activeSessions} 
              icon={<Video size={18} />} 
              color="indigo" 
            />
            <MetricCard 
              label="Total Earnings" 
              value={`LKR ${totalEarnings}`} 
              icon={<DollarSign size={18} />} 
              color="emerald" 
            />
            <MetricCard 
              label="New Questions" 
              value={unansweredQuestions.length} 
              icon={<MessageCircle size={18} />} 
              color="amber" 
            />
            <MetricCard 
              label="Pending Grades" 
              value={pendingHomework.length} 
              icon={<FileText size={18} />} 
              color="rose" 
            />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-slate-200 mb-10 overflow-x-auto no-scrollbar">
           {tabs.map(t => (
             <button key={t} onClick={() => setActiveTab(t)} className={cn("pb-5 px-1 text-sm font-bold border-b-4 transition-all whitespace-nowrap", activeTab === t ? "border-[#00a8cc] text-[#00a8cc]" : "border-transparent text-slate-400 hover:text-slate-600")}>{t}</button>
           ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
           {activeTab === 'Calendar' && (
             <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-soft">
                <div className="grid grid-cols-7 gap-4">
                   {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-4">{d}</div>)}
                   {Array.from({ length: 35 }).map((_, i) => (
                     <div key={i} className="aspect-square rounded-2xl border border-slate-50 bg-slate-50/50 p-3 relative group">
                        <span className="text-xs font-bold text-slate-300">{i + 1}</span>
                        {bookings.some(b => new Date(b.date).getDate() === (i + 1)) && <div className="absolute bottom-3 left-3 right-3 h-1.5 bg-[#00a8cc] rounded-full" />}
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'Upcoming' && (
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {bookings.filter(b => b.status === 'scheduled' || b.status === 'pending').map(b => (
                  <div key={b._id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-soft">
                     <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl font-black text-[#00a8cc]">{b.studentId?.username?.[0]}</div>
                        <div>
                           <h4 className="text-2xl font-black text-slate-800">{b.studentId?.profile?.firstName || b.studentId?.username}</h4>
                           <p className="text-sm font-bold text-[#00a8cc] uppercase tracking-widest">{b.subject}</p>
                        </div>
                     </div>
                     <div className="flex gap-4 mb-8">
                        <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                           <p className="font-black text-slate-800">{b.startTime} - {b.endTime}</p>
                        </div>
                        <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                           <p className="font-black text-slate-800">{format(new Date(b.date), 'MMM dd')}</p>
                        </div>
                     </div>
                     <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <span className="text-xl font-black text-slate-800">LKR {b.price}</span>
                        <div className="flex gap-3">
                           {b.status === 'pending' ? (
                             <>
                               <button onClick={() => handleBookingAction(b._id, 'rejected')} className="px-6 py-3 text-rose-500 font-bold">Reject</button>
                               <button onClick={() => handleBookingAction(b._id, 'scheduled')} className="bg-[#00a8cc] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">Accept</button>
                             </>
                           ) : (
                             <button onClick={() => navigate(`/session/${b._id}`)} className="bg-slate-900 text-white px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2"><Video size={16} /> Start Session</button>
                           )}
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}

           {activeTab === 'Availability' && (
             <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-soft">
                <div className="flex justify-between items-center mb-12">
                   <h2 className="text-2xl font-black text-slate-800 tracking-tight">Availability Schedule</h2>
                   <button onClick={handleUpdateAvailability} disabled={isUpdatingAvailability} className="bg-[#00a8cc] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
                     {isUpdatingAvailability ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />} Save Schedule
                   </button>
                </div>
                <div className="space-y-6">
                   {Object.keys(availability).map(day => (
                     <div key={day} className="flex flex-col md:flex-row gap-8 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 items-start md:items-center">
                        <div className="w-32"><h4 className="font-black text-slate-800 capitalize text-xl">{day}</h4></div>
                        <div className="flex-1 flex flex-wrap gap-4">
                           {availability[day]?.map((slot, idx) => (
                             <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                                <input type="time" value={slot.start} onChange={e => updateTimeSlot(day, idx, 'start', e.target.value)} className="bg-transparent font-bold text-slate-700 outline-none" />
                                <span className="text-slate-300 font-black">-</span>
                                <input type="time" value={slot.end} onChange={e => updateTimeSlot(day, idx, 'end', e.target.value)} className="bg-transparent font-bold text-slate-700 outline-none" />
                                <button onClick={() => removeTimeSlot(day, idx)} className="text-rose-400 hover:text-rose-600 p-1"><X size={16} /></button>
                             </div>
                           ))}
                           <button onClick={() => addTimeSlot(day)} className="px-4 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-[#00a8cc] hover:text-[#00a8cc] transition-all"><Plus size={20} /></button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'Materials' && (
             <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-soft">
                <div className="flex justify-between items-center mb-10">
                   <h2 className="text-2xl font-black text-slate-800">My Materials</h2>
                   <button onClick={() => { setEditingMaterialId(null); setMaterialData({ title: '', description: '', fileUrl: '', fileType: 'pdf', subject: 'Mathematics', grade: '10', price: 0 }); setShowMaterialModal(true); }} className="bg-[#00a8cc] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2"><Plus size={16} /> New Resource</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {myMaterials.map(m => (
                     <div key={m._id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-[#00a8cc] transition-all">
                        <FileText className="text-[#00a8cc] mb-4" size={32} />
                        <h4 className="text-lg font-black text-slate-800 mb-1">{m.title}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{m.subject} &bull; Grade {m.grade}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                           <span className="text-sm font-black text-[#00a8cc]">{m.price > 0 ? `LKR ${m.price}` : 'FREE'}</span>
                           <div className="flex gap-2">
                              <button onClick={() => { setEditingMaterialId(m._id); setMaterialData(m); setShowMaterialModal(true); }} className="p-2 text-slate-400 hover:text-[#00a8cc]"><Edit2 size={16}/></button>
                              <button onClick={async () => { if(window.confirm('Delete?')) { await materialApi.delete(m._id); fetchMyMaterials(); } }} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16}/></button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'Challenges' && (
             <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-soft">
                <div className="flex justify-between items-center mb-10">
                   <h2 className="text-2xl font-black text-slate-800">Knowledge Challenges</h2>
                   <button onClick={() => { setEditingChallengeId(null); setChallengeData(emptyChallenge); setShowChallengeModal(true); }} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2"><Plus size={16} /> New Challenge</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {myChallenges.map(q => (
                     <div key={q._id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-600 transition-all">
                        <Zap className="text-indigo-600 mb-4" size={32} />
                        <h4 className="text-lg font-black text-slate-800 mb-1">{q.title}</h4>
                        <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-4">{q.content || q.body}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{q.subject} &bull; Grade {q.grade}</span>
                           <div className="flex gap-2">
                              <button onClick={() => { setEditingChallengeId(q._id); setChallengeData({ ...emptyChallenge, ...q, content: q.content || q.body || '' }); setShowChallengeModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={16}/></button>
                              <button onClick={async () => { if(window.confirm('Delete?')) { await qaApi.delete(q._id); fetchMyChallenges(); } }} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16}/></button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}
        </div>

        {/* Modals */}
        <AnimatePresence>
           {showMaterialModal && (
             <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] p-10 w-full max-w-xl shadow-2xl relative">
                   <button onClick={() => setShowMaterialModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><X size={24} /></button>
                   <h3 className="text-3xl font-black text-slate-800 mb-8">{editingMaterialId ? 'Edit Resource' : 'Upload Resource'}</h3>
                   <div className="space-y-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                        <input type="text" placeholder="Material Title" value={materialData.title} onChange={e => setMaterialData({...materialData, title: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#00a8cc] font-bold" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">File Resource</label>
                        <div className="flex gap-4">
                           <label className="flex-1 cursor-pointer bg-slate-100 border-2 border-dashed border-slate-200 p-4 rounded-2xl flex items-center justify-center gap-2 hover:border-[#00a8cc] transition-all group">
                              <FileText className="text-slate-400 group-hover:text-[#00a8cc]" size={20} />
                              <span className="text-sm font-bold text-slate-500">{materialData.fileUrl ? 'Change File' : 'Select PDF/Image'}</span>
                              <input type="file" className="hidden" onChange={handleMaterialFileUpload} />
                           </label>
                           {materialData.fileUrl && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-2"><CheckCircle size={20} /> Ready</div>}
                        </div>
                      </div>
                      <textarea placeholder="Description" rows={3} value={materialData.description} onChange={e => setMaterialData({...materialData, description: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#00a8cc] font-medium" />
                      <div className="grid grid-cols-2 gap-4">
                         <input type="number" placeholder="Price (LKR)" value={materialData.price} onChange={e => setMaterialData({...materialData, price: Number(e.target.value)})} className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#00a8cc] font-bold" />
                         <select value={materialData.grade} onChange={e => setMaterialData({...materialData, grade: e.target.value})} className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#00a8cc] font-bold">
                            {['10', '11', '12', '13'].map(g => <option key={g} value={g}>Grade {g}</option>)}
                         </select>
                      </div>
                      <button onClick={handleSaveMaterial} disabled={materialLoading} className="w-full py-5 bg-[#00a8cc] text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-[#00a8cc]/20">{materialLoading ? 'Saving...' : 'Save Resource'}</button>
                   </div>
                </motion.div>
             </div>
           )}

           {showChallengeModal && (
             <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] p-10 w-full max-w-xl shadow-2xl relative">
                   <button onClick={() => setShowChallengeModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><X size={24} /></button>
                   <h3 className="text-3xl font-black text-slate-800 mb-8">{editingChallengeId ? 'Edit Challenge' : 'New Challenge'}</h3>
                   <div className="space-y-6">
                      <input type="text" placeholder="Challenge Title" value={challengeData.title} onChange={e => setChallengeData({...challengeData, title: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-bold" />
                      <textarea placeholder="Challenge Content / Question" rows={4} value={challengeData.content} onChange={e => setChallengeData({...challengeData, content: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-medium" />
                      <div className="grid grid-cols-2 gap-4">
                         <select value={challengeData.subject} onChange={e => setChallengeData({...challengeData, subject: e.target.value})} className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-bold">
                            {['Mathematics', 'Science', 'ICT', 'Accounting'].map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                         <select value={challengeData.grade} onChange={e => setChallengeData({...challengeData, grade: e.target.value})} className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-bold">
                            {['10', '11', '12', '13'].map(g => <option key={g} value={g}>Grade {g}</option>)}
                         </select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <select value={challengeData.type} onChange={e => setChallengeData({...challengeData, type: e.target.value})} className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-bold">
                            <option value="structured">Structured</option>
                            <option value="mcq">MCQ</option>
                            <option value="essay">Essay</option>
                         </select>
                         <select value={challengeData.difficulty} onChange={e => setChallengeData({...challengeData, difficulty: e.target.value})} className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-bold">
                            {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                         <input type="number" min="0" placeholder="Points" value={challengeData.points} onChange={e => setChallengeData({...challengeData, points: Number(e.target.value)})} className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-bold" />
                      </div>
                      <textarea placeholder="Correct answer / marking guide" rows={3} value={challengeData.correctAnswer} onChange={e => setChallengeData({...challengeData, correctAnswer: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-medium" />
                      <textarea placeholder="Explanation for students" rows={3} value={challengeData.explanation} onChange={e => setChallengeData({...challengeData, explanation: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-medium" />
                      <button onClick={handleSaveChallenge} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20">{editingChallengeId ? 'Update Challenge' : 'Post Challenge'}</button>
                   </div>
                </motion.div>
             </div>
           )}

           {showBroadcastModal && (
             <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] p-10 w-full max-w-xl shadow-2xl relative">
                   <button onClick={() => setShowBroadcastModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><X size={24} /></button>
                   <h3 className="text-3xl font-black text-slate-800 mb-2">Global Broadcast</h3>
                   <p className="text-slate-500 font-medium mb-8">Send a notification to all your students instantly.</p>
                   <div className="space-y-6">
                      <input type="text" placeholder="Headline" value={broadcastData.title} onChange={e => setBroadcastData({...broadcastData, title: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-slate-800 font-bold" />
                      <textarea placeholder="Your message..." rows={4} value={broadcastData.message} onChange={e => setBroadcastData({...broadcastData, message: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-slate-800 font-medium" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <select value={broadcastData.targetRole} onChange={e => setBroadcastData({...broadcastData, targetRole: e.target.value})} className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-slate-800 font-bold">
                            <option value="student">Students</option>
                            <option value="tutor">Tutors</option>
                            <option value="mentor">Mentors</option>
                         </select>
                         <select value={broadcastData.targetGrade} onChange={e => setBroadcastData({...broadcastData, targetGrade: e.target.value})} className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-slate-800 font-bold">
                            {['6', '7', '8', '9', '10', '11', '12', '13'].map(g => <option key={g} value={g}>Grade {g}</option>)}
                         </select>
                      </div>
                      <button onClick={handleBroadcast} disabled={isBroadcasting} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl disabled:opacity-60">
                        {isBroadcasting ? 'Sending...' : 'Send Now'}
                      </button>
                   </div>
                </motion.div>
             </div>
           )}
        </AnimatePresence>

      </div>
    </DashboardShell>
  );
};

export default TutorDashboard;
