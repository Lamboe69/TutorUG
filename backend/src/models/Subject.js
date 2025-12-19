const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'name'
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    field: 'code'
  },
  level: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'O-Level',
    field: 'level'
  },
  category: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'category'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description'
  },
  iconUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'icon_url'
  },
  colorHex: {
    type: DataTypes.STRING(7),
    allowNull: true,
    field: 'color_hex'
  },
  unebCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'uneb_code'
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'display_order'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'subjects',
  indexes: [
    { fields: ['code'] },
    { fields: ['level'] },
    { fields: ['is_active'] },
    { fields: ['display_order'] }
  ],
  timestamps: true,
  underscored: true
});

// Instance methods
Subject.prototype.getTopicsCount = async function() {
  const Topic = require('./Topic');
  return await Topic.count({ where: { subjectId: this.id } });
};

Subject.prototype.getActiveTopics = async function() {
  const Topic = require('./Topic');
  return await Topic.findAll({
    where: { subjectId: this.id, isPublished: true },
    order: [['displayOrder', 'ASC']]
  });
};

// Class methods
Subject.findByCode = function(code) {
  return this.findOne({ where: { code: code.toUpperCase() } });
};

Subject.findActive = function(level = null) {
  const whereClause = { isActive: true };
  if (level) {
    whereClause.level = level;
  }
  return this.findAll({
    where: whereClause,
    order: [['displayOrder', 'ASC']]
  });
};

Subject.getSubjectStats = async function(subjectId) {
  const Topic = require('./Topic');
  const UserProgress = require('./UserProgress');

  const topicsCount = await Topic.count({ where: { subjectId } });
  const completedTopics = await UserProgress.count({
    where: { subjectId, status: 'completed' }
  });

  return {
    totalTopics: topicsCount,
    completedTopics: completedTopics,
    completionRate: topicsCount > 0 ? (completedTopics / topicsCount) * 100 : 0
  };
};

module.exports = Subject;
