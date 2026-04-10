import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Award,
  BookOpen,
  Languages,
  ChevronRight
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-hot-toast';

interface Question {
  _id: string;
  title: string;
  content: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: string;
  explanation?: string;
  points: number;
  subject: string;
  grade: number;
  type: 'mcq' | 'structured' | 'essay';
}

const AttemptQuestionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const res = await api.get(`/api/qa/questions/${id}`);
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
      const res = await api.post('/api/qa/submissions', {
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
        toast.success('Answer submitted!');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer');
    }
  };

  if (loading) return <Layout userRole="student"><div className="p-8">Loading...</div></Layout>;
  if (!question) return <Layout userRole="student"><div className="p-8">Question not found</div></Layout>;

  return (
    <Layout userRole="student">
      <div className="min-h-screen p-4 md:p-8 space-y-8 bg-gray-50/50 dark:bg-gray-950/50">
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-bold uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={16} /> Back to questions
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Question Card */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-xl shadow-blue-500/5 border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{question.subject} • Grade {question.grade}</h3>
                    <h2 className="text-2xl font-black tracking-tight dark:text-white capitalize">{question.title}</h2>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-sm">
                  {question.points} Points
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none mb-10">
                <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-medium">
                  {question.content}
                </p>
              </div>

              {/* Answer Input */}
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.div 
                    key="input"
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6"
                  >
                    {question.type === 'mcq' ? (
                      <div className="grid gap-4">
                        {['A', 'B', 'C', 'D'].map((opt) => {
                          const optKey = `option${opt}` as keyof Question;
                          const optVal = question[optKey];
                          if (!optVal) return null;
                          return (
                            <button
                              key={opt}
                              onClick={() => setSelectedOption(opt)}
                              className={`p-5 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${
                                selectedOption === opt 
                                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                                  : 'border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                                selectedOption === opt ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
                              }`}>
                                {opt}
                              </span>
                              <span className="font-bold">{optVal}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your explanation here..."
                        className="w-full h-48 p-6 rounded-[1.5rem] bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300 font-medium text-lg outline-none transition-all"
                      />
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={question.type === 'mcq' ? !selectedOption : !answer}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
                    >
                      Process Submission <Send size={18} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8"
                  >
                    <div className="p-8 rounded-[2rem] bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 text-green-700 dark:text-green-300">
                      <div className="flex items-center gap-4 mb-4">
                        <CheckCircle size={32} />
                        <h3 className="text-xl font-bold uppercase tracking-wider">Submission Successful</h3>
                      </div>
                      <p className="font-medium opacity-80">
                        {result?.leaderboardRewarded 
                          ? `Excellent work! You've earned ${question.points} points for this correct submission.` 
                          : "Your answer has been recorded for evaluation."}
                      </p>
                    </div>

                    {question.explanation && (
                      <div className="p-8 rounded-[2rem] bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                        <h4 className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-blue-600 dark:text-blue-400 mb-4">
                          <Languages size={16} /> Model Explanation
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                          {question.explanation}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => navigate('/qa/medium')}
                      className="w-full py-5 bg-gray-900 dark:bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3"
                    >
                      Browse Next Problem <ChevronRight size={18} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Sidebar / Instructions */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="font-black uppercase text-xs tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <HelpCircle size={16} /> Instructions
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-4 text-sm font-medium text-gray-500">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold">1</span>
                  Read the problem carefully before providing a response.
                </li>
                <li className="flex gap-4 text-sm font-medium text-gray-500">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold">2</span>
                  Model answers are provided instantly for comparative learning.
                </li>
                <li className="flex gap-4 text-sm font-medium text-gray-500">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold">3</span>
                  Earned points contribute to your weekly and global rank.
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] p-8 text-white shadow-xl">
              <Award className="mb-4 text-white/50" size={32} />
              <h3 className="font-black uppercase text-xs tracking-widest mb-2">Pro Tip</h3>
              <p className="text-sm font-medium text-indigo-100 opacity-80">
                Correct answers on high-difficulty questions grant a higher score multiplier!
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AttemptQuestionPage;
