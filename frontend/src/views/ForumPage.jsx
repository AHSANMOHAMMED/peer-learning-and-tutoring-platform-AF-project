import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Search, Filter, Plus, 
  ThumbsUp, MessageCircle, MoreVertical, 
  CheckCircle, Shield, Award, User,
  Calendar, BookOpen, GraduationCap, ChevronDown,
  ArrowRight, SearchIcon, Sparkles, Send
} from 'lucide-react';
import { useAuth } from '../controllers/useAuth';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const ForumPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [isNewQuestionModalOpen, setIsNewQuestionModalOpen] = useState(false);

  // New Question Form State
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    content: '',
    subject: 'Mathematics',
    grade: user?.grade || 10,
    tags: ''
  });

  const subjects = ['Mathematics', 'Science', 'History', 'English', 'ICT', 'Business', 'Geography'];

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/questions');
      if (res.data.questions) {
        setQuestions(res.data.questions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/questions', {
        ...newQuestion,
        tags: newQuestion.tags.split(',').map(tag => tag.trim())
      });
      if (res.data) {
        toast.success('Question published to the community');
        setQuestions([res.data, ...questions]);
        setIsNewQuestionModalOpen(false);
        setNewQuestion({
          title: '',
          content: '',
          subject: 'Mathematics',
          grade: user?.grade || 10,
          tags: ''
        });
      }
    } catch (error) {
      toast.error('Failed to post question');
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || q.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <Layout userRole={user?.role}>
      <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-8 border-b border-slate-200/60">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                <Sparkles size={12} /> Aura Academic Community
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
                Scholastic <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Discourse Hub</span>
              </h1>
              <p className="text-slate-500 font-medium max-w-xl">
                Collaborate with the brightest minds. Ask questions, provide expert solutions, and build your academic reputation.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
               <div className="relative group flex-1 sm:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search discussions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 font-medium transition-all"
                  />
               </div>
               {user?.role === 'student' && (
                 <button 
                   onClick={() => setIsNewQuestionModalOpen(true)}
                   className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:bg-slate-950 active:scale-95 transition-all"
                 >
                   <Plus size={20} />
                   Start Discussion
                 </button>
               )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar Filters */}
            <div className="lg:col-span-3 space-y-8">
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/20">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <Filter size={16} className="text-indigo-600" /> Subject Areas
                  </h3>
                  <div className="space-y-2">
                     {['All', ...subjects].map(sub => (
                       <button
                         key={sub}
                         onClick={() => setSelectedSubject(sub)}
                         className={cn(
                           "w-full text-left px-5 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-between group",
                           selectedSubject === sub 
                             ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105" 
                             : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                         )}
                       >
                         {sub}
                         <ChevronDown size={14} className={cn("opacity-0 transition-all transform", selectedSubject === sub ? "opacity-100 rotate-[-90deg]" : "group-hover:opacity-100")} />
                       </button>
                     ))}
                  </div>
               </div>

               <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
                  <h3 className="text-xl font-black mb-4 relative z-10">Top Contributors</h3>
                  <p className="text-indigo-100 text-xs font-medium mb-6 relative z-10 opacity-80 uppercase tracking-widest">Global Ranking :: Period 4</p>
                  <div className="space-y-4 relative z-10">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="flex items-center gap-4 p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-white">{i}</div>
                          <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold truncate">User_{i}029</p>
                             <p className="text-[10px] uppercase font-black tracking-widest opacity-60">12,400 XP</p>
                          </div>
                          <Award size={16} className="text-amber-300" />
                       </div>
                     ))}
                  </div>
                  <button className="w-full mt-6 py-3 bg-white/20 hover:bg-white text-white hover:text-indigo-700 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                    View Leaderboard
                  </button>
               </div>
            </div>

            {/* Questions Feed */}
            <div className="lg:col-span-9 space-y-6">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-6">
                  <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing Community Feed...</p>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="bg-white p-20 rounded-[3rem] border border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="p-8 bg-slate-50 rounded-full text-slate-300"><MessageSquare size={64} /></div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Quiet in the hub</h2>
                    <p className="text-slate-500 font-medium">No discussions found matching your current filters.</p>
                  </div>
                  <button onClick={() => { setSelectedSubject('All'); setSearchQuery(''); }} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all">
                    Reset Filter Nodes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  <AnimatePresence>
                    {filteredQuestions.map((q, idx) => (
                      <motion.div
                        key={q._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/30 hover:border-indigo-200 transition-all relative overflow-hidden flex flex-col gap-6"
                      >
                         <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                                  {q.author?.username?.[0]?.toUpperCase() || <User size={20} />}
                               </div>
                               <div>
                                  <h4 className="text-sm font-black text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer">{q.author?.username || 'Verified Scholar'}</h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Grade {q.grade} Area</span>
                                     <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{new Date(q.createdAt).toLocaleDateString()}</span>
                                  </div>
                               </div>
                            </div>
                            <div className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full border border-slate-100 text-[10px] font-black uppercase tracking-widest">
                               {q.subject}
                            </div>
                         </div>

                         <div className="space-y-3">
                            <h2 className="text-xl lg:text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                               {q.title}
                            </h2>
                            <p className="text-slate-500 line-clamp-2 font-medium leading-relaxed">
                               {q.body}
                            </p>
                         </div>

                         <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-6">
                               <button className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all">
                                  <ThumbsUp size={18} />
                                  <span className="text-xs font-black">{q.voteScore || 0}</span>
                                </button>
                                <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all">
                                  <MessageCircle size={18} />
                                  <span className="text-xs font-black">{q.answersCount || 0} Decisions</span>
                                </button>
                            </div>
                            
                            <button 
                              onClick={() => navigate(`/forum/${q._id}`)}
                              className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 rounded-xl text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-slate-950 hover:text-white transition-all group/view"
                            >
                               Enter Discourse
                               <ArrowRight size={14} className="group-hover/view:translate-x-1 transition-transform" />
                            </button>
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Question Modal */}
      <AnimatePresence>
         {isNewQuestionModalOpen && (
           <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 lg:p-10">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsNewQuestionModalOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-3xl overflow-hidden"
              >
                 <div className="p-10 lg:p-14 space-y-10">
                    <div className="flex justify-between items-start">
                       <div className="space-y-2">
                          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Initiate <span className="text-indigo-600">Discourse</span></h2>
                          <p className="text-slate-400 font-medium">Define your academic problem for community synthesis.</p>
                       </div>
                    </div>

                    <form onSubmit={handleCreateQuestion} className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Inquiry Title</label>
                          <input 
                            required
                            type="text" 
                            placeholder="e.g. How to solve quadratic equations using the formula?"
                            value={newQuestion.title}
                            onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all font-bold text-slate-900"
                          />
                       </div>

                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Domain</label>
                             <select 
                               value={newQuestion.subject}
                               onChange={(e) => setNewQuestion({...newQuestion, subject: e.target.value})}
                               className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all font-bold text-slate-900 appearance-none"
                             >
                               {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Academic Grade</label>
                             <input 
                               type="number" 
                               min="6" max="13"
                               value={newQuestion.grade}
                               onChange={(e) => setNewQuestion({...newQuestion, grade: parseInt(e.target.value)})}
                               className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all font-bold text-slate-900"
                             />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Problem Parameters</label>
                          <textarea 
                            required
                            rows={4}
                            placeholder="Describe your question in detail..."
                            value={newQuestion.content}
                            onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-700 resize-none"
                          />
                       </div>

                       <div className="flex gap-4 pt-4">
                          <button 
                            type="button" 
                            onClick={() => setIsNewQuestionModalOpen(false)}
                            className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                          >
                             Abort
                          </button>
                          <button 
                            type="submit" 
                            className="flex-[2] py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3"
                          >
                             Publish Inquiry <Send size={16} />
                          </button>
                       </div>
                    </form>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

    </Layout>
  );
};

export default ForumPage;
