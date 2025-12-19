const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserReputation = sequelize.define('UserReputation', {
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
  totalPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_points'
  },
  currentLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'current_level'
  },
  rank: {
    type: DataTypes.ENUM('learner', 'helper', 'tutor', 'expert', 'master'),
    allowNull: false,
    defaultValue: 'learner',
    field: 'rank'
  },
  streakDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'streak_days'
  },
  longestStreak: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'longest_streak'
  },
  badgesEarned: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
    field: 'badges_earned'
  },
  achievementsUnlocked: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
    field: 'achievements_unlocked'
  },
  weeklyPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'weekly_points'
  },
  monthlyPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'monthly_points'
  },
  lastActivityDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_activity_date'
  },
  weekStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'week_start_date'
  },
  monthStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'month_start_date'
  }
}, {
  tableName: 'user_reputations',
  indexes: [
    { fields: ['user_id'], unique: true },
    { fields: ['total_points'] },
    { fields: ['current_level'] },
    { fields: ['rank'] },
    { fields: ['streak_days'] }
  ],
  timestamps: true,
  underscored: true
});

// Points and leveling constants
const POINTS_CONFIG = {
  // Quiz related
  QUIZ_COMPLETED: 10,
  QUIZ_PASSED: 25,
  QUIZ_HIGH_SCORE: 50, // 90%+ score
  QUIZ_PERFECT: 100,   // 100% score

  // Learning activities
  TOPIC_COMPLETED: 5,
  SUBTOPIC_COMPLETED: 2,
  AI_CHAT_MESSAGE: 1,
  STUDY_STREAK_DAY: 3,

  // Community
  COMMUNITY_POST: 5,
  HELPFUL_RESPONSE: 10,
  QUESTION_ANSWERED: 15,

  // Special achievements
  FIRST_QUIZ: 20,
  WEEKLY_STREAK_7: 50,
  MONTHLY_STREAK_30: 200,
  SUBJECT_MASTER: 100, // Complete all topics in a subject
  HIGH_SCORER: 75     // Top 10% in leaderboard
};

const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  1750,   // Level 6
  2750,   // Level 7
  4000,   // Level 8
  5500,   // Level 9
  7500    // Level 10
];

const RANK_THRESHOLDS = {
  learner: 0,
  helper: 500,
  tutor: 1500,
  expert: 3000,
  master: 6000
};

// Instance methods
UserReputation.prototype.addPoints = async function(points, reason = null) {
  const oldLevel = this.currentLevel;
  const oldRank = this.rank;

  this.totalPoints += points;
  this.weeklyPoints += points;
  this.monthlyPoints += points;
  this.lastActivityDate = new Date();

  // Update level
  this.currentLevel = this.calculateLevel();

  // Update rank
  this.rank = this.calculateRank();

  // Check for badges and achievements
  await this.checkForBadges();
  await this.checkForAchievements();

  // Log the points transaction
  await this.logPointsTransaction(points, reason);

  // Save changes
  await this.save();

  return {
    pointsAdded: points,
    newTotal: this.totalPoints,
    levelChanged: oldLevel !== this.currentLevel,
    rankChanged: oldRank !== this.rank,
    newLevel: this.currentLevel,
    newRank: this.rank
  };
};

UserReputation.prototype.calculateLevel = function() {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (this.totalPoints >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
};

UserReputation.prototype.calculateRank = function() {
  if (this.totalPoints >= RANK_THRESHOLDS.master) return 'master';
  if (this.totalPoints >= RANK_THRESHOLDS.expert) return 'expert';
  if (this.totalPoints >= RANK_THRESHOLDS.tutor) return 'tutor';
  if (this.totalPoints >= RANK_THRESHOLDS.helper) return 'helper';
  return 'learner';
};

UserReputation.prototype.updateStreak = async function() {
  const today = new Date().toISOString().split('T')[0];
  const lastActivity = this.lastActivityDate?.toISOString().split('T')[0];

  if (lastActivity === today) {
    // Already updated today
    return { streakContinued: false, currentStreak: this.streakDays };
  }

  if (this.isConsecutiveDay(lastActivity, today)) {
    // Continue streak
    this.streakDays += 1;
    if (this.streakDays > this.longestStreak) {
      this.longestStreak = this.streakDays;
    }
  } else {
    // Reset streak
    this.streakDays = 1;
  }

  await this.save();

  return {
    streakContinued: true,
    currentStreak: this.streakDays,
    longestStreak: this.longestStreak
  };
};

UserReputation.prototype.isConsecutiveDay = function(lastDate, today) {
  if (!lastDate) return false;

  const last = new Date(lastDate);
  const current = new Date(today);
  const diffTime = Math.abs(current - last);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays === 1;
};

UserReputation.prototype.checkForBadges = async function() {
  const newBadges = [];

  // Study streak badges
  if (this.streakDays >= 7 && !this.badgesEarned.includes('week_warrior')) {
    newBadges.push('week_warrior');
  }
  if (this.streakDays >= 30 && !this.badgesEarned.includes('month_master')) {
    newBadges.push('month_master');
  }
  if (this.longestStreak >= 100 && !this.badgesEarned.includes('century_streak')) {
    newBadges.push('century_streak');
  }

  // Points badges
  if (this.totalPoints >= 1000 && !this.badgesEarned.includes('point_hoarder_1000')) {
    newBadges.push('point_hoarder_1000');
  }
  if (this.totalPoints >= 5000 && !this.badgesEarned.includes('point_hoarder_5000')) {
    newBadges.push('point_hoarder_5000');
  }

  // Level badges
  if (this.currentLevel >= 5 && !this.badgesEarned.includes('level_5_climber')) {
    newBadges.push('level_5_climber');
  }
  if (this.currentLevel >= 10 && !this.badgesEarned.includes('level_10_achiever')) {
    newBadges.push('level_10_achiever');
  }

  if (newBadges.length > 0) {
    this.badgesEarned = [...this.badgesEarned, ...newBadges];
    await this.save();

    // Award bonus points for badges
    for (const badge of newBadges) {
      await this.addPoints(POINTS_CONFIG[badge.toUpperCase()] || 25, `Earned badge: ${badge}`);
    }
  }

  return newBadges;
};

UserReputation.prototype.checkForAchievements = async function() {
  const newAchievements = [];

  // Quiz achievements
  const QuizAttempt = require('./QuizAttempt');
  const quizAttempts = await QuizAttempt.count({
    where: { userId: this.userId, status: 'completed' }
  });

  if (quizAttempts >= 10 && !this.achievementsUnlocked.includes('quiz_taker_10')) {
    newAchievements.push('quiz_taker_10');
  }
  if (quizAttempts >= 50 && !this.achievementsUnlocked.includes('quiz_taker_50')) {
    newAchievements.push('quiz_taker_50');
  }

  // Perfect scores
  const perfectScores = await QuizAttempt.count({
    where: { userId: this.userId, score: 100, status: 'completed' }
  });

  if (perfectScores >= 5 && !this.achievementsUnlocked.includes('perfect_scorer_5')) {
    newAchievements.push('perfect_scorer_5');
  }

  if (newAchievements.length > 0) {
    this.achievementsUnlocked = [...this.achievementsUnlocked, ...newAchievements];
    await this.save();
  }

  return newAchievements;
};

UserReputation.prototype.logPointsTransaction = async function(points, reason) {
  // This would create a ReputationHistory record
  // For now, we'll implement this when we create that model
  console.log(`User ${this.userId} earned ${points} points: ${reason}`);
};

UserReputation.prototype.getLeaderboardPosition = async function() {
  const higherRanked = await this.constructor.count({
    where: {
      totalPoints: { [require('sequelize').Op.gt]: this.totalPoints }
    }
  });

  return higherRanked + 1;
};

UserReputation.prototype.getWeeklyProgress = async function() {
  const weekStart = this.getWeekStart();
  const weekAttempts = await require('./QuizAttempt').count({
    where: {
      userId: this.userId,
      completedAt: { [require('sequelize').Op.gte]: weekStart },
      status: 'completed'
    }
  });

  return {
    weekStart,
    pointsThisWeek: this.weeklyPoints,
    quizzesThisWeek: weekAttempts,
    targetPoints: 100, // Weekly target
    targetQuizzes: 5   // Weekly target
  };
};

UserReputation.prototype.getWeekStart = function() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
  return new Date(now.setDate(diff));
};

UserReputation.prototype.resetWeeklyStats = function() {
  const newWeekStart = this.getWeekStart();
  if (!this.weekStartDate || this.weekStartDate < newWeekStart) {
    this.weeklyPoints = 0;
    this.weekStartDate = newWeekStart;
  }
};

UserReputation.prototype.resetMonthlyStats = function() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  if (!this.monthStartDate ||
      this.monthStartDate.getMonth() !== currentMonth ||
      this.monthStartDate.getFullYear() !== currentYear) {
    this.monthlyPoints = 0;
    this.monthStartDate = new Date(currentYear, currentMonth, 1);
  }
};

// Class methods
UserReputation.findOrCreateByUserId = async function(userId) {
  let reputation = await this.findOne({ where: { userId } });

  if (!reputation) {
    reputation = await this.create({ userId });
  }

  // Reset weekly/monthly stats if needed
  reputation.resetWeeklyStats();
  reputation.resetMonthlyStats();
  await reputation.save();

  return reputation;
};

UserReputation.getLeaderboard = function(limit = 50, timeframe = 'all') {
  let whereClause = {};

  if (timeframe === 'weekly') {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    whereClause.lastActivityDate = { [require('sequelize').Op.gte]: weekStart };
  } else if (timeframe === 'monthly') {
    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 30);
    whereClause.lastActivityDate = { [require('sequelize').Op.gte]: monthStart };
  }

  return this.findAll({
    where: whereClause,
    include: [{
      model: require('./User'),
      as: 'user',
      attributes: ['firstName', 'lastName', 'currentClass']
    }],
    order: [['totalPoints', 'DESC'], ['lastActivityDate', 'ASC']],
    limit
  });
};

UserReputation.getRankDistribution = async function() {
  const ranks = await this.findAll({
    attributes: [
      'rank',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
    ],
    group: ['rank']
  });

  const distribution = {};
  ranks.forEach(rank => {
    distribution[rank.rank] = parseInt(rank.dataValues.count);
  });

  return distribution;
};

UserReputation.awardPoints = async function(userId, points, reason) {
  const reputation = await this.findOrCreateByUserId(userId);
  return await reputation.addPoints(points, reason);
};

// Associations
UserReputation.belongsTo(require('./User'), {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = UserReputation;
module.exports.POINTS_CONFIG = POINTS_CONFIG;
module.exports.LEVEL_THRESHOLDS = LEVEL_THRESHOLDS;
module.exports.RANK_THRESHOLDS = RANK_THRESHOLDS;
