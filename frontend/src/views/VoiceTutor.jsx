import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Volume2,
  BrainCircuit,
  Sparkles,
  Settings,
  RotateCcw,
  ShieldCheck,
  Zap,
  Cpu,
  Binary,
  Globe2,
  Signal,
  MoreHorizontal,
  ChevronRight,
  Activity,
  RefreshCw,
  Terminal,
  Database
} from 'lucide-react';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';

const VoiceTutor = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const mockTutorResponse = (text) => {
    setIsSpeaking(true);
    setResponse(`AI Tutor Node: Based on your inquiry regarding "${text}", I am synchronizing the core pedagogical parameters...`);

    const utterance = new SpeechSynthesisUtterance(`I understand you're asking about ${text}. Let's break that down together.`);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error', event);
      setIsSpeaking(false);
    };
    window.speechSynthesis.speak(utterance);
  };

  const handleMicToggle = () => {
    if (!isListening) {
      setIsListening(true);
      setTranscript('CAPTURE... LISTENING_FOR_INPUT_PARAMETERS...');
      setTimeout(() => {
        setIsListening(false);
        const demoQuestion = "How do I calculate projectile motion?";
        setTranscript(demoQuestion);
        mockTutorResponse(demoQuestion);
      }, 3000);
    } else {
      setIsListening(false);
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
    <Layout userRole="student">
      <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-500/10 overflow-x-hidden p-6 md:p-8 relative flex flex-col items-center justify-center text-left">
        {/* Luminous Overlays */}
        <div className="fixed inset-0 pointer-events-none z-[1001] text-left">
           <div className="absolute inset-0 bg-gradient-to-tr from-white/90 via-transparent to-white/90 pointer-events-none" />
        </div>

        <motion.div 
          className="relative z-10 w-full max-w-7xl mx-auto space-y-12 flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden" animate="visible"
        >
           {/* Voice Mentor Hub Header Command Center UI Architecture */}
           <motion.div variants={itemVariants} className="space-y-6 w-full text-center">
              <div className="flex items-center justify-center gap-4 px-6 py-2 bg-white/60 backdrop-blur-3xl rounded-xl border border-blue-50 shadow-md w-fit mx-auto text-center">
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.4)] text-center" />
                 <span className="text-xs font-medium uppercase tracking-widest text-slate-950 text-center">Cognitive Audio Capture Hub :: ACTIVE</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-medium tracking-tighter uppercase leading-none px-0 text-slate-950 mx-auto text-center">
                 Voice <br />
                 <span className="text-indigo-600">Mentor Hub.</span>
              </h1>
              <p className="text-base text-slate-400 max-w-lg leading-relaxed font-bold px-0 mx-auto text-center">
                 Articulate your cognitive inquiries via the high-fidelity neural uplink. Sovereign hands-free scholastic guidance matrix.
              </p>
           </motion.div>

           {/* Central Voice Aperture UI Matrix Terminal Architecture */}
           <motion.div variants={itemVariants} className="relative flex items-center justify-center group py-12 text-center">
              <AnimatePresence>
                 {(isListening || isSpeaking) && (
                   <motion.div
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1.25 }}
                     exit={{ opacity: 0, scale: 1.5 }}
                     className="absolute w-44 h-44 border-2 border-indigo-500/10 rounded-full shadow-[0_0_80px_rgba(99,102,241,0.05)] text-center"
                     style={{
                       animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                     }} 
                   />
                 )}
              </AnimatePresence>

              <div className="absolute inset-0 bg-indigo-500/[0.02] blur-[80px] rounded-full group-hover:bg-indigo-500/[0.05] transition-colors duration-1000 text-center" />
              
              <button
                onClick={handleMicToggle}
                className={cn(
                  "w-36 h-36 rounded-2xl flex items-center justify-center shadow-4xl transition-all duration-700 active:scale-95 relative z-20 border-2",
                  isListening 
                    ? "bg-rose-500 border-rose-100 scale-105 shadow-rose-200" 
                    : isSpeaking 
                      ? "bg-indigo-600 border-indigo-100 shadow-indigo-200" 
                      : "bg-white border-blue-50 hover:border-indigo-100 hover:shadow-4xl"
                )}
              >
                 {isListening ? (
                   <Mic className="text-white animate-pulse text-center" size={48} />
                 ) : isSpeaking ? (
                   <Volume2 className="text-white animate-bounce text-center" size={48} />
                 ) : (
                   <Mic className="text-slate-100 group-hover:text-indigo-600 transition-colors duration-700 text-center" size={48} />
                 )}
                  <div className="absolute -bottom-8 px-5 py-2 bg-white/60 backdrop-blur-3xl rounded-xl border border-blue-50 text-xs font-medium uppercase tracking-widest text-slate-300 shadow-xl text-center">
                     {isListening ? 'CAPTURE' : isSpeaking ? 'SYNTHESIZING_RESPONSE' : 'UPLINK_STANDBY'}
                  </div>
              </button>
           </motion.div>

           {/* Transcript Display Matrix UI Terminal UI Architecture */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl text-left">
              <AnimatePresence mode="wait">
                 {transcript && (
                   <motion.div
                     initial={{ opacity: 0, x: -15 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -15 }}
                     className="bg-white border border-blue-50 p-8 rounded-2xl shadow-4xl relative overflow-hidden group text-left"
                   >
                      <div className="absolute top-0 left-0 p-8 opacity-[0.01] pointer-events-none group-hover:rotate-12 transition-transform duration-1000 text-left"><Mic size={140} /></div>
                      <div className="relative z-10 text-left space-y-6">
                         <div className="flex items-center gap-3.5 text-left">
                            <div className="p-2.5 bg-slate-50 border border-slate-50 rounded-xl shadow-inner text-center">
                               <Signal size={16} className="text-indigo-600 text-center" />
                            </div>
                             <span className="text-xs font-medium text-slate-300 uppercase tracking-widest leading-none text-left">Vocal_Capture_Identity_Node</span>
                         </div>
                         <p className="text-xl font-medium text-slate-950 tracking-tight leading-tight px-0 text-left uppercase">"{transcript}"</p>
                      </div>
                   </motion.div>
                 )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                 {response && (
                   <motion.div
                     initial={{ opacity: 0, x: 15 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 15 }}
                     className="bg-indigo-600 p-8 rounded-2xl border border-indigo-100 shadow-4xl relative overflow-hidden group text-left"
                   >
                      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:-rotate-12 transition-transform duration-1000 text-right"><BrainCircuit size={140} /></div>
                      <div className="relative z-10 text-left space-y-6">
                         <div className="flex items-center gap-3.5 text-left">
                            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20 text-center">
                               <Sparkles size={16} className="text-white animate-pulse text-center" />
                            </div>
                             <span className="text-xs font-medium text-indigo-100 uppercase tracking-widest leading-none text-left">Neural_Synthesis_Protocol</span>
                         </div>
                         <p className="text-xl font-medium text-white tracking-tight leading-tight px-0 uppercase text-left leading-relaxed">{response.replace('AI Tutor Node: ', '')}</p>
                      </div>
                        <div className="absolute bottom-6 right-8 flex items-center gap-3 text-xs font-medium text-white/30 uppercase tracking-widest leading-none text-right">
                          <Activity size={10} /> Grid_Sync: 100% OPERATIONAL
                       </div>
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>

           {/* Metrics Footer UI Architecture Matrix */}
           <motion.div variants={itemVariants} className="pt-10 text-center">
              <div className="flex flex-wrap justify-center gap-6 text-center">
                 {[
                    { label: 'Sync Fidelity', value: '100% OK', icon: Activity, color: 'text-indigo-600' },
                    { label: 'Neural Latency', value: '42ms HI_SPEED', icon: Zap, color: 'text-emerald-500' },
                    { label: 'Language Hubs', value: 'TRILINGUAL', icon: Globe2, color: 'text-blue-500' }
                 ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-2.5 bg-white border border-blue-50 rounded-full shadow-xl text-left">
                       <stat.icon size={14} className={cn(stat.color, "text-left")} />
                        <div className="text-left">
                             <p className="text-xs font-medium uppercase text-slate-300 leading-none mb-1 text-left">{stat.label}</p>
                            <p className="text-xs font-medium uppercase text-slate-950 leading-none text-left">{stat.value}</p>
                        </div>
                    </div>
                 ))}
              </div>
           </motion.div>
        </motion.div>

        {/* Tactical UI Controller Toolbar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-8 py-3 bg-white/60 backdrop-blur-3xl border border-blue-50 rounded-2xl shadow-4xl hover:bg-white transition-all duration-700 text-center">
           <button className="p-4 bg-slate-50 hover:bg-white text-slate-200 hover:text-indigo-600 border border-slate-50 rounded-xl transition-all duration-700 shadow-inner group active:scale-95 text-center">
              <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-1000 text-center" />
           </button>
           <button 
              onClick={handleMicToggle}
              className={cn(
                "p-5 rounded-xl transition-all duration-700 shadow-4xl active:scale-90 group",
                isListening ? "bg-rose-500" : "bg-indigo-600"
              )}
            >
              <Mic size={24} className="text-white text-center" />
           </button>
           <button className="p-4 bg-slate-50 hover:bg-white text-slate-200 hover:text-indigo-600 border border-slate-50 rounded-xl transition-all duration-700 shadow-inner group active:scale-95 text-center">
              <Settings size={20} className="group-hover:rotate-90 transition-transform duration-1000 text-center" />
           </button>
        </div>

        {/* Global Hub Authority terminal indicator UI Architecture */}
        <div className="fixed bottom-8 right-8 group z-50 text-left">
           <div className="flex items-center gap-5 py-3.5 px-6 bg-white/60 backdrop-blur-3xl rounded-full border border-blue-50 shadow-4xl opacity-40 hover:opacity-100 transition-all duration-1000 text-left">
              <div className="relative text-left">
                 <Terminal size={18} className="text-indigo-600 animate-pulse text-left" />
                 <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 text-left" />
              </div>
               <div className="text-left text-left">
                  <p className="text-xs font-medium uppercase tracking-widest text-slate-950 leading-none text-left">AUDIO_MENTOR</p>
                  <div className="flex items-center gap-2.5 mt-1.5 text-xs font-medium uppercase text-indigo-600 tracking-widest leading-none text-left h-3">
                     <Database size={10} className="text-left" /> Sync: GLOBAL :: HI_FIDELITY_AUDIO
                  </div>
               </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default VoiceTutor;