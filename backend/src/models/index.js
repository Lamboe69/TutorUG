/**
 * Models Index
 * Centralized model exports with proper association setup
 */

const User = require('./User');
const Subject = require('./Subject');
const Topic = require('./Topic');
const Subtopic = require('./Subtopic');
const ChatSession = require('./ChatSession');
const ChatMessage = require('./ChatMessage');
const Quiz = require('./Quiz');
const QuizQuestion = require('./QuizQuestion');
const QuizAttempt = require('./QuizAttempt');
const UserProgress = require('./UserProgress');
const UserReputation = require('./UserReputation');
const OtpVerification = require('./OtpVerification');
const CommunityChannel = require('./CommunityChannel');

// Setup associations after all models are loaded
function setupAssociations() {
  // User associations
  User.hasMany(ChatSession, { foreignKey: 'userId', as: 'chatSessions' });
  User.hasMany(QuizAttempt, { foreignKey: 'userId', as: 'quizAttempts' });
  User.hasMany(UserProgress, { foreignKey: 'userId', as: 'progress' });
  User.hasOne(UserReputation, { foreignKey: 'userId', as: 'reputation' });

  // Subject associations
  Subject.hasMany(Topic, { foreignKey: 'subjectId', as: 'topics' });

  // Topic associations
  Topic.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
  Topic.hasMany(Subtopic, { foreignKey: 'topicId', as: 'subtopics' });
  Topic.hasMany(Quiz, { foreignKey: 'topicId', as: 'quizzes' });

  // Subtopic associations
  Subtopic.belongsTo(Topic, { foreignKey: 'topicId', as: 'topic' });
  Subtopic.hasMany(UserProgress, { foreignKey: 'subtopicId', as: 'userProgress' });

  // Chat associations
  ChatSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  ChatSession.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
  ChatSession.hasMany(ChatMessage, { foreignKey: 'sessionId', as: 'messages' });

  ChatMessage.belongsTo(ChatSession, { foreignKey: 'sessionId', as: 'session' });
  ChatMessage.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Quiz associations
  Quiz.belongsTo(Topic, { foreignKey: 'topicId', as: 'topic' });
  Quiz.hasMany(QuizQuestion, { foreignKey: 'quizId', as: 'questions' });
  Quiz.hasMany(QuizAttempt, { foreignKey: 'quizId', as: 'attempts' });

  QuizQuestion.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });

  QuizAttempt.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  QuizAttempt.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });

  // Progress associations
  UserProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  UserProgress.belongsTo(Subtopic, { foreignKey: 'subtopicId', as: 'subtopic' });
  UserProgress.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

  // Reputation associations
  UserReputation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // OTP associations
  OtpVerification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Community associations
  CommunityChannel.hasMany(ChatMessage, { foreignKey: 'channelId', as: 'messages' });
}

// Call setup on require
setupAssociations();

module.exports = {
  User,
  Subject,
  Topic,
  Subtopic,
  ChatSession,
  ChatMessage,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  UserProgress,
  UserReputation,
  OtpVerification,
  CommunityChannel
};
