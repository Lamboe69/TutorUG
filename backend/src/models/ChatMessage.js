const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'chat_sessions',
      key: 'id'
    },
    field: 'session_id'
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
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'role' // 'user' or 'assistant'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'content'
  },
  contentType: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'text',
    field: 'content_type'
  },
  modelUsed: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'model_used'
  },
  tokensUsed: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'tokens_used'
  },
  responseTimeMs: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'response_time_ms'
  },
  isHelpful: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    field: 'is_helpful'
  },
  isFlagged: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_flagged'
  },
  flagReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'flag_reason'
  }
}, {
  tableName: 'chat_messages',
  indexes: [
    { fields: ['session_id'] },
    { fields: ['user_id'] },
    { fields: ['role'] },
    { fields: ['is_flagged'] },
    { fields: ['created_at'] }
  ],
  timestamps: true,
  underscored: true
});

// Instance methods
ChatMessage.prototype.markAsHelpful = function() {
  this.isHelpful = true;
  return this.save();
};

ChatMessage.prototype.flagMessage = function(reason) {
  this.isFlagged = true;
  this.flagReason = reason;
  return this.save();
};

ChatMessage.prototype.getWordCount = function() {
  return this.content.split(/\s+/).filter(word => word.length > 0).length;
};

ChatMessage.prototype.containsUgandanContext = function() {
  const ugandanTerms = [
    'kampala', 'uganda', 'boda', 'matatu', 'owino', 'nakasero',
    'ntinda', 'mukono', 'masaka', 'jinja', 'mbale', 'arua',
    'kasese', 'kabale', 'masindi', 'hoima', 'lira', 'soroti',
    'shillings', 'ugx', 'ugandan', 'east african', 'kenya', 'tanzania'
  ];

  const content = this.content.toLowerCase();
  return ugandanTerms.some(term => content.includes(term));
};

// Class methods
ChatMessage.getSessionMessages = function(sessionId, limit = 50) {
  return this.findAll({
    where: { sessionId },
    include: [{
      model: require('./User'),
      as: 'user',
      attributes: ['firstName', 'lastName']
    }],
    order: [['createdAt', 'ASC']],
    limit
  });
};

ChatMessage.getRecentMessages = function(userId, limit = 20) {
  return this.findAll({
    where: { userId },
    include: [{
      model: require('./ChatSession'),
      as: 'session',
      include: [{
        model: require('./Subject'),
        as: 'subject'
      }]
    }],
    order: [['createdAt', 'DESC']],
    limit
  });
};

ChatMessage.getFlaggedMessages = function(limit = 100) {
  return this.findAll({
    where: { isFlagged: true },
    include: [
      {
        model: require('./User'),
        as: 'user',
        attributes: ['firstName', 'lastName', 'phoneNumber']
      },
      {
        model: require('./ChatSession'),
        as: 'session'
      }
    ],
    order: [['createdAt', 'DESC']],
    limit
  });
};

ChatMessage.getUserMessageStats = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const messages = await this.findAll({
    where: {
      userId,
      createdAt: { [require('sequelize').Op.gte]: startDate }
    },
    attributes: [
      'role',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      [require('sequelize').fn('AVG', require('sequelize').col('response_time_ms')), 'avgResponseTime'],
      [require('sequelize').fn('SUM', require('sequelize').col('tokens_used')), 'totalTokens']
    ],
    group: ['role']
  });

  const stats = {
    userMessages: 0,
    assistantMessages: 0,
    avgResponseTime: 0,
    totalTokens: 0
  };

  messages.forEach(message => {
    const count = parseInt(message.dataValues.count);
    const avgTime = parseFloat(message.dataValues.avgResponseTime || 0);
    const tokens = parseInt(message.dataValues.totalTokens || 0);

    if (message.role === 'user') {
      stats.userMessages = count;
    } else if (message.role === 'assistant') {
      stats.assistantMessages = count;
      stats.avgResponseTime = avgTime;
    }

    stats.totalTokens += tokens;
  });

  return stats;
};

ChatMessage.searchMessages = function(query, userId = null, limit = 50) {
  const whereClause = {
    content: { [require('sequelize').Op.iLike]: `%${query}%` },
    isFlagged: false
  };

  if (userId) {
    whereClause.userId = userId;
  }

  return this.findAll({
    where: whereClause,
    include: [
      {
        model: require('./ChatSession'),
        as: 'session',
        include: [{
          model: require('./Subject'),
          as: 'subject'
        }]
      },
      {
        model: require('./User'),
        as: 'user',
        attributes: ['firstName', 'lastName']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit
  });
};

ChatMessage.cleanupOldMessages = function(daysOld = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.destroy({
    where: {
      createdAt: { [require('sequelize').Op.lt]: cutoffDate }
    }
  });
};

// Associations
ChatMessage.belongsTo(require('./ChatSession'), {
  foreignKey: 'sessionId',
  as: 'session'
});

ChatMessage.belongsTo(require('./User'), {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = ChatMessage;
