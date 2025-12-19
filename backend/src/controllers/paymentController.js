const {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
  cancelSubscription,
  PAYMENT_PLANS
} = require('../services/paymentService');

const {
  sendSubscriptionConfirmationSMS,
  sendRenewalReminderSMS,
  sendCancellationConfirmationSMS
} = require('../services/smsService');

const {
  sendSubscriptionConfirmationEmail,
  sendRenewalReminderEmail
} = require('../services/emailService');

const User = require('../models/User');

// Get available payment plans
const getPaymentPlans = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        plans: PAYMENT_PLANS,
        currency: 'UGX'
      }
    });
  } catch (error) {
    console.error('Get payment plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment plans',
      error: error.message
    });
  }
};

// Initialize payment for subscription
const initiateSubscriptionPayment = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    // Validate plan
    if (!PAYMENT_PLANS[planId]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment plan'
      });
    }

    // Get user details
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has active subscription
    if (user.subscriptionStatus === 'active' && user.subscriptionEndDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription',
        subscriptionEndDate: user.subscriptionEndDate
      });
    }

    // Initialize payment
    const paymentResult = await initializePayment(user, planId);

    res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        paymentUrl: paymentResult.paymentUrl,
        transactionId: paymentResult.transactionId,
        amount: paymentResult.amount,
        currency: paymentResult.currency,
        plan: PAYMENT_PLANS[planId]
      }
    });

  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: error.message
    });
  }
};

// Verify payment status (manual verification)
const verifyPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const verification = await verifyPayment(transactionId);

    // Check if payment belongs to user (basic security)
    const payment = await require('../models/Payment').findOne({
      where: { transactionId, userId }
    });

    if (!payment && verification.success) {
      // Payment succeeded but doesn't belong to this user
      return res.status(403).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    res.status(200).json({
      success: true,
      data: verification
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

// Handle Flutterwave webhook
const handlePaymentWebhook = async (req, res) => {
  try {
    const webhookData = req.body;

    // Log webhook for debugging (remove in production)
    console.log('🪝 Payment webhook received:', {
      event: webhookData.event,
      tx_ref: webhookData.data?.tx_ref,
      status: webhookData.data?.status
    });

    await handleWebhook(webhookData);

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Always return 200 to webhook sender to avoid retries
    res.status(200).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
};

// Get user's payment history
const getUserPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const payments = await getPaymentHistory(userId, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        payments,
        totalCount: payments.length
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
      error: error.message
    });
  }
};

// Get user's subscription status
const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: [
        'subscriptionStatus',
        'subscriptionPlan',
        'subscriptionStartDate',
        'subscriptionEndDate',
        'trialEndDate'
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const now = new Date();
    const isActive = user.subscriptionStatus === 'active' && user.subscriptionEndDate > now;
    const isTrialActive = user.trialEndDate && user.trialEndDate > now;
    const daysRemaining = isActive ?
      Math.ceil((user.subscriptionEndDate - now) / (1000 * 60 * 60 * 24)) :
      0;

    res.status(200).json({
      success: true,
      data: {
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        isActive,
        isTrialActive,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        trialEndDate: user.trialEndDate,
        daysRemaining,
        canAccessPremium: isActive || isTrialActive
      }
    });

  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription status',
      error: error.message
    });
  }
};

// Cancel subscription
const cancelUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await cancelSubscription(userId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        accessUntil: result.accessUntil
      }
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
};

// Send renewal reminder (admin function)
const sendRenewalReminder = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send SMS reminder
    await sendRenewalReminderSMS(user);

    // Send email reminder if user has email
    if (user.email) {
      await sendRenewalReminderEmail(user);
    }

    res.status(200).json({
      success: true,
      message: 'Renewal reminder sent successfully'
    });

  } catch (error) {
    console.error('Send renewal reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send renewal reminder',
      error: error.message
    });
  }
};

// Get payment analytics (admin function)
const getPaymentAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const Payment = require('../models/Payment');

    // Get payment statistics
    const payments = await Payment.findAll({
      where: {
        createdAt: {
          [require('sequelize').Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'totalAmount']
      ],
      group: ['status']
    });

    const analytics = {
      period: `${days} days`,
      totalPayments: 0,
      successfulPayments: 0,
      failedPayments: 0,
      totalRevenue: 0,
      successRate: 0
    };

    payments.forEach(payment => {
      const count = parseInt(payment.dataValues.count);
      const amount = parseInt(payment.dataValues.totalAmount || 0);

      analytics.totalPayments += count;

      if (payment.status === 'completed') {
        analytics.successfulPayments = count;
        analytics.totalRevenue = amount;
      } else if (payment.status === 'failed') {
        analytics.failedPayments = count;
      }
    });

    analytics.successRate = analytics.totalPayments > 0 ?
      (analytics.successfulPayments / analytics.totalPayments) * 100 : 0;

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get payment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment analytics',
      error: error.message
    });
  }
};

module.exports = {
  getPaymentPlans,
  initiateSubscriptionPayment,
  verifyPaymentStatus,
  handlePaymentWebhook,
  getUserPaymentHistory,
  getSubscriptionStatus,
  cancelUserSubscription,
  sendRenewalReminder,
  getPaymentAnalytics
};
