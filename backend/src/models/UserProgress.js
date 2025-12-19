const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserProgress = sequelize.define('UserProgress', {
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
  subtopicId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'subtopics',
      key: 'id'
    },
    field: 'subtopic_id'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'not_started',
    field: 'status'
  },
  completionPercentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'completion_percentage'
  },
  quizAttempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'quiz_attempts'
  },
  bestQuizScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'best_quiz_score'
  },
  latestQuizScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'latest_quiz_score'
  },
  averageQuizScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'average_quiz_score'
  },
  timeSpentSeconds: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'time_spent_seconds'
  },
  lastAccessed: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_accessed'
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'started_at'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'review_count'
  },
  struggleIndicators: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'struggle_indicators'
  }
}, {
  tableName: 'user_progress',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['subject_id'] },
    { fields: ['topic_id'] },
    { fields: ['subtopic_id'] },
    { fields: ['status'] },
    { unique: true, fields: ['user_id', 'subtopic_id'] }
  ],
  timestamps: true,
  underscored: true
});

// Instance methods
UserProgress.prototype.markAsStarted = function() {
  if (this.status === 'not_started') {
    this.status = 'in_progress';
    this.startedAt = new Date();
  }
  this.lastAccessed = new Date();
};

UserProgress.prototype.markAsCompleted = function() {
  this.status = 'completed';
  this.completionPercentage = 100;
  this.completedAt = new Date();
  this.lastAccessed = new Date();
};

UserProgress.prototype.updateQuizScore = function(score) {
  this.quizAttempts += 1;
  this.latestQuizScore = score;

  // Update best score
  if (!this.bestQuizScore || score > this.bestQuizScore) {
    this.bestQuizScore = score;
  }

  // Calculate new average
  const totalScore = (this.averageQuizScore || 0) * (this.quizAttempts - 1) + score;
  this.averageQuizScore = totalScore / this.quizAttempts;
};

UserProgress.prototype.addTimeSpent = function(seconds) {
  this.timeSpentSeconds += seconds;
  this.lastAccessed = new Date();
};

UserProgress.prototype.recordStruggle = function(indicator) {
  const indicators = this.struggleIndicators || [];
  indicators.push({
    type: indicator.type,
    description: indicator.description,
    timestamp: new Date(),
    context: indicator.context
  });
  this.struggleIndicators = indicators;
};

UserProgress.prototype.incrementReview = function() {
  this.reviewCount += 1;
  this.lastAccessed = new Date();
};

// Class methods
UserProgress.getUserSubjectProgress = function(userId, subjectId) {
  return this.findAll({
    where: { userId, subjectId },
    include: [
      { model: require('./Topic'), as: 'topic' },
      { model: require('./Subtopic'), as: 'subtopic' }
    ],
    order: [['updatedAt', 'DESC']]
  });
};

UserProgress.getUserOverallProgress = async function(userId) {
  const progress = await this.findAll({
    where: { userId },
    attributes: [
      'status',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
    ],
    group: ['status']
  });

  const stats = {
    totalTopics: 0,
    completedTopics: 0,
    inProgressTopics: 0,
    notStartedTopics: 0,
    totalTimeSpent: 0,
    averageQuizScore: 0
  };

  progress.forEach(item => {
    const count = parseInt(item.dataValues.count);
    switch (item.status) {
      case 'completed':
        stats.completedTopics = count;
        break;
      case 'in_progress':
        stats.inProgressTopics = count;
        break;
      case 'not_started':
        stats.notStartedTopics = count;
        break;
    }
    stats.totalTopics += count;
  });

  // Get total time spent and average score
  const aggregates = await this.findAll({
    where: { userId },
    attributes: [
      [require('sequelize').fn('SUM', require('sequelize').col('time_spent_seconds')), 'totalTime'],
      [require('sequelize').fn('AVG', require('sequelize').col('average_quiz_score')), 'avgScore']
    ]
  });

  if (aggregates.length > 0) {
    stats.totalTimeSpent = parseInt(aggregates[0].dataValues.totalTime || 0);
    stats.averageQuizScore = parseFloat(aggregates[0].dataValues.avgScore || 0);
  }

  return stats;
};

UserProgress.getSubjectCompletionStats = async function(userId) {
  const subjects = await require('./Subject').findAll({ where: { isActive: true } });
  const stats = [];

  for (const subject of subjects) {
    const progress = await this.findAll({
      where: { userId, subjectId: subject.id },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status']
    });

    let completed = 0;
    let total = 0;

    progress.forEach(item => {
      total += parseInt(item.dataValues.count);
      if (item.status === 'completed') {
        completed += parseInt(item.dataValues.count);
      }
    });

    stats.push({
      subjectId: subject.id,
      subjectName: subject.name,
      completed,
      total,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    });
  }

  return stats;
};

UserProgress.findOrCreateProgress = async function(userId, subtopicId) {
  let progress = await this.findOne({
    where: { userId, subtopicId }
  });

  if (!progress) {
    // Get subtopic details to populate subject/topic IDs
    const Subtopic = require('./Subtopic');
    const subtopic = await Subtopic.findByPk(subtopicId, {
      include: [{
        model: require('./Topic'),
        as: 'topic'
      }]
    });

    if (subtopic) {
      progress = await this.create({
        userId,
        subjectId: subtopic.topic.subjectId,
        topicId: subtopic.topicId,
        subtopicId
      });
    }
  }

  return progress;
};

UserProgress.getStreakData = async function(userId) {
  // Get last 30 days of activity
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentActivity = await this.findAll({
    where: {
      userId,
      lastAccessed: { [require('sequelize').Op.gte]: thirtyDaysAgo }
    },
    attributes: [
      [require('sequelize').fn('DATE', require('sequelize').col('last_accessed')), 'date'],
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'activities']
    ],
    group: ['date'],
    order: [['date', 'DESC']]
  });

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const todayActivity = recentActivity.find(a => a.dataValues.date === today);
  const yesterdayActivity = recentActivity.find(a => a.dataValues.date === yesterday);

  if (todayActivity || yesterdayActivity) {
    currentStreak = 1; // At least today or yesterday

    // Count consecutive days backwards from today
    for (let i = 1; i <= 30; i++) {
      const checkDate = new Date(Date.now() - (i * 86400000)).toISOString().split('T')[0];
      const activity = recentActivity.find(a => a.dataValues.date === checkDate);

      if (activity) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    recentActivity: recentActivity.map(a => ({
      date: a.dataValues.date,
      activities: parseInt(a.dataValues.activities)
    }))
  };
};

// Associations
UserProgress.belongsTo(require('./User'), {
  foreignKey: 'userId',
  as: 'user'
});

UserProgress.belongsTo(require('./Subject'), {
  foreignKey: 'subjectId',
  as: 'subject'
});

UserProgress.belongsTo(require('./Topic'), {
  foreignKey: 'topicId',
  as: 'topic'
});

UserProgress.belongsTo(require('./Subtopic'), {
  foreignKey: 'subtopicId',
  as: 'subtopic'
});

module.exports = UserProgress;
