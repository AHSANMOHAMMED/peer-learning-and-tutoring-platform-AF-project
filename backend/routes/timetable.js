const express = require('express');
const router = express.Router();
const { 
  getSchedule, 
  addTimeSlot, 
  updateTimeSlot, 
  deleteTimeSlot 
} = require('../controllers/timetableController');
const { protect } = require('../middleware/auth');
const timeTableAIService = require('../services/timeTableAIService');

router.use(protect);

router.get('/', getSchedule);
router.post('/', addTimeSlot);
router.put('/:id', updateTimeSlot);
router.delete('/:id', deleteTimeSlot);

// AI Suggestions
router.get('/ai-suggest/:tutorId', async (req, res) => {
  try {
    const suggestions = await timeTableAIService.findOptimalSlots(req.user._id, req.params.tutorId);
    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
