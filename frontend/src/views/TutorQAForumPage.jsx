import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, Filter, BookOpen, Clock, 
  CheckCircle2, Send, Star, AlertCircle,
  Activity, Zap, ArrowRight, Info, Search
} from 'lucide-react';
import { useAuth } from '../controllers/useAuth';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';
import { toast } from 'react-hot-toast';

const TutorQAForumPage = () => {
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [answerDraft, setAnswerDraft] = useState('');
  const [marksDraft, setMarksDraft] = useState('');
  const [feedbackDraft, setFeedbackDraft] = useState('');

  // Fetch real questions from the backend API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await api.get('/questions');
        const questionArray = res.data.questions || res.data || [];
        // Normalize backend data to match UI expectations
        const formatted = questionArray.map(q => ({
           id: q._id,
           student: q.author?.username || (typeof q.author === 'string' ? q.author : 'Unknown Student'),
           grade: q.grade || 'General',
           subject: q.subject || 'General',
           title: q.title || 'Untitled Inquiry',
           body: q.body || q.content || 'No content provided.',
           status: q.answerCount > 0 || q.hasAcceptedAnswer ? 'Answered' : 'Unanswered',
           askedOn: new Date(q.createdAt).toLocaleDateString(),
           tutorAnswer: q.correctAnswer || '',
           marks: q.points || null,
           feedback: q.explanation || '',
           urgency: q.difficulty === 'Hard' ? 'High' : 'Normal'
        }));
        setQuestions(formatted);
        if (formatted.length > 0) setSelectedId(formatted[0].id);
      } catch (error) {
        console.error("Failed to fetch QA Questions", error);
        toast.error("Could not load Q&A forum.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const selectedQuestion = useMemo(
    () => questions.find((q) => q.id === selectedId) || questions[0],
    [questions, selectedId]
  );

  useEffect(() => {
    if (selectedId && selectedQuestion) {
      setAnswerDraft(selectedQuestion.tutorAnswer || '');
      setMarksDraft(selectedQuestion.marks?.toString() ?? '');
      setFeedbackDraft(selectedQuestion.feedback || '');
    }
  }, [selectedId, selectedQuestion]);

  const availableSubjects = useMemo(() => {
     const subs = new Set(questions.map(q => q.subject));
     return Array.from(subs);
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const subjectMatches = subjectFilter === 'All' || q.subject === subjectFilter;
      const statusMatches = statusFilter === 'All' || q.status === statusFilter;
      return subjectMatches && statusMatches;
    });
  }, [questions, subjectFilter, statusFilter]);

  const handleSaveAnswer = async () => {
    if (!answerDraft.trim() || !selectedId) return;
    try {
      setLoading(true);
      const res = await api.post(`/answers/question/${selectedId}`, {
        body: answerDraft,
        marks: marksDraft ? Number(marksDraft) : undefined,
        tutorComment: feedbackDraft
      });

      if (res.data) {
        // Update local state to show the answer immediately
        setQuestions(prev => prev.map(q => q.id === selectedId ? {
          ...q,
          tutorAnswer: answerDraft,
          feedback: feedbackDraft,
          marks: Number(marksDraft),
          status: 'Answered'
        } : q));
        toast.success('Your response has been published to the student.');
        setAnswerDraft('');
        setMarksDraft('');
        setFeedbackDraft('');
      }
    } catch (e) {
      console.error('Answer submission error:', e);
      toast.error(e.response?.data?.error || 'Failed to post answer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout userRole="tutor">
      <div className="max-w-[1400px] mx-auto w-full font-sans flex flex-col h-[calc(100vh-100px)]">
        
        {/* Header */}
        <div className="mb-6 shrink-0">
           <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Student Inbox</h1>
           <p className="text-slate-500 font-medium text-sm mt-1">Review and resolve open academic inquiries.</p>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden">
           
           {/* Left Sidebar - Inbox List */}
           <div className="w-full lg:w-[380px] border-r border-slate-100 flex flex-col">
              
              <div className="p-6 border-b border-slate-100 shrink-0">
                 <div className="relative mb-4">
                    <input type="text" placeholder="Search inquiries..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00a8cc] transition-colors" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 </div>
                 <div className="flex gap-2">
                    <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 outline-none cursor-pointer">
                       <option value="All">All Subjects</option>
                       {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 outline-none cursor-pointer">
                       <option value="All">All Statuses</option>
                       <option value="Unanswered">Unanswered</option>
                       <option value="Answered">Answered</option>
                    </select>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                 {loading ? (
                    <div className="p-10 text-center text-slate-400 font-medium text-sm">
                       <Activity className="animate-spin text-[#00a8cc] mx-auto mb-2" size={24} />
                       Loading Inbox...
                    </div>
                 ) : filteredQuestions.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 font-medium text-sm">No matches found.</div>
                 ) : (
                    <div className="divide-y divide-slate-100">
                       {filteredQuestions.map((q) => (
                          <div 
                             key={q.id}
                             onClick={() => setSelectedId(q.id)}
                             className={cn(
                                "p-5 cursor-pointer transition-colors border-l-4",
                                selectedId === q.id ? "bg-[#e8f6fa] border-[#00a8cc]" : "bg-white hover:bg-slate-50 border-transparent"
                             )}
                          >
                             <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800 text-sm line-clamp-1 flex-1 pr-2">{q.title}</h4>
                                <span className="text-[10px] font-semibold text-slate-400 shrink-0">{q.askedOn}</span>
                             </div>
                             <p className="text-slate-500 text-xs line-clamp-1 mb-3">{q.body}</p>
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                   <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px]">{q.student[0]}</div>
                                   {q.student}
                                </div>
                                <span className={cn(
                                   "text-[10px] font-bold px-2 py-0.5 rounded-md",
                                   q.status === 'Answered' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                )}>
                                   {q.status}
                                </span>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>

           {/* Right Content - Chat/Resolution Area */}
           <div className="flex-1 flex flex-col bg-[#fdfdfc]">
              {selectedQuestion ? (
                 <>
                    {/* Resolution Header */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                       <div>
                          <h2 className="text-xl font-bold text-slate-800">{selectedQuestion.title}</h2>
                          <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-500">
                             <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md">{selectedQuestion.subject}</span>
                             <span>Grade {selectedQuestion.grade}</span>
                             {selectedQuestion.urgency === 'High' && (
                                <span className="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-md flex items-center gap-1"><AlertCircle size={12}/> High Urgency</span>
                             )}
                          </div>
                       </div>
                    </div>

                    {/* Chat Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
                       
                       {/* Student Bubble */}
                       <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-slate-600 font-bold border border-slate-300">
                             {selectedQuestion.student[0]?.toUpperCase() || 'S'}
                          </div>
                          <div className="flex-1 max-w-3xl">
                             <div className="flex items-end gap-2 mb-1">
                                <span className="text-sm font-bold text-slate-700">{selectedQuestion.student}</span>
                                <span className="text-[10px] text-slate-400">{selectedQuestion.askedOn}</span>
                             </div>
                             <div className="bg-white border border-slate-200 p-4 rounded-b-xl rounded-tr-xl text-slate-700 text-sm leading-relaxed shadow-sm">
                                {selectedQuestion.body}
                             </div>
                          </div>
                       </div>

                       {/* Tutor Bubble (if answered) */}
                       {selectedQuestion.status === 'Answered' && (
                          <div className="flex gap-4 flex-row-reverse">
                             <div className="w-10 h-10 rounded-full bg-primary/10 shrink-0 flex items-center justify-center text-primary font-bold border border-primary/20">
                                You
                             </div>
                             <div className="flex-1 max-w-3xl items-end flex flex-col">
                                <div className="flex items-end gap-2 mb-1">
                                   <span className="text-[10px] text-slate-400">Just Now</span>
                                   <span className="text-sm font-bold text-slate-700">You (Tutor)</span>
                                </div>
                                <div className="bg-[#e8f6fa] border border-[#bcecf9] p-4 rounded-b-xl rounded-tl-xl text-slate-800 text-sm leading-relaxed shadow-sm">
                                   {selectedQuestion.tutorAnswer}
                                </div>
                             </div>
                          </div>
                       )}
                    </div>

                    {/* Compose Area */}
                    <div className="p-6 bg-white border-t border-slate-100 shrink-0">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Write your response</label>
                       <textarea
                          value={answerDraft}
                          onChange={(e) => setAnswerDraft(e.target.value)}
                          placeholder="Type your explanation here..."
                          rows={4}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:border-[#00a8cc] resize-none mb-4"
                       />
                       
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex flex-wrap items-center gap-4">
                             <div className="flex items-center gap-2">
                                <Star size={16} className="text-orange-500" />
                                <input
                                  type="number" min="0" max="10" placeholder="Mark (0-10)"
                                  value={marksDraft} onChange={(e) => setMarksDraft(e.target.value)}
                                  className="w-28 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00a8cc]"
                                />
                             </div>
                             <div className="flex items-center gap-2">
                                <input
                                  type="text" placeholder="Private feedback..."
                                  value={feedbackDraft} onChange={(e) => setFeedbackDraft(e.target.value)}
                                  className="w-48 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00a8cc]"
                                />
                             </div>
                          </div>
                          
                          <button
                            onClick={handleSaveAnswer}
                            disabled={!answerDraft.trim()}
                            className="bg-[#00a8cc] hover:bg-[#008ba8] text-white font-bold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                             Send Response <Send size={16} />
                          </button>
                       </div>
                    </div>

                 </>
              ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10">
                    <MessageSquare size={48} className="mb-4 text-slate-200" />
                    <p className="text-center font-medium">Select an inquiry from the sidebar<br/>to begin writing a response.</p>
                 </div>
              )}
           </div>

        </div>
      </div>
    </Layout>
  );
};

export default TutorQAForumPage;