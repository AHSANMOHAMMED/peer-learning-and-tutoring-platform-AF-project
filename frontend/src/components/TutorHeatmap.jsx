import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { Clock, Signal, Binary, Activity, Layers } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TutorHeatmap = ({ data }) => {
  return (
    <div className="p-10 md:p-12 bg-white/5 backdrop-blur-[120px] rounded-[4rem] border-2 border-white/5 shadow-5xl relative overflow-hidden group text-left">
      {/* Cinematic Overlays */}
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-[2000ms]">
         <Clock size={220} />
      </div>
      <div className="absolute -bottom-10 -left-10 p-16 opacity-5 pointer-events-none"><Layers size={180} /></div>

      <div className="relative z-10 space-y-12">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
            <div className="text-left space-y-4">
               <h3 className="text-3xl font-medium uppercase tracking-tighter flex items-center gap-6 px-0 text-white leading-none">
                  <Activity className="text-indigo-500 shadow-glow" size={36} /> Temporal Mastery Matrix
               </h3>
               <p className="text-base font-medium text-gray-800 uppercase tracking-normal leading-none ml-[0.5em]">Synchronizing availability nodes across 168 temporal cycles</p>
            </div>
            <div className="flex items-center gap-6 px-10 py-4 bg-black/60 rounded-full border-2 border-white/5 shadow-inner backdrop-blur-3xl shrink-0">
               <Signal size={18} className="text-emerald-500" />
               <span className="text-sm font-medium text-gray-800 uppercase tracking-normal leading-none pt-0.5">High-Fidelity Sync</span>
            </div>
         </div>

         <div className="flex flex-col gap-4 overflow-x-auto pb-6 no-scrollbar custom-scrollbar overscroll-contain">
            {DAYS.map((day, dayIndex) => (
               <div key={day} className="flex items-center gap-6">
                  <div className="w-16 h-10 flex items-center justify-end pr-4 border-r-2 border-white/5">
                     <span className="text-sm font-medium text-gray-800 uppercase tracking-widest">{day}</span>
                  </div>
                  <div className="flex gap-2">
                     {Array.from({ length: 24 }).map((_, hourIndex) => {
                        const index = dayIndex * 24 + hourIndex;
                        const value = data[index] || 0;

                        return (
                           <motion.div
                              key={hourIndex}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: (dayIndex * 24 + hourIndex) * 0.002 }}
                              whileHover={{ scale: 1.25, zIndex: 10, y: -2 }}
                              className={cn(
                                 "w-6 h-6 rounded-[8px] transition-all duration-500 cursor-pointer shadow-5xl border-2",
                                 value === 0 && "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10",
                                 value === 1 && "bg-indigo-500/20 border-indigo-500/30",
                                 value === 2 && "bg-indigo-500/50 border-white/20 shadow-glow shadow-indigo-500/10",
                                 value === 3 && "bg-white border-white shadow-glow shadow-white/40"
                              )}
                              title={`${day} ${hourIndex}:00 - node status: ${value === 3 ? 'critical_sync' : value > 0 ? 'active' : 'void'}`} 
                           />
                        );
                     })}
                  </div>
               </div>
            ))}
         </div>

         <div className="pt-8 border-t-2 border-white/5 flex flex-wrap items-center justify-between gap-10">
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 bg-black/40 border-2 border-white/5 rounded-full" />
                  <span className="text-xs font-medium text-gray-800 uppercase tracking-normal">Void</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 bg-indigo-500/50 border-2 border-white/10 rounded-full" />
                  <span className="text-xs font-medium text-gray-800 uppercase tracking-normal">Sync Active</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 bg-white shadow-glow rounded-full" />
                  <span className="text-xs font-medium text-gray-800 uppercase tracking-normal">Peak Node</span>
               </div>
            </div>

            <div className="px-8 py-4 bg-indigo-600/10 border-2 border-indigo-500/20 rounded-full flex items-center gap-4 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-1000 cursor-default">
               <Binary size={16} />
               <span className="text-sm font-medium uppercase tracking-normal">Temporal Engine: Online</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TutorHeatmap;