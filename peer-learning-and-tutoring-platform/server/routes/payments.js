const express = require('express');
const router = express.Router();
const PaymentService = require('../services/PaymentService');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

/**
 * @route   POST /api/payments/create-intent
 * @desc    Create payment intent for course enrollment
 * @access  Private
 */
router.post('/create-intent', [
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

    const paymentIntent = await PaymentService.createPaymentIntent(
      courseId,
      req.user._id
    );

    res.json({
      success: true,
      message: 'Payment intent created',
      data: paymentIntent
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment intent',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payments/confirm
 * @desc    Confirm payment and complete enrollment
 * @access  Private
 */
router.post('/confirm', [
  auth,
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required')
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

    const { paymentIntentId } = req.body;

    const result = await PaymentService.confirmPayment(paymentIntentId);

    res.json({
      success: true,
      message: 'Payment confirmed and enrolled successfully',
      data: result
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to confirm payment',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/payments/history
 * @desc    Get user's payment history
 * @access  Private
 */
router.get('/history', auth, async (req, res) => {
  try {
    const history = await PaymentService.getPaymentHistory(req.user._id);

    res.json({
      success: true,
      message: 'Payment history retrieved',
      data: { history }
    });

  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payments/refund
 * @desc    Process refund for a payment
 * @access  Private (Admin only)
 */
router.post('/refund', [
  auth,
  body('paymentIntentId').notEmpty(),
  body('amount').optional().isInt({ min: 1 }),
  body('reason').optional().trim()
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

    const { paymentIntentId, amount, reason } = req.body;

    const refund = await PaymentService.processRefund(
      paymentIntentId,
      amount,
      reason
    );

    res.json({
      success: true,
      message: 'Refund processed',
      data: { refund }
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (but validated with Stripe signature)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing stripe-signature header'
      });
    }

    const result = await PaymentService.handleWebhook(req.body, signature);

    res.json(result);

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payments/connect-account
 * @desc    Create Stripe Connect account for tutor
 * @access  Private (Tutors only)
 */
router.post('/connect-account', [
  auth,
  body('country').optional().isString(),
  body('firstName').notEmpty(),
  body('lastName').notEmpty()
], async (req, res) => {
  try {
    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only tutors can create Connect accounts'
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

    const result = await PaymentService.createConnectAccount(
      req.user._id,
      req.body
    );

    res.json({
      success: true,
      message: 'Connect account created',
      data: result
    });

  } catch (error) {
    console.error('Error creating Connect account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Connect account',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/payments/earnings
 * @desc    Get platform earnings summary (Admin only)
 * @access  Private (Admin)
 */
router.get('/earnings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { startDate, endDate } = req.query;
    
    const summary = await PaymentService.getEarningsSummary({
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    });

    res.json({
      success: true,
      message: 'Earnings summary retrieved',
      data: summary
    });

  } catch (error) {
    console.error('Error getting earnings summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get earnings summary',
      error: error.message
    });
  }
});

module.exports = router;
