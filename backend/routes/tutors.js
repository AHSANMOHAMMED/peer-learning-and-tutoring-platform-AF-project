const express = require('express');
const router = express.Router();
const { 
  registerTutor, 
  getTutors, 
  getTutorProfile, 
  moderateTutor,
  getAllTutors
} = require('../controllers/tutorController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, registerTutor);
router.get('/', getTutors);
router.get('/all', protect, authorize('admin', 'superadmin'), getAllTutors);
router.get('/:id', getTutorProfile);
router.put('/:id/moderate', protect, authorize('admin', 'superadmin'), moderateTutor);

module.exports = router;
