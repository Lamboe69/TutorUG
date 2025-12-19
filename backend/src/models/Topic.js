const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Topic = sequelize.define('Topic', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  subjectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'id'
    },
    field: 'subject_id'
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
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description'
  },
  unebReference: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'uneb_reference'
  },
  classLevel: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'class_level'
  },
  term: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'term'
  },
  difficulty: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'intermediate',
    field: 'difficulty'
  },
  estimatedDurationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'estimated_duration_minutes'
  },
  learningObjectives: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
    field: 'learning_objectives'
  },
  parentTopicId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'topics',
      key: 'id'
    },
    field: 'parent_topic_id'
  },
  prerequisites: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    allowNull: true,
    field: 'prerequisites'
  },
  introduction: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'introduction'
  },
  keyConcepts: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'key_concepts'
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
  tableName: 'topics',
  indexes: [
    { fields: ['subject_id'] },
    { fields: ['class_level'] },
    { fields: ['is_published'] },
    { fields: ['display_order'] },
    { fields: ['slug'] },
    { unique: true, fields: ['subject_id', 'slug'] }
  ],
  timestamps: true,
  underscored: true
});

// Instance methods
Topic.prototype.getSubtopicsCount = async function() {
  const Subtopic = require('./Subtopic');
  return await Subtopic.count({ where: { topicId: this.id } });
};

Topic.prototype.getPublishedSubtopics = async function() {
  const Subtopic = require('./Subtopic');
  return await Subtopic.findAll({
    where: { topicId: this.id, isPublished: true },
    order: [['displayOrder', 'ASC']]
  });
};

Topic.prototype.getUserProgress = async function(userId) {
  const UserProgress = require('./UserProgress');
  return await UserProgress.findAll({
    where: { userId, topicId: this.id },
    include: [{ model: require('./Subtopic'), as: 'subtopic' }]
  });
};

Topic.prototype.isPrerequisiteMet = async function(userId) {
  if (!this.prerequisites || this.prerequisites.length === 0) {
    return true;
  }

  const UserProgress = require('./UserProgress');
  const completedTopics = await UserProgress.count({
    where: {
      userId,
      topicId: { [require('sequelize').Op.in]: this.prerequisites },
      status: 'completed'
    }
  });

  return completedTopics === this.prerequisites.length;
};

// Class methods
Topic.findBySlug = function(subjectId, slug) {
  return this.findOne({
    where: { subjectId, slug }
  });
};

Topic.findPublished = function(subjectId = null) {
  const whereClause = { isPublished: true };
  if (subjectId) {
    whereClause.subjectId = subjectId;
  }
  return this.findAll({
    where: whereClause,
    include: [{
      model: require('./Subject'),
      as: 'subject'
    }],
    order: [['displayOrder', 'ASC']]
  });
};

Topic.getTopicsByClass = function(classLevel, term = null) {
  const whereClause = {
    classLevel,
    isPublished: true
  };
  if (term) {
    whereClause.term = term;
  }
  return this.findAll({
    where: whereClause,
    include: [{
      model: require('./Subject'),
      as: 'subject'
    }],
    order: [['subjectId', 'ASC'], ['displayOrder', 'ASC']]
  });
};

Topic.getTopicStats = async function(topicId) {
  const Subtopic = require('./Subtopic');
  const UserProgress = require('./UserProgress');

  const subtopicsCount = await Subtopic.count({ where: { topicId } });
  const completedSubtopics = await UserProgress.count({
    where: { topicId, status: 'completed' }
  });

  return {
    totalSubtopics: subtopicsCount,
    completedSubtopics: completedSubtopics,
    completionRate: subtopicsCount > 0 ? (completedSubtopics / subtopicsCount) * 100 : 0
  };
};

// Associations
Topic.belongsTo(require('./Subject'), {
  foreignKey: 'subjectId',
  as: 'subject'
});

Topic.hasMany(require('./Subtopic'), {
  foreignKey: 'topicId',
  as: 'subtopics'
});

Topic.hasMany(require('./UserProgress'), {
  foreignKey: 'topicId',
  as: 'userProgress'
});

module.exports = Topic;
