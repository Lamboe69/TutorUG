const AfricasTalking = require('africastalking');
const { getEnvConfig } = require('./env');

const env = getEnvConfig();

const at = AfricasTalking({
  apiKey: env.AT_API_KEY || process.env.AT_API_KEY || '',
  username: env.AT_USERNAME || process.env.AT_USERNAME || 'sandbox',
});

const sms = at.SMS;

const SMS_CONFIG = {
  senderId: process.env.AT_SENDER_ID || 'TUTORUGANDA',
  costPerSMS: parseInt(process.env.SMS_COST_UGX || '50', 10),
  templates: {
    otp: (code) => `Your TutorUG verification code is: ${code}. Valid for 5 minutes. Do not share this code.`,
    paymentSuccess: (plan, amount) => `Payment successful! You've subscribed to TutorUG ${plan} (${amount} UGX). Thank you!`,
    trialEnding: (days) => `Your TutorUG trial ends in ${days} days. Subscribe now for just 25,000 UGX/month!`,
    subscriptionExpired: () => `Your TutorUG subscription has expired. Renew now to continue learning.`,
  },
};

module.exports = { sms, SMS_CONFIG };
