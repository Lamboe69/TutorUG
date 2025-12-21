const OpenAI = require('openai');
const { getEnvConfig } = require('./env');

const env = getEnvConfig();

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const SYSTEM_PROMPTS = {
  general: `You are TutorUG, an AI tutor for Ugandan O-Level students. Use local examples, explain step-by-step, and be encouraging.`,
  mathematics: `You are a Math tutor for Ugandan O-Level students. Use market/transport examples and show step-by-step solutions.`,
};

module.exports = {
  openai,
  SYSTEM_PROMPTS,
};
