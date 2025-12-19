const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatSession = sequelize.define('ChatSession', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
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
  subjectId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'subjects',
      key: 'id'
    },
    field: 'subject_id'
  },
  topicId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'topics',
      key: 'id'
    },
    field: 'topic_id'
  },
  sessionType: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'learning',
    field: 'session_type'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'title'
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'started_at'
  },
  endedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'ended_at'
  },
  totalMessages: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_messages'
  },
  totalTokensUsed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_tokens_used'
  },
  costUsd: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    defaultValue: 0,
    field: 'cost_usd'
  },
  satisfactionRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'satisfaction_rating'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'chat_sessions',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['subject_id'] },
    { fields: ['topic_id'] },
    { fields: ['session_type'] },
    { fields: ['is_active'] },
    { fields: ['started_at'] }
  ],
  timestamps: true,
  underscored: true
});

// Instance methods
ChatSession.prototype.addMessage = async function(role, content, tokensUsed = 0) {
  this.totalMessages += 1;
  this.totalTokensUsed += tokensUsed;

  // Estimate cost (rough calculation for GPT-4o-mini)
  // $0.15 per 1M input tokens, $0.60 per 1M output tokens
  const estimatedCost = (tokensUsed * 0.0000003); // Rough average
  this.costUsd += estimatedCost;

  await this.save();
};

ChatSession.prototype.endSession = function(rating = null) {
  this.endedAt = new Date();
  this.isActive = false;
  if (rating) {
    this.satisfactionRating = rating;
  }
};

ChatSession.prototype.getDurationMinutes = function() {
  const endTime = this.endedAt || new Date();
  const durationMs = endTime - this.startedAt;
  return Math.round(durationMs / (1000 * 60));
};

// Class methods
ChatSession.findActiveByUser = function(userId) {
  return this.findAll({
    where: {
      userId,
      isActive: true
    },
    include: [{
      model: require('./Subject'),
      as: 'subject',
      required: false
    }],
    order: [['startedAt', 'DESC']]
  });
};

ChatSession.getUserStats = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const sessions = await this.findAll({
    where: {
      userId,
      startedAt: { [require('sequelize').Op.gte]: startDate }
    },
    attributes: [
      'sessionType',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      [require('sequelize').fn('SUM', require('sequelize').col('total_messages')), 'totalMessages'],
      [require('sequelize').fn('SUM', require('sequelize').col('total_tokens_used')), 'totalTokens'],
      [require('sequelize').fn('SUM', require('sequelize').col('cost_usd')), 'totalCost']
    ],
    group: ['sessionType']
  });

  const stats = {
    totalSessions: 0,
    totalMessages: 0,
    totalTokens: 0,
    totalCost: 0,
    byType: {}
  };

  sessions.forEach(session => {
    const count = parseInt(session.dataValues.count);
    const messages = parseInt(session.dataValues.totalMessages || 0);
    const tokens = parseInt(session.dataValues.totalTokens || 0);
    const cost = parseFloat(session.dataValues.totalCost || 0);

    stats.totalSessions += count;
    stats.totalMessages += messages;
    stats.totalTokens += tokens;
    stats.totalCost += cost;

    stats.byType[session.sessionType] = {
      sessions: count,
      messages,
      tokens,
      cost
    };
  });

  return stats;
};

ChatSession.cleanupOldSessions = function(daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.update(
    { isActive: false },
    {
      where: {
        isActive: true,
        startedAt: { [require('sequelize').Op.lt]: cutoffDate }
      }
    }
  );
};

// Associations
ChatSession.belongsTo(require('./User'), {
  foreignKey: 'userId',
  as: 'user'
});

ChatSession.belongsTo(require('./Subject'), {
  foreignKey: 'subjectId',
  as: 'subject'
});

ChatSession.belongsTo(require('./Topic'), {
  foreignKey: 'topicId',
  as: 'topic'
});

ChatSession.hasMany(require('./ChatMessage'), {
  foreignKey: 'sessionId',
  as: 'messages'
});

module.exports = ChatSession;
