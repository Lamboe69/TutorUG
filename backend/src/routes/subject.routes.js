const express = require('express');
const router = express.Router();
// const {
//   getSubjects,
//   getSubjectTopics,
//   // ... other controllers
// } = require('../controllers/subjectController');
// const { authenticateToken, requireActiveSubscription } = require('../utils/jwt');

// Placeholder routes - will implement later
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Subjects endpoint - coming soon',
    data: []
  });
});

router.get('/:subjectId/topics', (req, res) => {
  res.json({
    success: true,
    message: 'Topics endpoint - coming soon',
    data: []
  });
});

module.exports = router;
