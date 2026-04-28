import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, BookOpen, History, X, Lightbulb, Target, Brain, Cpu, Zap, Activity, ShieldCheck, Layers, ChevronRight, User, Maximize2, RefreshCw, ArrowUpRight, Camera, Image, Loader2, Mic } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../controllers/useAuth';
import { aiApi } from '../services/api';
import Layout from '../components/Layout';
import ReactMarkdown from 'react-markdown';
import { cn } from '../utils/cn';
import VoiceRecorder from '../components/VoiceRecorder';

const AIHomeworkChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [subject, setSubject] = useState('mathematics');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Use registered grade by default
  const [grade, setGrade] = useState(user?.grade || '10');
  
  const [showSetup, setShowSetup] = useState(true);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const messagesEndRef = useRef(null);

  // Dynamic subjects based on grade
  const getSubjectsByGrade = (g) => {
    const isPrimary = parseInt(g) <= 9;
    if (isPrimary) {
      return [
        { id: 'mathematics', name: 'Math', icon: '🔢', color: 'bg-blue-100 text-blue-600' },
        { id: 'science', name: 'Science', icon: '🔬', color: 'bg-emerald-100 text-emerald-600' },
        { id: 'english', name: 'English', icon: '📚', color: 'bg-orange-100 text-orange-600' },
        { id: 'history', name: 'History', icon: '🏛️', color: 'bg-amber-100 text-amber-600' },
        { id: 'geography', name: 'Geography', icon: '🌍', color: 'bg-blue-50 text-blue-500' },
      ];
    }
    return [
      { id: 'mathematics', name: 'Combined Mathematics', icon: '🔢', color: 'bg-blue-100 text-blue-600' },
      { id: 'physics', name: 'Physical Sciences', icon: '⚛️', color: 'bg-purple-100 text-purple-600' },
      { id: 'biology', name: 'Biological Sciences', icon: '🧬', color: 'bg-rose-100 text-rose-600' },
      { id: 'commerce', name: 'Commercial Stream', icon: '💼', color: 'bg-emerald-100 text-emerald-600' },
      { id: 'english', name: 'English', icon: '📚', color: 'bg-orange-100 text-orange-600' },
    ];
  };

  const subjects = getSubjectsByGrade(grade);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchSessionHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessionHistory = async () => {
    try {
      const response = await aiApi.homeworkHistory();      if (response.data.success) {
        setSessionHistory(response.data.data.sessions);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const startSession = async () => {
    try {
      setIsLoading(true);
       const response = await aiApi.homeworkHelp({ subject, grade, topic: '' });

      if (response.data.success) {
        setSessionId(response.data.data.sessionId);
        setMessages([
          { role: 'assistant', content: response.data.data.welcomeMessage, timestamp: new Date() }
        ]);
        setShowSetup(false);
      }
    } catch (error) {
      toast.error('Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !selectedImage) return;
    if (!sessionId) return;

    const userMessage = input.trim();
    const currentImage = selectedImage;

    setInput('');
    setSelectedImage(null);
    setImagePreview(null);

    setMessages((prev) => [...prev, { 
      role: 'user', 
      content: userMessage, 
      image: currentImage,
      timestamp: new Date() 
    }]);
    setIsLoading(true);

    try {
      const response = await aiApi.homeworkHelp({ 
        action: 'sendMessage', 
        sessionId, 
        message: userMessage, 
        image: currentImage 
      });
      if (response.data.success) {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: response.data.data.content,
          timestamp: new Date(),
          metadata: response.data.data
        }]);
      }
    } catch (error) {
      toast.error('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    setIsUploadingImage(true);
    try {
       const formData = new FormData();
       formData.append('image', file);
       const res = await aiApi.homeworkImageUpload(formData);
       if (res.data.success) {
         setSelectedImage({
           mimeType: res.data.data.mimeType,
           data: res.data.data.base64
         });
         toast.success('Image processed for AI Vision');
       }
    } catch (err) {
      toast.error('Failed to upload image');
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;
    try {
       await aiApi.homeworkHelp({ action: 'endSession', sessionId });
      setSessionId(null);
      setMessages([]);
      setShowSetup(true);
      fetchSessionHistory();
    } catch (error) {
      console.error(error);
    }
  };

  if (showSetup) {
    return (
      <Layout userRole="student">
        <div className="max-w-[1200px] mx-auto w-full font-sans">
          
          {/* Header */}
          <div className="mb-8 flex justify-between items-end">
             <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">AI Assistant</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Select a subject and grade to begin your personalized study session.</p>
             </div>
             <button onClick={() => setShowHistory(!showHistory)} className="bg-white border border-slate-200 text-slate-600 hover:text-[#00a8cc] px-4 py-2.5 rounded-xl font-bold text-sm shadow-soft transition-colors flex items-center gap-2">
                <History size={16} /> Past Sessions
             </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-[#00a8cc]/10 text-[#00a8cc] rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Bot size={40} />
               </div>
               <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Configure Your Session</h2>
               <p className="text-slate-500 font-medium text-sm mb-10 max-w-md">Our AI is trained on verified academic syllabuses. Pick your subject and let's get solving.</p>

               <div className="w-full text-left space-y-8">
                  {/* Subject Selection */}
                  <div>
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Choose Subject</label>
                     <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {subjects.map((sub) => (
                           <button
                             key={sub.id}
                             onClick={() => setSubject(sub.id)}
                             className={cn(
                               "p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2",
                               subject === sub.id 
                                 ? "bg-slate-900 border-slate-900 shadow-soft" 
                                 : "bg-white border-slate-100 hover:border-[#00a8cc] hover:bg-slate-50"
                             )}
                           >
                              <span className="text-2xl">{sub.icon}</span>
                              <span className={cn("text-xs font-bold", subject === sub.id ? "text-white" : "text-slate-600")}>{sub.name}</span>
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Grade Selection */}
                  <div>
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Choose Grade Level</label>
                     <div className="flex flex-wrap gap-3">
                        {['6', '7', '8', '9', '10', '11', '12'].map(g => {
                           const isRegisteredGrade = user?.grade === g;
                           const canSwitch = !user?.grade; // Only allow switching if no grade is registered

                           return (
                             <button
                               key={g}
                               disabled={!canSwitch && !isRegisteredGrade}
                               onClick={() => setGrade(g)}
                               className={cn(
                                 "w-12 h-12 rounded-xl border transition-all flex items-center justify-center font-bold text-sm",
                                 grade === g 
                                   ? "bg-[#00a8cc] border-[#00a8cc] text-white shadow-soft" 
                                   : "bg-white border-slate-100 text-slate-600 hover:border-[#00a8cc] disabled:opacity-30 disabled:hover:border-slate-100"
                               )}
                             >
                               G{g}
                             </button>
                           );
                        })}
                     </div>
                     {user?.grade && (
                        <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">
                           Grade locked to profile setting. Visit settings to update.
                        </p>
                     )}
                  </div>
               </div>

               <button onClick={startSession} disabled={isLoading} className="mt-12 w-full max-w-sm py-4 bg-[#00a8cc] hover:bg-[#008ba8] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <>Start Session <ArrowUpRight size={18} /></>}
               </button>
            </div>

            {/* Features Sidebar */}
            <div className="lg:col-span-4 space-y-6">
               {[
                  { icon: Target, title: 'Exam Focused', desc: 'Queries are aligned with national exam guidelines.' },
                  { icon: Brain, title: 'Deep Explanations', desc: 'Step-by-step reasoning for complex math and science problems.' },
                  { icon: History, title: 'Context Memory', desc: 'The AI remembers your problem constraints throughout the session.' }
               ].map((f, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
                     <div className="bg-slate-50 p-3 rounded-xl text-[#00a8cc]"><f.icon size={20} /></div>
                     <div>
                        <h4 className="font-bold text-slate-800 mb-1">{f.title}</h4>
                        <p className="text-sm font-medium text-slate-500">{f.desc}</p>
                     </div>
                  </div>
               ))}
               
               {showHistory && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-100">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Recent Sessions</h4>
                     {sessionHistory.length > 0 ? (
                        <div className="space-y-3">
                           {sessionHistory.slice(0, 3).map((s, i) => (
                              <div key={i} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-sm">
                                 <span className="font-bold text-slate-700 capitalize">{s.subject} <span className="text-slate-400 font-medium ml-1">G{s.grade}</span></span>
                                 <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">Saved</span>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <p className="text-sm font-medium text-slate-500">No recent sessions found.</p>
                     )}
                  </div>
               )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="student">
      <div className="h-[calc(100vh-80px)] max-w-[1000px] mx-auto w-full font-sans flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Chat Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#00a8cc]/10 text-[#00a8cc] rounded-xl flex items-center justify-center">
               <Bot size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800 leading-tight">AI Study Assistant</h2>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                 <span className="text-xs font-bold text-slate-500 capitalize">{subject} • Grade {grade}</span>
              </div>
            </div>
          </div>
          <button onClick={endSession} className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-bold text-sm transition-colors">
            End Session
          </button>
        </div>

        {/* Messages Layout */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8f9fc]">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex w-full", message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div className={cn("flex max-w-[85%] md:max-w-[75%]", message.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                   {/* Avatar */}
                   <div className="shrink-0 mx-3">
                      {message.role === 'user' ? (
                         <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500"><User size={16}/></div>
                      ) : (
                         <div className="w-8 h-8 rounded-full bg-[#00a8cc] flex items-center justify-center text-white"><Bot size={16}/></div>
                      )}
                   </div>
                   
                   {/* Bubble */}
                   <div className={cn(
                      "p-4 rounded-2xl shadow-sm",
                      message.role === 'user'
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                    )}>
                      {message.image && (
                        <div className="mb-3 rounded-xl overflow-hidden border border-slate-200/20 shadow-lg">
                           <img src={`data:${message.image.mimeType};base64,${message.image.data}`} alt="AI Context" className="max-h-60 object-contain w-full bg-black/5" />
                        </div>
                      )}
                      <div className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>

                      {message.metadata?.resources?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recommended Resources</p>
                          <div className="grid grid-cols-1 gap-2">
                            {message.metadata.resources.map((r, i) => (
                              <div key={i} className="flex items-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#00a8cc] transition-colors cursor-pointer">
                                <BookOpen size={16} className="text-[#00a8cc] shrink-0 mr-3" />
                                <div className="text-left flex-1 overflow-hidden">
                                   <p className="font-bold text-xs text-slate-700 line-clamp-1">{r.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center ml-14">
               <div className="bg-white border border-slate-100 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
               </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview */}
        <AnimatePresence>
          {imagePreview && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 py-2 border-t border-slate-100 flex items-center gap-4 bg-slate-50/50">
               <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-soft">
                  <img src={imagePreview} className="w-full h-full object-cover" />
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                       <Loader2 size={16} className="text-white animate-spin" />
                    </div>
                  )}
                  <button onClick={() => {setImagePreview(null); setSelectedImage(null);}} className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow-md">
                     <X size={10} />
                  </button>
               </div>
               <p className="text-xs font-bold text-slate-400">Image attached for processing...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Recorder */}
        <AnimatePresence>
          {showVoiceRecorder && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 py-2 border-t border-slate-100 bg-slate-50/80">
              <VoiceRecorder
                onSend={async (audioBlob) => {
                  if (!sessionId) return;
                  setShowVoiceRecorder(false);
                  setIsLoading(true);
                  setMessages(prev => [...prev, { role: 'user', content: '🎤 Voice note sent...', timestamp: new Date() }]);
                  try {
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = async () => {
                      const base64Audio = reader.result.split(',')[1];
                      const res = await aiApi.homeworkHelp({ 
                        action: 'sendMessage', 
                        sessionId, 
                        message: '🎤 Voice message attached',
                        audio: base64Audio
                      });
                      if (res.data.success) {
                        setMessages(prev => [...prev, {
                          role: 'assistant', content: res.data.data.content, timestamp: new Date(), metadata: res.data.data
                        }]);
                      }
                      setIsLoading(false);
                    };
                  } catch (err) {
                    toast.error('Failed to process voice note');
                    setIsLoading(false);
                  }
                }}
                onCancel={() => setShowVoiceRecorder(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-100 p-4 relative z-20">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full p-2 pr-3 focus-within:border-[#00a8cc] focus-within:bg-white transition-colors shadow-inner">
            <div className="flex items-center gap-1 pl-2">
               <label className="p-2 text-slate-400 hover:text-[#00a8cc] transition-colors cursor-pointer rounded-full hover:bg-white active:scale-95">
                  <Camera size={20} />
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
               </label>
               <label className="p-2 text-slate-400 hover:text-[#00a8cc] transition-colors cursor-pointer rounded-full hover:bg-white active:scale-95">
                  <Image size={20} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
               </label>
               <button
                 onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                 className={cn(
                   "p-2 transition-colors rounded-full active:scale-95",
                   showVoiceRecorder ? "text-rose-500 bg-rose-50" : "text-slate-400 hover:text-[#00a8cc] hover:bg-white"
                 )}
               >
                 <Mic size={20} />
               </button>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question, share a photo, or use voice..."
              className="flex-1 bg-transparent border-none px-2 py-2 text-[15px] font-medium text-slate-800 placeholder:text-slate-400 outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={(!input.trim() && !selectedImage) || isLoading || isUploadingImage}
              className="w-10 h-10 bg-[#00a8cc] text-white rounded-full flex items-center justify-center hover:bg-[#008ba8] disabled:opacity-50 transition-colors shrink-0 shadow-lg shadow-[#00a8cc]/20"
            >
              <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
            </button>
          </div>
          <p className="text-center text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">AI responses are generated based on scholastic standards and may occasionally vary.</p>
        </div>
      </div>
    </Layout>
  );
};

export default AIHomeworkChat;