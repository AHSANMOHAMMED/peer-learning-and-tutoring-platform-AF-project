export class Message {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.conversationId = data.conversationId || '';
    this.senderId = data.senderId || '';
    this.receiverId = data.receiverId || '';
    this.senderName = data.senderName || '';
    this.senderAvatar = data.senderAvatar || '';
    this.content = data.content || '';
    this.attachments = data.attachments || [];
    this.isRead = data.isRead || false;
    this.readAt = data.readAt ? new Date(data.readAt) : null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  }

  get hasAttachments() {
    return this.attachments && this.attachments.length > 0;
  }

  get isImage() {
    return this.hasAttachments && this.attachments.some(att => att.type?.startsWith('image/'));
  }

  get isFile() {
    return this.hasAttachments && this.attachments.some(att => !att.type?.startsWith('image/'));
  }

  get formattedTime() {
    return this.createdAt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get formattedDate() {
    return this.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  get isToday() {
    const today = new Date();
    return this.createdAt.toDateString() === today.toDateString();
  }

  markAsRead() {
    this.isRead = true;
    this.readAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      conversationId: this.conversationId,
      senderId: this.senderId,
      receiverId: this.receiverId,
      senderName: this.senderName,
      senderAvatar: this.senderAvatar,
      content: this.content,
      attachments: this.attachments,
      isRead: this.isRead,
      readAt: this.readAt,
      createdAt: this.createdAt
    };
  }

  static fromAPI(data) {
    return new Message(data);
  }

  static groupByDate(messages) {
    const groups = {};
    messages.forEach(message => {
      const dateKey = message.createdAt.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    return groups;
  }
}

export class Conversation {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.participants = data.participants || [];
    this.participantNames = data.participantNames || [];
    this.participantAvatars = data.participantAvatars || [];
    this.type = data.type || 'direct'; // direct, booking_related
    this.bookingId = data.bookingId || null;
    this.lastMessage = data.lastMessage || null;
    this.unreadCount = data.unreadCount || 0;
    this.isOnline = data.isOnline || false;
    this.typingUsers = data.typingUsers || [];
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  get displayName() {
    if (this.participantNames && this.participantNames.length > 0) {
      return this.participantNames.join(', ');
    }
    return 'Unknown';
  }

  get otherParticipantName() {
    // For direct conversations, return the name of the other person
    return this.participantNames && this.participantNames.length > 0 
      ? this.participantNames[0] 
      : 'Unknown';
  }

  get hasUnreadMessages() {
    return this.unreadCount > 0;
  }

  get isTyping() {
    return this.typingUsers && this.typingUsers.length > 0;
  }

  get lastMessagePreview() {
    if (!this.lastMessage) return 'No messages yet';
    if (this.lastMessage.content) {
      return this.lastMessage.content.length > 50 
        ? this.lastMessage.content.substring(0, 50) + '...' 
        : this.lastMessage.content;
    }
    if (this.lastMessage.attachments && this.lastMessage.attachments.length > 0) {
      return '📎 Attachment';
    }
    return 'New message';
  }

  get lastMessageTime() {
    if (!this.lastMessage || !this.lastMessage.createdAt) return '';
    const date = new Date(this.lastMessage.createdAt);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get isRelatedToBooking() {
    return this.type === 'booking_related' && this.bookingId;
  }

  toJSON() {
    return {
      id: this.id,
      participants: this.participants,
      participantNames: this.participantNames,
      participantAvatars: this.participantAvatars,
      type: this.type,
      bookingId: this.bookingId,
      lastMessage: this.lastMessage,
      unreadCount: this.unreadCount,
      isOnline: this.isOnline,
      typingUsers: this.typingUsers,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromAPI(data) {
    return new Conversation(data);
  }
}
