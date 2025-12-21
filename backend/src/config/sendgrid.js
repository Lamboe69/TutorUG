const sgMail = require('@sendgrid/mail');
const { getEnvConfig } = require('./env');

const env = getEnvConfig();

if (env.SENDGRID_API_KEY) {
  sgMail.setApiKey(env.SENDGRID_API_KEY);
}

const SENDGRID_CONFIG = {
  from: {
    email: process.env.SENDGRID_FROM_EMAIL || 'noreply@tutoruganda.com',
    name: process.env.SENDGRID_FROM_NAME || 'TutorUG',
  },
};

module.exports = { sgMail, SENDGRID_CONFIG };
