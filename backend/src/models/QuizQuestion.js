const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuizQuestion = sequelize.define('QuizQuestion', {
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
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'question'
  },
  questionType: {
    type: DataTypes.ENUM('multiple_choice', 'true_false', 'short_answer'),
    allowNull: false,
    defaultValue: 'multiple_choice',
    field: 'question_type'
  },
  options: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'options' // Array of strings for multiple choice
  },
  correctAnswer: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'correct_answer' // Index for multiple choice, text for short answer
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'explanation'
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'points'
  },
  timeLimitSeconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'time_limit_seconds'
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false,
    defaultValue: 'medium',
    field: 'difficulty'
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
    field: 'tags'
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'order'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'quiz_questions',
  indexes: [
    { fields: ['quiz_id'] },
    { fields: ['question_type'] },
    { fields: ['difficulty'] },
    { fields: ['is_active'] },
    { fields: ['order'] }
  ],
  timestamps: true,
  underscored: true
});

// Instance methods
QuizQuestion.prototype.isCorrect = function(userAnswer) {
  if (this.questionType === 'multiple_choice') {
    // For multiple choice, compare indices
    return parseInt(userAnswer) === parseInt(this.correctAnswer);
  } else if (this.questionType === 'true_false') {
    // For true/false, compare boolean values
    return String(userAnswer).toLowerCase() === String(this.correctAnswer).toLowerCase();
  } else {
    // For short answer, do case-insensitive comparison (could be enhanced with NLP)
    return this.normalizeAnswer(userAnswer) === this.normalizeAnswer(this.correctAnswer);
  }
};

QuizQuestion.prototype.normalizeAnswer = function(answer) {
  if (!answer) return '';
  return String(answer)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' '); // Normalize spaces
};

QuizQuestion.prototype.getOptionsWithIndex = function() {
  if (!this.options || !Array.isArray(this.options)) return [];

  return this.options.map((option, index) => ({
    index,
    text: option,
    isCorrect: index === parseInt(this.correctAnswer)
  }));
};

QuizQuestion.prototype.toPublicFormat = function(includeAnswer = false) {
  const publicQuestion = {
    id: this.id,
    question: this.question,
    questionType: this.questionType,
    points: this.points,
    timeLimitSeconds: this.timeLimitSeconds,
    difficulty: this.difficulty,
    order: this.order
  };

  if (this.questionType === 'multiple_choice' || this.questionType === 'true_false') {
    publicQuestion.options = this.options;
  }

  if (includeAnswer) {
    publicQuestion.correctAnswer = this.correctAnswer;
    publicQuestion.explanation = this.explanation;
  }

  return publicQuestion;
};

// Class methods
QuizQuestion.findByQuiz = function(quizId, activeOnly = true) {
  const whereClause = { quizId };
  if (activeOnly) {
    whereClause.isActive = true;
  }

  return this.findAll({
    where: whereClause,
    order: [['order', 'ASC'], ['createdAt', 'ASC']]
  });
};

QuizQuestion.getQuestionsForQuiz = function(quizId, randomize = false) {
  return this.findAll({
    where: {
      quizId,
      isActive: true
    },
    order: randomize ? sequelize.random() : [['order', 'ASC']]
  });
};

QuizQuestion.getQuestionStats = async function(questionId) {
  const question = await this.findByPk(questionId);
  if (!question) return null;

  // This would require a QuizAnswer model to track individual question performance
  // For now, return basic question stats
  return {
    questionId,
    questionType: question.questionType,
    difficulty: question.difficulty,
    points: question.points,
    // Would need QuizAnswer model for these:
    // timesAnswered: 0,
    // correctPercentage: 0,
    // averageTime: 0
  };
};

QuizQuestion.createBulkQuestions = async function(quizId, questionsData) {
  const questions = questionsData.map((q, index) => ({
    ...q,
    quizId,
    order: q.order || index
  }));

  return await this.bulkCreate(questions);
};

QuizQuestion.updateQuestionOrder = async function(quizId, questionOrders) {
  // questionOrders should be array of { id, order }
  const updatePromises = questionOrders.map(({ id, order }) =>
    this.update(
      { order },
      { where: { id, quizId } }
    )
  );

  await Promise.all(updatePromises);
  return true;
};

// Associations
QuizQuestion.belongsTo(require('./Quiz'), {
  foreignKey: 'quizId',
  as: 'quiz'
});

module.exports = QuizQuestion;
