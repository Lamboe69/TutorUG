// Environment validation and setup
const requiredEnvVars = [
  'JWT_SECRET',
  'DB_NAME',
  'OPENAI_API_KEY'
];

const optionalEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_PASSWORD',
  'REDIS_DB',
  'FRONTEND_URL',
  'FLUTTERWAVE_PUBLIC_KEY',
  'FLUTTERWAVE_SECRET_KEY',
  'AT_API_KEY',
  'AT_USERNAME',
  'SENDGRID_API_KEY'
];

// Validate required environment variables
const validateEnv = () => {
  const missing = requiredEnvVars.filter(variable => !process.env[variable]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Check if we're in production and missing optional variables
  if (process.env.NODE_ENV === 'production') {
    const missingOptional = optionalEnvVars.filter(variable => !process.env[variable]);
    if (missingOptional.length > 0) {
      console.warn(`Missing optional environment variables in production: ${missingOptional.join(', ')}`);
    }
  }

  return true;
};

// Get environment configuration
const getEnvConfig = () => {
  return {
    // Server
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT) || 3000,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

    // Database
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT) || 5432,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || '',

    // Redis
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(process.env.REDIS_PORT) || 6379,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || null,
    REDIS_DB: parseInt(process.env.REDIS_DB) || 0,

    // JWT
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    // OpenAI
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',

    // Payment
    FLUTTERWAVE_PUBLIC_KEY: process.env.FLUTTERWAVE_PUBLIC_KEY,
    FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY,

    // SMS
    AT_API_KEY: process.env.AT_API_KEY,
    AT_USERNAME: process.env.AT_USERNAME,

    // Email
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,

    // Subscription
    TRIAL_DURATION_DAYS: parseInt(process.env.TRIAL_DURATION_DAYS) || 7,
    MAX_DAILY_QUESTIONS_FREE: parseInt(process.env.MAX_DAILY_QUESTIONS_FREE) || 10,
    MAX_DAILY_QUESTIONS_PAID: parseInt(process.env.MAX_DAILY_QUESTIONS_PAID) || 999,
  };
};

module.exports = {
  validateEnv,
  getEnvConfig,
  requiredEnvVars,
  optionalEnvVars
};
