const { Message, Conversation } = require('../models/Message');
const User = require('../models/User');

// Get user's conversations
const getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const conversations = await Conversation.find({
      participants: req.userId,
      isDeleted: false,
      deletedBy: { $ne: req.userId }
    })
      .populate('participants', 'profile.firstName profile.lastName profile.avatar username')
      .populate('lastMessage.senderId', 'profile.firstName profile.lastName')
      .populate('bookingId', 'subject date')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();
    
    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
};

// Get or create conversation
const getOrCreateConversation = async (req, res) => {
  try {
    const { participantId, bookingId } = req.body;
    
    // Check if conversation already exists
    let query = {
      participants: { $all: [req.userId, participantId] },
      type: 'direct'
    };
    
    if (bookingId) {
      query = {
        bookingId,
        type: 'booking_related'
      };
    }
    
    let conversation = await Conversation.findOne(query)
      .populate('participants', 'profile.firstName profile.lastName profile.avatar username')
      .exec();
    
    // Create new conversation if not found
    if (!conversation) {
      const otherUser = await User.findById(participantId);
      if (!otherUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      conversation = new Conversation({
        participants: [req.userId, participantId],
        type: bookingId ? 'booking_related' : 'direct',
        bookingId,
        title: bookingId ? `Booking Discussion` : null
      });
      
      await conversation.save();
      
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'profile.firstName profile.lastName profile.avatar username')
        .exec();
    }
    
    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Get or create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get or create conversation',
      error: error.message
    });
  }
};

// Get messages in a conversation
const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    
    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.userId,
      deletedBy: { $ne: req.userId }
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    const messages = await Message.find({
      conversationId: id,
      isDeleted: false
    })
      .populate('senderId', 'profile.firstName profile.lastName profile.avatar username')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();
    
    // Mark messages as read
    await Message.updateMany(
      {
        conversationId: id,
        receiverId: req.userId,
        isRead: false
      },
      { isRead: true, readAt: new Date() }
    );
    
    // Reset unread count for user
    conversation.markAsRead(req.userId);
    await conversation.save();
    
    res.json({
      success: true,
      data: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, attachments, replyTo } = req.body;
    
    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.userId
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Get receiver (the other participant)
    const receiverId = conversation.participants.find(
      p => p.toString() !== req.userId.toString()
    );
    
    // Create message
    const message = new Message({
      conversationId: id,
      senderId: req.userId,
      receiverId,
      content,
      attachments: attachments || [],
      replyTo
    });
    
    await message.save();
    
    // Update conversation last message
    conversation.updateLastMessage(message);
    conversation.incrementUnread(receiverId);
    await conversation.save();
    
    // Populate and return
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'profile.firstName profile.lastName profile.avatar username')
      .exec();
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findOne({
      _id: id,
      receiverId: req.userId
    });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    message.isRead = true;
    message.readAt = new Date();
    await message.save();
    
    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
};

// Delete message (soft delete)
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findOne({
      _id: id,
      senderId: req.userId
    });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.userId,
      isRead: false,
      isDeleted: false
    });
    
    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

// Archive conversation
const archiveConversation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.userId
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    conversation.archiveForUser(req.userId);
    await conversation.save();
    
    res.json({
      success: true,
      message: 'Conversation archived successfully'
    });
  } catch (error) {
    console.error('Archive conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive conversation',
      error: error.message
    });
  }
};

// Delete conversation (soft delete for user)
const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.userId
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    conversation.deleteForUser(req.userId);
    await conversation.save();
    
    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation',
      error: error.message
    });
  }
};

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  getUnreadCount,
  archiveConversation,
  deleteConversation
};
