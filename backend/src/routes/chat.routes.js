const express = require('express');
const router = express.Router();
const {
  startChatSession,
  sendMessage,
  getSessionMessages,
  getActiveSessions,
  endChatSession,
  generateProblems,
  getTopicSummary,
  analyzeUnderstanding,
  markMessageHelpful,
  getChatStats,
  handleStudentInterruption,
  guideProjectIdea,
  checkProjectOriginalityEndpoint,
  generateProjectImplementationSteps
} = require('../controllers/chatController');
const { authenticateToken, requireActiveSubscription } = require('../utils/jwt');

// All chat routes require authentication
router.use(authenticateToken);

// Start new chat session
router.post('/sessions', startChatSession);

// Get user's active chat sessions
router.get('/sessions/active', getActiveSessions);

// Get chat statistics
router.get('/stats', getChatStats);

// Send message in a chat session
router.post('/sessions/:sessionId/messages', sendMessage);

// Get messages for a chat session
router.get('/sessions/:sessionId/messages', getSessionMessages);

// End a chat session
router.post('/sessions/:sessionId/end', endChatSession);

// Generate practice problems for a topic
router.get('/topics/:topicId/problems', generateProblems);

// Get topic summary
router.get('/topics/:topicId/summary', getTopicSummary);

// Analyze student understanding from chat session
router.get('/sessions/:sessionId/analysis', analyzeUnderstanding);

// Mark message as helpful
router.post('/messages/:messageId/helpful', markMessageHelpful);

// Handle student interruptions during explanations
router.post('/sessions/:sessionId/interrupt', handleStudentInterruption);

// Guide student project development
router.post('/sessions/:sessionId/project-guide', guideProjectIdea);

// Check project originality
router.post('/project/check-originality', checkProjectOriginalityEndpoint);

// Generate project implementation steps
router.post('/project/implementation-steps', generateProjectImplementationSteps);

module.exports = router;
