const paymentService = require('./paymentService');

/**
 * Handle incoming payment webhooks and delegate to paymentService
 * Keep this file small so tests can stub the implementation easily.
 */
async function handleFlutterwaveWebhook(payload) {
  // Delegate to paymentService; paymentService handles verification and DB updates
  return paymentService.handleWebhook(payload);
}

module.exports = {
  handleFlutterwaveWebhook
};
