const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const SchoolService = require('../services/SchoolService');

// Create new school
router.post('/', authenticate, authorize('admin'), [
  body('name').notEmpty().trim(),
  body('email').isEmail(),
  body('type').isIn(['government', 'private', 'international', 'religious']),
  body('levels').optional().isArray()
], async (req, res) => {
  try {
    const school = await SchoolService.createSchool(req.body, req.user._id);
    res.status(201).json({ success: true, data: school });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get user's schools
router.get('/my', authenticate, async (req, res) => {
  try {
    const schools = await SchoolService.getUserSchools(req.user._id);
    res.json({ success: true, data: schools });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Join school with code
router.post('/join', authenticate, [
  body('code').notEmpty().trim().toUpperCase(),
  body('role').optional().isIn(['student', 'teacher'])
], async (req, res) => {
  try {
    const { code, role = 'student' } = req.body;
    const result = await SchoolService.joinSchoolWithCode(code, req.user._id, role);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get school by ID
router.get('/:schoolId', authenticate, async (req, res) => {
  try {
    const School = require('../models/School');
    const school = await School.findById(req.params.schoolId);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }
    res.json({ success: true, data: school });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get school members
router.get('/:schoolId/members', authenticate, async (req, res) => {
  try {
    const { role, status, grade, search } = req.query;
    const members = await SchoolService.getSchoolMembers(req.params.schoolId, {
      role, status, grade, search
    });
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add user to school
router.post('/:schoolId/members', authenticate, authorize('admin'), [
  body('email').isEmail(),
  body('name').notEmpty(),
  body('role').isIn(['student', 'teacher', 'admin'])
], async (req, res) => {
  try {
    const result = await SchoolService.addUserToSchool(
      req.params.schoolId,
      req.body,
      req.user._id
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Bulk import students
router.post('/:schoolId/bulk-import', authenticate, authorize('admin'), [
  body('students').isArray()
], async (req, res) => {
  try {
    const results = await SchoolService.bulkImportStudents(
      req.params.schoolId,
      req.body.students,
      req.user._id
    );
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update school settings
router.patch('/:schoolId/settings', authenticate, authorize('admin'), async (req, res) => {
  try {
    const school = await SchoolService.updateSchoolSettings(
      req.params.schoolId,
      req.body,
      req.user._id
    );
    res.json({ success: true, data: school });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update subscription
router.post('/:schoolId/subscription', authenticate, authorize('admin'), [
  body('plan').isIn(['free', 'basic', 'premium', 'enterprise'])
], async (req, res) => {
  try {
    const school = await SchoolService.updateSubscription(
      req.params.schoolId,
      req.body.plan,
      req.user._id
    );
    res.json({ success: true, data: school });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get school analytics
router.get('/:schoolId/analytics', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const analytics = await SchoolService.getSchoolAnalytics(req.params.schoolId, timeRange);
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove member from school
router.delete('/:schoolId/members/:userId', authenticate, authorize('admin'), async (req, res) => {
  try {
    await SchoolService.removeUserFromSchool(
      req.params.schoolId,
      req.params.userId,
      req.user._id
    );
    res.json({ success: true, message: 'Member removed' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
