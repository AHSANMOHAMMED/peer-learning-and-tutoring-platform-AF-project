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

  const subjects = ['Mathematics', 'Science', 'History', 'English', 'ICT'];

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/questions');
        if (response.ok) {
          const data = await response.json();
          // For the student, we only want to show their own questions.
          // Since the dummy data might not be assigned to this specific user, we show all for Demo purposes.
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
          }));
          setQuestions(formatted);
          if (formatted.length > 0) setSelectedId(formatted[0].id);
        }
      } catch (error) {
        toast.error("Could not load your messages.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [user]);

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
                                <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-500">{q.subject}</span>
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
                             Me
                          </div>
                          <div className="flex-1 max-w-3xl flex flex-col items-end">
                             <div className="flex items-end gap-2 mb-1">
                                <span className="text-[10px] text-slate-400">{selectedQuestion.askedOn}</span>
                                <span className="text-sm font-bold text-slate-700">Me</span>
                             </div>
                             <div className="bg-white border border-slate-200 p-4 rounded-b-xl rounded-tl-xl text-slate-700 text-sm leading-relaxed shadow-sm">
                                {selectedQuestion.body}
                             </div>
                          </div>
                       </div>

                       {/* Tutor Bubble */}
                       {selectedQuestion.status === 'Resolved' && (
                          <div className="flex gap-4">
                             <div className="w-10 h-10 rounded-full bg-[#e8f6fa] shrink-0 flex items-center justify-center text-[#00a8cc] font-bold border border-[#bcecf9]">
                                T
                             </div>
                             <div className="flex-1 max-w-3xl">
                                <div className="flex items-end gap-2 mb-1">
                                   <span className="text-sm font-bold text-slate-700">Verified Tutor</span>
                                   <span className="text-[10px] text-slate-400 flex items-center gap-1"><AlertCircle size={10}/> Verified Answer</span>
                                </div>
                                <div className="bg-[#e8f6fa] border border-[#bcecf9] p-4 rounded-b-xl rounded-tr-xl text-slate-800 text-sm leading-relaxed shadow-sm">
                                   {selectedQuestion.tutorAnswer}
                                </div>
                                {selectedQuestion.marks && (
                                   <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold border border-orange-100">
                                      Teacher Mark: {selectedQuestion.marks} / 10
                                   </div>
                                )}
                             </div>
                          </div>
                       )}

                    </div>

                    {/* Compose Area for Follow up */}
                    {selectedQuestion.status === 'Resolved' && (
                       <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                          <div className="relative">
                             <input type="text" placeholder="Type a follow up reply..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00a8cc] pr-12" />
                             <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#00a8cc] text-white rounded-lg hover:bg-[#008ba8] transition-colors">
                                <Send size={16} />
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