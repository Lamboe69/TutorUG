const Quiz = require('../models/Quiz');
const QuizQuestion = require('../models/QuizQuestion');
const QuizAttempt = require('../models/QuizAttempt');
const UserReputation = require('../models/UserReputation');
const { POINTS_CONFIG } = require('../models/UserReputation');

// Get quizzes for a topic
const getTopicQuizzes = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { difficulty, limit = 10 } = req.query;

    let whereClause = { topicId };
    if (difficulty) {
      whereClause.difficulty = difficulty;
    }

    const quizzes = await Quiz.findAll({
      where: whereClause,
      include: [{
        model: require('../models/Topic'),
        as: 'topic',
        include: [{
          model: require('../models/Subject'),
          as: 'subject'
        }]
      }],
      order: [['difficulty', 'ASC'], ['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: {
        quizzes: quizzes.map(quiz => quiz.toPublicFormat()),
        totalCount: quizzes.length
      }
    });
  } catch (error) {
    console.error('Get topic quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quizzes',
      error: error.message
    });
  }
};

// Get quiz details
const getQuizDetails = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findByPk(quizId, {
      include: [{
        model: require('../models/Topic'),
        as: 'topic',
        include: [{
          model: require('../models/Subject'),
          as: 'subject'
        }]
      }]
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Get quiz statistics
    const stats = await Quiz.getQuizStatistics(quizId);

    res.status(200).json({
      success: true,
      data: {
        quiz: quiz.toPublicFormat(),
        statistics: stats
      }
    });
  } catch (error) {
    console.error('Get quiz details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz details',
      error: error.message
    });
  }
};

// Start quiz attempt
const startQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    // Check if user can attempt this quiz
    const canAttempt = await QuizAttempt.canAttemptQuiz(userId, quizId);

    if (!canAttempt.canAttempt) {
      return res.status(400).json({
        success: false,
        message: canAttempt.reason,
        data: canAttempt
      });
    }

    // Get quiz with questions
    const quiz = await Quiz.findByPk(quizId);
    const questions = await QuizQuestion.findByQuiz(quizId);

    // Create attempt
    const attempt = await QuizAttempt.create({
      quizId,
      userId,
      totalQuestions: questions.length,
      startedAt: new Date()
    });

    // Return quiz with questions (without answers)
    const quizData = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      timeLimitMinutes: quiz.timeLimitMinutes,
      totalQuestions: questions.length,
      attemptId: attempt.id,
      questions: questions.map(q => q.toPublicFormat())
    };

    res.status(200).json({
      success: true,
      message: 'Quiz attempt started',
      data: {
        attempt: {
          id: attempt.id,
          startedAt: attempt.startedAt,
          timeLimitMinutes: quiz.timeLimitMinutes
        },
        quiz: quizData
      }
    });
  } catch (error) {
    console.error('Start quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start quiz attempt',
      error: error.message
    });
  }
};

// Submit quiz answers
const submitQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    // Find attempt
    const attempt = await QuizAttempt.findOne({
      where: { id: attemptId, userId },
      include: [{
        model: Quiz,
        as: 'quiz',
        include: [{
          model: require('../models/Topic'),
          as: 'topic',
          include: [{
            model: require('../models/Subject'),
            as: 'subject'
          }]
        }]
      }]
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Quiz attempt is not in progress'
      });
    }

    // Calculate score
    const scoreResult = await attempt.calculateScore();
    attempt.completedAt = new Date();
    attempt.timeSpentSeconds = Math.floor((attempt.completedAt - attempt.startedAt) / 1000);
    attempt.markAsCompleted();

    // Update best attempt
    await attempt.updateBestAttempt();

    // Award points for quiz completion
    const reputation = await UserReputation.findOrCreateByUserId(userId);
    await reputation.updateStreak();

    let pointsEarned = POINTS_CONFIG.QUIZ_COMPLETED;
    if (attempt.score >= attempt.quiz.passingScore) {
      pointsEarned += POINTS_CONFIG.QUIZ_PASSED;
    }
    if (attempt.score >= 90) {
      pointsEarned += POINTS_CONFIG.QUIZ_HIGH_SCORE;
    }
    if (attempt.score === 100) {
      pointsEarned += POINTS_CONFIG.QUIZ_PERFECT;
    }

    await reputation.addPoints(pointsEarned, `Completed quiz: ${attempt.quiz.title}`);

    // Save attempt
    await attempt.save();

    // Get detailed results
    const detailedResults = await attempt.getDetailedResults();

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        attempt: {
          id: attempt.id,
          score: attempt.score,
          correctAnswers: attempt.correctAnswers,
          totalQuestions: attempt.totalQuestions,
          timeSpentSeconds: attempt.timeSpentSeconds,
          completedAt: attempt.completedAt,
          isBestAttempt: attempt.isBestAttempt
        },
        results: detailedResults,
        pointsEarned,
        passed: attempt.isPassing()
      }
    });
  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};

// Get user's quiz attempts
const getUserQuizAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizId, limit = 10 } = req.query;

    const attempts = await QuizAttempt.findUserAttempts(userId, quizId, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        attempts,
        totalCount: attempts.length
      }
    });
  } catch (error) {
    console.error('Get user quiz attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz attempts',
      error: error.message
    });
  }
};

// Get quiz results
const getQuizResults = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({
      where: { id: attemptId, userId },
      include: [{
        model: Quiz,
        as: 'quiz',
        include: [{
          model: require('../models/Topic'),
          as: 'topic',
          include: [{
            model: require('../models/Subject'),
            as: 'subject'
          }]
        }]
      }]
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    const detailedResults = await attempt.getDetailedResults();

    res.status(200).json({
      success: true,
      data: {
        attempt: {
          id: attempt.id,
          score: attempt.score,
          correctAnswers: attempt.correctAnswers,
          totalQuestions: attempt.totalQuestions,
          timeSpentSeconds: attempt.timeSpentSeconds,
          startedAt: attempt.startedAt,
          completedAt: attempt.completedAt,
          status: attempt.status,
          isBestAttempt: attempt.isBestAttempt
        },
        quiz: attempt.quiz.toPublicFormat(),
        results: detailedResults,
        passed: attempt.isPassing()
      }
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz results',
      error: error.message
    });
  }
};

// Get quiz leaderboard
const getQuizLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { limit = 50 } = req.query;

    const leaderboard = await QuizAttempt.findByQuiz(quizId, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        quizId,
        leaderboard,
        totalCount: leaderboard.length
      }
    });
  } catch (error) {
    console.error('Get quiz leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz leaderboard',
      error: error.message
    });
  }
};

module.exports = {
  getTopicQuizzes,
  getQuizDetails,
  startQuizAttempt,
  submitQuizAttempt,
  getUserQuizAttempts,
  getQuizResults,
  getQuizLeaderboard
};
