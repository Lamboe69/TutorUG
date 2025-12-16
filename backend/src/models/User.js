const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  phoneNumber: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true,
    field: 'phone_number'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'password_hash'
  },

  // Profile Info
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'last_name'
  },
  currentClass: {
    type: DataTypes.STRING(10),
    allowNull: false,
    field: 'current_class'
  },
  schoolName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'school_name'
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  // Account Status
  accountStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active',
    field: 'account_status'
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'email_verified'
  },
  phoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Since we verify via OTP
    field: 'phone_verified'
  },

  // Subscription
  subscriptionStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'trial',
    field: 'subscription_status'
  },
  subscriptionPlan: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'subscription_plan'
  },
  subscriptionStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'subscription_start_date'
  },
  subscriptionEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'subscription_end_date'
  },
  trialEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'trial_end_date'
  },

  // Preferences
  preferredLanguage: {
    type: DataTypes.STRING(10),
    defaultValue: 'en',
    field: 'preferred_language'
  },
  notificationEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'notification_enabled'
  },
  emailNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'email_notifications'
  },
  smsNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'sms_notifications'
  },

  // Metadata
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  },
  loginCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'login_count'
  },

  // Referral System
  referralCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    field: 'referral_code'
  },
  referredBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'referred_by'
  },

  // Parent Access
  parentPhone: {
    type: DataTypes.STRING(15),
    allowNull: true,
    field: 'parent_phone'
  },
  parentEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'parent_email'
  },
  parentAccessEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'parent_access_enabled'
  },
  parentAccessCode: {
    type: DataTypes.STRING(6),
    allowNull: true,
    field: 'parent_access_code'
  }
}, {
  tableName: 'users',
  indexes: [
    { fields: ['phone_number'] },
    { fields: ['email'] },
    { fields: ['subscription_status'] },
    { fields: ['current_class'] },
    { fields: ['referral_code'] }
  ]
});

// Instance methods
User.prototype.checkPassword = async function(password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

User.prototype.hashPassword = async function(password) {
  const saltRounds = 12;
  this.passwordHash = await bcrypt.hash(password, saltRounds);
};

User.prototype.updateLoginStats = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
};

User.prototype.isTrialActive = function() {
  if (!this.trialEndDate) return false;
  return this.trialEndDate > new Date();
};

User.prototype.isSubscriptionActive = function() {
  if (!this.subscriptionEndDate) return false;
  return this.subscriptionEndDate > new Date();
};

// Class methods
User.generateReferralCode = function() {
  return 'TUG' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

User.findByPhoneNumber = function(phoneNumber) {
  return this.findOne({ where: { phoneNumber } });
};

User.findByReferralCode = function(referralCode) {
  return this.findOne({ where: { referralCode } });
};

// Hooks
User.beforeCreate(async (user) => {
  if (!user.referralCode) {
    user.referralCode = User.generateReferralCode();
  }
});

User.beforeUpdate(async (user) => {
  // Hash password if it's being set
  if (user.changed('passwordHash') && user.passwordHash && !user.passwordHash.startsWith('$2a$')) {
    const saltRounds = 12;
    user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
  }
});

module.exports = User;
