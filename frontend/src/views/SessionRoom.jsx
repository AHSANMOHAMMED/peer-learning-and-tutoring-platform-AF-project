import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, Monitor, MessageSquare, Users, Mic, Camera, LogOut, 
  Clock, Settings, ShieldCheck, Maximize2, Brain, X, Send
} from 'lucide-react';
import VirtualClassroom from './VirtualClassroom';
import { useAuth } from '../controllers/useAuth';
import { cn } from '../utils/cn';

const SessionRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Mock Session Data (In a real app, fetch this via sessionId)
  const session = {
    title: 'Combined Mathematics: Integration Mastery',
    tutor: 'Verified Instructor',
    time: '4:00 PM - 5:30 PM',
    attendees: 2,
    status: 'Live'
  };

  return (
    <div className="h-screen bg-slate-900 text-white flex overflow-hidden font-sans">
      
      {/* Session Sidebar (Chat & Info) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -100, opacity: 0, width: 0 }}
            animate={{ x: 0, opacity: 1, width: 350 }}
            exit={{ x: -100, opacity: 0, width: 0 }}
            className="h-full border-r border-slate-800 bg-slate-950 flex flex-col relative z-20 shadow-2xl shrink-0"
          >
            <div className="p-8 border-b border-slate-800 flex flex-col gap-3">
               <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">LIVE SESSION</span>
                  <span className="text-[10px] font-black text-slate-500 ml-auto bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"># {sessionId?.substring(0, 8)}</span>
               </div>
               <h1 className="text-xl font-black leading-tight text-white tracking-tight">{session.title}</h1>
               <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                  <div className="w-6 h-6 rounded-full bg-[#00a8cc] flex items-center justify-center text-[10px] text-white">T</div>
                  {session.tutor}
               </div>
               
               <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-2xl flex flex-col">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Participants</span>
                     <span className="font-black text-white flex items-center gap-2"><Users size={14} className="text-[#00a8cc]"/> {session.attendees}</span>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-2xl flex flex-col">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Time Remaining</span>
                     <span className="font-black text-white flex items-center gap-2"><Clock size={14} className="text-amber-500"/> 42:15</span>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <MessageSquare size={12} /> Live Discussion
               </h4>
               
               <div className="flex flex-col gap-4">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none max-w-[90%] self-start shadow-sm">
                     <p className="text-[10px] font-black text-[#00a8cc] uppercase tracking-widest mb-1">Instructor</p>
                     <p className="text-sm font-medium text-slate-200">Welcome everyone! Today we focus on definite integration.</p>
                  </div>
                  <div className="bg-[#00a8cc]/10 border border-[#00a8cc]/20 p-4 rounded-2xl rounded-tr-none max-w-[90%] self-end text-right shadow-sm">
                     <p className="text-[10px] font-black text-[#00a8cc] uppercase tracking-widest mb-1">You</p>
                     <p className="text-sm font-medium text-slate-200">I have a question about the chain rule application here.</p>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-slate-950 border-t border-slate-800">
               <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Message the class..." 
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-6 pr-14 text-sm font-medium text-white focus:outline-none focus:border-[#00a8cc] transition-all placeholder:text-slate-600" 
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-[#00a8cc] text-white rounded-xl hover:scale-105 transition-transform">
                     <Send size={18} />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Classroom Area - Integrating VirtualClassroom */}
      <div className="flex-1 relative flex flex-col">
         {/* Toggle Sidebar Button */}
         {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-6 left-6 z-[1000] p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white shadow-2xl transition-all"
            >
              <MessageSquare size={20} />
            </button>
         )}

         <VirtualClassroom 
            roomId={sessionId || 'session-default'}
            isInstructor={user?.role === 'tutor'}
            onClose={() => navigate('/dashboard')}
         />
      </div>

    </div>
  );
};

export default SessionRoom;