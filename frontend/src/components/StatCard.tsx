import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  color?: 'primary' | 'secondary' | 'accent';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendPositive, 
  color = 'primary' 
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-shadow hover:shadow-md"
    >
      <div className={cn(
        "p-3 rounded-xl bg-opacity-10",
        color === 'primary' && "bg-blue-500 text-blue-500",
        color === 'secondary' && "bg-teal-500 text-teal-500",
        color === 'accent' && "bg-red-500 text-red-500"
      )}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
          {trend && (
            <span className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              trendPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
