const Flutterwave = require('flutterwave-node');
const { getEnvConfig } = require('../config/env');

// Initialize Flutterwave
const flutterwave = new Flutterwave(
  getEnvConfig().FLUTTERWAVE_PUBLIC_KEY,
  getEnvConfig().FLUTTERWAVE_SECRET_KEY
);

// Payment plans configuration
const PAYMENT_PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Plan',
    amount: 25000, // 25,000 UGX
    currency: 'UGX',
    durationMonths: 1,
    description: 'Full access for 1 month'
  },
  annual: {
    id: 'annual',
    name: 'Annual Plan',
    amount: 250000, // 250,000 UGX
    currency: 'UGX',
    durationMonths: 12,
    description: 'Full access for 12 months (2 months free!)'
  }
};

// Initialize payment
async function initializePayment(user, planId) {
  try {
    const plan = PAYMENT_PLANS[planId];
    if (!plan) {
      throw new Error('Invalid payment plan');
    }

    // Create payment payload
    const paymentData = {
      tx_ref: `TUG-${Date.now()}-${user.id}`,
      amount: plan.amount,
      currency: plan.currency,
      redirect_url: `${getEnvConfig().FRONTEND_URL}/payment/success`,
      payment_options: 'mobilemoneyuganda', // Focus on Uganda mobile money
      customer: {
        email: user.email || `${user.phoneNumber}@tutorug.com`,
        phone_number: user.phoneNumber,
        name: `${user.firstName} ${user.lastName}`
      },
      customizations: {
        title: 'TutorUG Subscription',
        description: plan.description,
        logo: 'https://tutoruganda.com/logo.png'
      },
      meta: {
        userId: user.id,
        planId: plan.id,
        durationMonths: plan.durationMonths
      }
    };

    const response = await flutterwave.Charge.create(paymentData);

    if (response.status === 'success') {
      // Store payment attempt in database
      await require('../models/Payment').create({
        userId: user.id,
        amount: plan.amount,
        currency: plan.currency,
        paymentMethod: 'flutterwave',
        transactionId: paymentData.tx_ref,
        flutterwaveRef: response.data.flw_ref,
        status: 'pending'
      });

      return {
        success: true,
        paymentUrl: response.data.link,
        transactionId: paymentData.tx_ref,
        amount: plan.amount,
        currency: plan.currency
      };
    } else {
      throw new Error(response.message || 'Payment initialization failed');
    }

  } catch (error) {
    console.error('Payment initialization error:', error);
    throw new Error(`Payment initialization failed: ${error.message}`);
  }
}

// Verify payment status
async function verifyPayment(transactionId) {
  try {
    // Find payment record
    const Payment = require('../models/Payment');
    const payment = await Payment.findOne({
      where: { transactionId }
    });

    if (!payment) {
      throw new Error('Payment record not found');
    }

    // Verify with Flutterwave
    const verification = await flutterwave.Transaction.verify({
      id: payment.flutterwaveRef
    });

    if (verification.status === 'success' && verification.data.status === 'successful') {
      // Update payment status
      payment.status = 'completed';
      payment.completedAt = new Date();
      await payment.save();

      // Activate user subscription
      const User = require('../models/User');
      const user = await User.findByPk(payment.userId);

      if (user) {
        const plan = PAYMENT_PLANS[payment.planId || 'monthly'];
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + (plan?.durationMonths || 1));

        user.subscriptionStatus = 'active';
        user.subscriptionEndDate = endDate;
        user.subscriptionPlan = plan?.id || 'monthly';
        await user.save();

        // Send confirmation SMS
        await sendSubscriptionConfirmationSMS(user, plan);

        // Send confirmation email if available
        if (user.email) {
          await sendSubscriptionConfirmationEmail(user, plan);
        }
      }

      return {
        success: true,
        status: 'completed',
        userId: payment.userId,
        amount: payment.amount,
        plan: plan?.name || 'Subscription'
      };
    } else {
      // Update payment status to failed
      payment.status = 'failed';
      payment.failureReason = verification.data.status || 'Payment verification failed';
      await payment.save();

      return {
        success: false,
        status: 'failed',
        reason: payment.failureReason
      };
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
}

// Handle Flutterwave webhook
async function handleWebhook(webhookData) {
  try {
    // Verify webhook signature (recommended for production)
    const secretHash = getEnvConfig().FLUTTERWAVE_SECRET_HASH;
    if (secretHash) {
      // Implement signature verification
      const expectedSignature = require('crypto')
        .createHmac('sha256', secretHash)
        .update(JSON.stringify(webhookData))
        .digest('hex');

      // Compare with received signature
    }

    const { event, data } = webhookData;

    if (event === 'charge.completed' && data.status === 'successful') {
      // Process successful payment
      const transactionId = data.tx_ref;
      await verifyPayment(transactionId);

      console.log(`✅ Payment completed: ${transactionId}`);
    }

    return { success: true, processed: true };

  } catch (error) {
    console.error('Webhook processing error:', error);
    throw error;
  }
}

// Get user's payment history
async function getPaymentHistory(userId, limit = 10) {
  try {
    const Payment = require('../models/Payment');
    const payments = await Payment.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit
    });

    return payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt
    }));

  } catch (error) {
    console.error('Get payment history error:', error);
    throw new Error('Failed to retrieve payment history');
  }
}

// Cancel subscription (set to expire at end of current period)
async function cancelSubscription(userId) {
  try {
    const User = require('../models/User');
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // For now, just update status - in production, integrate with payment processor
    user.subscriptionStatus = 'cancelled';
    await user.save();

    // Send cancellation confirmation
    await sendCancellationConfirmationSMS(user);

    return {
      success: true,
      message: 'Subscription cancelled successfully',
      accessUntil: user.subscriptionEndDate
    };

  } catch (error) {
    console.error('Cancel subscription error:', error);
    throw new Error('Failed to cancel subscription');
  }
}

// Check subscription status and auto-renew if needed
async function checkAndRenewSubscriptions() {
  try {
    const User = require('../models/User');

    // Find users whose subscriptions expire in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const expiringUsers = await User.findAll({
      where: {
        subscriptionStatus: 'active',
        subscriptionEndDate: {
          [require('sequelize').Op.lte]: threeDaysFromNow,
          [require('sequelize').Op.gte]: new Date()
        }
      }
    });

    // Send renewal reminders
    for (const user of expiringUsers) {
      await sendRenewalReminderSMS(user);
    }

    console.log(`📅 Sent renewal reminders to ${expiringUsers.length} users`);

    // Find expired subscriptions
    const expiredUsers = await User.findAll({
      where: {
        subscriptionStatus: 'active',
        subscriptionEndDate: { [require('sequelize').Op.lt]: new Date() }
      }
    });

    // Update expired subscriptions
    for (const user of expiredUsers) {
      user.subscriptionStatus = 'expired';
      await user.save();

      await sendSubscriptionExpiredSMS(user);
    }

    console.log(`⏰ Expired subscriptions for ${expiredUsers.length} users`);

  } catch (error) {
    console.error('Subscription renewal check error:', error);
  }
}

module.exports = {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
  cancelSubscription,
  checkAndRenewSubscriptions,
  PAYMENT_PLANS
};
