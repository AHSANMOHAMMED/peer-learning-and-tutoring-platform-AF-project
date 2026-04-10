import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Users, 
  TrendingUp, 
  Sparkles,
  Calendar,
  LayoutDashboard,
  Zap,
  ArrowRight,
  GraduationCap,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import Layout from '../components/Layout';
import { useAuth } from '../controllers/useAuth';
import { useTutors } from '../controllers/useTutors';
import { useBookings } from '../controllers/useBookings';
import { cn } from '../utils/cn';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tutors, fetchTutors } = useTutors();
  const { bookings, fetchBookings } = useBookings();
  
  useEffect(() => {
    fetchTutors();
    fetchBookings();
  }, [fetchTutors, fetchBookings]);

  const upcomingSessions = bookings
    .filter(b => b.status === 'confirmed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

  const recommendedTutors = tutors
    .filter(t => t.verificationStatus === 'approved')
    .slice(0, 3);

  const masteryData = [
    { name: 'Week 1', progress: 45 },
    { name: 'Week 2', progress: 52 },
    { name: 'Week 3', progress: 48 },
    { name: 'Week 4', progress: 61 },
    { name: 'Week 5', progress: 75 },
    { name: 'Week 6', progress: 82 },
  ];

  return (
    <Layout userRole="student">
      <div className="min-h-screen space-y-8 p-4 md:p-8 bg-gray-50/50 dark:bg-gray-950/50">
        {/* Immersive Welcome Hero */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 p-8 md:p-12 text-white shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                  <Sparkles className="text-yellow-300" size={24} />
                </div>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-indigo-100">Student Portal • Sri Lanka Edition</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                {user?.profile.firstName || 'Student'}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-white">Mastery Awaits</span>
              </h1>
              <p className="text-indigo-100/80 text-lg max-w-lg">
                Your journey to A/L success is <span className="font-bold text-white">65% complete</span>. You have {bookings.filter(b => b.status === 'confirmed').length} confirmed sessions scheduled.
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-5xl font-bold flex items-baseline gap-1">
                {user?.gamification.points || 0} <span className="text-lg opacity-60 font-medium">Points</span>
              </span>
              <p className="text-indigo-200 font-semibold flex items-center gap-2">
                <Zap size={16} /> {user?.gamification.streak || 0} Day Streak
              </p>
            </div>
          </div>
        </div>

        {/* Rapid Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
           {[
             { title: 'Find Tutors', icon: Users, color: 'text-blue-500', path: '/tutors' },
             { title: 'AI Assistant', icon: Sparkles, color: 'text-orange-500', path: '/ai-homework' },
             { title: 'Gamification', icon: Trophy, color: 'text-yellow-500', path: '/gamification' },
             { title: 'Marketplace', icon: Zap, color: 'text-indigo-500', path: '/marketplace' },
             { title: 'Materials', icon: BookOpen, color: 'text-purple-500', path: '/materials' },
             { title: 'Settings', icon: LayoutDashboard, color: 'text-gray-500', path: '/settings' }
           ].map((action, i) => (
             <button 
               key={i} 
               onClick={() => navigate(action.path)}
               className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl hover:bg-indigo-600 hover:text-white transition-all group shadow-sm flex flex-col items-center gap-3 text-center active:scale-95"
             >
                <div className={cn("p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 transition-colors group-hover:bg-white/20", action.color)}>
                   <action.icon size={24} />
                </div>
                <span className="font-bold tracking-tight text-sm">{action.title}</span>
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Progress Visualizer */}
          <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Academic Momentum</h3>
                <p className="text-gray-500 text-sm">Combined Maths & Physics progress tracking</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex flex-col items-end">
                <TrendingUp className="text-indigo-500 mb-1" size={20} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest tracking-tighter">Avg Score: 78%</span>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={masteryData}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="progress" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorProgress)" 
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming sessions panel */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold tracking-tight">Today's Hub</h3>
              <Calendar className="text-indigo-400" />
            </div>
            <div className="space-y-4">
              {upcomingSessions.length > 0 ? upcomingSessions.map((session, i) => (
                <div 
                  key={session._id} 
                  onClick={() => navigate(`/session/${session._id}`)}
                  className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 group cursor-pointer hover:border-indigo-500 transition-all active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Scheduled Session</span>
                    <Clock size={16} className="text-gray-400" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2 uppercase text-xs">{session.subject}</h4>
                  <p className="text-xs text-gray-500 mb-4">{(session.tutorId as any)?.userId?.username || 'Verified Mentor'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{session.startTime}</span>
                    <button className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all bg-indigo-600 text-white group-hover:scale-110"
                    )}>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 px-6 border border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                   <AlertCircle className="mx-auto text-gray-300 mb-3" size={32} />
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Sessions Today</p>
                </div>
              )}
              <button 
                onClick={() => navigate('/bookings')}
                className="w-full py-4 text-gray-500 dark:text-gray-400 font-bold text-sm bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
              >
                View Full Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Tutor Grid */}
        <div>
          <div className="flex items-center justify-between mb-6 px-4">
            <h3 className="text-3xl font-bold tracking-tight flex items-center gap-3">
               <GraduationCap className="text-indigo-500" size={32} />
                Featured Mentors
            </h3>
            <Link to="/tutors" className="text-indigo-600 font-bold hover:underline flex items-center gap-1 text-sm uppercase tracking-widest">
              Explore All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedTutors.length > 0 ? recommendedTutors.map((tutor) => (
              <div key={tutor._id} className="group bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-indigo-500/20">
                    {(tutor.userId as any)?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-gray-900 dark:text-white uppercase tracking-tighter">{(tutor.userId as any)?.username || 'Mentor'}</h4>
                    <p className="text-xs text-indigo-500 font-black uppercase tracking-widest leading-none mt-1">{tutor.subjects[0]}</p>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-gray-400">Alma Mater</span>
                    <span className="text-gray-700 dark:text-gray-300">{tutor.education[0]?.institution || 'National University'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-gray-400">Experience</span>
                    <span className="flex items-center gap-1 text-indigo-500">
                      <Zap size={14} fill="currentColor" /> {tutor.experience} Years
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/tutors')}
                  className="w-full py-4 bg-gray-50 dark:bg-gray-800 group-hover:bg-indigo-600 group-hover:text-white text-gray-700 dark:text-gray-200 font-bold rounded-2xl transition-all border border-gray-100 dark:border-gray-700 uppercase text-[10px] tracking-widest shadow-sm"
                >
                  Secure Mentorship
                </button>
              </div>
            )) : (
               [1,2,3].map(i => (
                 <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-[2.5rem] animate-pulse" />
               ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
