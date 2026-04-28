const express = require('express');
const router = express.Router();
const FeatureFlagService = require('../services/FeatureFlagService');
const { authenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const ADMIN_ROLES = ['admin', 'websiteAdmin', 'superadmin'];
const CONFIG_ROLES = [...ADMIN_ROLES, 'moderator'];

/**
 * @route   GET /api/feature-flags
 * @desc    Get all feature flags
 * @access  Private (Admin/Moderator)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    if (!CONFIG_ROLES.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const flags = await FeatureFlagService.getAllFlags();

    res.json({
      success: true,
      message: 'Feature flags retrieved',
      data: { flags }
    });

  } catch (error) {
    console.error('Error getting feature flags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feature flags',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/feature-flags/my-flags
 * @desc    Get feature flags for current user
 * @access  Private
 */
router.get('/my-flags', authenticate, async (req, res) => {
  try {
    const flags = await FeatureFlagService.getFlagsForUser(req.user);

    res.json({
      success: true,
      message: 'User feature flags retrieved',
      data: { flags }
    });

  } catch (error) {
    console.error('Error getting user feature flags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feature flags',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/feature-flags/:key
 * @desc    Get feature flag by key
 * @access  Private (Admin/Moderator)
 */
router.get('/:key', authenticate, async (req, res) => {
  try {
    if (!CONFIG_ROLES.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { key } = req.params;
    const flag = await FeatureFlagService.getFlagByKey(key);

    if (!flag) {
      return res.status(404).json({
        success: false,
        message: 'Feature flag not found'
      });
    }

    res.json({
      success: true,
      message: 'Feature flag retrieved',
      data: { flag }
    });

  } catch (error) {
    console.error('Error getting feature flag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feature flag',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/feature-flags
 * @desc    Create a new feature flag
 * @access  Private (Admin)
 */
router.post('/', [
  authenticate,
  body('key').notEmpty().trim().withMessage('Flag key is required'),
  body('name').notEmpty().trim().withMessage('Flag name is required'),
  body('description').optional().trim(),
  body('enabled').optional().isBoolean(),
  body('targeting').optional().isObject()
], async (req, res) => {
  try {
    if (!ADMIN_ROLES.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const flag = await FeatureFlagService.createFlag(req.body, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Feature flag created',
      data: { flag }
    });

  } catch (error) {
    console.error('Error creating feature flag:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Feature flag key already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create feature flag',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/feature-flags/:id
 * @desc    Update a feature flag
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    if (!ADMIN_ROLES.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { id } = req.params;
    const flag = await FeatureFlagService.updateFlag(id, req.body, req.user._id);

    res.json({
      success: true,
      message: 'Feature flag updated',
      data: { flag }
    });

  } catch (error) {
    console.error('Error updating feature flag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feature flag',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/feature-flags/:id/toggle
 * @desc    Toggle a feature flag
 * @access  Private (Admin/Moderator)
 */
router.post('/:id/toggle', authenticate, async (req, res) => {
  try {
    if (!CONFIG_ROLES.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { id } = req.params;
    const flag = await FeatureFlagService.toggleFlag(id, req.user._id);

    res.json({
      success: true,
      message: 'Feature flag toggled',
      data: { flag }
    });

  } catch (error) {
    console.error('Error toggling feature flag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle feature flag',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/feature-flags/:id
 * @desc    Delete a feature flag
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!ADMIN_ROLES.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { id } = req.params;
    await FeatureFlagService.deleteFlag(id);

    res.json({
      success: true,
      message: 'Feature flag deleted'
    });

  } catch (error) {
    console.error('Error deleting feature flag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feature flag',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/feature-flags/:id/analytics
 * @desc    Get feature flag analytics
 * @access  Private (Admin/Moderator)
 */
router.get('/:id/analytics', authenticate, async (req, res) => {
  try {
    if (!CONFIG_ROLES.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { id } = req.params;
    const analytics = await FeatureFlagService.getFlagAnalytics(id);

    res.json({
      success: true,
      message: 'Feature flag analytics retrieved',
      data: { analytics }
    });

  } catch (error) {
    console.error('Error getting flag analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get flag analytics',
      error: error.message
    });
  }
});

module.exports = router;
