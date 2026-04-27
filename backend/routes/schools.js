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
router.get('/', authenticate, authorize(['admin', 'superadmin']), getAllSchools);

/**
 * @route   GET /api/schools/:id
 * @desc    Get school by ID
 * @access  Private (Admin/SuperAdmin/SchoolAdmin)
 */
router.get('/:id', authenticate, authorize(['admin', 'superadmin', 'schoolAdmin']), getSchoolById);

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

module.exports = router;
