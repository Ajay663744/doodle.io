const express = require('express');
const { getProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All user routes are protected
router.use(protect);

/**
 * GET /api/users/profile
 * Returns authenticated user profile + lifetime stats (totalScore, gamesPlayed)
 *
 * Headers: Authorization: Bearer <token>
 *
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "64abc...",
 *     "name": "Alice",
 *     "email": "alice@example.com",
 *     "totalScore": 1250,
 *     "gamesPlayed": 8,
 *     "createdAt": "2025-02-10T..."
 *   }
 * }
 */
router.get('/profile', getProfile);

module.exports = router;
