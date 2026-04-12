import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Activity, TrendingUp, Target, Calendar, CheckCircle2, ShieldCheck, Award, MessageCircle, Clock, Plus, X, Send } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { useAuth } from '../controllers/useAuth';
import { parentApi, messageApi, fileApi } from '../services/api';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';
import VoiceRecorder from '../components/VoiceRecorder';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const ParentDashboard = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [summary, setSummary] = useState(null);
  const [livePulseData, setLivePulseData] = useState([]);
  
  // Linking State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  
  // Messaging State
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  useEffect(() => {
    fetchParentData();
    fetchConversations();
  }, []);

  const fetchParentData = async () => {
    try {
      const studentRes = await parentApi.getLinkedStudents();
      if (studentRes.success && studentRes.data.students.length > 0) {
         // The backend returns an array of student objects from getLinkedStudents
         const firstChild = studentRes.data.students[0];
         setStudent(firstChild);
         
         const summaryRes = await parentApi.getStudentSummary(firstChild._id);
         if (summaryRes.success) setSummary(summaryRes.data);

         const progressRes = await parentApi.getStudentProgress(firstChild._id, { timeRange: '30d' });
         if (progressRes.success && progressRes.data?.history) {
            setLivePulseData(progressRes.data.history.map((h, i) => ({
               name: `W${i+1}`,
               sync: h.completionRate || 0,
               mastery: h.averageScore || 0
            })));
         }
      }
    } catch (err) {
      console.error("Error fetching parent data", err);
    }
  };

  const fetchConversations = async () => {
     try {
        const res = await messageApi.getConversations();
        if (res.success) setConversations(res.data.conversations || []);
     } catch(err) {
        console.error("Failed to fetch conversations");
     }
  };

  const loadChat = async (convId) => {
     try {
        const res = await messageApi.getMessages(convId);
        if (res.success) {
           setChatMessages(res.data.messages);
           setActiveChat(convId);
        }
     } catch(err) {
        console.error("Failed to load map");
     }
  };

  const handleSendMessage = async (e) => {
     if (e) e.preventDefault();
     if (!messageInput.trim() || !activeChat) return;
     try {
        const res = await messageApi.sendMessage(activeChat, { content: messageInput });
        if (res.success) {
           setChatMessages([...chatMessages, res.data.message]);
           setMessageInput('');
        }
     } catch (err) {
        toast.error("Failed to send message");
     }
  };

  const handleSendVoiceNote = async (audioBlob) => {
     if (!activeChat) return;
     try {
        const formData = new FormData();
        formData.append('file', audioBlob);
        
        const uploadRes = await fileApi.upload(formData);
        if (uploadRes.success) {
           const res = await messageApi.sendMessage(activeChat, { 
              content: "Sent a voice note", 
              attachments: [{ 
                 url: uploadRes.data.url, 
                 type: 'audio',
                 name: 'Voice Note' 
              }] 
           });
           if (res.success) {
              setChatMessages([...chatMessages, res.data.message]);
              setIsVoiceMode(false);
           }
        }
     } catch (err) {
        toast.error("Failed to send voice note");
     }
  };

  const handleNudge = async (studentId, type) => {
     try {
        const res = await parentApi.nudgeStudent(studentId, type);
        if (res.success) {
           toast.success(res.message);
        }
     } catch (err) {
        toast.error("Failed to send nudge");
     }
  };

  const handleLinkStudent = async (e) => {
     e.preventDefault();
     try {
        const res = await parentApi.linkStudent({ studentEmail: linkEmail, relationship: 'parent' });
        if (res.success) {
           toast.success("Link request sent to student email!");
           setShowLinkModal(false);
           setLinkEmail('');
        }
     } catch (err) {
        toast.error(err.response?.data?.message || "Failed to link student");
     }
  };

  const displayPulseData = livePulseData.length > 0 ? livePulseData : [];

  return (
    <Layout userRole="parent">
      <div className="p-8 bg-slate-50 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.div 
            variants={itemVariants} 
            className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-6 border-b border-slate-200"
          >
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100/50 text-blue-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-blue-200/50">
                <ShieldCheck size={10} /> Family Supervision Active
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Parent <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">Dashboard</span>
              </h1>
              <p className="text-slate-500 font-medium max-w-lg">Monitor academic benchmarks, curriculum mastery, and educator communication.</p>
            </div>
            <div className="flex items-center gap-4">
               {student ? (
                 <div className="group flex items-center gap-4 px-6 py-4 bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/20 hover:border-blue-400/50 transition-all duration-500">
                    <div className="relative">
                       <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center border border-blue-100 text-blue-600 font-black text-xl uppercase group-hover:rotate-6 transition-transform">
                         {student.firstName?.[0] || student.name?.[0] || student.email?.[0] || 'S'}
                       </div>
                       <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monitoring Student</span>
                       <span className="text-lg font-black text-slate-900 tracking-tight">{student.firstName ? `${student.firstName} ${student.lastName}` : (student.name || student.email)}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-100">
                       <button 
                         onClick={() => handleNudge(student._id, 'session_reminder')}
                         className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors title='Remind to Join Class'"
                       >
                          <Clock size={18} />
                       </button>
                       <button 
                         onClick={() => handleNudge(student._id, 'homework_check')}
                         className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors title='Check Homework Progress'"
                       >
                          <Target size={18} />
                       </button>
                    </div>
                 </div>
               ) : (
                 <button onClick={() => setShowLinkModal(true)} className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                    <Plus size={20} /> Link Student Account
                 </button>
               )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { title: 'Curriculum Mastery', value: `${summary?.gamification?.progressPercentage || 0}%`, icon: Target, bg: 'from-blue-100 to-indigo-100', text: 'text-blue-600' },
               { title: 'Modules Verified', value: summary?.completedModules || summary?.assignmentsCompleted || 0, icon: CheckCircle2, bg: 'from-emerald-100 to-teal-100', text: 'text-emerald-600' },
               { title: 'Pending Sessions', value: summary?.upcomingSessions || 0, icon: Calendar, bg: 'from-violet-100 to-purple-100', text: 'text-violet-600' },
               { title: 'Learning Streak', value: summary?.gamification?.streak || summary?.activityStreak || 0, icon: TrendingUp, bg: 'from-amber-100 to-orange-100', text: 'text-amber-600' }
             ].map((stat, i) => (
                <motion.div 
                  key={i}
                  variants={itemVariants} 
                  whileHover={{ y: -8, scale: 1.02 }} 
                  className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-2xl shadow-slate-200/40 transition-all duration-500"
                >
                   <div className="flex justify-between items-start mb-6">
                      <div className={cn("p-4 rounded-2xl shadow-inner border border-white/10 bg-gradient-to-br", stat.bg, stat.text)}>
                         <stat.icon size={24} />
                      </div>
                   </div>
                   <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">{stat.title}</h3>
                   <p className="text-4xl font-black mt-2 text-slate-900 tracking-tighter">{stat.value}</p>
                </motion.div>
             ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <motion.div 
               variants={itemVariants}
               className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden group"
             >
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="flex justify-between items-center mb-10">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100"><Activity size={22} /></div>
                      <div>
                         <h2 className="text-xl font-black text-slate-800 tracking-tight">Academic Momentum</h2>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Performance Analytics</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
                      LIVE_ACTIVITY
                   </div>
                </div>
                <div className="h-72">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={displayPulseData}>
                         <defs>
                            <linearGradient id="colorSyncParent" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                               <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                         <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 700 }} dx={-10} />
                         <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px' }} />
                         <Area type="monotone" dataKey="sync" stroke="#2563eb" strokeWidth={5} fillOpacity={1} fill="url(#colorSyncParent)" />
                         <Area type="monotone" dataKey="mastery" stroke="#10b981" fillOpacity={0} strokeWidth={3} strokeDasharray="6 6" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
                <div className="flex gap-10 mt-10 justify-center">
                   <div className="flex items-center gap-3">
                       <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-glow-blue"></span>
                       <span className="text-xs font-black uppercase tracking-widest text-slate-400">Activity Engagement</span>
                   </div>
                   <div className="flex items-center gap-3">
                       <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 border-dashed"></span>
                       <span className="text-xs font-black uppercase tracking-widest text-slate-400">Mastery Benchmarks</span>
                   </div>
                </div>
             </motion.div>
             
             <div className="space-y-8">
                <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/40">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl border border-violet-100"><Target size={22} /></div>
                      <div>
                         <h2 className="text-lg font-black text-slate-800 tracking-tight">Curriculum Drill-down</h2>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Subject Progress</p>
                      </div>
                   </div>
                   <div className="space-y-2">
                      {summary?.subjects?.length > 0 ? summary.subjects.map((s, i) => (
                         <div key={i} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-violet-200 transition-all duration-500">
                            <div className="flex justify-between items-center mb-3">
                               <span className="text-sm font-black text-slate-700">{s.name}</span>
                               <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest bg-violet-50 px-2 py-0.5 rounded-md">{s.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden p-0.5">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${s.progress}%` }}
                                 transition={{ duration: 1.5, ease: "circOut" }}
                                 className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full" 
                               />
                            </div>
                         </div>
                      )) : (
                         <div className="text-center p-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Active Subjects</p>
                         </div>
                      )}
                   </div>
                </motion.div>

                <motion.div 
                  variants={itemVariants} 
                  whileHover={{ scale: 1.02, y: -5 }} 
                  className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-3xl shadow-slate-900/30 relative overflow-hidden group border border-white/5"
                >
                   <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] transform translate-x-20 -translate-y-20 group-hover:bg-blue-600/20 transition-all duration-1000" />
                   <h2 className="text-2xl font-black text-white mb-4 relative z-10 leading-tight">Elite Mentor <br/>Connect</h2>
                   <p className="text-slate-400 text-sm font-medium mb-10 relative z-10 leading-relaxed">
                      Communicate directly with certified educators regarding your student's curriculum benchmarks.
                   </p>
                   <button onClick={() => setShowChatDrawer(true)} className="w-full flex items-center justify-center gap-3 py-4 bg-white text-slate-900 rounded-2xl hover:bg-slate-50 transition-all font-black text-sm shadow-2xl relative z-10 active:scale-95">
                      <MessageCircle size={20} className="text-blue-600" />
                      Open Secure Messenger
                   </button>
                </motion.div>
             </div>
          </div>
        </div>

        {/* Link Student Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                   <h3 className="text-lg font-bold text-slate-900">Link a Student</h3>
                   <button onClick={() => setShowLinkModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleLinkStudent} className="p-6 space-y-4">
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Student Email</label>
                      <input 
                        type="email" 
                        required
                        value={linkEmail}
                        onChange={(e) => setLinkEmail(e.target.value)}
                        placeholder="Enter student's registered email" 
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                   </div>
                   <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
                      Send Link Request
                   </button>
                </form>
             </div>
          </div>
        )}

        {/* Messaging Drawer Model */}
        {showChatDrawer && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 md:p-10">
             <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-full max-h-[80vh] flex overflow-hidden">
                
                {/* Chat Sidebar */}
                <div className="w-1/3 border-r border-slate-200 flex flex-col">
                   <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <h3 className="font-bold text-slate-800">Messages</h3>
                      <button onClick={() => setShowChatDrawer(false)} className="md:hidden text-slate-400 hover:text-slate-600"><X size={20} /></button>
                   </div>
                   <div className="flex-1 overflow-y-auto">
                      {conversations.length > 0 ? conversations.map((conv) => (
                         <div 
                           key={conv._id} 
                           onClick={() => loadChat(conv._id)}
                           className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${activeChat === conv._id ? 'bg-blue-50 border-blue-100' : ''}`}
                         >
                            <h4 className="font-bold text-slate-800 text-sm">{conv.participants?.find(p => p._id !== user._id)?.username || 'Tutor'}</h4>
                            <p className="text-xs text-slate-500 truncate mt-1">{conv.lastMessage?.content || 'Click to view conversation'}</p>
                         </div>
                      )) : (
                         <div className="p-6 text-center text-slate-500 text-sm">No ongoing conversations.</div>
                      )}
                   </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 flex flex-col bg-slate-50 relative">
                   <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">{activeChat ? "Ongoing Chat" : "Select a Conversation"}</h3>
                      <button onClick={() => setShowChatDrawer(false)} className="hidden md:block text-slate-400 hover:text-slate-600"><X size={20} /></button>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {activeChat ? chatMessages.map((msg, i) => (
                         <div key={i} className={`flex ${msg.sender?._id === user._id || msg.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${msg.sender?._id === user._id || msg.sender === user._id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'}`}>
                               {msg.attachments?.some(a => a.type === 'audio') ? (
                                  <div className="space-y-2">
                                     <p className="text-[10px] opacity-70 italic mb-1 font-bold uppercase tracking-wider">Voice Note</p>
                                     <audio 
                                       src={msg.attachments.find(a => a.type === 'audio').url} 
                                       controls 
                                       className={`h-8 max-w-[200px] ${msg.sender?._id === user._id || msg.sender === user._id ? 'invert grayscale' : ''}`} 
                                     />
                                  </div>
                               ) : (
                                  msg.content
                               )}
                            </div>
                         </div>
                      )) : (
                         <div className="h-full flex items-center justify-center text-slate-400 font-medium">Select a conversation to start messaging.</div>
                      )}
                   </div>

                   {/* Chat Input */}
                   {activeChat && (
                      <div className="p-4 bg-white border-t border-slate-200">
                         {isVoiceMode ? (
                            <VoiceRecorder 
                               onSend={handleSendVoiceNote} 
                               onCancel={() => setIsVoiceMode(false)} 
                            />
                         ) : (
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                               <button 
                                 type="button" 
                                 onClick={() => setIsVoiceMode(true)}
                                 className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                               >
                                  <Mic size={20} />
                               </button>
                               <input 
                                 type="text" 
                                 value={messageInput}
                                 onChange={(e) => setMessageInput(e.target.value)}
                                 placeholder="Type your message..." 
                                 className="flex-1 px-4 py-2 border border-slate-200 rounded-full outline-none focus:border-blue-500 text-sm"
                               />
                               <button type="submit" className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                                  <Send size={16} className="-ml-0.5" />
                               </button>
                            </form>
                         )}
                      </div>
                   )}
                </div>

             </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default ParentDashboard;