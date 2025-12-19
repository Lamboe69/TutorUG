const sgMail = require('@sendgrid/mail');
const { getEnvConfig } = require('../config/env');

// Initialize SendGrid
sgMail.setApiKey(getEnvConfig().SENDGRID_API_KEY);

// Email templates
const EMAIL_TEMPLATES = {
  welcome: {
    subject: '🎓 Welcome to TutorUG - Your AI-Powered Learning Journey Begins!',
    template: (user) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to TutorUG</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    .highlight { background: #f0f8ff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Welcome to TutorUG!</h1>
      <p>Your AI-powered path to UNEB excellence starts now</p>
    </div>
    <div class="content">
      <h2>Hello ${user.firstName}! 👋</h2>

      <p>Thank you for joining <strong>TutorUG</strong> - Uganda's premier AI-powered education platform! We're excited to help you excel in your UNEB examinations and achieve your academic goals.</p>

      <div class="highlight">
        <h3>🚀 Your 7-Day Free Trial is Active!</h3>
        <p>You now have full access to:</p>
        <ul>
          <li>🤖 AI Tutor for Mathematics, Physics, Chemistry & Biology</li>
          <li>📚 Complete UNEB syllabus coverage</li>
          <li>🎯 Practice quizzes and progress tracking</li>
          <li>🏆 Achievement system and leaderboards</li>
          <li>💬 Community discussions with fellow students</li>
        </ul>
      </div>

      <p><strong>How to get started:</strong></p>
      <ol>
        <li>Visit <a href="https://tutoruganda.com">tutoruganda.com</a></li>
        <li>Choose your subjects (we recommend starting with your challenging ones)</li>
        <li>Ask the AI tutor any questions - it understands Ugandan context!</li>
        <li>Complete practice quizzes to track your progress</li>
      </ol>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://tutoruganda.com" class="button">🚀 Start Learning Now</a>
      </div>

      <p><strong>Need help?</strong> Reply to this email or contact us at support@tutoruganda.com</p>

      <p>Welcome to the TutorUG family! 🌟<br>
      <strong>The TutorUG Team</strong></p>
    </div>
    <div class="footer">
      <p>TutorUG - Your AI-Powered Path to UNEB Excellence 🇺🇬</p>
      <p>support@tutoruganda.com | +256 XXX XXX XXX</p>
      <p>You received this email because you signed up for TutorUG.</p>
    </div>
  </div>
</body>
</html>`
  },

  subscriptionConfirmation: {
    subject: '🎉 Payment Confirmed - Welcome to Premium TutorUG!',
    template: (user, plan) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmed - TutorUG</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
    .receipt { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Payment Confirmed!</h1>
      <p>Welcome to Premium TutorUG</p>
    </div>
    <div class="content">
      <h2>Thank you, ${user.firstName}! 💚</h2>

      <p>Your payment has been successfully processed and your subscription is now active!</p>

      <div class="receipt">
        <h3>📄 Payment Receipt</h3>
        <p><strong>Plan:</strong> ${plan.name}</p>
        <p><strong>Amount:</strong> ${plan.amount.toLocaleString()} UGX</p>
        <p><strong>Duration:</strong> ${plan.durationMonths} month(s)</p>
        <p><strong>Valid Until:</strong> ${user.subscriptionEndDate?.toLocaleDateString('en-UG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Payment Method:</strong> Mobile Money</p>
      </div>

      <div style="background: #ecfdf5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
        <h3>🎁 What You Now Have Access To:</h3>
        <ul>
          <li>✅ Unlimited AI tutor questions (24/7)</li>
          <li>✅ All subjects: Mathematics, Physics, Chemistry, Biology, English</li>
          <li>✅ Unlimited practice quizzes and tests</li>
          <li>✅ Detailed progress analytics</li>
          <li>✅ Study groups and community features</li>
          <li>✅ Priority customer support</li>
          <li>✅ Downloadable study materials</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://tutoruganda.com/dashboard" class="button">🚀 Access Your Dashboard</a>
      </div>

      <p><strong>Questions about your subscription?</strong><br>
      Contact us at support@tutoruganda.com or WhatsApp: +256 XXX XXX XXX</p>

      <p>Thank you for choosing TutorUG! Together, we'll help you achieve UNEB excellence! 🌟</p>

      <p><strong>The TutorUG Team</strong></p>
    </div>
    <div class="footer">
      <p>TutorUG - Your AI-Powered Path to UNEB Excellence 🇺🇬</p>
      <p>support@tutoruganda.com | +256 XXX XXX XXX</p>
    </div>
  </div>
</body>
</html>`
  },

  renewalReminder: {
    subject: '📅 Your TutorUG Subscription Expires Soon - Renew Today!',
    template: (user) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Renewal Reminder - TutorUG</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
    .urgent { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Subscription Renewal Reminder</h1>
    </div>
    <div class="content">
      <h2>Hello ${user.firstName},</h2>

      <div class="urgent">
        <h3>⏰ Your TutorUG subscription expires on ${user.subscriptionEndDate?.toLocaleDateString('en-UG', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
        <p>Don't lose access to your AI tutor and study materials!</p>
      </div>

      <p>Your learning journey with TutorUG has been amazing, and we don't want it to end! Renew today to continue:</p>

      <ul>
        <li>🤖 Getting instant help from our AI tutor</li>
        <li>📚 Accessing all your study materials</li>
        <li>🎯 Tracking your progress and achievements</li>
        <li>💬 Participating in study groups</li>
        <li>🏆 Maintaining your leaderboard position</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://tutoruganda.com/subscribe" class="button">🔄 Renew Subscription</a>
      </div>

      <p><strong>Current Plan:</strong> ${user.subscriptionPlan === 'annual' ? 'Annual Plan (250,000 UGX/year)' : 'Monthly Plan (25,000 UGX/month)'}</p>

      <p><strong>Need help?</strong> Contact us at support@tutoruganda.com</p>

      <p>Keep learning, keep growing! 📈<br>
      <strong>The TutorUG Team</strong></p>
    </div>
    <div class="footer">
      <p>TutorUG - Your AI-Powered Path to UNEB Excellence 🇺🇬</p>
      <p>support@tutoruganda.com | +256 XXX XXX XXX</p>
    </div>
  </div>
</body>
</html>`
  },

  achievement: {
    subject: '🎉 Congratulations! You\'ve Earned a New Achievement in TutorUG!',
    template: (user, achievement) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Achievement - TutorUG</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
    .achievement { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 10px; text-align: center; margin: 20px 0; border: 2px solid #f59e0b; }
    .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 New Achievement Unlocked!</h1>
    </div>
    <div class="content">
      <h2>Congratulations, ${user.firstName}! 🏆</h2>

      <div class="achievement">
        <h1 style="font-size: 48px; margin: 10px 0;">${achievement.icon || '🏆'}</h1>
        <h3 style="color: #92400e; margin: 15px 0;">${achievement.name}</h3>
        <p style="color: #78350f; font-size: 16px;">${achievement.description}</p>
      </div>

      <p>Amazing work! You've demonstrated dedication and excellence in your studies. This achievement has been added to your profile and shared with the TutorUG community.</p>

      <p><strong>What you accomplished:</strong> ${achievement.criteria || 'Outstanding academic performance and consistent learning.'}</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://tutoruganda.com/achievements" class="button">📊 View All Achievements</a>
      </div>

      <p>Keep up the fantastic work! Your dedication to learning is inspiring others in the TutorUG community.</p>

      <p>🌟 <strong>The TutorUG Team</strong></p>
    </div>
    <div class="footer">
      <p>TutorUG - Your AI-Powered Path to UNEB Excellence 🇺🇬</p>
      <p>support@tutoruganda.com | +256 XXX XXX XXX</p>
    </div>
  </div>
</body>
</html>`
  }
};

// Send welcome email
async function sendWelcomeEmail(user) {
  try {
    const msg = {
      to: user.email,
      from: {
        email: 'welcome@tutoruganda.com',
        name: 'TutorUG Team'
      },
      subject: EMAIL_TEMPLATES.welcome.subject,
      html: EMAIL_TEMPLATES.welcome.template(user)
    };

    const result = await sgMail.send(msg);
    console.log(`📧 Welcome email sent to ${user.email}:`, result[0]?.statusCode);

    return {
      success: true,
      messageId: result[0]?.headers['x-message-id']
    };

  } catch (error) {
    console.error('Welcome email error:', error);
    return { success: false, error: error.message };
  }
}

// Send subscription confirmation email
async function sendSubscriptionConfirmationEmail(user, plan) {
  try {
    const msg = {
      to: user.email,
      from: {
        email: 'billing@tutoruganda.com',
        name: 'TutorUG Billing'
      },
      subject: EMAIL_TEMPLATES.subscriptionConfirmation.subject,
      html: EMAIL_TEMPLATES.subscriptionConfirmation.template(user, plan)
    };

    const result = await sgMail.send(msg);
    console.log(`💰 Subscription confirmation email sent to ${user.email}:`, result[0]?.statusCode);

    return {
      success: true,
      messageId: result[0]?.headers['x-message-id']
    };

  } catch (error) {
    console.error('Subscription confirmation email error:', error);
    return { success: false, error: error.message };
  }
}

// Send renewal reminder email
async function sendRenewalReminderEmail(user) {
  try {
    const msg = {
      to: user.email,
      from: {
        email: 'billing@tutoruganda.com',
        name: 'TutorUG Billing'
      },
      subject: EMAIL_TEMPLATES.renewalReminder.subject,
      html: EMAIL_TEMPLATES.renewalReminder.template(user)
    };

    const result = await sgMail.send(msg);
    console.log(`⏰ Renewal reminder email sent to ${user.email}:`, result[0]?.statusCode);

    return {
      success: true,
      messageId: result[0]?.headers['x-message-id']
    };

  } catch (error) {
    console.error('Renewal reminder email error:', error);
    return { success: false, error: error.message };
  }
}

// Send achievement notification email
async function sendAchievementEmail(user, achievement) {
  try {
    const msg = {
      to: user.email,
      from: {
        email: 'achievements@tutoruganda.com',
        name: 'TutorUG Achievements'
      },
      subject: EMAIL_TEMPLATES.achievement.subject,
      html: EMAIL_TEMPLATES.achievement.template(user, achievement)
    };

    const result = await sgMail.send(msg);
    console.log(`🏆 Achievement email sent to ${user.email}:`, result[0]?.statusCode);

    return {
      success: true,
      messageId: result[0]?.headers['x-message-id']
    };

  } catch (error) {
    console.error('Achievement email error:', error);
    return { success: false, error: error.message };
  }
}

// Send custom email (for newsletters, announcements, etc.)
async function sendCustomEmail(to, subject, htmlContent, from = null) {
  try {
    const msg = {
      to,
      from: from || {
        email: 'noreply@tutoruganda.com',
        name: 'TutorUG'
      },
      subject,
      html: htmlContent
    };

    const result = await sgMail.send(msg);
    console.log(`📧 Custom email sent to ${Array.isArray(to) ? to.join(', ') : to}:`, result[0]?.statusCode);

    return {
      success: true,
      messageId: result[0]?.headers['x-message-id']
    };

  } catch (error) {
    console.error('Custom email error:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

// Send bulk email (for newsletters)
async function sendBulkEmail(recipients, subject, htmlContent, personalization = null) {
  try {
    const messages = recipients.map(recipient => ({
      to: recipient.email,
      from: {
        email: 'newsletter@tutoruganda.com',
        name: 'TutorUG Newsletter'
      },
      subject,
      html: personalization ? personalizeContent(htmlContent, recipient, personalization) : htmlContent,
      // Add unsubscribe link
      html: (personalization ? personalizeContent(htmlContent, recipient, personalization) : htmlContent) +
            `<br><br><p style="font-size: 12px; color: #666;">
            You're receiving this because you're a TutorUG member.
            <a href="https://tutoruganda.com/unsubscribe?email=${recipient.email}">Unsubscribe</a>
            </p>`
    }));

    const results = await Promise.allSettled(
      messages.map(msg => sgMail.send(msg))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`📧 Bulk email sent: ${successful} successful, ${failed} failed`);

    return {
      success: true,
      total: recipients.length,
      successful,
      failed
    };

  } catch (error) {
    console.error('Bulk email error:', error);
    throw new Error(`Bulk email failed: ${error.message}`);
  }
}

// Personalize email content
function personalizeContent(template, recipient, personalization) {
  let content = template;
  Object.keys(personalization).forEach(key => {
    const placeholder = `{{${key}}}`;
    content = content.replace(new RegExp(placeholder, 'g'), personalization[key]);
  });
  return content.replace(/{{firstName}}/g, recipient.firstName || 'Student');
}

// Verify email configuration
async function verifyEmailSetup() {
  try {
    const result = await sgMail.send({
      to: 'test@tutoruganda.com', // This should be your email for testing
      from: 'test@tutoruganda.com',
      subject: 'TutorUG Email Configuration Test',
      text: 'Email service is configured correctly!'
    });

    return {
      success: true,
      status: 'Email service configured and working'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: 'Email service configuration issue'
    };
  }
}

module.exports = {
  sendWelcomeEmail,
  sendSubscriptionConfirmationEmail,
  sendRenewalReminderEmail,
  sendAchievementEmail,
  sendCustomEmail,
  sendBulkEmail,
  verifyEmailSetup,
  EMAIL_TEMPLATES
};
