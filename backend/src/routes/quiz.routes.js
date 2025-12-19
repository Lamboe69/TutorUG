const express = require('express');
const router = express.Router();
const {
  getTopicQuizzes,
  getQuizDetails,
  startQuizAttempt,
  submitQuizAttempt,
  getUserQuizAttempts,
  getQuizResults,
  getQuizLeaderboard
} = require('../controllers/quizController');
const { authenticateToken } = require('../utils/jwt');

// All quiz routes require authentication
router.use(authenticateToken);

// Quiz browsing and details
router.get('/topics/:topicId/quizzes', getTopicQuizzes);
router.get('/quizzes/:quizId', getQuizDetails);

// Quiz attempts
router.post('/quizzes/:quizId/attempts', startQuizAttempt);
router.post('/attempts/:attemptId/submit', submitQuizAttempt);
router.get('/attempts/:attemptId/results', getQuizResults);

// User quiz history
router.get('/user/attempts', getUserQuizAttempts);

// Quiz leaderboards
router.get('/quizzes/:quizId/leaderboard', getQuizLeaderboard);

module.exports = router;
