/**
 * Subscription Check Job
 * Check for expired subscriptions and deactivate them.
 */

const cron = require('node-cron');
const { User } = require('../models');
const { sendSubscriptionExpiredSMS } = require('../services/smsService');

async function checkExpiredSubscriptions() {
  try {
    const now = new Date();

    // Find users with expired subscriptions
    const expiredSubs = await User.findAll({
      where: {
        subscriptionStatus: 'active',
        subscriptionEndDate: { [require('sequelize').Op.lt]: now }
      }
    });

    for (const user of expiredSubs) {
      user.subscriptionStatus = 'expired';
      await user.save();

      await sendSubscriptionExpiredSMS(user.phoneNumber);
    }

    console.log(`⏰ Marked ${expiredSubs.length} subscriptions as expired`);
  } catch (err) {
    console.error('Subscription check job error:', err);
  }
}

// Run every 6 hours
function scheduleSubscriptionCheck() {
  cron.schedule('0 */6 * * *', checkExpiredSubscriptions);
  console.log('✅ Subscription check job scheduled');
}

module.exports = { scheduleSubscriptionCheck, checkExpiredSubscriptions };
