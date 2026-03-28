import React from 'react';

/**
 * StatCard - Reusable statistics card with icon and trend
 * 
 * MVC Pattern: View (Pure UI Component)
 */
const StatCard = ({ title, value, icon: Icon, trend, color = 'blue', highlight = false }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    slate: 'from-slate-600 to-slate-700',
  };

  const iconBgColors = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
        highlight ? 'ring-2 ring-red-500 ring-opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${highlight ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl ${iconBgColors[color]} flex items-center justify-center`}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
