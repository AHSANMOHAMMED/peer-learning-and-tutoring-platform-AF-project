import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronRight, CheckCircle2, Clock, Flame, Percent, Sparkles, BookOpen, Users } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

import Layout from '../components/Layout';
import { useAuth } from '../controllers/useAuth';
import { useTutors } from '../controllers/useTutors';
import { useBookings } from '../controllers/useBookings';
import api from '../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fetchTutors } = useTutors();
  const { bookings, fetchBookings } = useBookings();
  const [myGroups, setMyGroups] = useState([]);

  useEffect(() => {
    fetchTutors();
    fetchBookings();
    fetchMyGroups();
  }, [fetchTutors, fetchBookings]);

  const fetchMyGroups = async () => {
    try {
      const res = await api.get('/groups/my-rooms');
      if (res.data.success) {
        setMyGroups(res.data.data?.groupRooms || res.data.data || []);
      }
    } catch (err) {
      console.error('Groups fetch error:', err);
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'scheduled').slice(0, 3);
  
  const gamification = user?.gamification || {};
  const stats = {
    streakDays: gamification.streak || 0,
    lessonDone: gamification.level || 0,
    studyTime: user?.totalLearningHours ? `${Math.floor(user.totalLearningHours)}h ${Math.round((user.totalLearningHours % 1) * 60)}m` : "0h 0m",
    successRate: gamification.points ? Math.min(100, Math.floor(gamification.points / 10)) + "%" : "0%"
  };

  const performanceData = [
    { name: 'Mastery', val: 65, fill: '#e6d5c3' },
    { name: 'Progress', val: 40, fill: '#e6d5c3' },
    { name: 'Growths', val: 30, fill: '#e6d5c3' },
    { name: 'Efficiency', val: 85, fill: '#2b2d42' },
    { name: 'Learning', val: 50, fill: '#e6d5c3' },
    { name: 'Milestone', val: 45, fill: '#e6d5c3' },
  ];

  const gaugeData = [
    { name: 'Done', value: gamification.points || 0 },
    { name: 'Remain', value: Math.max(100 - (gamification.points || 0), 5) }
  ];

  return (
    <Layout userRole="student">
      <div className="max-w-[1400px] mx-auto w-full font-sans">
        
        {/* Header Region */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
           <div>
              <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-tight mb-2">
                Welcome {user?.profile?.firstName || user?.username || 'Student'}!
              </h1>
              <p className="text-slate-500 text-[15px]">
                Start your next step toward success through learning.
              </p>
           </div>
           
           <div className="flex flex-wrap items-center gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-soft min-w-[140px]">
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-semibold text-slate-500">Streak Days</p>
                    <div className="p-1 bg-orange-50 text-orange-500 rounded-full"><Flame size={12} /></div>
                 </div>
                 <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-black text-slate-800">{stats.streakDays}</h3>
                    <span className="text-[10px] text-slate-400">Details</span>
                 </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-soft min-w-[140px]">
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-semibold text-slate-500">Lesson Done</p>
                    <div className="p-1 bg-emerald-50 text-emerald-500 rounded-full"><CheckCircle2 size={12} /></div>
                 </div>
                 <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-black text-slate-800">{stats.lessonDone}</h3>
                    <span className="text-[10px] text-slate-400">Details</span>
                 </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-soft min-w-[140px]">
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-semibold text-slate-500">Study Time</p>
                    <div className="p-1 bg-blue-50 text-blue-500 rounded-full"><Clock size={12} /></div>
                 </div>
                 <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-black text-slate-800">{stats.studyTime}</h3>
                    <span className="text-[10px] text-slate-400">Details</span>
                 </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-soft min-w-[140px]">
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-semibold text-slate-500">Success Rate</p>
                    <div className="p-1 bg-purple-50 text-purple-500 rounded-full"><Percent size={12} /></div>
                 </div>
                 <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-black text-slate-800">{stats.successRate}</h3>
                    <span className="text-[10px] text-slate-400">Details</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Charts Region */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
           
           <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-soft">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-bold text-slate-800">Performance Overview</h2>
                 <span className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">+15% from last week</span>
              </div>
              <div className="h-60">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData} maxBarSize={60}>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 13, fill: '#64748b', fontWeight: 500}} dy={15} />
                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)'}} />
                       {/* Background Bar */}
                       <Bar dataKey="val" fill="#f1f5f9" radius={[12, 12, 12, 12]} barSize={50} />
                       {/* Foreground Bar mapped through data */}
                       <Bar dataKey="val" radius={[12, 12, 12, 12]} barSize={50}>
                         {performanceData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} />
                         ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white rounded-3xl p-8 shadow-soft flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-slate-800">Daily Study Progress</h2>
                 <span className="font-bold text-slate-400">...</span>
              </div>
              <div className="flex-1 relative flex items-center justify-center h-48">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={gaugeData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={80} outerRadius={120} paddingAngle={0} dataKey="value" stroke="none">
                          <Cell key="cell-0" fill="#a08b7d" />
                          <Cell key="cell-1" fill="#f1f5f9" />
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute bottom-4 text-center">
                    <h3 className="text-4xl font-black text-slate-800">
                       {Math.min(100, gamification.points || 0)}%
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">Today's your goals</p>
                 </div>
              </div>
           </div>

        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           <div className="bg-white rounded-3xl p-8 shadow-soft">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-slate-800">Upcoming Lessons</h2>
                 <span className="font-bold text-slate-400">...</span>
              </div>
              <div className="space-y-4">
                 {upcomingBookings.length > 0 ? upcomingBookings.map((b, i) => (
                   <div key={i} className="flex items-center gap-4 bg-[#fcfcfc] border border-slate-100 p-4 rounded-2xl hover:border-[#a08b7d] transition-colors cursor-pointer">
                      <div className="w-10 h-10 border-4 border-orange-500 border-r-transparent rounded-full opacity-80" />
                      <div className="flex-1">
                         <h4 className="text-sm font-bold text-slate-800">{b.subject}</h4>
                         <p className="text-[11px] text-slate-400 mt-0.5">30 min - {b.tutorId?.name || 'Tutor'}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#f1f5f9] flex items-center justify-center">
                         <ChevronRight size={16} className="text-slate-500" />
                      </div>
                   </div>
                 )) : (
                    <div className="p-6 text-center text-sm text-slate-400 border border-dashed rounded-2xl border-slate-200">
                       No upcoming lessons.
                    </div>
                 )}
                 <button onClick={() => navigate('/bookings')} className="w-full mt-2 bg-[#f8f9fa] py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-[#a08b7d] hover:text-white transition-colors">
                    View All Schedule
                 </button>
              </div>
           </div>

           <div className="bg-white rounded-3xl p-8 shadow-soft flex flex-col justify-between border-2 border-transparent hover:border-[#ffd1e8] transition-colors">
              <div>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Intelligent Insight</h2>
                    <span className="font-bold text-slate-400">...</span>
                 </div>
                 <div className="bg-[#fcfaf7] border border-[#f5e6d3] rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="p-2 bg-orange-500 text-white rounded-lg"><Sparkles size={18} /></div>
                       <h3 className="text-lg font-bold text-slate-800">Revise Science Basics</h3>
                    </div>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                       You struggled with atomic structures yesterday. A quick review session can help solidify the concepts before your next lesson.
                    </p>
                 </div>
              </div>
              <button onClick={() => navigate('/ai-homework')} className="w-full mt-6 bg-[#a08b7d] text-white font-bold py-3.5 rounded-xl hover:bg-[#8f7a6c] transition-colors">
                 Start Review Session
              </button>
           </div>

           <div className="bg-[#fcfaf7] border border-[#f5e6d3] rounded-3xl p-8 shadow-soft flex flex-col justify-between">
              <div>
                 <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                       <Sparkles size={20} className="text-[#a08b7d]" />
                       <h2 className="text-xl font-bold text-slate-800">Science Foundation</h2>
                    </div>
                 </div>
                 <div className="flex justify-between items-center text-sm mb-4">
                    <div className="text-center"><div className="font-bold text-orange-500 flex items-center gap-1 justify-center"><div className="w-2 h-2 rounded-full bg-orange-500"/> Mastery</div><h3 className="text-xl font-black text-slate-800">52.428</h3></div>
                    <div className="text-center"><div className="font-bold text-emerald-500 flex items-center gap-1 justify-center"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Chapter</div><h3 className="text-xl font-black text-slate-800">20.980</h3></div>
                    <div className="text-center"><div className="font-bold text-purple-500 flex items-center gap-1 justify-center"><div className="w-2 h-2 rounded-full bg-purple-500"/> Lessons</div><h3 className="text-xl font-black text-slate-800">80.520</h3></div>
                 </div>
                 <div className="flex gap-1 mt-6">
                    {Array(20).fill(0).map((_, i) => (
                       <div key={i} className={`h-8 flex-1 rounded-sm ${i < 12 ? 'bg-[#e6d5c3]' : 'bg-[#f1f5f9]'} ${i===11 ? 'h-10 -mt-1 bg-[#a08b7d]' : ''}`} />
                    ))}
                 </div>
              </div>
              <div className="flex gap-4 mt-8">
                 <button className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm">Continue Lesson</button>
                 <button className="flex-1 bg-slate-100 text-slate-500 font-bold py-3 rounded-xl text-sm border border-transparent">~280 min left</button>
              </div>
           </div>

        </div>

        {/* My Learning Groups */}
        <div className="mt-6">
          <div className="bg-white rounded-3xl p-8 shadow-soft">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-[#00a8cc]" />
                <h2 className="text-xl font-bold text-slate-800">My Learning Groups</h2>
              </div>
              <button onClick={() => navigate('/groups')} className="text-sm font-bold text-[#00a8cc] hover:underline">View All</button>
            </div>
            {myGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myGroups.slice(0, 6).map((group, i) => (
                  <div key={group._id || i} className="p-4 bg-[#f8f9fc] rounded-2xl border border-slate-100 hover:border-[#00a8cc] transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00a8cc]/10 text-[#00a8cc] flex items-center justify-center font-bold text-sm">
                        {group.title?.[0] || 'G'}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{group.title || 'Study Group'}</h4>
                        <p className="text-xs text-slate-400 capitalize">{group.subject} &bull; {group.grade}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        <Users size={12} className="inline mr-1" />
                        {group.participants?.length || 0} members
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${group.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {group.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                <Users size={40} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">No groups joined yet. Browse available groups to connect with peers.</p>
                <button onClick={() => navigate('/groups')} className="mt-4 px-6 py-2.5 bg-[#00a8cc] text-white font-bold text-sm rounded-xl hover:bg-[#008ba8] transition-colors">Browse Groups</button>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );

};

export default StudentDashboard;