import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * MetricCard displays a key metric or statistic.
 */
const MetricCard = ({ 
  label, 
  value, 
  subtext, 
  icon, 
  color = 'indigo', 
  className 
}) => {
  // Use semantic color mapping if needed, or rely on tailwind classes.
  // Since we might use arbitrary colors like 'indigo', 'emerald', etc.,
  // we can use standard tailwind arbitrary mapping or safelisted classes.
  // For safety with Tailwind JIT, it's often better to pass actual classes,
  // but we can map colors to pre-defined classes if needed.

  const colorMap = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-500', border: 'border-indigo-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-500', border: 'border-emerald-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-500', border: 'border-orange-400' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-500', border: 'border-rose-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-500', border: 'border-amber-500' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-500', border: 'border-violet-500' },
  };

  const currentColors = colorMap[color] || colorMap.indigo;

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn(
        "bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-2xl shadow-slate-200/50 min-w-[180px] border-b-4 border-l border-t border-r border-slate-50 relative overflow-hidden",
        currentColors.border,
        className
      )}
    >
      <div className="flex justify-between items-center mb-3 relative z-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
          {label}
        </p>
        {icon && (
          <div className={cn("p-2 rounded-xl", currentColors.bg, currentColors.text)}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between relative z-10">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
          {value}
        </h3>
        {subtext && (
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {subtext}
          </span>
        )}
      </div>
      {icon && (
        <div className={cn("absolute -right-2 -bottom-2 opacity-[0.03] text-slate-900")}>
          {icon}
        </div>
      )}
    </motion.div>
  );
};

export default MetricCard;
