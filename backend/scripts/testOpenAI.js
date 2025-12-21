const { openai } = require('../src/config/openai');

async function main() {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a short assistant.' },
        { role: 'user', content: 'Say hello in one sentence.' }
      ],
      max_tokens: 40,
    });

    const text = completion.choices?.[0]?.message?.content;
    console.log('AI reply:', text);
  } catch (err) {
    console.error('OpenAI test failed:', err.message || err);
    process.exitCode = 2;
  }
}

if (require.main === module) main();
