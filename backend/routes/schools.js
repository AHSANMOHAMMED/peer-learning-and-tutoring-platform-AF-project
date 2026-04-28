const express = require('express');
const router = express.Router();
const { 
  getAllSchools, 
  getSchoolById, 
  getSchoolByCode,
  createSchool, 
  updateSchool, 
  deleteSchool 
} = require('../controllers/schoolController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/schools/verify/:code
 * @desc    Verify school code and get basic data
 * @access  Public
 */
router.get('/verify/:code', getSchoolByCode);

/**
 * @route   GET /api/schools
 * @desc    Get all schools
 * @access  Private (Admin/SuperAdmin)
 */
router.get('/', authenticate, authorize(['superadmin', 'websiteAdmin']), getAllSchools);

/**
 * @route   GET /api/schools/:id
 * @desc    Get school by ID
 * @access  Private (Admin/SuperAdmin/SchoolAdmin)
 */
router.get('/:id', authenticate, authorize(['superadmin', 'websiteAdmin', 'schoolAdmin']), getSchoolById);

/**
 * @route   POST /api/schools
 * @desc    Provision a new school
 * @access  Private (SuperAdmin)
 */
router.post('/', authenticate, authorize(['superadmin']), createSchool);

/**
 * @route   PUT /api/schools/:id
 * @desc    Update school configuration
 * @access  Private (SuperAdmin/SchoolAdmin)
 */
router.put('/:id', authenticate, authorize(['superadmin', 'schoolAdmin']), updateSchool);

/**
 * @route   DELETE /api/schools/:id
 * @desc    Decommission a school
 * @access  Private (SuperAdmin)
 */
router.delete('/:id', authenticate, authorize(['superadmin']), deleteSchool);

/**
 * @route   GET /api/schools/:id/users
 * @desc    Get all users in a school
 * @access  Private (SchoolAdmin)
 */
router.get('/:id/users', authenticate, authorize(['schoolAdmin']), async (req, res) => {
  try {
    const schoolId = req.params.id;
    // Verify school admin is linked to this school
    if (req.user.school.toString() !== schoolId) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this school' });
    }
    const users = await User.find({ school: schoolId }).select('-password');
    res.json({ success: true, data: { users } });
  } catch (error) {
    console.error('Get school users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch school users' });
  }
});

/**
 * @route   POST /api/schools/:id/users
 * @desc    Add user to school
 * @access  Private (SchoolAdmin)
 */
router.post('/:id/users', authenticate, authorize(['schoolAdmin']), async (req, res) => {
  try {
    const schoolId = req.params.id;
    // Verify school admin is linked to this school
    if (req.user.school.toString() !== schoolId) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this school' });
    }
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { school: schoolId }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User added to school', data: { user } });
  } catch (error) {
    console.error('Add user to school error:', error);
    res.status(500).json({ success: false, message: 'Failed to add user to school' });
  }
});

module.exports = router;
