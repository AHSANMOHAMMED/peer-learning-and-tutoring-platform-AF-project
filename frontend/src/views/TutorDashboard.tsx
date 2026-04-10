import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Star,
  Clock,
  ArrowRight,
  MoreVertical,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  PlusCircle
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
import StatCard from '../components/StatCard';
import { useAuth } from '../controllers/useAuth';
import { useBookings } from '../controllers/useBookings';
import { useMaterials } from '../controllers/useMaterials';
import { cn } from '../utils/cn';

const TutorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { bookings, fetchBookings } = useBookings();
  const { materials, fetchMaterials } = useMaterials();

  useEffect(() => {
    fetchBookings();
    fetchMaterials();
  }, [fetchBookings, fetchMaterials]);

  // Compute real recent earnings matrix (Last 7 Days approximation based on bookings)
  const earningData = React.useMemo(() => {
    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const earningsByDay = Array(7).fill(0).map((_, i) => ({ name: daysMap[i], income: 0 }));
    
    bookings.forEach(b => {
      if (b.status === 'completed' || b.paymentStatus === 'paid') {
        const d = new Date(b.date);
        earningsByDay[d.getDay()].income += (b.price || 0);
      }
    });
    return earningsByDay;
  }, [bookings]);

  const totalEarnings = bookings.reduce((sum, b) => sum + (b.paymentStatus === 'paid' ? (b.price || 0) : 0), 0);
  const totalHours = bookings.length; // Approximate 1 hr per booking
  const uniqueStudents = new Set(bookings.map(b => (b.studentId as any)?._id)).size;
  const userMaterials = materials.filter(m => (m.uploaderId as any)?._id === user?._id);

  return (
    <Layout userRole="tutor">
      <div className="min-h-screen space-y-8 p-4 md:p-8 bg-gray-50/50 dark:bg-gray-950/50">
        {/* Professional Welcome Hero */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-600 to-emerald-700 p-8 md:p-12 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                  <Briefcase className="text-teal-200" size={24} />
                </div>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-teal-100">Educator Command Center</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2">
                Manage, Mentor, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-white">Monetize</span>
              </h1>
              <p className="text-teal-100/80 text-lg max-w-lg">
                Your tutoring career is flourishing. You have <span className="font-bold text-white">{bookings.filter(b => b.status === 'confirmed').length || 4} sessions</span> confirmed and Rs. 12,400 pending payout.
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-5xl font-black flex items-baseline gap-1">
                Rs. {(totalEarnings / 1000).toFixed(1)}k <span className="text-lg opacity-60 font-medium">Earnings</span>
              </span>
              <p className="text-teal-200 font-bold flex items-center gap-2">
                <Star size={16} fill="currentColor" className="text-yellow-300" /> {user?.profile?.rating || '4.9'} Average Rating
              </p>
            </div>
          </div>
        </div>

        {/* Rapid Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { title: 'Tutor Workspace', icon: Briefcase, color: 'text-teal-500', path: '/tutor-workspace' },
             { title: 'Q&A Forum', icon: BookOpen, color: 'text-indigo-500', path: '/tutor/qa' },
             { title: 'Market Insights', icon: TrendingUp, color: 'text-emerald-500', path: '/marketplace' },
             { title: 'VR Classroom', icon: Sparkles, color: 'text-purple-500', path: '/vr-classroom' }
           ].map((action, i) => (
             <button 
               key={i} 
               onClick={() => (window.location.href = action.path)}
               className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl hover:bg-teal-600 hover:text-white transition-all group shadow-sm flex flex-col items-center gap-3 text-center active:scale-95"
             >
                <div className={cn("p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 transition-colors group-hover:bg-white/20", action.color)}>
                   <action.icon size={24} />
                </div>
                <span className="font-bold tracking-tight text-sm">{action.title}</span>
             </button>
           ))}
        </div>

        {/* Global Stats Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Active Students" value={uniqueStudents.toString()} icon={Users} color="secondary" />
          <StatCard title="Sessions Done" value={bookings.filter(b => b.status === 'completed').length.toString()} icon={CheckCircle2} color="primary" />
          <StatCard title="Hrs Taught" value={totalHours.toString()} icon={Clock} color="accent" />
          <StatCard title="Verification" value={user?.verificationStatus || 'Approved'} icon={TrendingUp} color="primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Revenue Analytics */}
          <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Earnings Intelligence</h3>
                <p className="text-gray-500 text-sm">Review your weekly tutoring revenue (LKR)</p>
              </div>
              <button className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:bg-teal-500 hover:text-white transition-all group/btn">
                <DollarSign className="text-teal-500 group-hover/btn:text-white mb-1" size={20} />
                <span className="text-xs font-black uppercase tracking-widest block">Withdraw LKR</span>
              </button>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#0d9488" 
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student Class Queue */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Active Classes</h3>
              <Users className="text-teal-400" />
            </div>
            <div className="space-y-4">
              {bookings.slice(-5).map((booking, i) => (
                <div key={i} className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700/50 hover:border-teal-500 transition-all flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-700 flex items-center justify-center font-bold text-gray-400">
                      {(booking.studentId as any)?.username?.[0] || 'S'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{(booking.studentId as any)?.username || 'Student'}</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-black">{booking.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-[10px] font-black uppercase tracking-widest hidden md:block", booking.status === 'confirmed' ? 'text-teal-500' : 'text-orange-500')}>
                      {booking.status}
                    </span>
                    <button className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-600 hover:bg-teal-500 hover:text-white transition-all text-gray-400">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="py-8 text-center text-gray-400 text-sm">No incoming bookings yet.</div>
              )}
              <button className="w-full py-4 text-teal-600 dark:text-teal-400 font-bold text-sm bg-teal-50 dark:bg-teal-900/20 rounded-2xl hover:bg-teal-100 transition-all">
                View All {bookings.length} Bookings
              </button>
            </div>
          </div>
        </div>

        {/* Global Material Management Hub */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h3 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                <BookOpen className="text-teal-500" size={32} />
                Teaching Inventory
              </h3>
              <p className="text-gray-500 mt-1 uppercase text-xs font-black tracking-widest">Share premium A/L knowledge</p>
            </div>
            <button className="px-8 py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/30 flex items-center gap-2">
              <PlusCircle size={20} />
              Upload New Resource
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userMaterials.slice(0, 4).map((material, i) => (
              <div key={i} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 hover:shadow-xl transition-all relative group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white dark:bg-gray-700 rounded-2xl shadow-sm">
                    {material.fileType?.includes('pdf') ? <BookOpen className="text-indigo-400" /> : <BookOpen className="text-teal-400" />}
                  </div>
                  <button className="text-gray-400 hover:text-teal-500 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">{material.title}</h4>
                <p className="text-xs text-gray-500 mb-6">{material.fileType?.toUpperCase() || 'DOCUMENT'} • {material.subject}</p>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span className={material.moderationStatus === 'approved' ? 'text-green-500' : 'text-orange-500'}>{material.moderationStatus}</span>
                  <div className="flex items-center gap-1 group-hover:text-teal-500 transition-colors">
                    Manage <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            ))}
            {userMaterials.length === 0 && (
               <div className="col-span-1 md:col-span-2 lg:col-span-4 py-12 text-center text-gray-400">
                  No materials uploaded yet. Click upload to build your inventory.
               </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TutorDashboard;
