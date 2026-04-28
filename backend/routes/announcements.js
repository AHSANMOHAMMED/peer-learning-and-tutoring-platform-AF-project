const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middleware/auth');
const { body } = require('express-validator');

// @route   POST /api/announcements
// @desc    Create an announcement
// @access  Private (Admin/Mentor/SchoolAdmin)
router.post('/', [
  authenticate,
  authorize('superadmin', 'websiteAdmin', 'schoolAdmin', 'mentor', 'moderator'),
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
], announcementController.createAnnouncement);

// @route   GET /api/announcements/my
// @desc    Get announcements for current user
// @access  Private
router.get('/my', authenticate, announcementController.getMyAnnouncements);

// @route   PUT /api/announcements/:id
// @desc    Update an announcement
// @access  Private (Author/Admin)
router.put('/:id', authenticate, announcementController.updateAnnouncement);

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement
// @access  Private (Author/Admin)
router.delete('/:id', authenticate, announcementController.deleteAnnouncement);

module.exports = router;
