const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OtpVerification = sequelize.define('OtpVerification', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  phoneNumber: {
    type: DataTypes.STRING(15),
    allowNull: false,
    field: 'phone_number'
  },
  otpCode: {
    type: DataTypes.STRING(6),
    allowNull: false,
    field: 'otp_code'
  },
  purpose: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'login' // login, registration, reset_password
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'otp_verifications',
  indexes: [
    { fields: ['phone_number'] },
    { fields: ['expires_at'] },
    { fields: ['otp_code'] }
  ],
  timestamps: true
});

// Instance methods
OtpVerification.prototype.isExpired = function() {
  return new Date() > this.expiresAt;
};

OtpVerification.prototype.canAttempt = function() {
  return this.attempts < 3; // Max 3 attempts
};

OtpVerification.prototype.incrementAttempts = function() {
  this.attempts += 1;
};

OtpVerification.prototype.markAsVerified = function() {
  this.verified = true;
};

// Class methods
OtpVerification.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

OtpVerification.createVerification = async function(phoneNumber, purpose = 'login') {
  // Clean up expired verifications for this phone number
  await this.destroy({
    where: {
      phoneNumber,
      expiresAt: { [require('sequelize').Op.lt]: new Date() }
    }
  });

  // Check if there are recent verifications (prevent spam)
  const recent = await this.findOne({
    where: {
      phoneNumber,
      createdAt: { [require('sequelize').Op.gte]: new Date(Date.now() - 60000) } // Last minute
    }
  });

  if (recent) {
    throw new Error('Please wait before requesting another OTP');
  }

  const otpCode = this.generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  return this.create({
    phoneNumber,
    otpCode,
    purpose,
    expiresAt
  });
};

OtpVerification.verifyOTP = async function(phoneNumber, otpCode) {
  const verification = await this.findOne({
    where: {
      phoneNumber,
      otpCode,
      verified: false
    }
  });

  if (!verification) {
    throw new Error('Invalid OTP');
  }

  if (verification.isExpired()) {
    await verification.destroy();
    throw new Error('OTP has expired');
  }

  if (!verification.canAttempt()) {
    throw new Error('Too many failed attempts');
  }

  verification.markAsVerified();
  await verification.save();

  return verification;
};

OtpVerification.findActive = function(phoneNumber, purpose = null) {
  const whereClause = {
    phoneNumber,
    verified: false,
    expiresAt: { [require('sequelize').Op.gt]: new Date() }
  };

  if (purpose) {
    whereClause.purpose = purpose;
  }

  return this.findOne({
    where: whereClause,
    order: [['createdAt', 'DESC']]
  });
};

// Cleanup expired verifications (call this periodically)
OtpVerification.cleanupExpired = function() {
  return this.destroy({
    where: {
      expiresAt: { [require('sequelize').Op.lt]: new Date() }
    }
  });
};

module.exports = OtpVerification;
