import React from 'react';

/**
 * ActivityFeed - Displays recent activity timeline
 * @param {Array} activities - Array of activity objects with {type, title, description, time}
 */
const ActivityFeed = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    const icons = {
      session: '📚',
      booking: '📅',
      review: '⭐',
      material: '📄',
      user: '👤',
      payment: '💳',
      approval: '✅',
      warning: '⚠️'
    };
    return icons[type] || '📌';
  };

  const getActivityColor = (type) => {
    const colors = {
      session: 'blue',
      booking: 'green',
      review: 'yellow',
      material: 'purple',
      user: 'indigo',
      payment: 'pink',
      approval: 'green',
      warning: 'red'
    };
    return colors[type] || 'gray';
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const color = getActivityColor(activity.type);
          return (
            <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <div className={`flex-shrink-0 w-10 h-10 bg-${color}-100 rounded-full flex items-center justify-center text-lg`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;
