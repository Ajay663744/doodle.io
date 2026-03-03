const mongoose = require('mongoose');

/**
 * GameHistory Model
 * Persists completed game sessions for history and global leaderboard purposes.
 */
const gameHistorySchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    roomName: {
        type: String,
        trim: true
    },
    playedAt: {
        type: Date,
        default: Date.now
    },
    totalRounds: {
        type: Number,
        default: 0
    },
    players: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            username: String,
            score: { type: Number, default: 0 },
            rank: { type: Number, default: 0 }
        }
    ],
    winner: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        score: { type: Number, default: 0 }
    },
    leaderboard: [
        {
            rank: Number,
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            username: String,
            score: Number
        }
    ]
});

// Index for fast user-specific history queries
gameHistorySchema.index({ 'players.userId': 1, playedAt: -1 });
gameHistorySchema.index({ roomId: 1 });

module.exports = mongoose.model('GameHistory', gameHistorySchema);
