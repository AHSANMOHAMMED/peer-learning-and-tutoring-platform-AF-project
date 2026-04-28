import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

/**
 * ActionPanel wraps a section that might contain a list of actions or quick links.
 */
export const ActionPanel = ({ 
  title, 
  actionLink, 
  actionText = 'View All', 
  children,
  className,
  delay = 0 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/30 border border-white flex flex-col relative overflow-hidden",
        className
      )}
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
        {actionLink && (
          <Link 
            to={actionLink} 
            className="group flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-4 py-2 rounded-xl"
          >
            {actionText} <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>
      
      <div className="flex-1">
        {children}
      </div>
    </motion.div>
  );
};

export default ActionPanel;
