import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

interface HeatmapProps {
  data: number[]; // 24 hours x 7 days = 168 cells
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TutorHeatmap: React.FC<HeatmapProps> = ({ data }) => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-xl font-bold mb-6">Availability Heatmap</h3>
      <div className="flex flex-col gap-2 overflow-x-auto pb-4">
        {DAYS.map((day, dayIndex) => (
          <div key={day} className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 w-8 text-right">{day}</span>
            <div className="flex gap-1">
              {Array.from({ length: 24 }).map((_, hourIndex) => {
                const index = dayIndex * 24 + hourIndex;
                const value = data[index] || 0;
                
                return (
                  <motion.div
                    key={hourIndex}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    className={cn(
                      "w-4 h-4 rounded-[3px] transition-colors cursor-pointer",
                      value === 0 && "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600",
                      value === 1 && "bg-secondary-light/30",
                      value === 2 && "bg-secondary-light/60",
                      value === 3 && "bg-secondary"
                    )}
                    title={`${day} ${hourIndex}:00 - ${value} slots available`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 justify-end text-xs font-bold text-gray-400 uppercase tracking-widest">
        <span>Less</span>
        <div className="w-3 h-3 rounded-[2px] bg-gray-100 dark:bg-gray-700" />
        <div className="w-3 h-3 rounded-[2px] bg-secondary-light/30" />
        <div className="w-3 h-3 rounded-[2px] bg-secondary-light/60" />
        <div className="w-3 h-3 rounded-[2px] bg-secondary" />
        <span>More</span>
      </div>
    </div>
  );
};

export default TutorHeatmap;
