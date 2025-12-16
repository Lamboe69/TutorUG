const { Op } = require('sequelize');
const User = require('../models/User');
const OtpVerification = require('../models/OtpVerification');
const {
  generateToken,
  generateUserToken,
  generateRefreshToken
} = require('../utils/jwt');
const {
  validateUserRegistrationData,
  validateOTPVerification,
  sanitizeUserInput,
  normalizePhoneNumber
} = require('../utils/validators');
const { getEnvConfig } = require('../config/env');

// Mock SMS service (replace with actual Africa's Talking integration)
const sendSMS = async (phoneNumber, message) => {
  console.log(`SMS to ${phoneNumber}: ${message}`);
  // TODO: Integrate with Africa's Talking
  return true;
};

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { phoneNumber, purpose = 'login' } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Check if user exists (for registration check)
    const existingUser = await User.findByPhoneNumber(normalizedPhone);
    if (purpose === 'registration' && existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Phone number already registered'
      });
    }

    if (purpose === 'login' && !existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not registered'
      });
    }

    // Create OTP verification
    const verification = await OtpVerification.createVerification(normalizedPhone, purpose);

    // Send SMS (using mocked service for now)
    const message = `Your TutorUG verification code is: ${verification.otpCode}. Valid for 5 minutes.`;
    await sendSMS(normalizedPhone, message);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your phone',
      data: {
        verification_id: verification.id,
        expires_in: 300 // 5 minutes
      }
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP'
    });
  }
};

// Register user
const register = async (req, res) => {
  try {
    const userData = sanitizeUserInput(req.body);

    // Validate registration data
    validateUserRegistrationData(userData);

    const {
      phoneNumber,
      firstName,
      lastName,
      currentClass,
      schoolName,
      region,
      email,
      referralCode
    } = userData;

    // Check if phone number already exists
    const existingUser = await User.findByPhoneNumber(phoneNumber);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Phone number already registered'
      });
    }

    // Check referral code if provided
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findByReferralCode(referralCode);
      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: 'Invalid referral code'
        });
      }
      referredBy = referrer.id;
    }

    // Calculate trial end date
    const trialDuration = getEnvConfig().TRIAL_DURATION_DAYS;
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialDuration);

    // Create user
    const user = await User.create({
      phoneNumber,
      firstName,
      lastName,
      currentClass,
      schoolName,
      region,
      email,
      subscriptionStatus: 'trial',
      trialEndDate,
      referredBy
    });

    // Send welcome SMS
    const welcomeMessage = `Welcome to TutorUG, ${firstName}! Your 7-day free trial starts now. 🎓`;
    await sendSMS(phoneNumber, welcomeMessage);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user.id,
          phone_number: user.phoneNumber,
          first_name: user.firstName,
          last_name: user.lastName,
          current_class: user.currentClass,
          subscription_status: user.subscriptionStatus,
          trial_end_date: user.trialEndDate
        },
        requires_payment: false // Trial users don't need payment immediately
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed',
      errors: error.details || null
    });
  }
};

// Verify OTP and complete login/registration
const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otpCode } = req.body;

    // Validate input
    validateOTPVerification({ phoneNumber, otpCode });

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Verify OTP
    const verification = await OtpVerification.verifyOTP(normalizedPhone, otpCode);

    // Find or create user based on purpose
    let user;
    if (verification.purpose === 'registration') {
      user = await User.findByPhoneNumber(normalizedPhone);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found. Please register first.'
        });
      }
    } else {
      user = await User.findByPhoneNumber(normalizedPhone);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found. Please register first.'
        });
      }

      // Update login stats
      user.updateLoginStats();
      await user.save();
    }

    // Generate tokens
    const tokenPayload = generateUserToken(user);
    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.status(200).json({
      success: true,
      message: verification.purpose === 'registration' ? 'Account created successfully' : 'Login successful',
      data: {
        user: {
          id: user.id,
          phone_number: user.phoneNumber,
          first_name: user.firstName,
          last_name: user.lastName,
          current_class: user.currentClass,
          subscription_status: user.subscriptionStatus,
          trial_end_date: user.trialEndDate,
          subscription_end_date: user.subscriptionEndDate
        },
        token,
        refresh_token: refreshToken,
        expires_in: 604800 // 7 days in seconds
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'OTP verification failed'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Check if user exists
    const user = await User.findByPhoneNumber(normalizedPhone);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not registered'
      });
    }

    // Send OTP for login verification
    const verification = await OtpVerification.createVerification(normalizedPhone, 'login');
    const message = `Your TutorUG verification code is: ${verification.otpCode}. Valid for 5 minutes.`;
    await sendSMS(normalizedPhone, message);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your phone',
      data: {
        verification_id: verification.id,
        expires_in: 300
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone_number: user.phoneNumber,
          first_name: user.firstName,
          last_name: user.lastName,
          current_class: user.currentClass,
          school_name: user.schoolName,
          region: user.region,
          email: user.email,
          subscription_status: user.subscriptionStatus,
          trial_end_date: user.trialEndDate,
          subscription_end_date: user.subscriptionEndDate,
          created_at: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userData = sanitizeUserInput(req.body);
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    const allowedFields = ['firstName', 'lastName', 'schoolName', 'region', 'email'];
    allowedFields.forEach(field => {
      if (userData[field] !== undefined) {
        user[field] = userData[field];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          phone_number: user.phoneNumber,
          first_name: user.firstName,
          last_name: user.lastName,
          current_class: user.currentClass,
          school_name: user.schoolName,
          region: user.region,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

module.exports = {
  sendOTP,
  register,
  verifyOTP,
  login,
  getProfile,
  updateProfile
};
