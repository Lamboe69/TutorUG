const crypto = require('crypto');
const { getEnvConfig } = require('../config/env');

const env = getEnvConfig();

// Middleware to verify Flutterwave webhook signatures.
// Expects either a header with the secret or an HMAC sha256 signature.
module.exports = function webhookAuth(req, res, next) {
  const secret = process.env.FLW_SECRET_HASH || env.FLUTTERWAVE_SECRET_KEY || process.env.FLUTTERWAVE_SECRET_KEY;
  const received = req.headers['verif-hash'] || req.headers['x-flutterwave-signature'] || req.headers['x-flw-signature'];

  if (!secret) {
    console.warn('webhookAuth: No FLW secret configured — skipping verification');
    return next();
  }

  if (!received) {
    return res.status(401).json({ error: 'Missing webhook signature header' });
  }

  // Prefer direct equality (some sandboxes send the secret directly)
  if (received === secret) return next();

  // Otherwise compute HMAC SHA256 of raw body if available
  const payload = req.rawBody || (req.body ? JSON.stringify(req.body) : '');
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  if (hmac === received) return next();

  return res.status(401).json({ error: 'Invalid webhook signature' });
};
