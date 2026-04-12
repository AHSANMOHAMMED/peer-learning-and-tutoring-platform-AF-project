const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const { 
  submitHomework, 
  getTutorPendingHomework, 
  gradeHomework, 
  getStudentHistory 
} = require('../controllers/homeworkController');
const GridFSService = require('../services/GridFSService');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Upload homework files (images/PDFs) to GridFS
router.post('/upload', authorize('student'), upload.array('files', 5), async (req, res) => {
  try {
    const uploadedFiles = [];
    for (const file of (req.files || [])) {
      const gridFile = await GridFSService.upload(file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
        metadata: { uploadedBy: req.user._id, type: 'homework' }
      });
      uploadedFiles.push({
        id: gridFile._id.toString(),
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        url: `/api/files/preview/${gridFile._id}`
      });
    }
    res.json({ success: true, data: uploadedFiles });
  } catch (error) {
    console.error('Homework upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/submit', authorize('student'), submitHomework);
router.get('/student/history', authorize('student'), getStudentHistory);

router.get('/tutor/pending', authorize('tutor'), getTutorPendingHomework);
router.put('/grade/:id', authorize('tutor'), gradeHomework);

module.exports = router;
