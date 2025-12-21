const { sms, SMS_CONFIG } = require('../src/config/africastalking');

async function main() {
  const to = process.env.TEST_PHONE;
  if (!to) {
    console.error('Please set TEST_PHONE in your environment (e.g. +2567...)');
    process.exit(2);
  }

  try {
    const res = await sms.send({
      to: [to],
      message: SMS_CONFIG.templates.otp('123456'),
      from: SMS_CONFIG.senderId,
    });

    console.log('SMS send result:', res);
  } catch (err) {
    console.error('SMS test failed:', err.message || err);
    process.exitCode = 2;
  }
}

if (require.main === module) main();
