jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test AI reply' } }],
          usage: { total_tokens: 10 },
          model: 'gpt-4o-mini'
        })
      }
    },
    moderations: { create: jest.fn().mockResolvedValue({ results: [{ flagged: false, categories: {}, category_scores: {} }] }) }
  }));
});

// Mock ChatMessage model to avoid DB access
jest.mock('../src/models/ChatMessage', () => ({ findAll: jest.fn().mockResolvedValue([]) }));

const aiService = require('../src/services/aiService');

describe('AI Service', () => {
  test('getAITutorResponse returns AI response object', async () => {
    const result = await aiService.getAITutorResponse('What is 2+2?', null, { id: 'session1' });

    expect(result).toBeDefined();
    expect(result.response).toBe('Test AI reply');
    expect(result.tokensUsed).toBe(10);
    expect(result.modelUsed).toBe('gpt-4o-mini');
  });
});
