import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, ArrowLeft, ExternalLink, CheckCircle, AlertCircle,
  MessageCircle, Code, Book, Trophy, ChevronRight, Star, ThumbsUp,
  Trash2, Edit2, MoreVertical, Flag, Share2, Download, Filter,
  Search, Plus, Eye, EyeOff, Calendar, Clock, User, BookOpen,
  GraduationCap, Sparkles, ArrowRight, MessageSquare, SearchIcon,
  Filter as FilterIcon, X, Check, AlertTriangle, Shield,
  Award, Bell, Settings, Briefcase, Phone, Mail, MapPin, Tag, 
  Hash, Link as LinkIcon, Copy, Play, Pause, Volume2,
  VolumeX, Maximize, Minimize, Upload, Image as ImageIcon,
  FileText, Video as VideoIcon, File, Folder, FolderOpen,
  FolderPlus, FolderMinus, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight as ChevronRight2,
  MoreHorizontal, PlusCircle, Pencil, Trash as Trash2Icon,
  Copy as CopyIcon, Download as DownloadIcon
} from 'lucide-react';
import { useAuth } from '../controllers/useAuth';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';
import { toast } from 'react-hot-toast';
import { qaApi, answerApi } from '../services/api';
import ReactMarkdown from 'react-markdown';

const AttemptQuestionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const res = await qaApi.getById(id);
      const payload = res?.data || res;
      if (payload?.success) {
        setQuestion(payload.data);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!question) return;

    const finalAnswer = question.type === 'mcq' ? selectedOption : answer;
    if (!finalAnswer) {
      toast.error('Please provide an answer');
      return;
    }

     try {
       const res = await answerApi.create({ 
         questionId: id,
         questionTitle: question.title,
         subject: question.subject,
         grade: question.grade,
         type: question.type,
         body: finalAnswer,
         answer: finalAnswer,
         points: question.points
       });

      const payload = res?.data || res;
      setResult(payload?.data || payload);
      setIsSubmitted(true);
      toast.success('Response Submitted');
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading && !question) {
     return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-12 text-center">
           <RefreshCw className="text-indigo-600 animate-spin" size={48} />
           <p className="text-sm font-bold uppercase tracking-widest text-slate-400 animate-pulse text-center">Loading Assessment Module...</p>
        </div>
     );
  }

  return (
    <Layout userRole="student">
      <div className="min-h-screen bg-[#fafafc] text-slate-900 selection:bg-indigo-500/10 overflow-x-hidden relative text-left p-6 md:p-8">
        <motion.div 
          className="relative z-10 max-w-[1440px] mx-auto space-y-8 text-left"
          variants={containerVariants}
          initial="hidden" animate="visible"
        >
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-2.5 bg-white/60 backdrop-blur-3xl rounded-xl border border-slate-200 shadow-sm text-left">
             <div className="flex items-center gap-6 text-left">
                <button
                   onClick={() => navigate(-1)}
                   className="flex items-center gap-2.5 text-slate-500 hover:text-indigo-600 transition-all font-bold uppercase text-[10px] tracking-widest group text-left"
                >
                   <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </button>
                <div className="h-4 w-px bg-slate-200 hidden md:block" />
                <div className="flex items-center gap-2.5 text-slate-400 text-left">
                   <Signal size={12} className="text-emerald-500" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Connection: Stable</span>
                </div>
             </div>
             <div className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-md">
                Module ID: {id?.slice(-6).toUpperCase()}
             </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 text-left items-start pb-20">
             {/* Question Card */}
             <div className="xl:col-span-8 space-y-8 text-left">
                <motion.div
                  variants={itemVariants}
                  className="bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-12 shadow-lg relative overflow-hidden group/card text-left"
                >
                   <div className="relative z-10 text-left space-y-12">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-10 text-left">
                         <div className="flex items-center gap-6 text-left">
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 shadow-sm group-hover/card:bg-indigo-600 group-hover/card:text-white transition-all duration-500 shrink-0">
                               <GraduationCap size={28} />
                            </div>
                            <div className="text-left">
                               <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-2">{question.subject} • Grade {question.grade}</h3>
                               <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-800 uppercase leading-none">{question.title}</h1>
                            </div>
                         </div>
                         <div className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl border-b-4 border-indigo-800 active:translate-y-0.5 active:border-b-0 transition-all shrink-0">
                            {question.points} Points Available
                         </div>
                      </div>

                      <div className="p-10 bg-slate-50 border border-slate-100 rounded-3xl shadow-inner text-left relative overflow-hidden">
                         <p className="text-2xl font-bold text-slate-800 leading-tight tracking-tight uppercase px-0 relative z-10">
                            {question.content}
                         </p>
                      </div>

                      {/* Input Section */}
                      <AnimatePresence mode="wait">
                         {!isSubmitted ?
                         <motion.div
                           key="input"
                           initial={{ opacity: 0, scale: 0.98 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.98 }}
                           className="space-y-10 text-left"
                         >
                            {question.type === 'mcq' ?
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                               {['A', 'B', 'C', 'D'].map((opt) => {
                                  const optKey = `option${opt}`;
                                  const optVal = question[optKey];
                                  if (!optVal) return null;
                                  return (
                                     <button
                                       key={opt}
                                       onClick={() => setSelectedOption(opt)}
                                       className={cn(
                                          "p-6 rounded-3xl border transition-all text-left flex items-center gap-6 group/opt shadow-sm active:scale-95 relative overflow-hidden",
                                          selectedOption === opt ?
                                          'bg-slate-800 text-white border-slate-900 scale-[1.02] shadow-xl' :
                                          'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-slate-50'
                                       )}
                                     >
                                        <span className={cn(
                                           "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm transition-all shrink-0",
                                           selectedOption === opt ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover/opt:text-indigo-600'
                                        )}>
                                           {opt}
                                        </span>
                                        <div className="text-left flex-1 overflow-hidden">
                                           <span className="font-bold text-[14px] uppercase tracking-tight leading-tight line-clamp-2">{optVal}</span>
                                        </div>
                                     </button>
                                  );
                               })}
                            </div> :
                            <div className="relative text-left">
                               <textarea
                                 value={answer}
                                 onChange={(e) => setAnswer(e.target.value)}
                                 placeholder="Type your answer here..."
                                 className="w-full h-48 p-10 rounded-3xl bg-slate-50 border border-slate-200 text-xl font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:shadow-xl transition-all shadow-inner uppercase tracking-wider placeholder:text-slate-300 text-left"
                               />
                            </div>
                            }

                            <button
                              onClick={handleSubmit}
                              disabled={question.type === 'mcq' ? !selectedOption : !answer}
                              className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-20 text-white rounded-3xl font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 group/submit"
                            >
                               Submit Response <Send size={18} className="group-hover/submit:translate-x-2 transition-transform" />
                            </button>
                         </motion.div> :
                         <motion.div
                           key="result"
                           initial={{ opacity: 0, scale: 0.98 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="space-y-10 text-left"
                         >
                            <div className="p-10 md:p-14 rounded-[2.5rem] bg-emerald-600 text-white shadow-xl relative overflow-hidden border-b-8 border-emerald-800 text-left">
                               <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-110 transition-transform"><BadgeCheck size={160} /></div>
                               <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-10 text-left">
                                  <div className="p-6 bg-white/20 backdrop-blur-3xl rounded-3xl border border-white/20 shadow-2xl shrink-0">
                                     <CheckCircle size={40} />
                                  </div>
                                  <div className="text-left space-y-4">
                                     <h3 className="text-3xl font-black tracking-tight uppercase leading-none text-white">Submission Successful</h3>
                                     <p className="text-emerald-100 font-bold uppercase text-xs tracking-widest leading-relaxed max-w-xl px-0">
                                        {result?.leaderboardRewarded ?
                                        `Assessment finalized. You have been awarded ${question.points} points for your contribution.` :
                                        "Submission received. Our team will review your response shortly for point distribution."}
                                     </p>
                                  </div>
                                </div>
                            </div>

                            {question.explanation &&
                            <div className="p-10 md:p-12 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl text-left relative overflow-hidden group/explain">
                               <h4 className="flex items-center gap-3 font-black uppercase text-xs tracking-widest text-indigo-600 mb-8 leading-none">
                                 <BookOpen size={16} /> Detailed Explanation
                               </h4>
                               <div className="bg-slate-50 border border-slate-100 p-10 rounded-3xl shadow-inner text-left">
                                  <p className="text-lg font-bold text-slate-500 leading-relaxed uppercase tracking-wide">
                                     "{question.explanation}"
                                  </p>
                                </div>
                            </div>
                            }

                            <button
                               onClick={() => navigate('/qa/all')}
                               className="w-full py-6 bg-slate-800 text-white rounded-3xl font-black text-sm uppercase tracking-widest transition-all shadow-xl hover:bg-slate-900 active:scale-95 group/next flex items-center justify-center gap-4"
                            >
                               Next Challenge <ArrowRight size={18} className="group-hover/next:translate-x-2 transition-transform" />
                            </button>
                         </motion.div>
                         }
                      </AnimatePresence>
                   </div>
                </motion.div>
             </div>

             {/* Sidebar: Guidelines */}
             <div className="xl:col-span-4 space-y-8 text-left">
                <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-lg text-left relative overflow-hidden group">
                   <h3 className="text-lg font-black text-slate-800 mb-10 flex items-center gap-4 uppercase leading-none relative z-10 text-left">
                      <HelpCircle className="text-indigo-600" size={20} /> Assessment Guidelines
                   </h3>
                   <div className="space-y-6 relative z-10 text-left">
                      {[
                        { id: 1, text: "Examine the question requirements thoroughly before submitting your final response." },
                        { id: 2, text: "All submissions are synchronized with the national performance database." },
                        { id: 3, text: "Points earned contribute to your overall platform ranking and badge progress." }
                      ].map((step) => (
                        <div key={step.id} className="flex gap-5 text-left group/protocol">
                           <span className="w-8 h-8 rounded-xl bg-indigo-600 shrink-0 flex items-center justify-center text-white font-black text-sm shadow-md transition-all group-hover/protocol:scale-110">{step.id}</span>
                           <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest group-hover:text-slate-800 transition-colors pt-1">{step.text}</p>
                        </div>
                      ))}
                   </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden group text-left hover:scale-[1.01] transition-all cursor-pointer">
                   <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-125 transition-transform"><Award size={140} /></div>
                   <div className="relative z-10 space-y-10 text-left">
                      <h4 className="text-2xl font-black tracking-tight uppercase leading-none">Speed Bonus</h4>
                      <p className="text-xs font-black opacity-70 uppercase leading-relaxed tracking-widest">
                         Submit the correct answer within 60 seconds to earn a <span className="text-white border-b-2 border-white/30 pb-0.5">3x Reward Multiplier</span> for this module.
                      </p>
                      <div className="flex items-center gap-5 pt-4 text-left">
                         <div className="p-4 bg-white/20 rounded-2xl border border-white/20 backdrop-blur-3xl shadow-2xl shrink-0">
                            <Zap size={24} className="text-white animate-pulse" />
                         </div>
                          <div className="text-left">
                             <p className="text-[10px] font-black uppercase tracking-widest text-white">Multiplier Status</p>
                             <p className="text-xl font-black uppercase tracking-tight text-white mt-1">Active</p>
                          </div>
                      </div>
                   </div>
                </motion.div>
             </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AttemptQuestionPage;
