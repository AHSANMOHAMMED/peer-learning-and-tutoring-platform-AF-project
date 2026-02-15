import { apiService } from './api';

export const messageService = {
  // Get all conversations
  async getConversations() {
    return await apiService.get('/api/messages/conversations');
  },

  // Get or create conversation with a user
  async getOrCreateConversation(participantId, bookingId = null) {
    return await apiService.post('/api/messages/conversations', {
      participantId,
      bookingId
    });
  },

  // Get messages in a conversation
  async getMessages(conversationId) {
    return await apiService.get(`/api/messages/conversations/${conversationId}/messages`);
  },

  // Send message
  async sendMessage(conversationId, content, attachments = []) {
    return await apiService.post(`/api/messages/conversations/${conversationId}/messages`, {
      content,
      attachments
    });
  },

  // Mark message as read
  async markMessageAsRead(messageId) {
    return await apiService.put(`/api/messages/messages/${messageId}/read`);
  },

  // Delete message
  async deleteMessage(messageId) {
    return await apiService.delete(`/api/messages/messages/${messageId}`);
  },

  // Get unread message count
  async getUnreadCount() {
    return await apiService.get('/api/messages/unread-count');
  },

  // Archive conversation
  async archiveConversation(conversationId) {
    return await apiService.post(`/api/messages/conversations/${conversationId}/archive`);
  },

  // Delete conversation
  async deleteConversation(conversationId) {
    return await apiService.delete(`/api/messages/conversations/${conversationId}`);
  }
};
