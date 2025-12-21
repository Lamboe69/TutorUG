const Flutterwave = require('flutterwave-node-v3');
const { getEnvConfig } = require('./env');

const env = getEnvConfig();

const flw = new Flutterwave(env.FLUTTERWAVE_PUBLIC_KEY || '', env.FLUTTERWAVE_SECRET_KEY || '');

const PAYMENT_CONFIG = {
  currency: process.env.PAYMENT_CURRENCY || 'UGX',
  paymentOptions: 'mobilemoneyuganda,card',
  callbackUrl: `${env.FRONTEND_URL}/payment/callback`,
  webhookUrl: `${process.env.API_URL || `http://localhost:${env.PORT}`}/api/payments/webhook`,
  plans: {
    monthly: { name: 'Monthly Subscription', amount: 25000, duration: 1 },
    annual: { name: 'Annual Subscription', amount: 250000, duration: 12 },
  },
};

module.exports = { flw, PAYMENT_CONFIG };
