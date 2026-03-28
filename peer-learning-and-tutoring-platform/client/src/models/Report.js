export class Report {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.reporterId = data.reporterId || '';
    this.reporter = data.reporter || null;
    this.reportedId = data.reportedId || '';
    this.reportedUser = data.reportedUser || null;
    this.reportedType = data.reportedType || 'content'; // content, user, session
    this.reportedItemId = data.reportedItemId || '';
    this.reportedItem = data.reportedItem || null;
    this.reason = data.reason || '';
    this.description = data.description || '';
    this.priority = data.priority || 'medium'; // low, medium, high, urgent
    this.status = data.status || 'pending'; // pending, investigating, resolved, dismissed
    this.action = data.action || null; // warn, suspend, ban, delete_content, none
    this.actionTakenBy = data.actionTakenBy || null;
    this.actionNotes = data.actionNotes || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.resolvedAt = data.resolvedAt || null;
  }

  get isPending() {
    return this.status === 'pending';
  }

  get isResolved() {
    return this.status === 'resolved';
  }

  get isDismissed() {
    return this.status === 'dismissed';
  }

  get isUrgent() {
    return this.priority === 'urgent';
  }

  get reportedItemDisplay() {
    const typeMap = {
      content: 'Study Material',
      user: 'User Profile',
      session: 'Session',
      message: 'Message',
      review: 'Review'
    };
    return typeMap[this.reportedType] || this.reportedType;
  }

  get statusColor() {
    const colorMap = {
      pending: 'yellow',
      investigating: 'blue',
      resolved: 'green',
      dismissed: 'gray'
    };
    return colorMap[this.status] || 'gray';
  }

  get priorityColor() {
    const colorMap = {
      low: 'blue',
      medium: 'yellow',
      high: 'orange',
      urgent: 'red'
    };
    return colorMap[this.priority] || 'gray';
  }

  get formattedDate() {
    return new Date(this.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  dismiss(notes = '') {
    this.status = 'dismissed';
    this.action = 'none';
    this.actionNotes = notes;
    this.updatedAt = new Date();
    this.resolvedAt = new Date();
  }

  resolve(action, notes = '', adminId = '') {
    this.status = 'resolved';
    this.action = action;
    this.actionNotes = notes;
    this.actionTakenBy = adminId;
    this.updatedAt = new Date();
    this.resolvedAt = new Date();
  }

  startInvestigation() {
    this.status = 'investigating';
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      reporterId: this.reporterId,
      reporter: this.reporter,
      reportedId: this.reportedId,
      reportedUser: this.reportedUser,
      reportedType: this.reportedType,
      reportedItemId: this.reportedItemId,
      reportedItem: this.reportedItem,
      reason: this.reason,
      description: this.description,
      priority: this.priority,
      status: this.status,
      action: this.action,
      actionTakenBy: this.actionTakenBy,
      actionNotes: this.actionNotes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      resolvedAt: this.resolvedAt
    };
  }

  static fromAPI(data) {
    return new Report(data);
  }
}
