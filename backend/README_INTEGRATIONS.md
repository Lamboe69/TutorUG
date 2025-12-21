# Integration Tests & Quick Checks

This file contains quick steps to verify integrations in `backend/` during development.

Prerequisites

- Copy `.env.example` to `.env` and set required keys: `OPENAI_API_KEY`, `AT_API_KEY`, `AT_USERNAME`, `FLUTTERWAVE_PUBLIC_KEY`, `FLUTTERWAVE_SECRET_KEY`, `SENDGRID_API_KEY` as needed.
- Install dependencies:

```bash
cd backend
npm install
```

Test OpenAI connectivity

```bash
# ensure OPENAI_API_KEY is set in your environment or .env
node scripts/testOpenAI.js
```

Test Africa's Talking SMS (use sandbox credentials)

```bash
# set TEST_PHONE env var to a phone number you control (e.g. +25677xxxxxxx)
node scripts/testSMS.js
```

Notes

- `ttsService.js` is a placeholder that writes a marker file to `public/audio/`. Replace with a proper TTS provider for production.
- Webhook verification uses `src/middleware/webhookAuth.js` and raw body capture enabled in `src/app.js`.
