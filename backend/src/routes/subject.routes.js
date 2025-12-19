const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubject,
  getSubjectTopics,
  getTopic,
  getSubtopic,
  searchContent,
  getRecommended
} = require('../controllers/subjectController');
const { authenticateToken, optionalAuth } = require('../utils/jwt');

// Get all subjects (public, but can include progress for authenticated users)
router.get('/', optionalAuth, getSubjects);

// Get single subject with topics
router.get('/:subjectId', optionalAuth, getSubject);

// Get topics for a subject
router.get('/:subjectId/topics', optionalAuth, getSubjectTopics);

// Get single topic with subtopics
router.get('/topic/:topicId', optionalAuth, getTopic);

// Get single subtopic
router.get('/subtopic/:subtopicId', optionalAuth, getSubtopic);

// Search content
router.get('/search', optionalAuth, searchContent);

// Get recommended content (requires authentication)
router.get('/recommended', authenticateToken, getRecommended);

module.exports = router;
