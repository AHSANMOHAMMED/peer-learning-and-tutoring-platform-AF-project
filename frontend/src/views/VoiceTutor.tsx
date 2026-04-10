import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  BrainCircuit, 
  Sparkles,
  Command,
  LayoutDashboard,
  Settings,
  X,
  Play,
  RotateCcw
} from 'lucide-react';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';

const VoiceTutor: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const mockTutorResponse = (text: string) => {
    setIsSpeaking(true);
    setResponse(`AI Tutor: Based on your question about "${text}", let me explain the core concept...`);
    
    // Web Speech API Synthesis
    const utterance = new SpeechSynthesisUtterance(`I understand you're asking about ${text}. Let's break that down together.`);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event: any) => {
      console.error('Speech synthesis error', event);
      setIsSpeaking(false);
    };
    window.speechSynthesis.speak(utterance);
  };

  const handleMicToggle = () => {
    if (!isListening) {
      setIsListening(true);
      setTranscript('Listening for your question...');
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

  return (
    <Layout userRole="student">
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-950/50 relative overflow-hidden">
        {/* Ambient background animations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl opacity-20 pointer-events-none">
           <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 blur-[150px] rounded-full animate-pulse" />
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 blur-[150px] rounded-full animate-pulse delay-700" />
        </div>

        <div className="relative z-10 w-full max-w-2xl text-center space-y-12">
           <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 mb-6">
                 <div className="p-3 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-500/20">
                    <BrainCircuit className="text-white" size={32} />
                </div>
                <span className="text-xs font-black tracking-[0.4em] uppercase text-indigo-500">Phase 6 • Hands-Free Assistant</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-950 dark:text-white">
                 Voice <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Mentor.</span>
              </h1>
              <p className="text-gray-500 text-lg font-medium">Just tap and ask. No typing required.</p>
           </div>

           {/* Central Voice Ring */}
           <div className="relative flex items-center justify-center">
              <AnimatePresence>
                 {(isListening || isSpeaking) && (
                    <motion.div 
                       initial={{ opacity: 0, scale: 0.8 }}
                       animate={{ opacity: 1, scale: 1.2 }}
                       exit={{ opacity: 0, scale: 1.5 }}
                       className="absolute w-64 h-64 border-2 border-indigo-500/30 rounded-full"
                       style={{ 
                          animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                       }}
                    />
                 )}
              </AnimatePresence>
              
              <button 
                 onClick={handleMicToggle}
                 className={cn(
                    "w-48 h-48 rounded-full flex items-center justify-center shadow-2xl transition-all duration-700 active:scale-90 relative z-20",
                    isListening ? "bg-red-500 scale-110" : isSpeaking ? "bg-indigo-600" : "bg-white dark:bg-gray-900"
                 )}
              >
                 {isListening ? (
                    <Mic className="text-white animate-bounce" size={64} />
                 ) : isSpeaking ? (
                    <Volume2 className="text-white animate-pulse" size={64} />
                 ) : (
                    <Mic className="text-gray-400" size={64} />
                 )}
              </button>
           </div>

           {/* Transcript Display */}
           <div className="space-y-6">
              <AnimatePresence mode="wait">
                 {transcript && (
                    <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm"
                    >
                       <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">You asked:</p>
                       <p className="text-xl font-bold text-gray-900 dark:text-white">"{transcript}"</p>
                    </motion.div>
                 )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                 {response && (
                    <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/20"
                    >
                       <div className="flex items-center gap-3 mb-4">
                          <Sparkles size={20} className="text-indigo-200" />
                          <span className="text-[10px] font-black uppercase tracking-widest">AI Response</span>
                       </div>
                       <p className="text-lg font-bold leading-relaxed">{response}</p>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>

        {/* Floating Controls */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-full border border-gray-100 dark:border-white/5 shadow-2xl z-50">
           <button className="p-4 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-all">
              <RotateCcw size={24} />
           </button>
           <button className="p-4 rounded-full bg-indigo-600 text-white shadow-lg">
              <Mic size={24} />
           </button>
           <button className="p-4 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-all">
              <Settings size={24} />
           </button>
        </div>
      </div>
    </Layout>
  );
};

export default VoiceTutor;
