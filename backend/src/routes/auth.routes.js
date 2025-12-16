const express = require('express');
const router = express.Router();
const {
  sendOTP,
  register,
  verifyOTP,
  login,
  getProfile,
  updateProfile
} = require('../controllers/authController');
const { authenticateToken } = require('../utils/jwt');
const rateLimit = require('express-rate-limit');

// Rate limiters for auth endpoints
const otpRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Max 5 OTP requests per 5 minutes
  message: 'Too many OTP requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 login attempts per 15 minutes
  message: 'Too many login attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (no authentication required)
// POST /api/auth/register - Register new user
router.post('/register', register);

// POST /api/auth/login - Login existing user
router.post('/login', loginRateLimit, login);

// POST /api/auth/send-otp - Send OTP for verification
router.post('/send-otp', otpRateLimit, sendOTP);

// POST /api/auth/verify-otp - Verify OTP for login/registration
router.post('/verify-otp', verifyOTP);

// Protected routes (authentication required)
// GET /api/auth/profile - Get current user profile
router.get('/profile', authenticateToken, getProfile);

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, updateProfile);

module.exports = router;
