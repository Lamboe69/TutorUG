const AfricasTalking = require('africa-talking');
const { getEnvConfig } = require('../config/env');

// Initialize Africa's Talking
const africasTalking = AfricasTalking({
  apiKey: getEnvConfig().AT_API_KEY,
  username: getEnvConfig().AT_USERNAME || 'tutorUG'
});

// SMS service functions
const sms = africasTalking.SMS;

// Send OTP SMS
async function sendOTP(phoneNumber, otpCode) {
  try {
    // Format phone number for Uganda
    const formattedNumber = formatPhoneNumber(phoneNumber);

    const message = `Your TutorUG verification code is: ${otpCode}. Valid for 5 minutes.`;

    const result = await sms.send({
      to: [formattedNumber],
      message: message,
      from: 'TutorUG' // Your registered sender ID
    });

    console.log(`📱 OTP SMS sent to ${formattedNumber}:`, result);

    return {
      success: true,
      messageId: result.SMSMessageData?.Recipients?.[0]?.messageId,
      cost: result.SMSMessageData?.Recipients?.[0]?.cost
    };

  } catch (error) {
    console.error('SMS OTP send error:', error);
    throw new Error(`Failed to send OTP SMS: ${error.message}`);
  }
}

// Send welcome SMS to new users
async function sendWelcomeSMS(user) {
  try {
    const formattedNumber = formatPhoneNumber(user.phoneNumber);

    const message = `Welcome to TutorUG, ${user.firstName}! 🎓 Your 7-day free trial starts now. Access Mathematics, Physics, Chemistry & more. Visit tutoruganda.com to start learning!`;

    const result = await sms.send({
      to: [formattedNumber],
      message: message,
      from: 'TutorUG'
    });

    console.log(`🎉 Welcome SMS sent to ${user.firstName}:`, result);

    return {
      success: true,
      messageId: result.SMSMessageData?.Recipients?.[0]?.messageId
    };

  } catch (error) {
    console.error('Welcome SMS error:', error);
    // Don't throw - welcome SMS is not critical
    return { success: false, error: error.message };
  }
}

// Send subscription confirmation SMS
async function sendSubscriptionConfirmationSMS(user, plan) {
  try {
    const formattedNumber = formatPhoneNumber(user.phoneNumber);

    const endDate = user.subscriptionEndDate?.toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const message = `🎉 Payment confirmed! Your ${plan.name} is now active until ${endDate}. Thank you for choosing TutorUG! Access all subjects at tutoruganda.com`;

    const result = await sms.send({
      to: [formattedNumber],
      message: message,
      from: 'TutorUG'
    });

    console.log(`💰 Subscription confirmation SMS sent to ${user.firstName}:`, result);

    return {
      success: true,
      messageId: result.SMSMessageData?.Recipients?.[0]?.messageId
    };

  } catch (error) {
    console.error('Subscription confirmation SMS error:', error);
    return { success: false, error: error.message };
  }
}

// Send renewal reminder SMS
async function sendRenewalReminderSMS(user) {
  try {
    const formattedNumber = formatPhoneNumber(user.phoneNumber);

    const endDate = user.subscriptionEndDate?.toLocaleDateString('en-UG', {
      month: 'long',
      day: 'numeric'
    });

    const message = `📅 Reminder: Your TutorUG subscription expires on ${endDate}. Renew now to keep learning! Visit tutoruganda.com/subscribe`;

    const result = await sms.send({
      to: [formattedNumber],
      message: message,
      from: 'TutorUG'
    });

    console.log(`⏰ Renewal reminder SMS sent to ${user.firstName}:`, result);

    return {
      success: true,
      messageId: result.SMSMessageData?.Recipients?.[0]?.messageId
    };

  } catch (error) {
    console.error('Renewal reminder SMS error:', error);
    return { success: false, error: error.message };
  }
}

// Send subscription expired SMS
async function sendSubscriptionExpiredSMS(user) {
  try {
    const formattedNumber = formatPhoneNumber(user.phoneNumber);

    const message = `⏰ Your TutorUG subscription has expired. Renew today to continue your learning journey! Visit tutoruganda.com/subscribe for special offers.`;

    const result = await sms.send({
      to: [formattedNumber],
      message: message,
      from: 'TutorUG'
    });

    console.log(`🚫 Subscription expired SMS sent to ${user.firstName}:`, result);

    return {
      success: true,
      messageId: result.SMSMessageData?.Recipients?.[0]?.messageId
    };

  } catch (error) {
    console.error('Subscription expired SMS error:', error);
    return { success: false, error: error.message };
  }
}

// Send cancellation confirmation SMS
async function sendCancellationConfirmationSMS(user) {
  try {
    const formattedNumber = formatPhoneNumber(user.phoneNumber);

    const endDate = user.subscriptionEndDate?.toLocaleDateString('en-UG', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const message = `✅ Subscription cancelled. You'll have access until ${endDate}. Thank you for being part of TutorUG! You can resubscribe anytime at tutoruganda.com`;

    const result = await sms.send({
      to: [formattedNumber],
      message: message,
      from: 'TutorUG'
    });

    console.log(`🚪 Cancellation confirmation SMS sent to ${user.firstName}:`, result);

    return {
      success: true,
      messageId: result.SMSMessageData?.Recipients?.[0]?.messageId
    };

  } catch (error) {
    console.error('Cancellation confirmation SMS error:', error);
    return { success: false, error: error.message };
  }
}

// Send study reminder SMS
async function sendStudyReminderSMS(user, subjectName = null) {
  try {
    const formattedNumber = formatPhoneNumber(user.phoneNumber);

    let message = `📚 Time to study! Keep your learning streak alive. `;

    if (subjectName) {
      message += `How about practicing some ${subjectName} today? `;
    }

    message += `Open TutorUG and continue your progress! tutoruganda.com`;

    const result = await sms.send({
      to: [formattedNumber],
      message: message,
      from: 'TutorUG'
    });

    console.log(`📖 Study reminder SMS sent to ${user.firstName}:`, result);

    return {
      success: true,
      messageId: result.SMSMessageData?.Recipients?.[0]?.messageId
    };

  } catch (error) {
    console.error('Study reminder SMS error:', error);
    return { success: false, error: error.message };
  }
}

// Send achievement notification SMS
async function sendAchievementSMS(user, achievement) {
  try {
    const formattedNumber = formatPhoneNumber(user.phoneNumber);

    const message = `🎉 Congratulations ${user.firstName}! You've earned: "${achievement}". Keep up the great work! 🌟 #TutorUG`;

    const result = await sms.send({
      to: [formattedNumber],
      message: message,
      from: 'TutorUG'
    });

    console.log(`🏆 Achievement SMS sent to ${user.firstName}:`, result);

    return {
      success: true,
      messageId: result.SMSMessageData?.Recipients?.[0]?.messageId
    };

  } catch (error) {
    console.error('Achievement SMS error:', error);
    return { success: false, error: error.message };
  }
}

// Send promotional SMS (admin feature)
async function sendBulkSMS(phoneNumbers, message) {
  try {
    const formattedNumbers = phoneNumbers.map(num => formatPhoneNumber(num));

    const result = await sms.send({
      to: formattedNumbers,
      message: message,
      from: 'TutorUG'
    });

    console.log(`📢 Bulk SMS sent to ${formattedNumbers.length} recipients:`, result);

    return {
      success: true,
      recipients: result.SMSMessageData?.Recipients?.length || 0,
      cost: result.SMSMessageData?.Recipients?.reduce((total, r) => total + parseFloat(r.cost || 0), 0)
    };

  } catch (error) {
    console.error('Bulk SMS error:', error);
    throw new Error(`Bulk SMS failed: ${error.message}`);
  }
}

// Get SMS delivery reports
async function getDeliveryReports(messageId = null) {
  try {
    // Africa's Talking provides delivery reports via webhooks
    // This would be implemented with webhook handling
    // For now, return a placeholder
    return {
      messageId,
      status: 'delivered', // This would come from webhooks
      deliveredAt: new Date()
    };
  } catch (error) {
    console.error('Delivery report error:', error);
    throw new Error('Failed to get delivery reports');
  }
}

// Utility function to format phone numbers for Uganda
function formatPhoneNumber(phoneNumber) {
  // Remove any non-numeric characters
  let cleaned = phoneNumber.replace(/\D/g, '');

  // Handle different formats
  if (cleaned.startsWith('256')) {
    // Already in international format
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    // Local format, convert to international
    return `+256${cleaned.substring(1)}`;
  } else if (cleaned.length === 9) {
    // Just the local number without 0
    return `+256${cleaned}`;
  } else {
    // Assume it's already properly formatted
    return phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
  }
}

// Check SMS balance
async function getSMSBalance() {
  try {
    const airtime = africasTalking.AIRTIME;
    // This would require implementing airtime balance checking
    // For now, return a placeholder
    return {
      balance: 'Check via Africa\'s Talking dashboard',
      currency: 'UGX'
    };
  } catch (error) {
    console.error('SMS balance check error:', error);
    throw new Error('Failed to check SMS balance');
  }
}

module.exports = {
  sendOTP,
  sendWelcomeSMS,
  sendSubscriptionConfirmationSMS,
  sendRenewalReminderSMS,
  sendSubscriptionExpiredSMS,
  sendCancellationConfirmationSMS,
  sendStudyReminderSMS,
  sendAchievementSMS,
  sendBulkSMS,
  getDeliveryReports,
  getSMSBalance,
  formatPhoneNumber
};
