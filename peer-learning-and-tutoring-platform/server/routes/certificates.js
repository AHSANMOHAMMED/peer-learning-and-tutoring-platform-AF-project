const express = require('express');
const router = express.Router();
const NFTCertificateService = require('../services/NFTCertificateService');
const auth = require('../middleware/auth');
const { body, validationResult, param } = require('express-validator');

/**
 * @route   POST /api/certificates/create
 * @desc    Create NFT certificate for course completion
 * @access  Private
 */
router.post('/create', [
  auth,
  body('courseId').notEmpty().withMessage('Course ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { courseId } = req.body;

    // Check eligibility
    const eligibility = await NFTCertificateService.checkEligibility(
      courseId,
      req.user._id
    );

    if (!eligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: eligibility.reason,
        data: eligibility
      });
    }

    // Create certificate
    const certificate = await NFTCertificateService.createCertificate(
      courseId,
      req.user._id
    );

    // Queue for minting (in production, this would be a background job)
    // For now, we'll mint immediately
    setTimeout(async () => {
      try {
        await NFTCertificateService.processMinting(certificate._id);
      } catch (error) {
        console.error('Background minting error:', error);
      }
    }, 1000);

    res.status(201).json({
      success: true,
      message: 'Certificate created and minting in progress',
      data: { certificate }
    });

  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create certificate',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/certificates/my-certificates
 * @desc    Get user's NFT certificates
 * @access  Private
 */
router.get('/my-certificates', auth, async (req, res) => {
  try {
    const certificates = await NFTCertificateService.getUserCertificates(
      req.user._id
    );

    res.json({
      success: true,
      message: 'Certificates retrieved',
      data: { certificates }
    });

  } catch (error) {
    console.error('Error getting certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get certificates',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/certificates/verify/:code
 * @desc    Verify certificate by code
 * @access  Public
 */
router.get('/verify/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const certificate = await NFTCertificateService.verifyCertificate(code);

    res.json({
      success: true,
      message: 'Certificate verified',
      data: { certificate }
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Certificate not found',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/certificates/:id/eligibility
 * @desc    Check certificate eligibility
 * @access  Private
 */
router.get('/:id/eligibility', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const eligibility = await NFTCertificateService.checkEligibility(
      id,
      req.user._id
    );

    res.json({
      success: true,
      message: 'Eligibility checked',
      data: eligibility
    });

  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check eligibility',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/certificates/:id/share-linkedin
 * @desc    Get LinkedIn share URL for certificate
 * @access  Private
 */
router.post('/:id/share-linkedin', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const shareUrl = await NFTCertificateService.shareOnLinkedIn(id);

    res.json({
      success: true,
      message: 'LinkedIn share URL generated',
      data: { shareUrl }
    });

  } catch (error) {
    console.error('LinkedIn sharing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate share URL',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/certificates/:id/share-twitter
 * @desc    Get Twitter share URL for certificate
 * @access  Private
 */
router.post('/:id/share-twitter', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const shareUrl = await NFTCertificateService.shareOnTwitter(id);

    res.json({
      success: true,
      message: 'Twitter share URL generated',
      data: { shareUrl }
    });

  } catch (error) {
    console.error('Twitter sharing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate share URL',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/certificates/stats
 * @desc    Get certificate statistics (Admin only)
 * @access  Private (Admin)
 */
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const stats = await NFTCertificateService.getCertificateStats();

    res.json({
      success: true,
      message: 'Certificate statistics retrieved',
      data: stats
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/certificates/:id/revoke
 * @desc    Revoke a certificate (Admin only)
 * @access  Private (Admin)
 */
router.post('/:id/revoke', [
  auth,
  body('reason').notEmpty().withMessage('Revocation reason is required')
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
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

    const { id } = req.params;
    const { reason } = req.body;

    const certificate = await NFTCertificateService.revokeCertificate(
      id,
      reason,
      req.user._id
    );

    res.json({
      success: true,
      message: 'Certificate revoked',
      data: { certificate }
    });

  } catch (error) {
    console.error('Revocation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke certificate',
      error: error.message
    });
  }
});

module.exports = router;
