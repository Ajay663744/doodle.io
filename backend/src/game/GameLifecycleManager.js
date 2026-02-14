/**
 * GameLifecycleManager
 * Manages complete game lifecycle from start to end
 */

const GAME_CONFIG = require('../config/gameConfig');

class GameLifecycleManager {
    /**
     * Check if game should end
     * @param {object} gameState - Current game state
     * @returns {boolean} True if game should end
     */
    shouldGameEnd(gameState) {
        if (!gameState) return false;

        // Game ends after completing all rounds
        // Each round = all players have drawn once
        const totalPlayers = gameState.players.length;
        const turnsPerRound = totalPlayers;
        const totalTurns = GAME_CONFIG.TOTAL_ROUNDS * turnsPerRound;

        // Calculate total turns completed
        // roundNumber starts at 1, currentDrawerIndex cycles 0 to (players-1)
        const turnsCompleted = (gameState.roundNumber - 1) * turnsPerRound + gameState.currentDrawerIndex + 1;

        return turnsCompleted >= totalTurns;
    }

    /**
     * Check if current round is complete (all players had a turn)
     * @param {object} gameState - Current game state
     * @returns {boolean} True if round is complete
     */
    isRoundComplete(gameState) {
        if (!gameState || !gameState.players) {
            return false;
        }

        // Round is complete when we've cycled back to first player
        const nextDrawerIndex = (gameState.currentDrawerIndex + 1) % gameState.players.length;
        return nextDrawerIndex === 0;
    }

    /**
     * Get game progress info
     * @param {object} gameState - Current game state
     * @returns {object} Progress information
     */
    getGameProgress(gameState) {
        if (!gameState) {
            return {
                currentRound: 0,
                totalRounds: GAME_CONFIG.TOTAL_ROUNDS,
                currentTurn: 0,
                totalTurns: 0,
                progress: 0
            };
        }

        const totalPlayers = gameState.players.length;
        const turnsPerRound = totalPlayers;
        const totalTurns = GAME_CONFIG.TOTAL_ROUNDS * turnsPerRound;
        const turnsCompleted = (gameState.roundNumber - 1) * turnsPerRound + gameState.currentDrawerIndex + 1;

        return {
            currentRound: gameState.roundNumber,
            totalRounds: GAME_CONFIG.TOTAL_ROUNDS,
            currentTurn: gameState.currentDrawerIndex + 1,
            totalTurnsInRound: turnsPerRound,
            turnsCompleted,
            totalTurns,
            progress: Math.floor((turnsCompleted / totalTurns) * 100)
        };
    }

    /**
     * Get final game results
     * @param {object} gameState - Current game state
     * @returns {object} Final results
     */
    getFinalResults(gameState) {
        if (!gameState) {
            return {
                winner: null,
                leaderboard: [],
                totalRounds: 0
            };
        }

        // Sort players by score
        const leaderboard = gameState.players
            .map(player => ({
                userId: player.userId,
                username: player.username,
                score: gameState.scores[player.userId] || 0
            }))
            .sort((a, b) => b.score - a.score)
            .map((entry, index) => ({
                ...entry,
                rank: index + 1
            }));

        const winner = leaderboard[0] || null;

        return {
            winner,
            leaderboard,
            totalRounds: gameState.roundNumber,
            finalScores: gameState.scores
        };
    }

    /**
     * Validate game can start
     * @param {object} gameState - Current game state
     * @returns {object} Validation result { valid, reason }
     */
    validateGameStart(gameState) {
        if (!gameState) {
            return { valid: false, reason: 'Game not found' };
        }

        if (gameState.gameStatus !== GAME_CONFIG.GAME_STATUS.WAITING) {
            return { valid: false, reason: 'Game already started' };
        }

        if (gameState.players.length < GAME_CONFIG.MIN_PLAYERS_TO_START) {
            return {
                valid: false,
                reason: `Need at least ${GAME_CONFIG.MIN_PLAYERS_TO_START} players to start`
            };
        }

        if (gameState.players.length > GAME_CONFIG.MAX_PLAYERS_PER_ROOM) {
            return {
                valid: false,
                reason: `Maximum ${GAME_CONFIG.MAX_PLAYERS_PER_ROOM} players allowed`
            };
        }

        return { valid: true };
    }

    /**
     * Reset game state for new game
     * @param {object} gameState - Current game state
     * @returns {object} Reset game state
     */
    resetGameState(gameState) {
        if (!gameState) return null;

        // Reset scores
        gameState.players.forEach(player => {
            gameState.scores[player.userId] = 0;
        });

        // Reset game state
        gameState.roundNumber = 0;
        gameState.currentDrawerIndex = -1;
        gameState.currentDrawerSocketId = null;
        gameState.currentWord = null;
        gameState.wordOptions = [];
        gameState.guessedPlayers = [];
        gameState.gameStatus = GAME_CONFIG.GAME_STATUS.WAITING;

        // Reset scoring metadata
        gameState.firstCorrectGuessTime = null;
        gameState.playerGuessTimes = {};
        gameState.roundScores = {};
        gameState.roundStartTime = null;

        return gameState;
    }
}

module.exports = new GameLifecycleManager();
