/**
 * Socket.io Chat Handler
 * Manages real-time chat events between students and AI tutor.
 */

const { getAITutorResponse } = require('../services/aiService');
const { ChatSession, ChatMessage } = require('../models');

module.exports = function setupChatHandler(io, socket) {
  // Student joins a chat session
  socket.on('join-chat-session', async (sessionId) => {
    socket.join(`chat_${sessionId}`);
    console.log(`User ${socket.id} joined session ${sessionId}`);

    socket.emit('session-joined', { success: true, sessionId });
  });

  // Student sends a message
  socket.on('chat-message', async (data) => {
    try {
      const { sessionId, userId, message } = data;

      // Store user message in DB
      const userMsg = await ChatMessage.create({
        sessionId,
        userId,
        content: message,
        role: 'user'
      });

      // Broadcast user message to session
      io.to(`chat_${sessionId}`).emit('message-received', {
        id: userMsg.id,
        role: 'user',
        content: message,
        timestamp: userMsg.createdAt
      });

      // Get AI response
      const session = await ChatSession.findByPk(sessionId);
      const user = await require('../models').User.findByPk(userId);

      const aiResult = await getAITutorResponse(message, user, session);

      // Store AI response in DB
      const aiMsg = await ChatMessage.create({
        sessionId,
        userId,
        content: aiResult.response,
        role: 'assistant',
        tokensUsed: aiResult.tokensUsed,
        model: aiResult.modelUsed,
        responseTimeMs: aiResult.responseTimeMs
      });

      // Broadcast AI response to session
      io.to(`chat_${sessionId}`).emit('message-received', {
        id: aiMsg.id,
        role: 'assistant',
        content: aiResult.response,
        tokensUsed: aiResult.tokensUsed,
        timestamp: aiMsg.createdAt
      });
    } catch (err) {
      console.error('Chat message error:', err);
      socket.emit('chat-error', { message: 'Failed to process message' });
    }
  });

  // Student types indicator
  socket.on('typing', (data) => {
    const { sessionId, userId } = data;
    io.to(`chat_${sessionId}`).emit('user-typing', { userId });
  });

  // Stop typing
  socket.on('stop-typing', (data) => {
    const { sessionId, userId } = data;
    io.to(`chat_${sessionId}`).emit('user-stopped-typing', { userId });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
};
