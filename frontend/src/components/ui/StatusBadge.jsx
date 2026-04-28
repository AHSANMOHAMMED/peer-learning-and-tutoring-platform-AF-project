import React from 'react';
import { cn } from '../../utils/cn';

/**
 * StatusBadge displays a status indicator (e.g. Active, Pending, Error)
 */
const StatusBadge = ({ 
  status,
  variant = 'default', // 'default', 'success', 'warning', 'danger', 'info', 'neutral'
  className 
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-600 border-slate-200',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    warning: 'bg-amber-50 text-amber-600 border-amber-200',
    danger: 'bg-rose-50 text-rose-600 border-rose-200',
    info: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    neutral: 'bg-slate-50 text-slate-500 border-slate-200',
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider inline-block border",
      variants[variant] || variants.default,
      className
    )}>
      {status}
    </span>
  );
};

export default StatusBadge;
