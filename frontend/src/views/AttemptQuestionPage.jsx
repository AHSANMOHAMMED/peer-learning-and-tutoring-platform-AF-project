import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  CheckCircle,
  HelpCircle,
  Award,
  BookOpen,
  Languages,
  ChevronRight,
  Target,
  Zap,
  Cpu,
  Binary,
  ShieldCheck,
  Signal,
  ArrowUpRight,
  Fingerprint,
  Layers,
  Sparkles,
  Search,
  Book,
  Activity,
  BadgeCheck,
  Terminal,
  Globe2,
  RefreshCw,
  Database
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { cn } from '../utils/cn';

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
      const res = await api.get(`/qa/questions/${id}`);
      if (res.data.success) {
        setQuestion(res.data.data);
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
      const res = await api.post('/qa/submissions', {
        questionId: question._id,
        questionTitle: question.title,
        subject: question.subject,
        grade: question.grade,
        type: question.type,
        answer: finalAnswer,
        points: question.points
      });

      if (res.data.success) {
        setResult(res.data.data);
        setIsSubmitted(true);
        toast.success('Submission Authorized');
      }
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
          <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="text-center">
            <div className="relative text-center">
               <Cpu className="text-indigo-600" size={60} />
               <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse text-center" />
            </div>
          </motion.div>
          <p className="text-sm font-medium uppercase tracking-widest text-slate-300 animate-pulse text-center">Initializing Arena Mission Terminal...</p>
        </div>
     );
  }

  return (
    <Layout userRole="student">
      <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-500/10 overflow-x-hidden relative text-left p-6 md:p-8">
        {/* Luminous Overlays */}
        <div className="fixed inset-0 pointer-events-none z-[1001] text-left">
           <div className="absolute inset-0 bg-gradient-to-tr from-white/90 via-transparent to-white/90 pointer-events-none" />
        </div>

        <motion.div 
          className="relative z-10 max-w-[1440px] mx-auto space-y-8 text-left"
          variants={containerVariants}
          initial="hidden" animate="visible"
        >
          {/* Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-2.5 bg-white/60 backdrop-blur-3xl rounded-xl border border-blue-50 shadow-sm text-left">
             <div className="flex items-center gap-6 text-left">
                <button
                   onClick={() => navigate(-1)}
                   className="flex items-center gap-2.5 text-slate-400 hover:text-indigo-600 transition-all font-medium uppercase text-xs tracking-widest group text-left"
                >
                   <ArrowLeft size={14} className="group-hover:-translate-x-1.5 transition-transform text-left" /> ABORT_MISSION_COMMAND
                </button>
                <div className="h-4 w-px bg-slate-100 hidden md:block" />
                <div className="flex items-center gap-2.5 text-slate-400 text-left">
                   <Signal size={12} className="text-indigo-600 text-left" />
                   <span className="text-xs font-medium uppercase tracking-widest text-left">Grid Sync Fidelity: HI_OPTIMAL</span>
                </div>
             </div>
             <div className="px-3.5 py-1.5 bg-slate-950 text-white rounded-lg text-xs font-medium uppercase tracking-widest shadow-4xl text-center border border-white/5">
                TRIALS::
             </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 text-left items-start pb-20">
             {/* Main Question Card Hub Terminal UI */}
             <div className="xl:col-span-8 space-y-6 text-left">
                <motion.div
                  variants={itemVariants}
                  className="bg-white border border-blue-50 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden group/card text-left transition-all duration-700 hover:border-indigo-100"
                >
                   <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/[0.01] blur-[100px] rounded-full pointer-events-none text-right" />
                   
                   <div className="relative z-10 text-left space-y-10">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-10 text-left">
                         <div className="flex items-center gap-5 text-left text-left">
                            <div className="p-3.5 bg-indigo-50 border border-indigo-50 rounded-xl text-indigo-600 shadow-inner group-hover/card:bg-indigo-600 group-hover/card:text-white transition-all duration-700 text-center shrink-0">
                               <BookOpen size={24} className="text-left" />
                            </div>
                            <div className="text-left text-left">
                               <h3 className="text-xs font-medium uppercase tracking-widest text-slate-300 leading-none text-left">Problem_Node :: Sector_Auth_{question.subject?.toUpperCase()?.replace(/ /g, '_')}</h3>
                               <h1 className="text-xl md:text-3xl font-medium tracking-tighter text-slate-950 uppercase leading-none mt-2 text-left">{question.title}</h1>
                            </div>
                         </div>
                         <div className="px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-medium text-sm tabular-nums shadow-4xl border-b-2 border-indigo-800 active:translate-y-0.5 active:border-b-0 transition-all text-center shrink-0">
                            {question.points} MERIT_TOKENS
                         </div>
                      </div>

                      <div className="p-8 md:p-12 bg-slate-50 border border-slate-50 rounded-xl shadow-inner text-left relative overflow-hidden group/content">
                         <div className="absolute top-0 left-0 p-6 opacity-[0.01] group-hover/content:rotate-6 transition-transform duration-1000 pointer-events-none text-left"><Layers size={100} /></div>
                         <p className="text-xl font-medium text-slate-950 leading-tight tracking-tight uppercase px-0 relative z-10 text-left">
                            {question.content}
                         </p>
                      </div>

                      {/* Answer Input Node Terminal UI Architecture */}
                      <AnimatePresence mode="wait">
                         {!isSubmitted ?
                         <motion.div
                           key="input"
                           initial={{ opacity: 0, scale: 0.98 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.98 }}
                           className="space-y-8 text-left"
                         >
                            {question.type === 'mcq' ?
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-left">
                               {['A', 'B', 'C', 'D'].map((opt) => {
                                  const optKey = `option${opt}`;
                                  const optVal = question[optKey];
                                  if (!optVal) return null;
                                  return (
                                     <button
                                       key={opt}
                                       onClick={() => setSelectedOption(opt)}
                                       className={cn(
                                          "p-4 rounded-xl border transition-all duration-700 text-left flex items-center gap-4 group/opt shadow-lg active:scale-95 text-left overflow-hidden relative",
                                          selectedOption === opt ?
                                          'bg-slate-950 text-white border-slate-900 scale-[1.02] shadow-4xl' :
                                          'bg-slate-50 border-slate-50 text-slate-200 hover:border-indigo-100 hover:text-slate-950 hover:bg-white'
                                       )}
                                     >
                                        <span className={cn(
                                           "w-8 h-8 rounded-lg flex items-center justify-center font-medium text-sm shadow-inner transition-all duration-700 text-center shrink-0",
                                           selectedOption === opt ? 'bg-indigo-600 text-white' : 'bg-white text-slate-100 group-hover/opt:text-indigo-600'
                                        )}>
                                           {opt}
                                        </span>
                                        <div className="text-left flex-1 text-left overflow-hidden">
                                           <span className="font-black text-[12px] uppercase tracking-tight leading-tight text-left line-clamp-2">{optVal}</span>
                                        </div>
                                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover/opt:opacity-5 transition-opacity pointer-events-none text-right"><Fingerprint size={20} /></div>
                                     </button>
                                  );
                               })}
                            </div> :
                            <div className="relative group/textarea text-left">
                               <textarea
                                 value={answer}
                                 onChange={(e) => setAnswer(e.target.value)}
                                 placeholder="INPUT_RESPONSE_PARAMETERS_FOR_SECTOR_AUDIT..."
                                 className="w-full h-40 p-8 rounded-xl bg-slate-50 border border-slate-50 text-lg font-medium text-slate-950 outline-none focus:bg-white focus:border-indigo-100 focus:shadow-4xl transition-all duration-700 shadow-inner uppercase tracking-widest placeholder:text-slate-200 text-left"
                               />
                               <div className="absolute bottom-4 right-4 p-4 opacity-[0.01] pointer-events-none group-focus-within/textarea:opacity-10 transition-opacity duration-700 text-right"><Fingerprint size={60} /></div>
                            </div>
                            }

                            <button
                              onClick={handleSubmit}
                              disabled={question.type === 'mcq' ? !selectedOption : !answer}
                              className="w-full py-4.5 bg-indigo-600 hover:bg-slate-950 disabled:opacity-20 text-white rounded-xl font-medium text-xs uppercase tracking-widest transition-all duration-700 shadow-4xl active:scale-95 flex items-center justify-center gap-3 group/submit text-center border border-white/5"
                            >
                               PROVISION_SUBMISSION <Send size={16} className="group-hover/submit:translate-x-1.5 transition-transform duration-700 text-center" />
                            </button>
                         </motion.div> :
                         <motion.div
                           key="result"
                           initial={{ opacity: 0, scale: 0.98 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="space-y-8 text-left"
                         >
                            <div className="p-8 md:p-12 rounded-2xl bg-emerald-600 text-white shadow-4xl relative overflow-hidden border-b-2 border-emerald-800 text-left">
                               <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none transition-transform duration-1000 group-hover:scale-110 text-right"><BadgeCheck size={140} /></div>
                               <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-10 text-left">
                                  <div className="p-4 bg-white/20 backdrop-blur-3xl rounded-xl border border-white/20 shadow-xl shrink-0 text-center">
                                     <CheckCircle size={32} />
                                  </div>
                                  <div className="text-left space-y-3">
                                     <h3 className="text-xl font-medium tracking-tighter uppercase leading-none text-white text-left">SOLUTION_SUCCESSFUL_</h3>
                                     <p className="text-emerald-100 font-medium uppercase text-xs tracking-normal leading-relaxed max-w-xl px-0 text-left">
                                        {result?.leaderboardRewarded ?
                                        `MISSION_PROTOCOL_COMPLETE. AUTHORIZED ${question.points} MERIT_EXP_TOKENS LINKED TO IDENTITY GRID HUB.` :
                                        "Parameters recorded in high-fidelity buffer. Awaiting senior audit for final scoring and national grid merit distribution."}
                                     </p>
                                  </div>
                                </div>
                            </div>

                            {question.explanation &&
                            <div className="p-8 md:p-10 rounded-2xl bg-white border border-blue-50 shadow-4xl text-left relative overflow-hidden group/explain">
                               <div className="absolute top-0 left-0 p-6 opacity-[0.01] pointer-events-none text-left"><Sparkles size={80} /></div>
                               <h4 className="flex items-center gap-2.5 font-medium uppercase text-xs tracking-widest text-indigo-600 mb-6 leading-none text-left">
                                 <Languages size={14} className="text-left" /> DEEP_LOG_EXPLANATION
                               </h4>
                               <div className="bg-slate-50 border border-slate-50 p-8 rounded-xl shadow-inner text-left">
                                  <p className="text-[14px] font-bold text-slate-300 leading-relaxed uppercase tracking-wider px-0 text-left">
                                     "{question.explanation}"
                                  </p>
                                </div>
                            </div>
                            }

                            <div className="flex gap-4 text-left">
                               <button
                                  onClick={() => navigate('/qa/medium')}
                                  className="flex-1 py-4.5 bg-slate-950 text-white rounded-xl font-medium text-xs uppercase tracking-widest transition-all duration-700 shadow-4xl hover:bg-indigo-600 active:scale-95 group/next flex items-center justify-center gap-3 text-center border border-white/5"
                               >
                                  INITIALIZE_NEXT <ArrowUpRight size={16} className="group-hover/next:translate-x-0.5 group-hover/next:-translate-y-0.5 transition-transform duration-700 text-center" />
                               </button>
                            </div>
                         </motion.div>
                         }
                      </AnimatePresence>
                   </div>
                </motion.div>
             </div>

             {/* Sidebar: Mission Protocols & Merit Modules UI Terminal Sidebar Architecture */}
             <div className="xl:col-span-4 space-y-6 text-left">
                <motion.div variants={itemVariants} className="bg-white border border-blue-50 rounded-2xl p-6 md:p-8 shadow-4xl text-left hover:border-indigo-100 transition-all duration-700 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-6 opacity-[0.01] pointer-events-none text-right"><HelpCircle size={100} className="text-indigo-600" /></div>
                   <h3 className="text-base font-medium tracking-tighter mb-8 flex items-center gap-3 uppercase text-slate-950 leading-none relative z-10 text-left">
                      <Terminal className="text-indigo-600 text-left" size={16} /> MISSION_PROTOCOLS
                   </h3>
                   <div className="space-y-5 relative z-10 text-left">
                      {[
                        { id: 1, text: "READ PROBLEM CORE PARAMETERS CAREFULLY PRIOR TO SECTOR SUBMISSION." },
                        { id: 2, text: "SUBMISSION MODELS PROVISIONED FOR NATIONAL COMPARATIVE SYNTHESIS." },
                        { id: 3, text: "POINTS CONTRIBUTE TO GLOBAL GRID HUB AUTHORITY GRID RANK." }
                      ].map((step) => (
                        <div key={step.id} className="flex gap-4 text-left group/protocol">
                           <span className="w-6 h-6 rounded-lg bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-medium text-sm shadow-lg border border-white/5 transition-all duration-700 group-hover/protocol:scale-110 text-center">{step.id}</span>
                           <p className="text-xs font-medium text-slate-200 leading-relaxed uppercase tracking-widest group-hover:text-slate-950 transition-colors duration-700 pt-1 text-left">{step.text}</p>
                        </div>
                      ))}
                   </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-4xl relative overflow-hidden group text-left hover:scale-[1.01] transition-all duration-700 cursor-pointer">
                   <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none group-hover:scale-125 transition-transform duration-[2000ms] text-right"><Award size={100} /></div>
                   <div className="relative z-10 space-y-8 text-left">
                      <h4 className="text-xl font-medium tracking-tighter uppercase leading-none text-white text-left">ELITE_BONUS_</h4>
                      <p className="text-xs font-bold opacity-70 uppercase leading-relaxed tracking-normal text-left">
                         Correct synchronization on high-fidelity nodes provisions a <span className="text-white border-b border-white/30 pb-0.5">3.5X_ALGO_MULT</span> reward.
                      </p>
                      <div className="flex items-center gap-3.5 pt-2 text-left">
                         <div className="p-2.5 bg-white/10 rounded-xl border border-white/5 backdrop-blur-3xl shadow-4xl shrink-0 text-center">
                            <Zap size={18} className="text-white animate-pulse text-left" />
                         </div>
                          <div className="text-left text-left">
                             <p className="text-xs font-medium uppercase tracking-widest leading-none text-white">ActiveGridMult::ON</p>
                             <p className="text-xs font-medium uppercase tracking-normal opacity-40 leading-none mt-2">AUTH_TIERI</p>
                          </div>
                      </div>
                   </div>
                </motion.div>
             </div>
          </div>
        </motion.div>

        {/* Global Hub Authority terminal indicator UI Matrix Architecture */}
        <div className="fixed bottom-8 right-8 group z-50 opacity-40 hover:opacity-100 transition-all duration-1000 text-left">
           <div className="flex items-center gap-6 py-3.5 px-6 bg-white/60 backdrop-blur-3xl rounded-full border border-blue-50 shadow-4xl cursor-default text-left">
              <div className="relative text-left">
                 <Terminal size={18} className="text-indigo-600 animate-pulse text-left" />
                 <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 text-left" />
              </div>
               <div className="flex flex-col text-left text-left">
                  <p className="text-sm font-medium uppercase tracking-widest text-slate-950 leading-none text-left h-3">MISSION_TERMINAL</p>
                  <div className="flex items-center gap-2.5 mt-1.5 text-xs font-medium uppercase text-indigo-600 tracking-widest leading-none text-left h-4">
                     <Database size={10} className="text-left h-3" /> Sync: Operational :: HUB_SESSION master_node_sync
                  </div>
               </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default AttemptQuestionPage;