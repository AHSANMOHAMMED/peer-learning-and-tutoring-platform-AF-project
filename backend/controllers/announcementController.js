const Announcement = require('../models/Announcement');
const { validationResult } = require('express-validator');

// Create announcement (Admin/SuperAdmin/SchoolAdmin/Mentor)
exports.createAnnouncement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, content, targetRoles, targetGrades, priority, type, expiresAt, isPinned } = req.body;

    const announcement = new Announcement({
      title,
      content,
      author: req.user._id,
      targetRoles: targetRoles || ['all'],
      targetGrades: targetGrades || [],
      priority: priority || 'normal',
      type: type || 'system',
      expiresAt,
      isPinned: isPinned || false
    });

    await announcement.save();

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get announcements for current user
exports.getMyAnnouncements = async (req, res) => {
  try {
    const { role, grade } = req.user;
    
    const query = {
      isActive: true,
      $or: [
        { targetRoles: 'all' },
        { targetRoles: role }
      ]
    };

    if (grade) {
      query.$or.push({ targetGrades: grade });
    }

    // Filter out expired announcements
    query.$and = [
      { $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }] }
    ];

    const announcements = await Announcement.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .populate('author', 'username profile.firstName profile.lastName role')
      .limit(20);

    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    // Check if user is author or admin
    if (announcement.author.toString() !== req.user._id.toString() && !['superadmin', 'websiteAdmin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, updateData, { new: true });

    res.json({
      success: true,
      data: updatedAnnouncement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    // Check if user is author or admin
    if (announcement.author.toString() !== req.user._id.toString() && !['superadmin', 'websiteAdmin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Announcement.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Announcement deleted'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
