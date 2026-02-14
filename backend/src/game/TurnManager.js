/**
 * TurnManager
 * Handles turn rotation and drawer selection using round-robin system
 */

const GAME_CONFIG = require('../config/gameConfig');

class TurnManager {
    /**
     * Get the next drawer in round-robin fashion
     * @param {object} gameState - Current game state
     * @returns {object} Next drawer info { index, socketId, userId, username }
     */
    getNextDrawer(gameState) {
        if (!gameState || !gameState.players || gameState.players.length === 0) {
            return null;
        }

        // Move to next player in round-robin
        const nextIndex = (gameState.currentDrawerIndex + 1) % gameState.players.length;
        const nextDrawer = gameState.players[nextIndex];

        return {
            index: nextIndex,
            socketId: nextDrawer.socketId,
            userId: nextDrawer.userId,
            username: nextDrawer.username
        };
    }

    /**
     * Get the first drawer (when game starts)
     * @param {object} gameState - Current game state
     * @returns {object} First drawer info { index, socketId, userId, username }
     */
    getFirstDrawer(gameState) {
        if (!gameState || !gameState.players || gameState.players.length === 0) {
            return null;
        }

        const firstDrawer = gameState.players[0];
        return {
            index: 0,
            socketId: firstDrawer.socketId,
            userId: firstDrawer.userId,
            username: firstDrawer.username
        };
    }

    /**
     * Check if all players have had a turn in the current round
     * @param {object} gameState - Current game state
     * @returns {boolean} True if round is complete
     */
    isRoundComplete(gameState) {
        if (!gameState || !gameState.players) {
            return false;
        }

        // If we've cycled back to the first player, round is complete
        const nextIndex = (gameState.currentDrawerIndex + 1) % gameState.players.length;
        return nextIndex === 0;
    }

    /**
     * Validate if a player can be the drawer
     * @param {string} socketId - Socket ID of the player
     * @param {object} gameState - Current game state
     * @returns {boolean} True if player can draw
     */
    canPlayerDraw(socketId, gameState) {
        if (!gameState || !socketId) {
            return false;
        }

        // Check if player exists in the game
        const player = gameState.players.find(p => p.socketId === socketId);
        return !!player;
    }

    /**
     * Get current drawer info
     * @param {object} gameState - Current game state
     * @returns {object|null} Current drawer info or null
     */
    getCurrentDrawer(gameState) {
        if (!gameState || !gameState.players || gameState.currentDrawerIndex === undefined) {
            return null;
        }

        const drawer = gameState.players[gameState.currentDrawerIndex];
        if (!drawer) return null;

        return {
            index: gameState.currentDrawerIndex,
            socketId: drawer.socketId,
            userId: drawer.userId,
            username: drawer.username
        };
    }

    /**
     * Get list of players who should guess (everyone except drawer)
     * @param {object} gameState - Current game state
     * @returns {array} Array of guesser players
     */
    getGuessers(gameState) {
        if (!gameState || !gameState.players) {
            return [];
        }

        return gameState.players.filter((player, index) => {
            return index !== gameState.currentDrawerIndex;
        });
    }

    /**
     * Check if all guessers have guessed correctly
     * @param {object} gameState - Current game state
     * @returns {boolean} True if all guessers have guessed
     */
    haveAllGuessersGuessed(gameState) {
        if (!gameState) return false;

        const guessers = this.getGuessers(gameState);
        const guessedPlayers = gameState.guessedPlayers || [];

        // If no guessers, return true
        if (guessers.length === 0) return true;

        // Check if all guessers have guessed
        return guessers.every(guesser =>
            guessedPlayers.includes(guesser.userId)
        );
    }
}

module.exports = new TurnManager();
