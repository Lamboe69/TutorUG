const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuizAttempt = sequelize.define('QuizAttempt', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  quizId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quizzes',
      key: 'id'
    },
    field: 'quiz_id'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  answers: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    field: 'answers' // { questionId: userAnswer }
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'score' // Percentage score
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_questions'
  },
  correctAnswers: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'correct_answers'
  },
  timeSpentSeconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'time_spent_seconds'
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'started_at'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'completed', 'timed_out'),
    allowNull: false,
    defaultValue: 'in_progress',
    field: 'status'
  },
  attemptNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'attempt_number'
  },
  isBestAttempt: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_best_attempt'
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'feedback'
  }
}, {
  tableName: 'quiz_attempts',
  indexes: [
    { fields: ['quiz_id'] },
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['score'] },
    { fields: ['started_at'] },
    { fields: ['is_best_attempt'] }
  ],
  timestamps: true,
  underscored: true
});

// Instance methods
QuizAttempt.prototype.calculateScore = async function() {
  const QuizQuestion = require('./QuizQuestion');
  const questions = await QuizQuestion.findByQuiz(this.quizId);
  let correctAnswers = 0;
  let totalPoints = 0;
  let earnedPoints = 0;

  for (const question of questions) {
    const userAnswer = this.answers[question.id];
    totalPoints += question.points;

    if (userAnswer !== undefined && question.isCorrect(userAnswer)) {
      correctAnswers += 1;
      earnedPoints += question.points;
    }
  }

  const percentageScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  this.score = percentageScore;
  this.correctAnswers = correctAnswers;
  this.totalQuestions = questions.length;

  return {
    score: percentageScore,
    correctAnswers,
    totalQuestions: questions.length,
    earnedPoints,
    totalPoints
  };
};

QuizAttempt.prototype.markAsCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
};

QuizAttempt.prototype.markAsTimedOut = function() {
  this.status = 'timed_out';
  this.completedAt = new Date();
};

QuizAttempt.prototype.isPassing = function(passingScore = 70) {
  return this.score >= passingScore;
};

QuizAttempt.prototype.getDetailedResults = async function() {
  const QuizQuestion = require('./QuizQuestion');
  const questions = await QuizQuestion.findByQuiz(this.quizId);

  const results = [];
  for (const question of questions) {
    const userAnswer = this.answers[question.id];
    const isCorrect = userAnswer !== undefined && question.isCorrect(userAnswer);

    results.push({
      questionId: question.id,
      question: question.question,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
      points: question.points,
      earnedPoints: isCorrect ? question.points : 0
    });
  }

  return results;
};

QuizAttempt.prototype.getTimeSpent = function() {
  if (!this.completedAt) return null;
  const timeSpent = Math.floor((this.completedAt - this.startedAt) / 1000);
  return timeSpent;
};

QuizAttempt.prototype.updateBestAttempt = async function() {
  // Find all attempts for this user/quiz combination
  const allAttempts = await this.constructor.findAll({
    where: {
      quizId: this.quizId,
      userId: this.userId,
      status: 'completed'
    },
    order: [['score', 'DESC'], ['completedAt', 'ASC']]
  });

  // Reset all best_attempt flags
  await this.constructor.update(
    { isBestAttempt: false },
    {
      where: {
        quizId: this.quizId,
        userId: this.userId
      }
    }
  );

  // Set the best attempt
  if (allAttempts.length > 0) {
    allAttempts[0].isBestAttempt = true;
    await allAttempts[0].save();
  }
};

// Class methods
QuizAttempt.findUserAttempts = function(userId, quizId = null, limit = 10) {
  const whereClause = { userId };
  if (quizId) {
    whereClause.quizId = quizId;
  }

  return this.findAll({
    where: whereClause,
    include: [{
      model: require('./Quiz'),
      as: 'quiz',
      include: [{
        model: require('./Topic'),
        as: 'topic',
        include: [{
          model: require('./Subject'),
          as: 'subject'
        }]
      }]
    }],
    order: [['startedAt', 'DESC']],
    limit
  });
};

QuizAttempt.findByQuiz = function(quizId, limit = 50) {
  return this.findAll({
    where: { quizId },
    include: [{
      model: require('./User'),
      as: 'user',
      attributes: ['firstName', 'lastName']
    }],
    order: [['score', 'DESC'], ['completedAt', 'ASC']],
    limit
  });
};

QuizAttempt.getUserBestScores = function(userId) {
  // Get best attempt for each quiz
  return this.findAll({
    where: {
      userId,
      isBestAttempt: true
    },
    include: [{
      model: require('./Quiz'),
      as: 'quiz',
      include: [{
        model: require('./Topic'),
        as: 'topic',
        include: [{
          model: require('./Subject'),
          as: 'subject'
        }]
      }]
    }],
    order: [['score', 'DESC']]
  });
};

QuizAttempt.getQuizStatistics = async function(quizId) {
  const attempts = await this.findAll({
    where: { quizId, status: 'completed' },
    attributes: [
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalAttempts'],
      [require('sequelize').fn('AVG', require('sequelize').col('score')), 'avgScore'],
      [require('sequelize').fn('MAX', require('sequelize').col('score')), 'highestScore'],
      [require('sequelize').fn('MIN', require('sequelize').col('score')), 'lowestScore'],
      [require('sequelize').fn('AVG', require('sequelize').col('time_spent_seconds')), 'avgTimeSpent']
    ]
  });

  if (!attempts[0]) return null;

  const stats = attempts[0].dataValues;
  return {
    quizId,
    totalAttempts: parseInt(stats.totalAttempts),
    averageScore: parseFloat(stats.avgScore || 0),
    highestScore: parseInt(stats.highestScore || 0),
    lowestScore: parseInt(stats.lowestScore || 0),
    averageTimeSpent: parseInt(stats.avgTimeSpent || 0)
  };
};

QuizAttempt.getAttemptStreak = async function(userId) {
  // Find consecutive days with quiz attempts
  const attempts = await this.findAll({
    where: { userId, status: 'completed' },
    attributes: [
      [require('sequelize').fn('DATE', require('sequelize').col('completed_at')), 'date'],
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
    ],
    group: [require('sequelize').fn('DATE', require('sequelize').col('completed_at'))],
    order: [[require('sequelize').fn('DATE', require('sequelize').col('completed_at')), 'DESC']],
    limit: 30 // Check last 30 days
  });

  // Calculate streak (consecutive days)
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];

  for (const attempt of attempts) {
    const attemptDate = attempt.dataValues.date;
    if (attemptDate === today || this.isConsecutiveDay(today, attemptDate, streak)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

QuizAttempt.isConsecutiveDay = function(today, attemptDate, currentStreak) {
  const todayDate = new Date(today);
  const attemptDateObj = new Date(attemptDate);
  const diffTime = Math.abs(todayDate - attemptDateObj);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays === currentStreak + 1;
};

QuizAttempt.canAttemptQuiz = async function(userId, quizId) {
  const Quiz = require('./Quiz');

  // Check if quiz exists and is published
  const quiz = await Quiz.findByPk(quizId);
  if (!quiz || !quiz.isPublished) {
    return { canAttempt: false, reason: 'Quiz not found or not available' };
  }

  // Check attempt limit
  if (quiz.maxAttempts) {
    const attemptCount = await this.count({
      where: { userId, quizId, status: 'completed' }
    });

    if (attemptCount >= quiz.maxAttempts) {
      return {
        canAttempt: false,
        reason: `Maximum attempts (${quiz.maxAttempts}) reached`,
        attemptsUsed: attemptCount
      };
    }
  }

  // Check if there's an in-progress attempt
  const inProgressAttempt = await this.findOne({
    where: { userId, quizId, status: 'in_progress' }
  });

  if (inProgressAttempt) {
    return {
      canAttempt: false,
      reason: 'You have an unfinished attempt',
      inProgressAttemptId: inProgressAttempt.id
    };
  }

  return { canAttempt: true };
};

// Associations
QuizAttempt.belongsTo(require('./Quiz'), {
  foreignKey: 'quizId',
  as: 'quiz'
});

QuizAttempt.belongsTo(require('./User'), {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = QuizAttempt;
