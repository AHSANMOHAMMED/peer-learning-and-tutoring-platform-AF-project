import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MessageSquare, ThumbsUp, 
  CheckCircle, Globe, Award, User,
  Send, MoreVertical, Shield, Clock,
  ChevronUp, ChevronDown, Trash2, Edit2,
  Check, X
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../controllers/useAuth';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const ForumThreadPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerDraft, setAnswerDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestionAndAnswers();
  }, [id]);

  const fetchQuestionAndAnswers = async () => {
    try {
      setLoading(true);
      const [qRes, aRes] = await Promise.all([
        questionApi.getById(id),
        answerApi.getAll({ questionId: id })
      ]);
      
      if (qRes.data.question) setQuestion(qRes.data.question);
      if (aRes.data.answers) setAnswers(aRes.data.answers);
    } catch (error) {
      console.error('Error fetching thread:', error);
      toast.error('Failed to load discussion thread');
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!answerDraft.trim()) return;
    
    try {
      setSubmitting(true);
      const res = await answerApi.create({ ...answerDraft, questionId: id });
      if (res.data) {
        toast.success('Your contribution has been published');
        setAnswers([...answers, res.data]);
        setAnswerDraft('');
      }
    } catch (error) {
      toast.error('Failed to post answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsCorrect = async (answerId) => {
    try {
      const res = await api.put(`/answers/${answerId}/status`, { 
        status: 'correct',
        tutorComment: 'Marked as correct by a verified educator.'
      });
      if (res.data) {
        toast.success('Answer marked as the definitive solution');
        setAnswers(prev => prev.map(a => a._id === answerId ? res.data : a));
      }
    } catch (error) {
      toast.error('Failed to mark answer');
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Delete this response?')) return;
    try {
      await api.delete(`/answers/${answerId}`);
      toast.success('Response removed');
      setAnswers(prev => prev.filter(a => a._id !== answerId));
    } catch (error) {
      toast.error('Failed to delete response');
    }
  };

  if (loading && !question) {
    return (
      <Layout userRole={user?.role}>
        <div className="min-h-screen flex items-center justify-center">
           <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole={user?.role}>
      <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10">
        <div className="max-w-5xl mx-auto space-y-10">
          
          {/* Thread Header */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/forum')}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Forum
            </button>
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{answers.length} Responses</span>
               <div className="h-4 w-px bg-slate-200" />
               <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Active Thread</span>
            </div>
          </div>

          {/* Question Component */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white p-10 lg:p-14 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/20 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             
             <div className="relative z-10 space-y-10">
                <div className="flex flex-wrap items-center gap-4">
                   <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 text-[10px] font-black uppercase tracking-widest">
                      {question.subject}
                   </div>
                   <div className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full border border-slate-100 text-[10px] font-black uppercase tracking-widest">
                      Grade {question.grade}
                   </div>
                   <div className="ml-auto text-slate-400 flex items-center gap-2">
                      <Clock size={14} />
                      <span className="text-[10px] font-black uppercase">{new Date(question.createdAt).toLocaleDateString()}</span>
                   </div>
                </div>

                <div className="space-y-6">
                   <h1 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                      {question.title}
                   </h1>
                   <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100/50">
                      <p className="text-slate-600 text-lg lg:text-xl font-medium leading-relaxed whitespace-pre-wrap">
                         {question.body}
                      </p>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-slate-400">
                         {question.author?.username?.[0]?.toUpperCase() || <User size={20} />}
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-900">{question.author?.username || 'Verified Scholar'}</p>
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Author • {question.author?.reputation || 0} Rep</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all font-black text-[10px] uppercase shadow-sm">
                         <ThumbsUp size={16} /> Upvote Discussion
                      </button>
                   </div>
                </div>
             </div>
          </motion.div>

          {/* Answers Feed */}
          <div className="space-y-8">
             <div className="flex items-center gap-4">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Expert & Peer Insights</h3>
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-black text-slate-400">{answers.length} Community Responses</span>
             </div>

             <div className="space-y-6">
                <AnimatePresence>
                   {answers.map((ans, idx) => (
                     <motion.div 
                       key={ans._id}
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       className={cn(
                         "bg-white p-8 lg:p-10 rounded-[2.5rem] border transition-all relative overflow-hidden group/ans",
                         ans.status === 'correct' ? "border-emerald-200 shadow-2xl shadow-emerald-200/20" : "border-slate-200"
                       )}
                     >
                        {ans.status === 'correct' && (
                          <div className="absolute top-0 right-0 px-6 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-2xl shadow-lg flex items-center gap-2">
                             <Check size={14} /> Verified Solution
                          </div>
                        )}

                        <div className="flex flex-col lg:flex-row gap-8">
                           <div className="flex flex-col items-center gap-3 shrink-0">
                              <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                                 <ChevronUp size={24} />
                              </button>
                              <span className="font-black text-lg text-slate-900">{ans.voteScore || 0}</span>
                              <button className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all">
                                 <ChevronDown size={24} />
                              </button>
                           </div>

                           <div className="flex-1 space-y-6">
                              <div className="space-y-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs border border-slate-200">
                                       {ans.author?.username?.[0]?.toUpperCase() || 'V'}
                                    </div>
                                    <div>
                                       <div className="flex items-center gap-2">
                                          <p className="text-sm font-black text-slate-900">{ans.author?.username || 'Verified Scholar'}</p>
                                          {ans.author?.role === 'tutor' && (
                                            <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-indigo-100">Verified Educator</div>
                                          )}
                                       </div>
                                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{new Date(ans.createdAt).toLocaleDateString()}</p>
                                    </div>
                                 </div>
                                 <p className="text-slate-600 text-base lg:text-lg font-medium leading-relaxed">
                                    {ans.body}
                                 </p>
                              </div>

                              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                 <div className="flex items-center gap-4">
                                    <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-black text-[10px] uppercase">
                                       <MessageSquare size={14} /> Reply
                                    </button>
                                    <button className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] uppercase">
                                       Share
                                    </button>
                                 </div>

                                 <div className="flex items-center gap-2">
                                    {user?.role === 'tutor' && ans.status !== 'correct' && (
                                      <button 
                                        onClick={() => handleMarkAsCorrect(ans._id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all font-black text-[10px] uppercase border border-emerald-100"
                                      >
                                         <CheckCircle size={14} /> Mark Solution
                                      </button>
                                    )}
                                    {(user?.role === 'admin' || user?._id === ans.author?._id) && (
                                      <button 
                                        onClick={() => handleDeleteAnswer(ans._id)}
                                        className="p-2 text-slate-300 hover:text-rose-600 rounded-lg transition-all"
                                      >
                                         <Trash2 size={16} />
                                      </button>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   ))}
                </AnimatePresence>
             </div>
          </div>

          {/* Answer Input */}
          {user?.role !== 'parent' && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 lg:p-14 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/20"
            >
               <div className="space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                        <Edit2 size={24} />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Your Resolution</h2>
                        <p className="text-slate-400 font-medium mt-1 uppercase text-[10px] tracking-widest">Constructive Feedback Mode</p>
                     </div>
                  </div>

                  <form onSubmit={handlePostAnswer} className="space-y-6">
                     <textarea 
                       required
                       rows={6}
                       placeholder="Provide a comprehensive academic response. Include steps or reasoning where possible..."
                       value={answerDraft}
                       onChange={(e) => setAnswerDraft(e.target.value)}
                       className="w-full px-8 py-8 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 resize-none text-lg"
                     />
                     <div className="flex justify-end">
                        <button 
                          disabled={submitting || !answerDraft.trim()}
                          type="submit"
                          className="px-12 py-5 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                           {submitting ? 'Publishing...' : 'Post Response'}
                           <Send size={18} />
                        </button>
                     </div>
                  </form>
               </div>
            </motion.div>
          )}

          {user?.role === 'parent' && (
            <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 text-center">
               <p className="text-indigo-600 font-bold text-sm">Parent View: Monitoring child's academic activity. Commenting is disabled.</p>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default ForumThreadPage;
