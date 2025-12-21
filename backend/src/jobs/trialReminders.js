/**
 * Trial Reminders Job
 * Send SMS to users when their trial is about to expire.
 */

const cron = require('node-cron');
const { User } = require('../models');
const { sendTrialEndingReminder } = require('../services/smsService');

async function checkTrialReminders() {
  try {
    // Find users whose trial ends in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const expiringTrials = await User.findAll({
      where: {
        trialEndDate: {
          [require('sequelize').Op.lte]: threeDaysFromNow,
          [require('sequelize').Op.gte]: new Date()
        }
      }
    });

    for (const user of expiringTrials) {
      const daysLeft = Math.ceil((user.trialEndDate - new Date()) / (1000 * 60 * 60 * 24));
      await sendTrialEndingReminder(user.phoneNumber, daysLeft);
    }

    console.log(`📱 Sent trial reminders to ${expiringTrials.length} users`);
  } catch (err) {
    console.error('Trial reminder job error:', err);
  }
}

// Run daily at 8 AM
function scheduleTrialReminders() {
  cron.schedule('0 8 * * *', checkTrialReminders);
  console.log('✅ Trial reminder job scheduled');
}

module.exports = { scheduleTrialReminders, checkTrialReminders };
