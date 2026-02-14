/**
 * Lobby and Leaderboard Socket Handlers
 * Handles player ready status, lobby updates, and round summaries
 */

const GameStateManager = require('../game/GameStateManager');

/**
 * Initialize lobby and leaderboard socket handlers
 * @param {object} io - Socket.io instance
 * @param {object} socket - Socket instance
 */
function initializeLobbyHandlers(io, socket) {
    /**
     * Player toggles ready status
     */
    socket.on('player_ready_toggle', ({ roomId, userId }) => {
        try {
            const gameState = GameStateManager.getGame(roomId);

            if (!gameState) {
                socket.emit('game_error', { message: 'Game not found' });
                return;
            }

            // Find player and toggle ready status
            const player = gameState.players.find(p => p.userId === userId);
            if (!player) {
                socket.emit('game_error', { message: 'Player not found' });
                return;
            }

            // Toggle ready status
            player.isReady = !player.isReady;
            gameState.lastActivity = new Date();

            console.log(`🎮 Player ${player.username} is now ${player.isReady ? 'READY' : 'NOT READY'} in room: ${roomId}`);

            // Get lobby status
            const lobbyStatus = getLobbyStatus(gameState);

            // Emit lobby status update to all players in room
            io.to(roomId).emit('lobby_status_update', lobbyStatus);

        } catch (error) {
            console.error('Error toggling player ready:', error);
            socket.emit('game_error', { message: 'Failed to toggle ready status' });
        }
    });

    /**
     * Request current lobby status
     */
    socket.on('get_lobby_status', ({ roomId }) => {
        try {
            const gameState = GameStateManager.getGame(roomId);

            if (!gameState) {
                socket.emit('game_error', { message: 'Game not found' });
                return;
            }

            const lobbyStatus = getLobbyStatus(gameState);
            socket.emit('lobby_status_update', lobbyStatus);

        } catch (error) {
            console.error('Error getting lobby status:', error);
            socket.emit('game_error', { message: 'Failed to get lobby status' });
        }
    });
}

/**
 * Get lobby status from game state
 * @param {object} gameState - Game state
 * @returns {object} Lobby status
 */
function getLobbyStatus(gameState) {
    const readyPlayers = gameState.players.filter(p => p.isReady).length;
    const totalPlayers = gameState.players.length;
    const minPlayersRequired = 2; // From GAME_CONFIG.MIN_PLAYERS_TO_START

    const canStart = readyPlayers >= minPlayersRequired &&
        gameState.gameStatus === 'waiting';

    return {
        totalPlayers,
        readyPlayers,
        canStart,
        minPlayersRequired,
        gameStatus: gameState.gameStatus,
        players: gameState.players.map(p => ({
            userId: p.userId,
            username: p.username,
            isHost: p.isHost,
            isReady: p.isReady,
            isDrawing: p.isDrawing || false,
            hasGuessedCorrectly: p.hasGuessedCorrectly || false
        }))
    };
}

/**
 * Create round result summary
 * @param {object} gameState - Game state
 * @param {object} finalRoundScores - Final round scores
 * @param {array} leaderboard - Current leaderboard
 * @returns {object} Round summary
 */
function createRoundSummary(gameState, finalRoundScores, leaderboard) {
    const drawer = gameState.players[gameState.currentDrawerIndex];

    // Get players who guessed correctly
    const correctGuessers = gameState.players.filter(p =>
        gameState.guessedPlayers.includes(p.userId)
    ).map(p => ({
        userId: p.userId,
        username: p.username,
        points: finalRoundScores[p.userId] || 0
    }));

    return {
        correctWord: gameState.currentWord,
        drawer: {
            userId: drawer?.userId,
            username: drawer?.username,
            points: finalRoundScores[drawer?.userId] || 0
        },
        correctGuessers,
        roundScores: finalRoundScores,
        totalScores: gameState.scores,
        leaderboard,
        roundNumber: gameState.roundNumber,
        guessedCount: gameState.guessedPlayers.length,
        totalGuessers: gameState.players.length - 1
    };
}

module.exports = {
    initializeLobbyHandlers,
    getLobbyStatus,
    createRoundSummary
};
