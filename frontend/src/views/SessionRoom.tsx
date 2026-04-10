import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Monitor, 
  Settings, 
  MessageSquare, 
  Users, 
  X, 
  Maximize2, 
  Minimize2,
  Lock,
  Zap,
  Mic,
  Camera,
  LogOut,
  ChevronRight,
  Clock
} from 'lucide-react';
import JitsiMeeting from '../components/JitsiMeeting';
import Whiteboard from '../components/Whiteboard';
import { cn } from '../utils/cn';
import { io } from 'socket.io-client';

const SessionRoom: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'video' | 'board'>('video');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [socket] = useState(() => io(import.meta.env.VITE_API_URL || 'http://localhost:5001'));

  // Mock Session Data
  const session = {
    title: 'Combined Maths: Integration Masterclass',
    tutor: 'Saritha Munasinghe (UoM)',
    time: '4:00 PM - 5:30 PM',
    attendees: 2
  };

  return (
    <div className="h-screen bg-gray-950 text-white flex overflow-hidden font-display">
      {/* Dynamic Session Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full border-r border-white/5 bg-slate-900/50 backdrop-blur-3xl flex flex-col relative z-50 overflow-hidden"
          >
            <div className="p-8 border-b border-white/5">
              <div className="flex items-center gap-2 mb-8">
                <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">
                  Live Session ID: {sessionId?.substring(0, 8)}
                </div>
              </div>
              <h1 className="text-3xl font-black tracking-tight mb-3 leading-tight">{session.title}</h1>
              <p className="text-slate-400 text-sm font-medium mb-6">{session.tutor}</p>
              <div className="flex items-center gap-4 text-xs font-black text-indigo-400 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Users size={14} /> {session.attendees} Attending</span>
                <span className="flex items-center gap-1"><Clock size={14} /> 45:12 Elapsed</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Session Chat</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-bold text-indigo-400 mb-1">Mentor Saritha</p>
                      <p className="text-sm text-slate-300">Let's start with the properties of Definite Integrals today.</p>
                    </div>
                  </div>
               </div>
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Quick Tools</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-xs font-bold flex flex-col items-center gap-2">
                       <Monitor size={20} className="text-teal-400" /> Share Screen
                    </button>
                    <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-xs font-bold flex flex-col items-center gap-2">
                       <Zap size={20} className="text-yellow-400" /> AI Insights
                    </button>
                  </div>
               </div>
            </div>

            <div className="p-8 border-t border-white/5 bg-slate-900/80">
               <button 
                 onClick={() => navigate('/dashboard')}
                 className="w-full py-5 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all text-red-500 border border-red-500/20 rounded-2xl font-black text-sm flex items-center justify-center gap-3"
               >
                 <LogOut size={18} /> End Session Room
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Learning Hub */}
      <div className="flex-1 relative flex flex-col">
        {/* Toggle Controls */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex items-center p-1.5 bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-full shadow-2xl">
          <button 
            onClick={() => setActiveTab('video')}
            className={cn(
              "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center",
              activeTab === 'video' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"
            )}
          >
            <Video size={16} /> Conference
          </button>
          <button 
            onClick={() => setActiveTab('board')}
            className={cn(
              "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center",
              activeTab === 'board' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"
            )}
          >
            <Monitor size={16} /> Whiteboard
          </button>
        </div>

        {/* Dynamic Workspace */}
        <div className="flex-1 p-8 grid relative h-full pt-28">
           <AnimatePresence mode="wait">
             {activeTab === 'video' ? (
               <motion.div 
                 key="video"
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.98 }}
                 className="w-full h-full rounded-[3rem] overflow-hidden bg-slate-900 border border-white/5 relative"
               >
                 <JitsiMeeting 
                   roomName={sessionId || 'peerlearn-session'} 
                   displayName="Student Ahsan"
                 />
               </motion.div>
             ) : (
               <motion.div 
                 key="board"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 20 }}
                 className="w-full h-full rounded-[3rem] overflow-hidden bg-white relative shadow-2xl shadow-black/50"
               >
                 <Whiteboard sessionId={sessionId || 'default'} socket={socket} />
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Global Toolbar Mini */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-8 py-4 bg-slate-900/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] shadow-2xl">
           <button className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors text-slate-400 group">
             <Mic size={24} className="group-hover:text-white" />
           </button>
           <button className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors text-slate-400 group">
             <Camera size={24} className="group-hover:text-white" />
           </button>
           <div className="w-[1px] h-8 bg-white/10 mx-2" />
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className={cn(
               "p-4 rounded-2xl transition-all",
               isSidebarOpen ? "bg-indigo-600/10 text-indigo-400" : "bg-white/5 text-slate-400"
             )}
           >
             <MessageSquare size={24} />
           </button>
           <button className="p-4 bg-white/5 rounded-2xl hover:bg-red-500 transition-all text-red-500 hover:text-white">
             <X size={24} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default SessionRoom;
