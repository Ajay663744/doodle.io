/**
 * ScoreCalculator
 * Handles all scoring calculations for the game
 */

const GAME_CONFIG = require('../config/gameConfig');

class ScoreCalculator {
    /**
     * Calculate guesser score with time-decay
     * @param {number} guessTime - Timestamp when player guessed (ms since round start)
     * @param {number} firstGuessTime - Timestamp of first correct guess (ms since round start)
     * @param {number} roundDuration - Total round duration in seconds
     * @returns {number} Calculated points
     */
    calculateGuesserScore(guessTime, firstGuessTime, roundDuration = GAME_CONFIG.ROUND_DURATION) {
        const maxPoints = GAME_CONFIG.POINTS.MAX_GUESSER_POINTS;
        const decayFactor = GAME_CONFIG.POINTS.TIME_DECAY_FACTOR;

        // If this is the first guess, award max points
        if (firstGuessTime === null || guessTime === firstGuessTime) {
            return maxPoints;
        }

        // Calculate time difference in seconds
        const timeDifference = (guessTime - firstGuessTime) / 1000;

        // Apply decay formula: points = maxPoints - (timeDifference * decayFactor)
        let points = maxPoints - (timeDifference * decayFactor);

        // Ensure minimum points
        points = Math.max(points, GAME_CONFIG.POINTS.MIN_GUESSER_POINTS);

        // Round to nearest integer
        return Math.floor(points);
    }

    /**
     * Calculate drawer score based on participation
     * @param {number} correctGuessCount - Number of players who guessed correctly
     * @param {number} totalGuessersCount - Total number of guessers (excluding drawer)
     * @returns {number} Calculated points for drawer
     */
    calculateDrawerScore(correctGuessCount, totalGuessersCount) {
        const basePoints = GAME_CONFIG.POINTS.DRAWER_BASE;

        // If no guessers, drawer gets 0 points
        if (totalGuessersCount === 0) {
            return 0;
        }

        // Calculate participation rate
        const participationRate = correctGuessCount / totalGuessersCount;

        // Formula: drawerPoints = basePoints × participationRate
        let points = basePoints * participationRate;

        // Round to nearest integer
        points = Math.floor(points);

        // Ensure non-negative
        return Math.max(points, 0);
    }

    /**
     * Calculate time bonus (legacy support)
     * @param {number} timeRemaining - Time remaining in seconds
     * @returns {number} Bonus points
     */
    calculateTimeBonus(timeRemaining) {
        const bonus = Math.floor(timeRemaining * GAME_CONFIG.POINTS.TIME_BONUS_MULTIPLIER);
        return Math.max(bonus, 0);
    }

    /**
     * Get leaderboard from scores
     * @param {object} scores - Score object { userId: points }
     * @param {array} players - Array of player objects
     * @returns {array} Sorted leaderboard
     */
    getLeaderboard(scores, players) {
        console.log('🎯 DEBUG getLeaderboard - Players:', JSON.stringify(players, null, 2));
        console.log('🎯 DEBUG getLeaderboard - Scores:', JSON.stringify(scores, null, 2));

        const leaderboard = players.map(player => ({
            userId: player.userId,
            username: player.username,
            score: scores[player.userId] || 0
        }));

        console.log('🎯 DEBUG getLeaderboard - Mapped leaderboard:', JSON.stringify(leaderboard, null, 2));

        // Sort by score descending
        leaderboard.sort((a, b) => b.score - a.score);

        // Add rank
        leaderboard.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        console.log('🎯 DEBUG getLeaderboard - Final leaderboard:', JSON.stringify(leaderboard, null, 2));

        return leaderboard;
    }

    /**
     * Calculate round scores for all players
     * @param {object} gameState - Current game state
     * @returns {object} Round scores { userId: roundPoints }
     */
    calculateRoundScores(gameState) {
        const roundScores = {};

        // Initialize all players with 0
        gameState.players.forEach(player => {
            roundScores[player.userId] = 0;
        });

        // Calculate guesser scores
        if (gameState.playerGuessTimes) {
            const firstGuessTime = gameState.firstCorrectGuessTime;

            Object.keys(gameState.playerGuessTimes).forEach(userId => {
                const guessTime = gameState.playerGuessTimes[userId];
                const points = this.calculateGuesserScore(
                    guessTime,
                    firstGuessTime,
                    GAME_CONFIG.ROUND_DURATION
                );
                roundScores[userId] = points;
            });
        }

        // Calculate drawer score
        const drawer = gameState.players[gameState.currentDrawerIndex];
        if (drawer) {
            const correctGuessCount = gameState.guessedPlayers.length;
            const totalGuessers = gameState.players.length - 1; // Exclude drawer

            const drawerPoints = this.calculateDrawerScore(correctGuessCount, totalGuessers);
            roundScores[drawer.userId] = drawerPoints;
        }

        return roundScores;
    }

    /**
     * Validate score (prevent negative scores)
     * @param {number} score - Score to validate
     * @returns {number} Valid score
     */
    validateScore(score) {
        return Math.max(0, Math.floor(score));
    }
}

module.exports = new ScoreCalculator();
