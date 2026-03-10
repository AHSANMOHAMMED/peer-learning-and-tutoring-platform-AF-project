const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const LectureCourse = require('../models/LectureCourse');
const User = require('../models/User');

class PaymentService {
  constructor() {
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    this.currency = 'lkr'; // Sri Lankan Rupees (or 'usd' for international)
  }

  /**
   * Create a payment intent for course enrollment
   * @param {String} courseId - Course ID
   * @param {String} userId - User ID
   * @returns {Object} Payment intent and client secret
   */
  async createPaymentIntent(courseId, userId) {
    try {
      // Get course details
      const course = await LectureCourse.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      if (course.isFree || course.price === 0) {
        throw new Error('Course is free, no payment required');
      }

      // Check if user is already enrolled
      if (course.isEnrolled(userId)) {
        throw new Error('Already enrolled in this course');
      }

      // Get user details
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create Stripe customer if not exists
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: user._id.toString()
          }
        });
        customerId = customer.id;
        
        // Save customer ID to user
        user.stripeCustomerId = customerId;
        await user.save();
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: course.price * 100, // Convert to cents
        currency: this.currency,
        customer: customerId,
        metadata: {
          courseId: course._id.toString(),
          userId: user._id.toString(),
          type: 'course_enrollment'
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: course.price,
        currency: this.currency,
        course: {
          id: course._id,
          title: course.title,
          price: course.price
        }
      };

    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm payment and enroll user in course
   * @param {String} paymentIntentId - Stripe payment intent ID
   * @returns {Object} Enrollment result
   */
  async confirmPayment(paymentIntentId) {
    try {
      // Retrieve payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment not successful. Status: ${paymentIntent.status}`);
      }

      const { courseId, userId } = paymentIntent.metadata;

      // Get course and user
      const course = await LectureCourse.findById(courseId);
      const user = await User.findById(userId);

      if (!course || !user) {
        throw new Error('Course or user not found');
      }

      // Enroll user
      const enrolled = course.enrollStudent(userId);
      if (!enrolled) {
        throw new Error('Failed to enroll student');
      }

      await course.save();

      // Create payment record
      const paymentRecord = {
        userId,
        courseId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        stripePaymentIntentId: paymentIntent.id,
        status: 'completed',
        paidAt: new Date()
      };

      // Save to user's payment history
      user.paymentHistory = user.paymentHistory || [];
      user.paymentHistory.push(paymentRecord);
      await user.save();

      return {
        success: true,
        course: {
          id: course._id,
          title: course.title
        },
        payment: paymentRecord
      };

    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  /**
   * Create subscription for recurring payments (e.g., premium membership)
   * @param {String} userId - User ID
   * @param {String} priceId - Stripe price ID
   * @returns {Object} Subscription details
   */
  async createSubscription(userId, priceId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: { userId: user._id.toString() }
        });
        customerId = customer.id;
        user.stripeCustomerId = customerId;
        await user.save();
      }

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: user._id.toString()
        }
      });

      return {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        status: subscription.status
      };

    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   * @param {String} subscriptionId - Stripe subscription ID
   * @returns {Object} Cancellation result
   */
  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      
      return {
        success: true,
        status: subscription.status,
        canceledAt: new Date()
      };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Process refund
   * @param {String} paymentIntentId - Payment intent ID
   * @param {Number} amount - Amount to refund (in cents)
   * @param {String} reason - Refund reason
   * @returns {Object} Refund result
   */
  async processRefund(paymentIntentId, amount = null, reason = '') {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
        reason: 'requested_by_customer'
      };

      if (amount) {
        refundData.amount = amount;
      }

      const refund = await stripe.refunds.create(refundData);

      return {
        refundId: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        reason
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  /**
   * Get user's payment history
   * @param {String} userId - User ID
   * @returns {Array} Payment history
   */
  async getPaymentHistory(userId) {
    try {
      const user = await User.findById(userId).select('paymentHistory');
      return user?.paymentHistory || [];
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook events
   * @param {Object} payload - Webhook payload
   * @param {String} signature - Webhook signature
   * @returns {Object} Processing result
   */
  async handleWebhook(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      console.log('Webhook event received:', event.type);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSuccess(event.data.object);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSuccess(paymentIntent) {
    const { courseId, userId, type } = paymentIntent.metadata;

    if (type === 'course_enrollment') {
      try {
        await this.confirmPayment(paymentIntent.id);
        console.log(`User ${userId} enrolled in course ${courseId}`);
      } catch (error) {
        console.error('Error handling payment success:', error);
      }
    }
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailure(paymentIntent) {
    const { userId, courseId } = paymentIntent.metadata;
    
    console.log(`Payment failed for user ${userId}, course ${courseId}`);
    
    // Could send email notification, update user record, etc.
  }

  /**
   * Handle invoice payment success
   */
  async handleInvoicePaymentSuccess(invoice) {
    console.log('Invoice payment succeeded:', invoice.id);
    
    // Handle subscription renewals
    if (invoice.subscription) {
      // Update user's subscription status
    }
  }

  /**
   * Handle subscription creation
   */
  async handleSubscriptionCreated(subscription) {
    const { userId } = subscription.metadata;
    
    try {
      const user = await User.findById(userId);
      if (user) {
        user.subscriptionStatus = 'active';
        user.stripeSubscriptionId = subscription.id;
        await user.save();
      }
    } catch (error) {
      console.error('Error handling subscription creation:', error);
    }
  }

  /**
   * Handle subscription deletion/cancellation
   */
  async handleSubscriptionDeleted(subscription) {
    const { userId } = subscription.metadata;
    
    try {
      const user = await User.findById(userId);
      if (user) {
        user.subscriptionStatus = 'canceled';
        await user.save();
      }
    } catch (error) {
      console.error('Error handling subscription deletion:', error);
    }
  }

  /**
   * Create Stripe Connect account for tutor payouts
   * @param {String} userId - Tutor user ID
   * @param {Object} accountData - Account information
   * @returns {Object} Connect account details
   */
  async createConnectAccount(userId, accountData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const account = await stripe.accounts.create({
        type: 'express',
        country: accountData.country || 'LK',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        },
        business_type: 'individual',
        individual: {
          first_name: accountData.firstName,
          last_name: accountData.lastName
        },
        metadata: {
          userId: user._id.toString()
        }
      });

      // Save account ID to user
      user.stripeConnectAccountId = account.id;
      await user.save();

      // Generate onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.CLIENT_URL}/tutor/payments/onboarding?refresh=true`,
        return_url: `${process.env.CLIENT_URL}/tutor/payments/onboarding?success=true`,
        type: 'account_onboarding'
      });

      return {
        accountId: account.id,
        onboardingUrl: accountLink.url
      };

    } catch (error) {
      console.error('Error creating Connect account:', error);
      throw error;
    }
  }

  /**
   * Transfer payout to tutor
   * @param {String} connectAccountId - Tutor's Connect account ID
   * @param {Number} amount - Amount in cents
   * @param {String} currency - Currency code
   * @returns {Object} Transfer result
   */
  async transferToTutor(connectAccountId, amount, currency = 'lkr') {
    try {
      const transfer = await stripe.transfers.create({
        amount,
        currency,
        destination: connectAccountId
      });

      return {
        transferId: transfer.id,
        amount: transfer.amount / 100,
        currency: transfer.currency,
        status: transfer.status
      };
    } catch (error) {
      console.error('Error transferring to tutor:', error);
      throw error;
    }
  }

  /**
   * Get platform earnings summary
   * @param {Object} filters - Date filters
   * @returns {Object} Earnings summary
   */
  async getEarningsSummary(filters = {}) {
    try {
      const { startDate, endDate } = filters;
      
      // Get all successful payments from user records
      const users = await User.find({
        'paymentHistory.status': 'completed',
        'paymentHistory.paidAt': {
          $gte: startDate || new Date(0),
          $lte: endDate || new Date()
        }
      }).select('paymentHistory');

      let totalRevenue = 0;
      let totalRefunds = 0;
      const courseEarnings = {};

      users.forEach(user => {
        user.paymentHistory?.forEach(payment => {
          if (payment.status === 'completed') {
            totalRevenue += payment.amount;
            
            // Track by course
            if (payment.courseId) {
              if (!courseEarnings[payment.courseId]) {
                courseEarnings[payment.courseId] = {
                  total: 0,
                  count: 0
                };
              }
              courseEarnings[payment.courseId].total += payment.amount;
              courseEarnings[payment.courseId].count++;
            }
          } else if (payment.status === 'refunded') {
            totalRefunds += payment.amount;
          }
        });
      });

      return {
        totalRevenue,
        totalRefunds,
        netRevenue: totalRevenue - totalRefunds,
        totalTransactions: Object.values(courseEarnings).reduce((sum, c) => sum + c.count, 0),
        courseBreakdown: courseEarnings,
        averageTransactionValue: totalRevenue / Object.values(courseEarnings).reduce((sum, c) => sum + c.count, 0) || 0
      };

    } catch (error) {
      console.error('Error getting earnings summary:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
