const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  topicId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'topics',
      key: 'id'
    },
    field: 'topic_id'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'title'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description'
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false,
    defaultValue: 'medium',
    field: 'difficulty'
  },
  timeLimitMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'time_limit_minutes'
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_questions'
  },
  passingScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 70,
    field: 'passing_score'
  },
  maxAttempts: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'max_attempts'
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_published'
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
    field: 'tags'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'created_by'
  }
}, {
  tableName: 'quizzes',
  indexes: [
    { fields: ['topic_id'] },
    { fields: ['difficulty'] },
    { fields: ['is_published'] },
    { fields: ['created_at'] }
  ],
  timestamps: true,
  underscored: true
});

// Instance methods
Quiz.prototype.getAverageScore = async function() {
  const QuizAttempt = require('./QuizAttempt');
  const attempts = await QuizAttempt.findAll({
    where: { quizId: this.id },
    attributes: [[require('sequelize').fn('AVG', require('sequelize').col('score')), 'avgScore']]
  });

  return attempts[0]?.dataValues?.avgScore ? parseFloat(attempts[0].dataValues.avgScore) : 0;
};

Quiz.prototype.getTotalAttempts = async function() {
  const QuizAttempt = require('./QuizAttempt');
  return await QuizAttempt.count({
    where: { quizId: this.id }
  });
};

Quiz.prototype.getPassRate = async function() {
  const QuizAttempt = require('./QuizAttempt');
  const [passed, total] = await Promise.all([
    QuizAttempt.count({
      where: { quizId: this.id, score: { [require('sequelize').Op.gte]: this.passingScore } }
    }),
    QuizAttempt.count({
      where: { quizId: this.id }
    })
  ]);

  return total > 0 ? (passed / total) * 100 : 0;
};

// Class methods
Quiz.findByTopic = function(topicId, includeUnpublished = false) {
  const whereClause = { topicId };
  if (!includeUnpublished) {
    whereClause.isPublished = true;
  }

  return this.findAll({
    where: whereClause,
    include: [{
      model: require('./Topic'),
      as: 'topic',
      include: [{
        model: require('./Subject'),
        as: 'subject'
      }]
    }],
    order: [['difficulty', 'ASC'], ['createdAt', 'DESC']]
  });
};

Quiz.findByDifficulty = function(difficulty) {
  return this.findAll({
    where: { difficulty, isPublished: true },
    include: [{
      model: require('./Topic'),
      as: 'topic',
      include: [{
        model: require('./Subject'),
        as: 'subject'
      }]
    }],
    order: [['createdAt', 'DESC']]
  });
};

Quiz.getPopularQuizzes = function(limit = 10) {
  // This would need a view or complex query to count attempts
  // For now, return recent quizzes
  return this.findAll({
    where: { isPublished: true },
    include: [{
      model: require('./Topic'),
      as: 'topic',
      include: [{
        model: require('./Subject'),
        as: 'subject'
      }]
    }],
    order: [['createdAt', 'DESC']],
    limit
  });
};

Quiz.getQuizStats = async function(quizId) {
  const quiz = await this.findByPk(quizId);
  if (!quiz) return null;

  const [avgScore, totalAttempts, passRate] = await Promise.all([
    quiz.getAverageScore(),
    quiz.getTotalAttempts(),
    quiz.getPassRate()
  ]);

  return {
    quizId,
    averageScore: avgScore,
    totalAttempts,
    passRate,
    difficulty: quiz.difficulty,
    totalQuestions: quiz.totalQuestions
  };
};

// Associations
Quiz.belongsTo(require('./Topic'), {
  foreignKey: 'topicId',
  as: 'topic'
});

Quiz.belongsTo(require('./User'), {
  foreignKey: 'createdBy',
  as: 'creator'
});

Quiz.hasMany(require('./QuizQuestion'), {
  foreignKey: 'quizId',
  as: 'questions'
});

Quiz.hasMany(require('./QuizAttempt'), {
  foreignKey: 'quizId',
  as: 'attempts'
});

module.exports = Quiz;
