const User = require('../models/User');
const GameHistory = require('../models/GameHistory');

/**
 * @desc    Get global leaderboard (top players by total score)
 * @route   GET /api/leaderboard
 * @access  Private
 *
 * Query Params:
 *   - limit (optional, default: 10) - number of players to return
 *
 * Example Response:
 * {
 *   "success": true,
 *   "data": [
 *     { "rank": 1, "name": "Alice", "totalScore": 3200, "gamesPlayed": 15 },
 *     { "rank": 2, "name": "Bob",   "totalScore": 2800, "gamesPlayed": 12 }
 *   ]
 * }
 */
const getLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const players = await User.find({ gamesPlayed: { $gt: 0 } })
            .select('name totalScore gamesPlayed')
            .sort({ totalScore: -1 })
            .limit(limit);

        const leaderboard = players.map((player, index) => ({
            rank: index + 1,
            id: player._id,
            name: player.name,
            totalScore: player.totalScore || 0,
            gamesPlayed: player.gamesPlayed || 0
        }));

        res.status(200).json({
            success: true,
            count: leaderboard.length,
            data: leaderboard
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching leaderboard' });
    }
};

/**
 * @desc    Get authenticated user's game history
 * @route   GET /api/games/history
 * @access  Private
 *
 * Query Params:
 *   - page   (optional, default: 1)
 *   - limit  (optional, default: 10)
 *
 * Example Response:
 * {
 *   "success": true,
 *   "total": 5,
 *   "page": 1,
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
const getGameHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const userId = req.user.id;

        const [games, total] = await Promise.all([
            GameHistory.find({ 'players.userId': userId })
                .sort({ playedAt: -1 })
                .skip(skip)
                .limit(limit),
            GameHistory.countDocuments({ 'players.userId': userId })
        ]);

        const data = games.map(game => {
            const myRecord = game.players.find(p => p.userId.toString() === userId);
            return {
                roomId: game.roomId,
                roomName: game.roomName || game.roomId,
                playedAt: game.playedAt,
                totalRounds: game.totalRounds,
                myScore: myRecord ? myRecord.score : 0,
                myRank: myRecord ? myRecord.rank : null,
                winner: game.winner
                    ? { username: game.winner.username, score: game.winner.score }
                    : null,
                playerCount: game.players.length
            };
        });

        res.status(200).json({
            success: true,
            total,
            page,
            pages: Math.ceil(total / limit),
            data
        });
    } catch (error) {
        console.error('GameHistory error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching game history' });
    }
};

module.exports = { getLeaderboard, getGameHistory };
