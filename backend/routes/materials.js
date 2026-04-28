const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const { 
  uploadMaterial, 
  getMaterials, 
  getMyMaterials,
  getMaterialById, 
  moderateMaterial, 
  updateMaterial,
  deleteMaterial,
  purchaseMaterial
} = require('../controllers/materialController');
const GridFSService = require('../services/GridFSService');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Material Browse
router.get('/', getMaterials);
router.get('/my', getMyMaterials);
router.get('/:id', getMaterialById);

// Material Actions
router.post('/', uploadMaterial);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);
router.post('/:id/purchase', purchaseMaterial);

// Admin/Moderator
router.put('/:id/moderate', authorize('admin', 'moderator', 'superadmin'), moderateMaterial);

// Dedicated Upload for Material Files
router.post('/upload', upload.array('files', 1), async (req, res) => {
  try {
    const file = req.files[0];
    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const gridFile = await GridFSService.upload(file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
      metadata: { uploadedBy: req.user._id, type: 'material' }
    });

    res.json({ 
      success: true, 
      url: `/api/files/preview/${gridFile._id}`,
      name: file.originalname,
      type: file.mimetype
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
