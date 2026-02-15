import { useState, useCallback } from 'react';
import { Message, Conversation } from '../models/Message';
import { messageService } from '../services/messageService';

export class MessageViewModel {
  constructor() {
    this.conversations = [];
    this.currentConversation = null;
    this.messages = [];
    this.unreadCount = 0;
    this.isLoading = false;
    this.error = null;
    this.typingUsers = [];
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  getState() {
    return {
      conversations: this.conversations,
      currentConversation: this.currentConversation,
      messages: this.messages,
      unreadCount: this.unreadCount,
      isLoading: this.isLoading,
      error: this.error,
      typingUsers: this.typingUsers
    };
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.error = null;
    this.notify();
  }

  setError(error) {
    this.error = error;
    this.isLoading = false;
    this.notify();
  }

  setConversations(conversationsData) {
    this.conversations = conversationsData.map(conv => Conversation.fromAPI(conv));
    this.isLoading = false;
    this.error = null;
    this.notify();
  }

  setCurrentConversation(conversationData) {
    this.currentConversation = conversationData ? Conversation.fromAPI(conversationData) : null;
    this.messages = [];
    this.isLoading = false;
    this.error = null;
    this.notify();
  }

  setMessages(messagesData) {
    this.messages = messagesData.map(msg => Message.fromAPI(msg));
    this.isLoading = false;
    this.error = null;
    this.notify();
  }

  addMessage(messageData) {
    const message = Message.fromAPI(messageData);
    this.messages.push(message);
    this.notify();
  }

  updateUnreadCount(count) {
    this.unreadCount = count;
    this.notify();
  }

  async fetchConversations() {
    this.setLoading(true);
    try {
      const response = await messageService.getConversations();
      if (response.success) {
        this.setConversations(response.data);
        return { success: true };
      } else {
        this.setError(response.message || 'Failed to fetch conversations');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to fetch conversations');
      return { success: false, message: error.message };
    }
  }

  async getOrCreateConversation(participantId, bookingId) {
    this.setLoading(true);
    try {
      const response = await messageService.getOrCreateConversation(participantId, bookingId);
      if (response.success) {
        this.setCurrentConversation(response.data);
        return { success: true, data: response.data };
      } else {
        this.setError(response.message || 'Failed to get or create conversation');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to get or create conversation');
      return { success: false, message: error.message };
    }
  }

  async fetchMessages(conversationId) {
    this.setLoading(true);
    try {
      const response = await messageService.getMessages(conversationId);
      if (response.success) {
        this.setMessages(response.data);
        // Update conversation unread count
        if (this.currentConversation && this.currentConversation.id === conversationId) {
          this.currentConversation.unreadCount = 0;
        }
        return { success: true };
      } else {
        this.setError(response.message || 'Failed to fetch messages');
        return { success: false, message: response.message };
      }
    } catch (error) {
      this.setError(error.message || 'Failed to fetch messages');
      return { success: false, message: error.message };
    }
  }

  async sendMessage(conversationId, content, attachments = []) {
    try {
      const response = await messageService.sendMessage(conversationId, content, attachments);
      if (response.success) {
        this.addMessage(response.data);
        // Update conversation last message
        if (this.currentConversation) {
          this.currentConversation.lastMessage = {
            content,
            senderId: response.data.senderId,
            createdAt: new Date()
          };
        }
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async markMessageAsRead(messageId) {
    try {
      const response = await messageService.markMessageAsRead(messageId);
      if (response.success) {
        const index = this.messages.findIndex(m => m.id === messageId);
        if (index >= 0) {
          this.messages[index].isRead = true;
          this.messages[index].readAt = new Date();
          this.notify();
        }
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async fetchUnreadCount() {
    try {
      const response = await messageService.getUnreadCount();
      if (response.success) {
        this.updateUnreadCount(response.data.unreadCount);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async archiveConversation(conversationId) {
    try {
      const response = await messageService.archiveConversation(conversationId);
      if (response.success) {
        this.conversations = this.conversations.filter(c => c.id !== conversationId);
        if (this.currentConversation && this.currentConversation.id === conversationId) {
          this.currentConversation = null;
          this.messages = [];
        }
        this.notify();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async deleteConversation(conversationId) {
    try {
      const response = await messageService.deleteConversation(conversationId);
      if (response.success) {
        this.conversations = this.conversations.filter(c => c.id !== conversationId);
        if (this.currentConversation && this.currentConversation.id === conversationId) {
          this.currentConversation = null;
          this.messages = [];
        }
        this.notify();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  setTyping(userId, isTyping) {
    if (isTyping) {
      if (!this.typingUsers.includes(userId)) {
        this.typingUsers.push(userId);
      }
    } else {
      this.typingUsers = this.typingUsers.filter(id => id !== userId);
    }
    this.notify();
  }

  clearCurrentConversation() {
    this.currentConversation = null;
    this.messages = [];
    this.typingUsers = [];
    this.notify();
  }

  clearError() {
    this.error = null;
    this.notify();
  }
}

export const messageViewModel = new MessageViewModel();

export function useMessageViewModel() {
  const [state, setState] = useState(messageViewModel.getState());

  const updateState = useCallback(() => {
    setState(messageViewModel.getState());
  }, []);

  useState(() => {
    const unsubscribe = messageViewModel.subscribe(updateState);
    return unsubscribe;
  });

  return {
    ...state,
    fetchConversations: messageViewModel.fetchConversations.bind(messageViewModel),
    getOrCreateConversation: messageViewModel.getOrCreateConversation.bind(messageViewModel),
    fetchMessages: messageViewModel.fetchMessages.bind(messageViewModel),
    sendMessage: messageViewModel.sendMessage.bind(messageViewModel),
    markMessageAsRead: messageViewModel.markMessageAsRead.bind(messageViewModel),
    fetchUnreadCount: messageViewModel.fetchUnreadCount.bind(messageViewModel),
    archiveConversation: messageViewModel.archiveConversation.bind(messageViewModel),
    deleteConversation: messageViewModel.deleteConversation.bind(messageViewModel),
    setTyping: messageViewModel.setTyping.bind(messageViewModel),
    clearCurrentConversation: messageViewModel.clearCurrentConversation.bind(messageViewModel),
    clearError: messageViewModel.clearError.bind(messageViewModel)
  };
}
