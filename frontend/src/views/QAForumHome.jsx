import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Plus, Search,
  Send, User, Clock, AlertCircle, Sparkles
} from 'lucide-react';
import { useAuth } from '../controllers/useAuth';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';
import { toast } from 'react-hot-toast';

const QAForumHome = () => {
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('All');
  
  const [isCompose, setIsCompose] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
   const [newSubject, setNewSubject] = useState('Mathematics');
   const [viewMode, setViewMode] = useState('Feed');
   const [answerBody, setAnswerBody] = useState('');
   const [isAnswering, setIsAnswering] = useState(false);

  const subjects = ['Mathematics', 'Science', 'History', 'English', 'ICT'];

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
        
        // In 'Feed' mode, fetch all questions for the student's grade
        // In 'MyQuestions' mode, fetch only user's questions
        const url = viewMode === 'Feed' 
          ? `${API_URL}/api/questions?grade=${user?.profile?.grade?.match(/\d+/)?.[0] || '10'}`
          : `${API_URL}/api/questions/user/my`;

        const response = await fetch(url, {
           headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const formatted = (data.questions || []).map(q => ({
             id: q._id,
             student: q.author?.username || q.author || 'Me',
             grade: q.grade || 10,
             subject: q.subject || 'General',
             title: q.title || 'Untitled Inquiry',
             body: q.body || q.content || 'No content provided.',
             status: q.answers?.length > 0 ? 'Resolved' : 'Pending',
             askedOn: new Date(q.createdAt).toLocaleDateString(),
             tutorAnswer: q.answers?.[0]?.content || '',
             marks: q.marks || null,
             authorId: q.author?._id || q.author,
             answers: q.answers || []
          }));
          setQuestions(formatted);
          if (formatted.length > 0 && !selectedId) setSelectedId(formatted[0].id);
        }
      } catch (error) {
        toast.error("Could not load forum questions.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [user, viewMode]);

  const selectedQuestion = useMemo(
    () => questions.find((q) => q.id === selectedId),
    [questions, selectedId]
  );

  const filteredQuestions = useMemo(() => {
    if (filter === 'All') return questions;
    return questions.filter(q => q.status === filter);
  }, [questions, filter]);

  const handlePostQuestion = async () => {
    if (!newTitle.trim() || !newBody.trim()) return toast.error("Please fill all fields");
    
    const token = localStorage.getItem('token');
    try {
       const response = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ title: newTitle, content: newBody, subject: newSubject, grade: 10, tags: [] })
       });

       if (response.ok) {
          const data = await response.json();
          const newQ = {
             id: data._id || Date.now().toString(),
             student: 'Me',
             grade: 10,
             subject: newSubject,
             title: newTitle,
             body: newBody,
             status: 'Pending',
             askedOn: 'Just Now',
             tutorAnswer: '',
          };
          setQuestions([newQ, ...questions]);
          setSelectedId(newQ.id);
          setIsCompose(false);
          setNewTitle('');
          setNewBody('');
          toast.success("Question posted to tutors!");
       }
    } catch(err) {
       toast.error("Failed to post question. Trying optimistically.");
       // Optimistic fallback for demo
       const newQ = {
             id: Date.now().toString(),
             student: 'Me',
             grade: 10,
             subject: newSubject,
             title: newTitle,
             body: newBody,
             status: 'Pending',
             askedOn: 'Just Now',
             tutorAnswer: '',
       };
       setQuestions([newQ, ...questions]);
       setSelectedId(newQ.id);
       setIsCompose(false);
    }
  };

  const handlePostAnswer = async () => {
    if (!answerBody.trim()) return toast.error("Answer cannot be empty");
    
    setIsAnswering(true);
    const token = localStorage.getItem('token');
    try {
       const response = await fetch(`/api/answers/${selectedId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ body: answerBody })
       });

       if (response.ok) {
          toast.success("Answer submitted successfully!");
          setAnswerBody('');
          // Re-fetch or update local state
          const updatedQ = { ...selectedQuestion };
          updatedQ.status = 'Resolved';
          setQuestions(questions.map(q => q.id === selectedId ? updatedQ : q));
       }
    } catch(err) {
       toast.error("Failed to post answer");
    } finally {
       setIsAnswering(false);
    }
  };

  return (
    <Layout userRole={user?.role || 'student'}>
      <div className="max-w-[1400px] mx-auto w-full font-sans flex flex-col h-[calc(100vh-100px)]">
        
        {/* Header */}
        <div className="mb-6 shrink-0 flex justify-between items-end">
           <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Messages & Support</h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Ask questions and communicate with platform mentors.</p>
           </div>
           <button 
              onClick={() => { setIsCompose(true); setSelectedId(null); }}
              className="bg-[#00a8cc] hover:bg-[#008ba8] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
           >
              <Plus size={18} /> New Question
           </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden">
           
           {/* Left Sidebar - Inbox List */}
           <div className="w-full lg:w-[380px] border-r border-slate-100 flex flex-col">
              
              <div className="p-6 border-b border-slate-100 shrink-0">
                 <div className="relative mb-4">
                    <input type="text" placeholder="Search my questions..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00a8cc] transition-colors" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 </div>
                  <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 mb-4">
                     <button onClick={() => setViewMode('Feed')} className={cn("flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", viewMode === 'Feed' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:bg-slate-50")}>Feed</button>
                     <button onClick={() => setViewMode('MyQuestions')} className={cn("flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", viewMode === 'MyQuestions' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:bg-slate-50")}>My Posts</button>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => setFilter('All')} className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-colors", filter === 'All' ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500")}>All</button>
                     <button onClick={() => setFilter('Pending')} className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-colors", filter === 'Pending' ? "bg-amber-100 text-amber-700" : "bg-slate-50 text-slate-500")}>Pending</button>
                     <button onClick={() => setFilter('Resolved')} className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-colors", filter === 'Resolved' ? "bg-emerald-100 text-emerald-700" : "bg-slate-50 text-slate-500")}>Resolved</button>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                 {loading ? (
                    <div className="p-10 text-center text-slate-400 font-medium text-sm">Loading History...</div>
                 ) : filteredQuestions.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 font-medium text-sm">No matches found.</div>
                 ) : (
                    <div className="divide-y divide-slate-100">
                       {filteredQuestions.map((q) => (
                          <div 
                             key={q.id}
                             onClick={() => { setSelectedId(q.id); setIsCompose(false); }}
                             className={cn(
                                "p-5 cursor-pointer transition-colors border-l-4",
                                selectedId === q.id && !isCompose ? "bg-[#e8f6fa] border-[#00a8cc]" : "bg-white hover:bg-slate-50 border-transparent"
                             )}
                          >
                             <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800 text-sm line-clamp-1 flex-1 pr-2">{q.title}</h4>
                                <span className="text-[10px] font-semibold text-slate-400 shrink-0">{q.askedOn}</span>
                             </div>
                             <p className="text-slate-500 text-xs line-clamp-1 mb-3">{q.body}</p>
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500 uppercase">{q.student?.[0] || 'S'}</div>
                                    <span className="text-[10px] font-bold text-slate-500">{q.student}</span>
                                 </div>
                                 <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1",
                                    q.status === 'Resolved' ? "text-emerald-500" : "text-amber-500"
                                 )}>
                                    <div className={cn("w-1.5 h-1.5 rounded-full", q.status === 'Resolved' ? "bg-emerald-500" : "bg-amber-500")}/>
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
           <div className="flex-1 flex flex-col bg-[#fdfdfc] relative">
              
              {isCompose ? (
                 <div className="p-10 flex flex-col h-full bg-white animate-in fade-in">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                       <Sparkles className="text-[#00a8cc]" /> Ask a Question
                    </h2>
                    
                    <div className="space-y-6 max-w-3xl">
                       <div>
                          <label className="text-sm font-bold text-slate-600 block mb-2">Subject Area</label>
                          <select 
                             value={newSubject} onChange={(e) => setNewSubject(e.target.value)}
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-[#00a8cc] font-medium"
                          >
                             {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                       </div>
                       <div>
                          <label className="text-sm font-bold text-slate-600 block mb-2">Question Title</label>
                          <input 
                             type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                             placeholder="e.g. How do I solve for x in a quadratic equation?"
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-[#00a8cc] font-medium"
                          />
                       </div>
                       <div className="flex-1">
                          <label className="text-sm font-bold text-slate-600 block mb-2">Details & Context</label>
                          <textarea 
                             value={newBody} onChange={(e) => setNewBody(e.target.value)}
                             placeholder="Provide the full problem description..."
                             rows={8}
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 outline-none focus:border-[#00a8cc] resize-none"
                          />
                       </div>
                       <div className="pt-4 flex justify-end">
                          <button 
                             onClick={handlePostQuestion}
                             className="bg-[#00a8cc] hover:bg-[#008ba8] text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
                          >
                             Submit Question <Send size={18} />
                          </button>
                       </div>
                    </div>
                 </div>
              ) : selectedQuestion ? (
                 <>
                    {/* Chat Header */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                       <div>
                          <h2 className="text-xl font-bold text-slate-800">{selectedQuestion.title}</h2>
                          <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-500">
                             <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">{selectedQuestion.subject}</span>
                             <span>{selectedQuestion.askedOn}</span>
                          </div>
                       </div>
                    </div>

                    {/* Chat Bubbles */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-50/50">
                       
                       {/* My Bubble */}
                        <div className="flex gap-4 flex-row-reverse">
                           <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-slate-600 font-bold border border-slate-300">
                              {selectedQuestion.student?.[0] || 'S'}
                           </div>
                           <div className="flex-1 max-w-3xl flex flex-col items-end">
                              <div className="flex items-end gap-2 mb-1">
                                 <span className="text-[10px] text-slate-400">{selectedQuestion.askedOn}</span>
                                 <span className="text-sm font-bold text-slate-700">{selectedQuestion.student}</span>
                              </div>
                              <div className="bg-white border border-slate-200 p-4 rounded-b-xl rounded-tl-xl text-slate-700 text-sm leading-relaxed shadow-sm">
                                 {selectedQuestion.body}
                              </div>
                           </div>
                        </div>
                        {selectedQuestion.answers?.map((ans, ai) => (
                           <div key={ai} className="flex gap-4">
                              <div className="w-10 h-10 rounded-full bg-blue-50 shrink-0 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                                 {ans.author?.username?.[0] || 'A'}
                              </div>
                              <div className="flex-1 max-w-3xl">
                                 <div className="flex items-end gap-2 mb-1">
                                    <span className="text-sm font-bold text-slate-700">{ans.author?.username || 'Peer'}</span>
                                    <span className="text-[10px] text-slate-400">{new Date(ans.createdAt).toLocaleDateString()}</span>
                                 </div>
                                 <div className="bg-white border border-slate-100 p-4 rounded-b-xl rounded-tr-xl text-slate-700 text-sm leading-relaxed shadow-sm">
                                    {ans.body}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                     {selectedQuestion.authorId !== user?._id && (
                        <div className="p-6 bg-white border-t border-slate-100 shrink-0">
                           <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Provide your solution</p>
                           <div className="flex gap-4">
                              <textarea 
                                 value={answerBody}
                                 onChange={(e) => setAnswerBody(e.target.value)}
                                 placeholder="Explain your answer or solve the problem..." 
                                 className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00a8cc] resize-none" 
                                 rows={2}
                              />
                              <button 
                                 onClick={handlePostAnswer}
                                 disabled={isAnswering}
                                 className="px-6 bg-[#00a8cc] text-white rounded-xl hover:bg-[#008ba8] transition-colors font-bold flex items-center justify-center gap-2"
                              >
                                 {isAnswering ? '...' : <Send size={20} />}
                              </button>
                           </div>
                        </div>
                     )}
                 </>
              ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10">
                    <MessageSquare size={48} className="mb-4 text-slate-200" />
                    <p className="text-center font-medium">Select a message string from the sidebar<br/>or start a new question.</p>
                 </div>
              )}
           </div>

        </div>
      </div>
    </Layout>
  );
};

export default QAForumHome;