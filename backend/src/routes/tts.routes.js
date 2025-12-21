const express = require('express');
const router = express.Router();
const { synthesizeText } = require('../controllers/ttsController');
const { authenticateToken } = require('../utils/jwt');

// Protected TTS endpoint: synthesize text to audio
router.post('/synthesize', authenticateToken, synthesizeText);

module.exports = router;
