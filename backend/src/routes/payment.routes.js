const express = require('express');
const router = express.Router();
const {
  getPaymentPlans,
  initiateSubscriptionPayment,
  verifyPaymentStatus,
  handlePaymentWebhook,
  getUserPaymentHistory,
  getSubscriptionStatus,
  cancelUserSubscription,
  sendRenewalReminder,
  getPaymentAnalytics
} = require('../controllers/paymentController');
const { authenticateToken, requireActiveSubscription } = require('../utils/jwt');

// Public routes (no auth required)
router.get('/plans', getPaymentPlans);

// Webhook endpoint (no auth, but verify signature)
router.post('/webhook', handlePaymentWebhook);

// All other routes require authentication
router.use(authenticateToken);

// User subscription management
router.get('/subscription/status', getSubscriptionStatus);
router.post('/subscription/cancel', cancelUserSubscription);

// Payment operations
router.post('/subscribe', initiateSubscriptionPayment);
router.get('/verify/:transactionId', verifyPaymentStatus);
router.get('/history', getUserPaymentHistory);

// Admin routes (would need additional admin middleware in production)
// router.post('/admin/renewal-reminder/:userId', sendRenewalReminder);
// router.get('/admin/analytics', getPaymentAnalytics);

module.exports = router;
