const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subtopic = sequelize.define('Subtopic', {
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
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'slug'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'content'
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'summary'
  },
  ugandanExamples: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'ugandan_examples'
  },
  practiceProblems: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'practice_problems'
  },
  keyPoints: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
    field: 'key_points'
  },
  commonMistakes: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'common_mistakes'
  },
  tipsAndTricks: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
    field: 'tips_and_tricks'
  },
  images: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'images'
  },
  videos: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'videos'
  },
  diagrams: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'diagrams'
  },
  estimatedReadTimeMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'estimated_read_time_minutes'
  },
  difficulty: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'intermediate',
    field: 'difficulty'
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'display_order'
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_published'
  }
}, {
  tableName: 'subtopics',
  indexes: [
    { fields: ['topic_id'] },
    { fields: ['is_published'] },
    { fields: ['display_order'] },
    { fields: ['slug'] },
    { unique: true, fields: ['topic_id', 'slug'] }
  ],
  timestamps: true,
  underscored: true
});

// Instance methods
Subtopic.prototype.getUserProgress = async function(userId) {
  const UserProgress = require('./UserProgress');
  return await UserProgress.findOne({
    where: { userId, subtopicId: this.id }
  });
};

Subtopic.prototype.isCompletedByUser = async function(userId) {
  const progress = await this.getUserProgress(userId);
  return progress && progress.status === 'completed';
};

Subtopic.prototype.getNextSubtopic = async function() {
  return await this.constructor.findOne({
    where: {
      topicId: this.topicId,
      displayOrder: { [require('sequelize').Op.gt]: this.displayOrder },
      isPublished: true
    },
    order: [['displayOrder', 'ASC']]
  });
};

Subtopic.prototype.getPreviousSubtopic = async function() {
  return await this.constructor.findOne({
    where: {
      topicId: this.topicId,
      displayOrder: { [require('sequelize').Op.lt]: this.displayOrder },
      isPublished: true
    },
    order: [['displayOrder', 'DESC']]
  });
};

Subtopic.prototype.generateQuiz = function() {
  // Generate practice quiz from practice_problems
  if (!this.practiceProblems || this.practiceProblems.length === 0) {
    return null;
  }

  const questions = this.practiceProblems.slice(0, 5); // Take first 5 problems

  return {
    title: `${this.title} - Practice Quiz`,
    questions: questions.map((problem, index) => ({
      id: `q${index + 1}`,
      question: problem.question,
      options: problem.options,
      correctAnswer: problem.correctAnswer,
      explanation: problem.explanation,
      topic: this.title
    })),
    passingScore: 70,
    timeLimitMinutes: Math.max(5, questions.length * 2)
  };
};

// Class methods
Subtopic.findBySlug = function(topicId, slug) {
  return this.findOne({
    where: { topicId, slug }
  });
};

Subtopic.findPublished = function(topicId = null) {
  const whereClause = { isPublished: true };
  if (topicId) {
    whereClause.topicId = topicId;
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
    order: [['displayOrder', 'ASC']]
  });
};

Subtopic.getSubtopicsByDifficulty = function(difficulty, limit = 10) {
  return this.findAll({
    where: {
      difficulty,
      isPublished: true
    },
    include: [{
      model: require('./Topic'),
      as: 'topic'
    }],
    limit,
    order: [['createdAt', 'DESC']]
  });
};

Subtopic.search = function(query, limit = 20) {
  return this.findAll({
    where: {
      isPublished: true,
      [require('sequelize').Op.or]: [
        { title: { [require('sequelize').Op.iLike]: `%${query}%` } },
        { content: { [require('sequelize').Op.iLike]: `%${query}%` } },
        { summary: { [require('sequelize').Op.iLike]: `%${query}%` } }
      ]
    },
    include: [{
      model: require('./Topic'),
      as: 'topic',
      include: [{
        model: require('./Subject'),
        as: 'subject'
      }]
    }],
    limit,
    order: [['createdAt', 'DESC']]
  });
};

Subtopic.getRecommended = async function(userId, limit = 5) {
  // Get subtopics user hasn't completed yet
  const UserProgress = require('./UserProgress');
  const completedSubtopicIds = await UserProgress.findAll({
    where: { userId, status: 'completed' },
    attributes: ['subtopicId']
  }).then(progress => progress.map(p => p.subtopicId));

  return this.findAll({
    where: {
      id: { [require('sequelize').Op.notIn]: completedSubtopicIds },
      isPublished: true
    },
    include: [{
      model: require('./Topic'),
      as: 'topic'
    }],
    limit,
    order: [['createdAt', 'DESC']]
  });
};

// Associations
Subtopic.belongsTo(require('./Topic'), {
  foreignKey: 'topicId',
  as: 'topic'
});

Subtopic.hasMany(require('./UserProgress'), {
  foreignKey: 'subtopicId',
  as: 'userProgress'
});

module.exports = Subtopic;
