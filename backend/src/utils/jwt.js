const jwt = require('jsonwebtoken');
const { getEnvConfig } = require('../config/env');

// Generate JWT token
const generateToken = (payload, expiresIn = null) => {
  const secret = getEnvConfig().JWT_SECRET;
  const expiration = expiresIn || getEnvConfig().JWT_EXPIRES_IN;

  return jwt.sign(payload, secret, { expiresIn: expiration });
};

// Generate refresh token (longer expiry)
const generateRefreshToken = (payload) => {
  const secret = getEnvConfig().JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: '30d' });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const secret = getEnvConfig().JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Generate user token payload
const generateUserToken = (user) => {
  return {
    user_id: user.id,
    phone_number: user.phoneNumber,
    subscription_status: user.subscriptionStatus,
    subscription_end: user.subscriptionEndDate,
    iat: Math.floor(Date.now() / 1000)
  };
};

// Extract token from Authorization header
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header');
  }

  return authHeader.substring(7); // Remove "Bearer " prefix
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    const payload = verifyToken(token);

    // Add user info to request
    req.user = {
      id: payload.user_id,
      phoneNumber: payload.phone_number,
      subscriptionStatus: payload.subscription_status,
      subscriptionEnd: payload.subscription_end
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

// Check subscription status middleware
const requireActiveSubscription = (req, res, next) => {
  const { subscriptionStatus, subscriptionEnd } = req.user;

  if (subscriptionStatus === 'trial' || subscriptionStatus === 'active') {
    // Check if trial/subscription is still active
    if (subscriptionEnd && new Date(subscriptionEnd) <= new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Subscription expired. Please renew your subscription.'
      });
    }
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Active subscription required'
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = extractTokenFromHeader(authHeader);
      const payload = verifyToken(token);

      req.user = {
        id: payload.user_id,
        phoneNumber: payload.phone_number,
        subscriptionStatus: payload.subscription_status,
        subscriptionEnd: payload.subscription_end
      };
    }
  } catch (error) {
    // Silently ignore auth errors for optional auth
  }
  next();
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  generateUserToken,
  extractTokenFromHeader,
  authenticateToken,
  requireActiveSubscription,
  optionalAuth
};
