/**
 * Jobs Index
 * Bootstrap all background jobs.
 */

const { scheduleTrialReminders } = require('./trialReminders');
const { scheduleSubscriptionCheck } = require('./subscriptionCheck');
const { scheduleCacheWarmer } = require('./cacheWarmer');

function initializeJobs() {
  console.log('🚀 Initializing background jobs...');
  scheduleTrialReminders();
  scheduleSubscriptionCheck();
  scheduleCacheWarmer();
  console.log('✅ All jobs scheduled');
}

module.exports = { initializeJobs };
