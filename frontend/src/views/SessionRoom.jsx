import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Monitor, MessageSquare, Users, Mic, Camera, LogOut, Clock, Settings, ShieldCheck, Maximize2 } from 'lucide-react';
import JitsiMeeting from '../components/JitsiMeeting';
import Whiteboard from '../components/Whiteboard';
import { cn } from '../utils/cn';
import { io } from 'socket.io-client';

const SessionRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('video');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [socket] = useState(() => io(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001'));

  // Mock Session Data
  const session = {
    title: 'Combined Mathematics: Integration Mastery',
    tutor: 'Verified Instructor',
    time: '4:00 PM - 5:30 PM',
    attendees: 2,
    status: 'Live'
  };

  return (
    <div className="h-screen bg-[#f8f9fc] text-slate-900 flex overflow-hidden font-sans">
      
      {/* Session Sidebar */}
      <AnimatePresence>
        {isSidebarOpen &&
        <motion.div
           initial={{ x: -100, opacity: 0, width: 0 }}
           animate={{ x: 0, opacity: 1, width: 320 }}
           exit={{ x: -100, opacity: 0, width: 0 }}
           className="h-full border-r border-slate-200 bg-white flex flex-col relative z-20 shadow-soft shrink-0"
        >
           <div className="p-6 border-b border-slate-100 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                 <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                 <span className="text-xs font-bold uppercase tracking-widest text-rose-500">LIVE</span>
                 <span className="text-xs font-bold text-slate-400 ml-auto bg-slate-50 px-2 py-1 rounded-md">ID: {sessionId?.substring(0, 8)}</span>
              </div>
              <h1 className="text-lg font-bold leading-tight text-slate-800">{session.title}</h1>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                 <ShieldCheck size={16} className="text-[#00a8cc]" /> {session.tutor}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                 <div className="bg-slate-50 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Participants</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1"><Users size={14}/> {session.attendees}</span>
                 </div>
                 <div className="bg-slate-50 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Duration</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1"><Clock size={14}/> 45m</span>
                 </div>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-2">Class Chat</h4>
              
              {/* Chat bubbles */}
              <div className="flex flex-col gap-3">
                 <div className="bg-blue-50 border border-blue-100 p-3 rounded-tr-xl rounded-b-xl max-w-[90%] self-start">
                    <p className="text-[10px] font-bold text-blue-500 mb-1">Instructor</p>
                    <p className="text-sm font-medium text-slate-700">Welcome everyone! Please open chapter 4.</p>
                 </div>
                 <div className="bg-[#f8f9fc] border border-slate-100 p-3 rounded-tl-xl rounded-b-xl max-w-[90%] self-end text-right">
                    <p className="text-[10px] font-bold text-slate-400 mb-1">Me</p>
                    <p className="text-sm font-medium text-slate-700">Ready.</p>
                 </div>
              </div>
           </div>

           <div className="p-4 border-t border-slate-100 bg-white">
              <input type="text" placeholder="Type a message..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00a8cc]" />
           </div>
        </motion.div>
        }
      </AnimatePresence>

      {/* Main Classroom Area */}
      <div className="flex-1 relative flex flex-col z-10 overflow-hidden bg-slate-900 p-4 pb-20">
        
        {/* Workspace Mode Tabs */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center p-1.5 bg-white/10 backdrop-blur-md rounded-xl">
          <button
            onClick={() => setActiveTab('video')}
            className={cn(
              "px-6 py-2 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-2",
              activeTab === 'video' ? "bg-white text-slate-900" : "text-white/70 hover:text-white"
            )}>
            <Video size={16} /> Meeting
          </button>
          <button
            onClick={() => setActiveTab('board')}
            className={cn(
              "px-6 py-2 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-2",
              activeTab === 'board' ? "bg-white text-slate-900" : "text-white/70 hover:text-white"
            )}>
            <Monitor size={16} /> Whiteboard
          </button>
        </div>

        {/* Viewport */}
        <div className="flex-1 w-full h-full rounded-2xl overflow-hidden relative shadow-2xl">
           {activeTab === 'video' ? (
              <JitsiMeeting roomName={sessionId || 'peerlearn-session'} displayName="Student User" />
           ) : (
              <div className="w-full h-full bg-white relative">
                 <Whiteboard sessionId={sessionId || 'default'} socket={socket} />
              </div>
           )}
        </div>

        {/* Floating Control Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl">
           <button className="p-3.5 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors text-white relative">
              <Mic size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-700" />
           </button>
           <button className="p-3.5 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors text-white">
              <Camera size={20} />
           </button>
           
           <div className="w-px h-8 bg-slate-600 mx-2" />
           
           <button
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className={cn("p-3.5 rounded-xl transition-colors text-white", isSidebarOpen ? "bg-[#00a8cc]" : "bg-slate-700 hover:bg-slate-600")}>
              <MessageSquare size={20} />
           </button>
           
           <button className="p-3.5 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors text-white">
              <Settings size={20} />
           </button>

           <div className="w-px h-8 bg-slate-600 mx-2" />

           <button onClick={() => navigate('/dashboard')} className="px-6 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
              Leave <LogOut size={16} />
           </button>
        </div>

      </div>
    </div>);
};

export default SessionRoom;