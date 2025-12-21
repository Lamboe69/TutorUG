// Mock flutterwave-node to avoid network calls
jest.mock('flutterwave-node', () => {
  return jest.fn().mockImplementation(() => ({
    Charge: { create: jest.fn().mockResolvedValue({ status: 'success', data: { flw_ref: 'FLW_REF_123', link: 'https://pay.example/xyz' } }) },
    Transaction: { verify: jest.fn().mockResolvedValue({ status: 'success', data: { status: 'successful', amount: 25000, currency: 'UGX' } }) }
  }));
});

// Mock Payment model
jest.mock('../src/models/Payment', () => ({
  create: jest.fn().mockResolvedValue({ id: 1 }),
  findOne: jest.fn()
}));

const paymentService = require('../src/services/paymentService');

describe('Payment Service', () => {
  test('initializePayment returns paymentUrl and transactionId', async () => {
    const user = { id: 42, email: 'user@example.com', phoneNumber: '+256771234567', firstName: 'Test', lastName: 'User' };

    const result = await paymentService.initializePayment(user, 'monthly');

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.paymentUrl).toBe('https://pay.example/xyz');
    expect(result.transactionId).toMatch(/TUG-/);
  });
});
