const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CommunityChannel = sequelize.define('CommunityChannel', {
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
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'slug'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description'
  },
  channelType: {
    type: DataTypes.ENUM('subject', 'general', 'study_group', 'announcement'),
    allowNull: false,
    defaultValue: 'general',
    field: 'channel_type'
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
  isPrivate: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_private'
  },
  memberCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'member_count'
  },
  messageCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'message_count'
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_message_at'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  rules: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rules'
  },
  moderators: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    allowNull: false,
    defaultValue: [],
    field: 'moderators'
  }
}, {
  tableName: 'community_channels',
  indexes: [
    { fields: ['slug'], unique: true },
    { fields: ['channel_type'] },
    { fields: ['subject_id'] },
    { fields: ['is_active'] },
    { fields: ['last_message_at'] },
    { fields: ['member_count'] }
  ],
  timestamps: true,
  underscored: true
});

// Instance methods
CommunityChannel.prototype.addMember = async function() {
  this.memberCount += 1;
  await this.save();
  return this.memberCount;
};

CommunityChannel.prototype.removeMember = async function() {
  if (this.memberCount > 0) {
    this.memberCount -= 1;
    await this.save();
  }
  return this.memberCount;
};

CommunityChannel.prototype.addMessage = async function() {
  this.messageCount += 1;
  this.lastMessageAt = new Date();
  await this.save();
  return this.messageCount;
};

CommunityChannel.prototype.isModerator = function(userId) {
  return this.moderators.includes(userId);
};

CommunityChannel.prototype.addModerator = async function(userId) {
  if (!this.moderators.includes(userId)) {
    this.moderators = [...this.moderators, userId];
    await this.save();
  }
  return this.moderators;
};

CommunityChannel.prototype.removeModerator = async function(userId) {
  this.moderators = this.moderators.filter(id => id !== userId);
  await this.save();
  return this.moderators;
};

CommunityChannel.prototype.getActiveMembers = async function() {
  // This would require a ChannelMember model for tracking active users
  // For now, return approximate count
  return this.memberCount;
};

CommunityChannel.prototype.toPublicFormat = function() {
  return {
    id: this.id,
    name: this.name,
    slug: this.slug,
    description: this.description,
    channelType: this.channelType,
    memberCount: this.memberCount,
    messageCount: this.messageCount,
    lastMessageAt: this.lastMessageAt,
    isPrivate: this.isPrivate,
    rules: this.rules
  };
};

// Class methods
CommunityChannel.findByType = function(channelType, limit = 20) {
  return this.findAll({
    where: {
      channelType,
      isActive: true,
      isPrivate: false
    },
    include: [{
      model: require('./Subject'),
      as: 'subject',
      required: false
    }],
    order: [['lastMessageAt', 'DESC'], ['memberCount', 'DESC']],
    limit
  });
};

CommunityChannel.findBySubject = function(subjectId) {
  return this.findAll({
    where: {
      subjectId,
      isActive: true
    },
    order: [['memberCount', 'DESC']]
  });
};

CommunityChannel.getPopularChannels = function(limit = 10) {
  return this.findAll({
    where: {
      isActive: true,
      isPrivate: false
    },
    order: [['memberCount', 'DESC'], ['lastMessageAt', 'DESC']],
    limit
  });
};

CommunityChannel.searchChannels = function(query, limit = 20) {
  return this.findAll({
    where: {
      isActive: true,
      isPrivate: false,
      [require('sequelize').Op.or]: [
        { name: { [require('sequelize').Op.iLike]: `%${query}%` } },
        { description: { [require('sequelize').Op.iLike]: `%${query}%` } }
      ]
    },
    order: [['memberCount', 'DESC']],
    limit
  });
};

CommunityChannel.getChannelStats = async function() {
  const stats = await this.findAll({
    attributes: [
      'channelType',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      [require('sequelize').fn('SUM', require('sequelize').col('member_count')), 'totalMembers'],
      [require('sequelize').fn('SUM', require('sequelize').col('message_count')), 'totalMessages']
    ],
    where: { isActive: true },
    group: ['channelType']
  });

  const result = {
    totalChannels: 0,
    totalMembers: 0,
    totalMessages: 0,
    byType: {}
  };

  stats.forEach(stat => {
    const count = parseInt(stat.dataValues.count);
    const members = parseInt(stat.dataValues.totalMembers || 0);
    const messages = parseInt(stat.dataValues.totalMessages || 0);

    result.totalChannels += count;
    result.totalMembers += members;
    result.totalMessages += messages;

    result.byType[stat.channelType] = {
      channels: count,
      members,
      messages
    };
  });

  return result;
};

CommunityChannel.cleanupInactiveChannels = function(daysInactive = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

  return this.update(
    { isActive: false },
    {
      where: {
        isActive: true,
        lastMessageAt: { [require('sequelize').Op.lt]: cutoffDate },
        memberCount: { [require('sequelize').Op.lt]: 5 } // Very low activity
      }
    }
  );
};

// Associations
CommunityChannel.belongsTo(require('./Subject'), {
  foreignKey: 'subjectId',
  as: 'subject'
});

CommunityChannel.belongsTo(require('./Topic'), {
  foreignKey: 'topicId',
  as: 'topic'
});

CommunityChannel.hasMany(require('./CommunityMessage'), {
  foreignKey: 'channelId',
  as: 'messages'
});

module.exports = CommunityChannel;
