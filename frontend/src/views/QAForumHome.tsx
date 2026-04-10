import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Target, 
  History, 
  ChevronRight, 
  Award, 
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

// Using a mock auth hook or props for now to match the existing views
const useAuthMock = () => ({
  isAuthenticated: true,
  user: { role: 'student', name: 'Student' }
});

const QAForumHome: React.FC = () => {
  const { isAuthenticated, user } = useAuthMock();
  const isStudent = user?.role === 'student';

  return (
    <Layout userRole={user?.role as any || 'student'}>
      <div className="min-h-screen p-4 md:p-8 space-y-8 bg-gray-50/50 dark:bg-gray-950/50">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-10 md:p-14 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-100 text-xs font-bold uppercase tracking-widest">
                <Sparkles size={14} />
                Student Q&A Forum
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
                Practice, Learn, & <span className="text-blue-200">Earn.</span>
              </h1>
              <p className="text-blue-100 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                Enter a specialized learning space for Sri Lankan students. Master your subjects with real-time feedback and earn recognition from top tutors.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/qa/medium"
                  className="px-8 py-5 bg-white text-blue-600 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-3 hover:scale-105 active:scale-95"
                >
                  Enter Forum <ChevronRight size={18} />
                </Link>
                {isAuthenticated && isStudent && (
                  <Link
                    to="/qa/history"
                    className="px-8 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all hover:bg-white/20 flex items-center justify-center gap-3"
                  >
                    <History size={18} /> Practice History
                  </Link>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-8">
                <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20">
                  <BookOpen className="text-blue-200 mb-4" size={32} />
                  <h3 className="font-bold text-lg mb-2">Grades 6–11</h3>
                  <p className="text-blue-100 text-sm opacity-80">Tailored learning paths for your grade.</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20">
                  <Award className="text-blue-200 mb-4" size={32} />
                  <h3 className="font-bold text-lg mb-2">Rewards</h3>
                  <p className="text-blue-100 text-sm opacity-80">Earn points and badges for correct answers.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20">
                  <HelpCircle className="text-blue-200 mb-4" size={32} />
                  <h3 className="font-bold text-lg mb-2">Expert Tutoring</h3>
                  <p className="text-blue-100 text-sm opacity-80">Get help from verified subject matter experts.</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20">
                  <Target className="text-blue-200 mb-4" size={32} />
                  <h3 className="font-bold text-lg mb-2">Instant Feedback</h3>
                  <p className="text-blue-100 text-sm opacity-80">Localized explanations in your native medium.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Grade Specific",
              desc: "Only content relevant to your grade level is shown, keeping you focused on your syllabus.",
              icon: BookOpen,
              color: "blue"
            },
            {
              title: "Visual Subject Cards",
              desc: "Quickly find topics using our intuitive colorful card layout for all standard subjects.",
              icon: Target,
              color: "indigo"
            },
            {
              title: "Professional Review",
              desc: "Every answer is verified by tutors to ensure you learn the right concepts for your exams.",
              icon: Award,
              color: "purple"
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="p-10 rounded-[3rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none"
            >
              <div className={`w-14 h-14 rounded-2xl bg-${item.color}-100 dark:bg-${item.color}-900/30 flex items-center justify-center text-${item.color}-600 dark:text-${item.color}-400 mb-6`}>
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4 dark:text-white uppercase tracking-wider text-xs">{item.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default QAForumHome;
