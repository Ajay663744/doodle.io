const User = require('../models/User');
const GameHistory = require('../models/GameHistory');

/**
 * @desc    Get authenticated user's profile + stats
 * @route   GET /api/users/profile
 * @access  Private
 *
 * Example Response:
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
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                totalScore: user.totalScore || 0,
                gamesPlayed: user.gamesPlayed || 0,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('GetProfile error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
};

module.exports = { getProfile };
