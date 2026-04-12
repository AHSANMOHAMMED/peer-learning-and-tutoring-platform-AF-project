import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, BookOpen, CheckCircle2, Lock, ArrowRight, Clock, Box } from 'lucide-react';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';
import { timetableApi } from '../services/api';

const StudyPlanner = () => {
  const [activeWeek, setActiveWeek] = useState(1);
  const [curriculum, setCurriculum] = useState([]);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await timetableApi.getSchedule();
        if (res.success && res.data.length > 0) {
          const mapped = res.data.map((slot, index) => ({
             week: index + 1,
             title: slot.title || 'Tutoring Session',
             status: new Date(slot.startTime) < new Date() ? 'completed' : 'active',
             topics: [slot.subject || 'General Study']
          }));
          setCurriculum(mapped);
        } else {
          setCurriculum([]);
        }
      } catch (err) {
        setCurriculum([]);
      }
    };
    fetchTimetable();
  }, []);

  return (
    <Layout userRole="student">
      <div className="max-w-[1400px] mx-auto w-full font-sans">
        
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Study Planner</h1>
           <p className="text-slate-500 font-medium text-sm mt-1">Track your progress and access upcoming syllabus milestones.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
          
          {/* Timeline Sidebar */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Curriculum Roadmap</h3>
             
             <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {curriculum.map((week) => (
                   <button
                     key={week.week}
                     onClick={() => week.status !== 'locked' && setActiveWeek(week.week)}
                     className={cn(
                       "relative w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all z-10",
                       activeWeek === week.week ? "bg-slate-900 border-slate-900 shadow-soft" : "bg-white border-slate-100 hover:border-[#00a8cc]",
                       week.status === 'locked' && "opacity-50 cursor-not-allowed bg-slate-50"
                     )}
                   >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-white shrink-0",
                        activeWeek === week.week ? "bg-white text-slate-900" : week.status === 'completed' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                      )}>
                         {week.status === 'locked' ? <Lock size={14}/> : week.status === 'completed' ? <CheckCircle2 size={16}/> : week.week}
                      </div>
                      <div>
                         <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-0.5", activeWeek === week.week ? "text-slate-400" : "text-slate-400")}>
                            {week.status === 'completed' ? 'Completed' : week.status === 'active' ? 'Current Phase' : 'Locked'}
                         </p>
                         <h4 className={cn("font-bold text-sm", activeWeek === week.week ? "text-white" : "text-slate-800")}>{week.title}</h4>
                      </div>
                   </button>
                ))}
             </div>
          </div>

          {/* Details Content Panel */}
          <div className="lg:col-span-8">
             {curriculum.length > 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-100 pb-8">
                      <div>
                         <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#00a8cc] rounded-lg text-xs font-bold uppercase tracking-widest mb-4">
                            Week {activeWeek} Module
                         </span>
                         <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            {curriculum[activeWeek - 1]?.title}
                         </h2>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 font-bold text-sm shrink-0">
                         <Clock size={16} /> Est. 12 Hours
                      </div>
                   </div>

                   <h4 className="text-lg font-bold text-slate-800 mb-6">Learning Objectives</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                      {curriculum[activeWeek - 1]?.topics.map((topic, i) => (
                         <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-4 hover:border-[#00a8cc] hover:bg-white transition-colors cursor-default">
                            <div className="bg-white p-3 rounded-xl text-[#00a8cc] shadow-sm"><BookOpen size={20} /></div>
                            <div>
                               <h5 className="font-bold text-slate-800 mb-1 leading-tight">{topic}</h5>
                               <p className="text-sm font-medium text-slate-500">Core conceptual syllabus requirement.</p>
                            </div>
                         </div>
                      ))}
                   </div>

                   <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-soft relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-right">
                         <Target size={120} />
                      </div>
                      <div className="relative z-10">
                         <h4 className="text-xl font-bold mb-2">Ready to begin this module?</h4>
                         <p className="text-slate-400 font-medium text-sm">Launch your active learning session to record progress.</p>
                      </div>
                      <button className="whitespace-nowrap px-8 py-4 bg-[#00a8cc] hover:bg-[#008ba8] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shrink-0 z-10 w-full md:w-auto">
                         Start Session <ArrowRight size={18} />
                      </button>
                   </div>
                </div>
             ) : (
                <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                   <Box size={40} className="text-slate-300 mb-4" />
                   <h3 className="text-lg font-bold text-slate-700">No schedule active</h3>
                   <p className="text-slate-500 font-medium">Book a tutor or enroll in a syllabus to generate your learning path.</p>
                </div>
             )}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default StudyPlanner;