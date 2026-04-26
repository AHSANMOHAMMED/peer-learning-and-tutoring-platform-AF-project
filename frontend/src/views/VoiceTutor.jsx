import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Volume2,
  Sparkles,
  Settings,
  RotateCcw,
  Activity,
  Globe2,
  MessageSquare,
  Bot
} from 'lucide-react';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';

const VoiceTutor = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [history, setHistory] = useState([]);

  const getTutorResponse = async (text) => {
    try {
      setIsSpeaking(true);
      // Simulating API Call
      // const res = await api.post('/ai/chat', { message: text, history });
      const aiMessage = "I heard you ask about that topic. Let's break it down step by step to ensure you understand the core concepts. What specific part are you struggling with?";
      
      setResponse(aiMessage);
      setHistory(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: aiMessage }]);

      // Voice Feedback
      const utterance = new SpeechSynthesisUtterance(aiMessage);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('Speech synthesis error', event);
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setResponse("I'm sorry, I encountered an error connecting to our learning services. Please try again.");
      setIsSpeaking(false);
    }
  };

  const handleMicToggle = () => {
    if (!isListening) {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) {
        setTranscript('Your browser does not support the Web Speech API. Please use a supported browser, such as Chrome.');
        return;
      }

      const recognition = new Recognition();
      recognition.lang = 'en-US';
      recognition.start();
      
      setIsListening(true);
      setTranscript('Listening for your question...');

      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        setIsListening(false);
        getTutorResponse(result);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setTranscript('Sorry, I could not hear you clearly. Please try again.');
      };
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
      <div className="min-h-screen bg-[#fafafc] p-6 md:p-8 flex flex-col items-center justify-center font-sans">
        
        <motion.div 
          className="w-full max-w-5xl mx-auto flex flex-col items-center"
          variants={containerVariants}
          initial="hidden" animate="visible"
        >
           {/* Header Section */}
           <motion.div variants={itemVariants} className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100">
                 <Sparkles size={14} /> AI Voice Mentor
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                 Hands-free <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-600">Learning</span>
              </h1>
              <p className="text-slate-500 font-medium max-w-lg mx-auto">
                 Got a quick question? Need a concept explained out loud? Tap the microphone and talk directly to your personal AI study buddy.
              </p>
           </motion.div>

           {/* Central Voice UI */}
           <motion.div variants={itemVariants} className="relative flex justify-center mb-16 px-4">
              <AnimatePresence>
                 {(isListening || isSpeaking) && (
                   <motion.div
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1.25 }}
                     exit={{ opacity: 0, scale: 1.5 }}
                     className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[3px] border-indigo-500/20 rounded-full"
                     style={{
                       animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                     }} 
                   />
                 )}
              </AnimatePresence>
              
              <button
                onClick={handleMicToggle}
                className={cn(
                  "w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 z-10",
                  isListening 
                    ? "bg-rose-500 shadow-xl shadow-rose-500/30 scale-105" 
                    : isSpeaking 
                      ? "bg-indigo-600 shadow-xl shadow-indigo-600/30" 
                      : "bg-white border hover:bg-indigo-50 shadow-lg border-slate-200"
                )}
              >
                 {isListening ? (
                   <Mic className="text-white animate-pulse" size={48} />
                 ) : isSpeaking ? (
                   <Volume2 className="text-white animate-bounce" size={48} />
                 ) : (
                   <Mic className="text-slate-400 group-hover:text-indigo-600" size={48} />
                 )}
                  <div className="absolute -bottom-10 bg-white px-4 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                     {isListening ? 'Listening...' : isSpeaking ? 'Speaking' : 'Tap to Speak'}
                  </div>
              </button>
           </motion.div>

           {/* Transcripts Display Area */}
           <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <AnimatePresence mode="wait">
                 {transcript && (
                   <motion.div
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -10 }}
                     className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm text-left group"
                   >
                      <div className="flex items-center gap-3 mb-4">
                         <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><MessageSquare size={16} /></div>
                         <h3 className="font-bold text-slate-700 text-sm">You asked:</h3>
                      </div>
                      <p className="text-lg font-medium text-slate-800 leading-relaxed">"{transcript}"</p>
                   </motion.div>
                 )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                 {response && (
                   <motion.div
                     initial={{ opacity: 0, x: 10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 10 }}
                     className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl text-left"
                   >
                      <div className="flex items-center gap-3 mb-4">
                         <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><Bot size={16} /></div>
                         <h3 className="font-bold text-slate-300 text-sm">Mentor said:</h3>
                      </div>
                      <p className="text-lg font-medium text-white leading-relaxed">{response}</p>
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>
           
           {/* Footer Stats Placeholder */}
           <motion.div variants={itemVariants} className="mt-16 w-full max-w-3xl border-t border-slate-200 pt-8 flex justify-center gap-8">
              <div className="flex items-center justify-center gap-2">
                 <Globe2 size={16} className="text-slate-400" />
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Multi-lingual Support</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                 <Activity size={16} className="text-slate-400" />
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Low Latency Speech API</span>
              </div>
           </motion.div>
        </motion.div>

        {/* Floating Toolbar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white p-3 rounded-full shadow-xl border border-slate-200 z-50">
           <button onClick={() => {setTranscript(''); setResponse(''); setHistory([]);}} className="w-12 h-12 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full flex justify-center items-center text-slate-500 hover:text-slate-700 transition">
              <RotateCcw size={20} />
           </button>
           <button onClick={handleMicToggle} className={cn("w-14 h-14 rounded-full flex justify-center items-center shadow-md transition-colors", isListening ? "bg-rose-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700")}>
              <Mic size={24} />
           </button>
           <button className="w-12 h-12 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full flex justify-center items-center text-slate-500 hover:text-slate-700 transition">
              <Settings size={20} />
           </button>
        </div>

      </div>
    </Layout>
  );
};

export default VoiceTutor;