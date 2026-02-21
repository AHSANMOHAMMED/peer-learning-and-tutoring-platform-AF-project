const express = require('express');
const { body, param, query } = require('express-validator');
const materialController = require('../controllers/materialController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Upload materials (files)
router.post('/upload', authenticate, materialController.upload.array('files', 5));

// Upload link material
router.post('/upload-link', authenticate, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').trim().isLength({ min: 1, max: 2000 }).withMessage('Description must be 1-2000 characters'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('url').isURL().withMessage('Valid URL is required'),
  body('grade').optional().isInt({ min: 6, max: 13 }).withMessage('Grade must be between 6 and 13'),
  body('tags').optional().trim(),
  body('categories').optional().trim(),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('estimatedTime').optional().isInt({ min: 1 }).withMessage('Estimated time must be at least 1 minute'),
  body('language').optional().isLength({ min: 2, max: 5 }).withMessage('Language code must be 2-5 characters'),
  body('license').optional().isIn(['cc0', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nc-sa', 'copyright'])
], validate, materialController.uploadLink);

// Get materials with filters
router.get('/', [
  query('subject').optional().trim(),
  query('grade').optional().isInt({ min: 6, max: 13 }).withMessage('Grade must be between 6 and 13'),
  query('type').optional().isIn(['pdf', 'document', 'video', 'image', 'link', 'presentation', 'spreadsheet', 'archive']),
  query('tags').optional().trim(),
  query('categories').optional().trim(),
  query('sortBy').optional().isIn(['createdAt', 'downloadCount', 'viewCount', 'rating.average', 'analytics.popularScore']),
  query('sortOrder').optional().isIn(['1', '-1']),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim()
], validate, materialController.getMaterials);

// Get material by ID
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid material ID')
], validate, materialController.getMaterialById);

// Download material
router.get('/:id/download', authenticate, [
  param('id').isMongoId().withMessage('Invalid material ID')
], validate, materialController.downloadMaterial);

// Get user's materials
router.get('/user/my-materials', authenticate, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'flagged'])
], validate, materialController.getUserMaterials);

// Update material
router.put('/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid material ID'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 2000 }).withMessage('Description must be 1-2000 characters'),
  body('subject').optional().trim().notEmpty().withMessage('Subject cannot be empty'),
  body('grade').optional().isInt({ min: 6, max: 13 }).withMessage('Grade must be between 6 and 13'),
  body('tags').optional().trim(),
  body('categories').optional().trim(),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('estimatedTime').optional().isInt({ min: 1 }).withMessage('Estimated time must be at least 1 minute'),
  body('language').optional().isLength({ min: 2, max: 5 }).withMessage('Language code must be 2-5 characters'),
  body('license').optional().isIn(['cc0', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nc-sa', 'copyright'])
], validate, materialController.updateMaterial);

// Delete material
router.delete('/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid material ID')
], validate, materialController.deleteMaterial);

// Add review to material
router.post('/:id/reviews', authenticate, [
  param('id').isMongoId().withMessage('Invalid material ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters')
], validate, materialController.addReview);

// Get popular materials
router.get('/popular/list', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], validate, materialController.getPopularMaterials);

module.exports = router;
