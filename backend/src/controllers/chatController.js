const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const UserProgress = require('../models/UserProgress');
const {
  getAITutorResponse,
  generatePracticeProblems,
  analyzeStudentUnderstanding,
  generateTopicSummary,
  moderateContent,
  handleInterruption,
  guideProjectDevelopment,
  checkProjectOriginality,
  generateProjectSteps
} = require('../services/aiService');

// Start new chat session
const startChatSession = async (req, res) => {
  try {
    const { subjectId, topicId, sessionType = 'learning', title } = req.body;
    const userId = req.user.id;

    // Validate subject and topic if provided
    let subject = null;
    let topic = null;

    if (subjectId) {
      subject = await Subject.findByPk(subjectId);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }
    }

    if (topicId) {
      topic = await Topic.findByPk(topicId);
      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Topic not found'
        });
      }
    }

    // Generate title if not provided
    let sessionTitle = title;
    if (!sessionTitle) {
      if (topic) {
        sessionTitle = `${topic.title} - AI Tutor Session`;
      } else if (subject) {
        sessionTitle = `${subject.name} Practice Session`;
      } else {
        sessionTitle = 'General AI Tutor Session';
      }
    }

    // Create new chat session
    const session = await ChatSession.create({
      userId,
      subjectId: subject?.id,
      topicId: topic?.id,
      sessionType,
      title: sessionTitle
    });

    // Return session with context
    const sessionData = await ChatSession.findByPk(session.id, {
      include: [
        { model: Subject, as: 'subject' },
        { model: Topic, as: 'topic' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Chat session started successfully',
      data: {
        session: sessionData,
        welcomeMessage: generateWelcomeMessage(subject, topic)
      }
    });
  } catch (error) {
    console.error('Start chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start chat session',
      error: error.message
    });
  }
};

// Send message and get AI response
const sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, messageType = 'text' } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    // Verify session belongs to user and is active
    const session = await ChatSession.findOne({
      where: { id: sessionId, userId, isActive: true },
      include: [
        { model: Subject, as: 'subject' },
        { model: Topic, as: 'topic' }
      ]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Active chat session not found'
      });
    }

    // Moderate user message for safety
    const moderation = await moderateContent(message);
    if (moderation.isFlagged) {
      return res.status(400).json({
        success: false,
        message: 'Message contains inappropriate content. Please rephrase your question.'
      });
    }

    // Get user info for context
    const user = await require('../models/User').findByPk(userId);

    // Save user message
    const userMessage = await ChatMessage.create({
      sessionId,
      userId,
      role: 'user',
      content: message,
      contentType: messageType
    });

    // Update session message count
    await session.addMessage('user', message, 0);

    // Get AI response
    const aiResult = await getAITutorResponse(
      message,
      user,
      session,
      session.subject,
      session.topic
    );

    // Moderate AI response
    const aiModeration = await moderateContent(aiResult.response);
    let finalResponse = aiResult.response;

    if (aiModeration.isFlagged) {
      finalResponse = "I apologize, but I need to provide a more appropriate response. Could you please rephrase your question about the academic topic?";
    }

    // Save AI response
    const aiMessage = await ChatMessage.create({
      sessionId,
      userId,
      role: 'assistant',
      content: finalResponse,
      contentType: 'text',
      modelUsed: aiResult.modelUsed,
      tokensUsed: aiResult.tokensUsed,
      responseTimeMs: aiResult.responseTimeMs
    });

    // Update session with AI message
    await session.addMessage('assistant', finalResponse, aiResult.tokensUsed);

    // Update user progress if they're working on a specific topic
    if (session.topicId) {
      await updateProgressForTopic(userId, session.topicId, message, finalResponse);
    }

    res.status(200).json({
      success: true,
      data: {
        userMessage: {
          id: userMessage.id,
          content: userMessage.content,
          timestamp: userMessage.createdAt
        },
        aiMessage: {
          id: aiMessage.id,
          content: finalResponse,
          modelUsed: aiResult.modelUsed,
          tokensUsed: aiResult.tokensUsed,
          responseTimeMs: aiResult.responseTimeMs,
          timestamp: aiMessage.createdAt
        },
        session: {
          id: session.id,
          totalMessages: session.totalMessages,
          totalTokensUsed: session.totalTokensUsed
        }
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Get chat session messages
const getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;

    // Verify session belongs to user
    const session = await ChatSession.findOne({
      where: { id: sessionId, userId },
      include: [
        { model: Subject, as: 'subject' },
        { model: Topic, as: 'topic' }
      ]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Get messages
    const messages = await ChatMessage.getSessionMessages(sessionId, limit);

    res.status(200).json({
      success: true,
      data: {
        session: {
          id: session.id,
          title: session.title,
          subject: session.subject,
          topic: session.topic,
          startedAt: session.startedAt,
          isActive: session.isActive
        },
        messages,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: messages.length === parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get session messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
};

// Get user's active chat sessions
const getActiveSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const sessions = await ChatSession.findActiveByUser(userId);

    res.status(200).json({
      success: true,
      data: {
        sessions,
        totalCount: sessions.length
      }
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active sessions',
      error: error.message
    });
  }
};

// End chat session
const endChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    const session = await ChatSession.findOne({
      where: { id: sessionId, userId, isActive: true }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Active chat session not found'
      });
    }

    // End session
    session.endSession(rating);
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Chat session ended successfully',
      data: {
        session: {
          id: session.id,
          durationMinutes: session.getDurationMinutes(),
          totalMessages: session.totalMessages,
          totalTokensUsed: session.totalTokensUsed,
          satisfactionRating: session.satisfactionRating
        }
      }
    });
  } catch (error) {
    console.error('End chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end chat session',
      error: error.message
    });
  }
};

// Generate practice problems for a topic
const generateProblems = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { difficulty = 'intermediate', count = 5 } = req.query;
    const userId = req.user.id;

    const topic = await Topic.findByPk(topicId, {
      include: [{ model: Subject, as: 'subject' }]
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    const result = await generatePracticeProblems(topic, difficulty, parseInt(count));

    res.status(200).json({
      success: true,
      data: {
        topic: {
          id: topic.id,
          title: topic.title,
          subject: topic.subject?.name
        },
        problems: result.problems,
        metadata: {
          count: result.problems.length,
          difficulty,
          tokensUsed: result.tokensUsed
        }
      }
    });
  } catch (error) {
    console.error('Generate problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate practice problems',
      error: error.message
    });
  }
};

// Get topic summary
const getTopicSummary = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findByPk(topicId, {
      include: [{ model: Subject, as: 'subject' }]
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    const result = await generateTopicSummary(topic);

    res.status(200).json({
      success: true,
      data: {
        topic: {
          id: topic.id,
          title: topic.title,
          subject: topic.subject?.name
        },
        summary: result.summary,
        metadata: {
          tokensUsed: result.tokensUsed
        }
      }
    });
  } catch (error) {
    console.error('Get topic summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate topic summary',
      error: error.message
    });
  }
};

// Analyze student understanding
const analyzeUnderstanding = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { messageCount = 10 } = req.query;
    const userId = req.user.id;

    // Verify session belongs to user
    const session = await ChatSession.findOne({
      where: { id: sessionId, userId }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    const analysis = await analyzeStudentUnderstanding(sessionId, parseInt(messageCount));

    res.status(200).json({
      success: true,
      data: {
        sessionId,
        analysis,
        metadata: {
          messagesAnalyzed: messageCount,
          analysisTimestamp: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Analyze understanding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze understanding',
      error: error.message
    });
  }
};

// Mark message as helpful
const markMessageHelpful = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await ChatMessage.findOne({
      where: { id: messageId, userId }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.markAsHelpful();

    res.status(200).json({
      success: true,
      message: 'Message marked as helpful'
    });
  } catch (error) {
    console.error('Mark message helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as helpful',
      error: error.message
    });
  }
};

// Get chat statistics
const getChatStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const stats = await ChatSession.getUserStats(userId, parseInt(days));

    res.status(200).json({
      success: true,
      data: {
        stats,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get chat stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat statistics',
      error: error.message
    });
  }
};

// Helper functions
function generateWelcomeMessage(subject, topic) {
  let message = "Hello! I'm your AI tutor from TutorUG. I'm here to help you excel in your studies! 🎓\n\n";

  if (topic) {
    message += `I see you're working on "${topic.title}". `;
    message += "I'll use Ugandan examples and explain concepts step-by-step to help you understand.\n\n";
  } else if (subject) {
    message += `I see you're focusing on ${subject.name}. `;
    message += "I'll help you master this subject with clear explanations and practice.\n\n";
  } else {
    message += "I'm ready to help with Mathematics, Physics, Chemistry, Biology, and more!\n\n";
  }

  message += "What would you like to learn today? Feel free to ask any questions! 💪";

  return message;
}

async function updateProgressForTopic(userId, topicId, userMessage, aiResponse) {
  try {
    // Find or create progress record
    let progress = await UserProgress.findOrCreateProgress(userId, null); // We'll set subtopic later

    // Simple heuristic: if user is asking questions, mark as started
    if (userMessage.includes('?') || userMessage.toLowerCase().includes('how') ||
        userMessage.toLowerCase().includes('what') || userMessage.toLowerCase().includes('why')) {
      if (progress.status === 'not_started') {
        progress.markAsStarted();
        await progress.save();
      }
    }

    // Track time spent (rough estimate)
    const timeSpent = Math.max(30, Math.min(300, aiResponse.length / 10)); // 30-300 seconds
    await progress.addTimeSpent(timeSpent);

  } catch (error) {
    console.error('Error updating progress:', error);
    // Don't fail the chat if progress update fails
  }
}

// Handle student interruptions during explanations
const handleStudentInterruption = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { interruptionMessage, currentExplanation } = req.body;
    const userId = req.user.id;

    if (!interruptionMessage || interruptionMessage.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Interruption message cannot be empty'
      });
    }

    // Verify session belongs to user and is active
    const session = await ChatSession.findOne({
      where: { id: sessionId, userId, isActive: true },
      include: [
        { model: Subject, as: 'subject' },
        { model: Topic, as: 'topic' }
      ]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Active chat session not found'
      });
    }

    // Moderate interruption message
    const moderation = await moderateContent(interruptionMessage);
    if (moderation.isFlagged) {
      return res.status(400).json({
        success: false,
        message: 'Message contains inappropriate content. Please rephrase your concern.'
      });
    }

    // Get user info
    const user = await require('../models/User').findByPk(userId);

    // Save interruption message
    const userMessage = await ChatMessage.create({
      sessionId,
      userId,
      role: 'user',
      content: `[INTERRUPTION] ${interruptionMessage}`,
      contentType: 'text'
    });

    // Update session message count
    await session.addMessage('user', interruptionMessage, 0);

    // Handle the interruption
    const aiResult = await handleInterruption(
      interruptionMessage,
      currentExplanation || 'Currently explaining a concept',
      user,
      session,
      session.subject,
      session.topic
    );

    // Moderate AI response
    const aiModeration = await moderateContent(aiResult.response);
    let finalResponse = aiResult.response;

    if (aiModeration.isFlagged) {
      finalResponse = "I apologize, but I need to provide a more appropriate response. Could you please rephrase your question about the academic topic?";
    }

    // Save AI response
    const aiMessage = await ChatMessage.create({
      sessionId,
      userId,
      role: 'assistant',
      content: finalResponse,
      contentType: 'text',
      modelUsed: aiResult.modelUsed,
      tokensUsed: aiResult.tokensUsed,
      responseTimeMs: aiResult.responseTimeMs
    });

    // Update session with AI message
    await session.addMessage('assistant', finalResponse, aiResult.tokensUsed);

    res.status(200).json({
      success: true,
      data: {
        interruptionHandled: true,
        userMessage: {
          id: userMessage.id,
          content: interruptionMessage,
          timestamp: userMessage.createdAt
        },
        aiMessage: {
          id: aiMessage.id,
          content: finalResponse,
          modelUsed: aiResult.modelUsed,
          tokensUsed: aiResult.tokensUsed,
          responseTimeMs: aiResult.responseTimeMs,
          timestamp: aiMessage.createdAt
        },
        session: {
          id: session.id,
          totalMessages: session.totalMessages,
          totalTokensUsed: session.totalTokensUsed
        }
      }
    });
  } catch (error) {
    console.error('Handle interruption error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle interruption',
      error: error.message
    });
  }
};

// Guide student project development
const guideProjectIdea = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { projectIdea } = req.body;
    const userId = req.user.id;

    if (!projectIdea || projectIdea.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Project idea cannot be empty'
      });
    }

    // Verify session belongs to user and is active
    const session = await ChatSession.findOne({
      where: { id: sessionId, userId, isActive: true },
      include: [
        { model: Subject, as: 'subject' }
      ]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Active chat session not found'
      });
    }

    // Moderate project idea
    const moderation = await moderateContent(projectIdea);
    if (moderation.isFlagged) {
      return res.status(400).json({
        success: false,
        message: 'Project idea contains inappropriate content. Please rephrase.'
      });
    }

    // Get user info
    const user = await require('../models/User').findByPk(userId);

    // Save project idea message
    const userMessage = await ChatMessage.create({
      sessionId,
      userId,
      role: 'user',
      content: `[PROJECT IDEA] ${projectIdea}`,
      contentType: 'text'
    });

    // Update session message count
    await session.addMessage('user', projectIdea, 0);

    // Check project originality
    const originalityCheck = await checkProjectOriginality(projectIdea, user);

    // Guide project development
    const aiResult = await guideProjectDevelopment(
      projectIdea,
      user,
      session,
      session.subject
    );

    // Save AI response
    const aiMessage = await ChatMessage.create({
      sessionId,
      userId,
      role: 'assistant',
      content: aiResult.response,
      contentType: 'text',
      modelUsed: aiResult.modelUsed,
      tokensUsed: aiResult.tokensUsed,
      responseTimeMs: aiResult.responseTimeMs
    });

    // Update session with AI message
    await session.addMessage('assistant', aiResult.response, aiResult.tokensUsed);

    res.status(200).json({
      success: true,
      data: {
        projectGuidance: true,
        originalityAnalysis: originalityCheck.analysis,
        userMessage: {
          id: userMessage.id,
          content: projectIdea,
          timestamp: userMessage.createdAt
        },
        aiMessage: {
          id: aiMessage.id,
          content: aiResult.response,
          modelUsed: aiResult.modelUsed,
          tokensUsed: aiResult.tokensUsed,
          responseTimeMs: aiResult.responseTimeMs,
          timestamp: aiMessage.createdAt
        },
        session: {
          id: session.id,
          totalMessages: session.totalMessages,
          totalTokensUsed: session.totalTokensUsed
        }
      }
    });
  } catch (error) {
    console.error('Guide project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to guide project development',
      error: error.message
    });
  }
};

// Check project originality
const checkProjectOriginalityEndpoint = async (req, res) => {
  try {
    const { projectIdea } = req.body;
    const userId = req.user.id;

    if (!projectIdea || projectIdea.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Project idea cannot be empty'
      });
    }

    const user = await require('../models/User').findByPk(userId);
    const result = await checkProjectOriginality(projectIdea, user);

    res.status(200).json({
      success: true,
      data: {
        projectIdea,
        analysis: result.analysis,
        tokensUsed: result.tokensUsed
      }
    });
  } catch (error) {
    console.error('Check project originality error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check project originality',
      error: error.message
    });
  }
};

// Generate project implementation steps
const generateProjectImplementationSteps = async (req, res) => {
  try {
    const { projectIdea } = req.body;
    const userId = req.user.id;

    if (!projectIdea || projectIdea.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Project idea cannot be empty'
      });
    }

    const user = await require('../models/User').findByPk(userId);
    const result = await generateProjectSteps(projectIdea, user);

    res.status(200).json({
      success: true,
      data: {
        projectIdea,
        implementationSteps: result.steps,
        tokensUsed: result.tokensUsed
      }
    });
  } catch (error) {
    console.error('Generate project steps error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate project steps',
      error: error.message
    });
  }
};

module.exports = {
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
};
