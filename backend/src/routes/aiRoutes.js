const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateHint } = require('../controllers/aiController');

/**
 * POST /api/ai/hint
 * Requires: valid JWT token (drawer must be authenticated)
 * Body:    { word: string }
 * Returns: { success: true, image: "data:image/png;base64,..." }
 */
router.post('/hint', protect, generateHint);

module.exports = router;
