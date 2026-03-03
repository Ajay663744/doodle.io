const express = require('express');
const { getLeaderboard, getGameHistory } = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All game routes are protected
router.use(protect);

/**
 * GET /api/leaderboard
 * Returns top players globally sorted by totalScore.
 *
 * Query Params:
 *   - limit (optional, default: 10)
 *
 * Response 200:
 * {
 *   "success": true,
 *   "count": 10,
 *   "data": [
 *     { "rank": 1, "name": "Alice", "totalScore": 3200, "gamesPlayed": 15 },
 *     { "rank": 2, "name": "Bob",   "totalScore": 2800, "gamesPlayed": 12 }
 *   ]
 * }
 */
router.get('/leaderboard', getLeaderboard);

/**
 * GET /api/games/history
 * Returns paginated list of the authenticated user's completed games.
 *
 * Query Params:
 *   - page  (optional, default: 1)
 *   - limit (optional, default: 10)
 *
 * Response 200:
 * {
 *   "success": true,
 *   "total": 5,
 *   "page": 1,
 *   "pages": 1,
 *   "data": [
 *     {
 *       "roomId": "ABC123",
 *       "roomName": "Fun Room",
 *       "playedAt": "2026-03-01T...",
 *       "totalRounds": 3,
 *       "myScore": 450,
 *       "myRank": 2,
 *       "winner": { "username": "Alice", "score": 680 },
 *       "playerCount": 4
 *     }
 *   ]
 * }
 */
router.get('/history', getGameHistory);

module.exports = router;
