const express = require('express');
const router = express.Router();
const { 
  uploadMaterial, 
  getMaterials, 
  getMaterialById, 
  moderateMaterial, 
  deleteMaterial 
} = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, uploadMaterial);
router.get('/', protect, getMaterials);
router.get('/:id', protect, getMaterialById);
router.put('/:id/moderate', protect, authorize('admin', 'moderator', 'superadmin'), moderateMaterial);
router.delete('/:id', protect, deleteMaterial);

module.exports = router;
