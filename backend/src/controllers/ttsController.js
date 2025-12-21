const ttsService = require('../services/ttsService');

// POST /api/tts/synthesize
async function synthesizeText(req, res) {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'Missing `text` in request body' });
    }

    const result = await ttsService.synthesize(text, { voice: req.body.voice });

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('TTS synthesize error:', err);
    res.status(500).json({ success: false, message: 'Failed to synthesize text', error: err.message });
  }
}

module.exports = { synthesizeText };
