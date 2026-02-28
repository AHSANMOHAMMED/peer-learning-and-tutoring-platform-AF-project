import React from 'react';
import { Link } from 'react-router-dom';

/**
 * QuickActionCard - Interactive card for quick navigation or actions
 * @param {string} title - Action title
 * @param {string} description - Action description
 * @param {string} icon - Icon emoji or SVG
 * @param {string} link - Navigation link (optional)
 * @param {function} onClick - Click handler (optional)
 * @param {string} color - Color theme
 */
const QuickActionCard = ({ title, description, icon, link, onClick, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  };

  const content = (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-full flex items-center justify-center text-xl font-bold`}>
          {icon}
        </div>
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );

  const className = "bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer";

  if (link) {
    return (
      <Link to={link} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className={className}>
      {content}
    </div>
  );
};

export default QuickActionCard;
