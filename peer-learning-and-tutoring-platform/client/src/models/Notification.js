export class Notification {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.userId = data.userId || '';
    this.type = data.type || 'system'; // booking, message, system, reminder
    this.title = data.title || '';
    this.message = data.message || '';
    this.data = data.data || {};
    this.isRead = data.isRead || false;
    this.readAt = data.readAt ? new Date(data.readAt) : null;
    this.channels = {
      inApp: data.channels?.inApp !== false,
      email: data.channels?.email || false,
      sms: data.channels?.sms || false,
      push: data.channels?.push || false
    };
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  }

  get icon() {
    const icons = {
      booking: '📅',
      message: '💬',
      system: '🔔',
      reminder: '⏰',
      payment: '💳',
      review: '⭐',
      session: '🎥'
    };
    return icons[this.type] || '🔔';
  }

  get color() {
    const colors = {
      booking: 'blue',
      message: 'green',
      system: 'gray',
      reminder: 'yellow',
      payment: 'purple',
      review: 'orange',
      session: 'red'
    };
    return colors[this.type] || 'gray';
  }

  get formattedTime() {
    const now = new Date();
    const diff = now - this.createdAt;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return this.createdAt.toLocaleDateString();
  }

  get isRecent() {
    const oneDay = 24 * 60 * 60 * 1000;
    return (new Date() - this.createdAt) < oneDay;
  }

  markAsRead() {
    this.isRead = true;
    this.readAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      title: this.title,
      message: this.message,
      data: this.data,
      isRead: this.isRead,
      readAt: this.readAt,
      channels: this.channels,
      createdAt: this.createdAt
    };
  }

  static fromAPI(data) {
    return new Notification(data);
  }

  static groupByDate(notifications) {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const oneWeekAgo = Date.now() - 7 * 86400000;

    notifications.forEach(notification => {
      const date = notification.createdAt.toDateString();
      
      if (date === today) {
        groups.today.push(notification);
      } else if (date === yesterday) {
        groups.yesterday.push(notification);
      } else if (notification.createdAt.getTime() > oneWeekAgo) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  }
}
