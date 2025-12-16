// Phone number validation (Ugandan format)
const validatePhoneNumber = (phoneNumber) => {
  // Ugandan phone numbers: +256XXXXXXXXX or 0XXXXXXXXX or 256XXXXXXXXX
  const ugandanPhoneRegex = /^(?:\+?256|0)?[7-9]\d{8}$/;
  return ugandanPhoneRegex.test(phoneNumber);
};

// Normalize phone number to +256XXXXXXXXX format
const normalizePhoneNumber = (phoneNumber) => {
  let normalized = phoneNumber.replace(/[\s\-()]/g, ''); // Remove spaces, hyphens, parentheses

  // Add +256 if not present
  if (normalized.startsWith('0') && normalized.length === 10) {
    normalized = '+256' + normalized.substring(1);
  } else if (normalized.startsWith('256') && normalized.length === 12) {
    normalized = '+' + normalized;
  }

  return normalized;
};

// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Class validation
const validateClass = (classLevel) => {
  const validClasses = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
  return validClasses.includes(classLevel?.toUpperCase());
};

// Referral code validation
const validateReferralCode = (code) => {
  const referralRegex = /^TUG[A-Z0-9]{6}$/;
  return referralRegex.test(code?.toUpperCase());
};

// OTP validation
const validateOTP = (otp) => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

// Validation functions that throw errors
const validateUserRegistrationData = (data) => {
  const errors = [];

  if (!data.phoneNumber) {
    errors.push('Phone number is required');
  } else if (!validatePhoneNumber(data.phoneNumber)) {
    errors.push('Invalid Ugandan phone number format');
  }

  if (data.email && !validateEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.firstName?.trim()) {
    errors.push('First name is required');
  }

  if (!data.lastName?.trim()) {
    errors.push('Last name is required');
  }

  if (!data.currentClass) {
    errors.push('Current class is required');
  } else if (!validateClass(data.currentClass)) {
    errors.push('Invalid class level');
  }

  if (data.referralCode && !validateReferralCode(data.referralCode)) {
    errors.push('Invalid referral code format');
  }

  if (errors.length > 0) {
    const error = new Error('Validation failed');
    error.details = errors;
    throw error;
  }

  return true;
};

const validateOTPVerification = (data) => {
  const errors = [];

  if (!data.phoneNumber) {
    errors.push('Phone number is required');
  }

  if (!data.otpCode) {
    errors.push('OTP code is required');
  } else if (!validateOTP(data.otpCode)) {
    errors.push('OTP must be 6 digits');
  }

  if (errors.length > 0) {
    const error = new Error('OTP verification failed');
    error.details = errors;
    throw error;
  }

  return true;
};

// Sanitize input functions
const sanitizeString = (str, maxLength = null) => {
  if (!str) return str;
  let sanitized = str.trim();
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  return sanitized;
};

const sanitizeUserInput = (data) => {
  const sanitized = {};

  if (data.phoneNumber) {
    sanitized.phoneNumber = normalizePhoneNumber(data.phoneNumber);
  }

  if (data.firstName) {
    sanitized.firstName = sanitizeString(data.firstName, 100);
  }

  if (data.lastName) {
    sanitized.lastName = sanitizeString(data.lastName, 100);
  }

  if (data.currentClass) {
    sanitized.currentClass = data.currentClass.toUpperCase();
  }

  if (data.schoolName) {
    sanitized.schoolName = sanitizeString(data.schoolName, 255);
  }

  if (data.region) {
    sanitized.region = sanitizeString(data.region, 100);
  }

  if (data.referralCode) {
    sanitized.referralCode = data.referralCode.toUpperCase();
  }

  return sanitized;
};

module.exports = {
  validatePhoneNumber,
  normalizePhoneNumber,
  validateEmail,
  validateClass,
  validateReferralCode,
  validateOTP,
  validateUserRegistrationData,
  validateOTPVerification,
  sanitizeString,
  sanitizeUserInput
};
