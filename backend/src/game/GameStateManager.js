/**
 * GameStateManager
 * Central manager for all game states in memory
 */

const GAME_CONFIG = require('../config/gameConfig');
const TurnManager = require('./TurnManager');
const WordManager = require('./WordManager');
const ScoreCalculator = require('./ScoreCalculator');

class GameStateManager {
    constructor() {
        // In-memory storage: roomId -> GameState
        this.games = new Map();
    }

    /**
     * Create a new game state for a room
     * @param {string} roomId - Room ID
     * @param {array} players - Array of player objects
     * @returns {object} Created game state
     */
    createGame(roomId, players = []) {
        const gameState = {
            roomId,
            players: players.map((player, index) => ({
                socketId: player.socketId,
                userId: player.userId,
                username: player.username,
                isHost: index === 0, // First player is host
                isReady: false,      // Ready status for lobby
                isDrawing: false,    // Currently drawing
                hasGuessedCorrectly: false  // Guessed correctly this round
            })),
            currentDrawerIndex: -1,
            currentDrawerSocketId: null,
            currentWord: null,
            wordOptions: [],
            roundNumber: 0,
            roundTimeRemaining: GAME_CONFIG.ROUND_DURATION,
            gameStatus: GAME_CONFIG.GAME_STATUS.WAITING,
            scores: {},
            guessedPlayers: [],

            // Enhanced scoring metadata
            firstCorrectGuessTime: null,     // Timestamp of first correct guess (ms since round start)
            playerGuessTimes: {},            // { userId: guessTime }
            roundScores: {},                 // Current round scores
            roundStartTime: null,            // Timestamp when round started

            createdAt: new Date(),
            lastActivity: new Date()
        };

        // Initialize scores for all players
        players.forEach(player => {
            gameState.scores[player.userId] = 0;
        });

        this.games.set(roomId, gameState);
        console.log(`🎮 Game created for room: ${roomId}`);

        return gameState;
    }

    /**
     * Get game state for a room
     * @param {string} roomId - Room ID
     * @returns {object|null} Game state or null if not found
     */
    getGame(roomId) {
        return this.games.get(roomId) || null;
    }

    /**
     * Update game state
     * @param {string} roomId - Room ID
     * @param {object} updates - Object with fields to update
     * @returns {object|null} Updated game state or null
     */
    updateGame(roomId, updates) {
        const gameState = this.games.get(roomId);

        if (!gameState) {
            console.error(`Game not found for room: ${roomId}`);
            return null;
        }

        // Update fields
        Object.assign(gameState, updates);
        gameState.lastActivity = new Date();

        this.games.set(roomId, gameState);
        return gameState;
    }

    /**
     * Delete a game state
     * @param {string} roomId - Room ID
     */
    deleteGame(roomId) {
        const deleted = this.games.delete(roomId);
        if (deleted) {
            console.log(`🗑️  Game deleted for room: ${roomId}`);
        }
    }

    /**
     * Add a player to the game
     * @param {string} roomId - Room ID
     * @param {object} player - Player object { socketId, userId, username }
     * @returns {boolean} Success status
     */
    addPlayer(roomId, player) {
        const gameState = this.games.get(roomId);

        if (!gameState) {
            console.error(`Game not found for room: ${roomId}`);
            return false;
        }

        // Check if player already exists
        const existingPlayer = gameState.players.find(p => p.userId === player.userId);
        if (existingPlayer) {
            // Update socket ID if player reconnected
            existingPlayer.socketId = player.socketId;
            console.log(`🔄 Player ${player.username} reconnected to room: ${roomId}`);
        } else {
            // Add new player
            gameState.players.push({
                socketId: player.socketId,
                userId: player.userId,
                username: player.username,
                isHost: false,
                isReady: false,
                isDrawing: false,
                hasGuessedCorrectly: false
            });

            // Initialize score
            gameState.scores[player.userId] = 0;

            console.log(`➕ Player ${player.username} added to room: ${roomId}`);
        }

        gameState.lastActivity = new Date();
        return true;
    }

    /**
     * Remove a player from the game
     * @param {string} roomId - Room ID
     * @param {string} socketId - Socket ID of player to remove
     * @returns {boolean} Success status
     */
    removePlayer(roomId, socketId) {
        const gameState = this.games.get(roomId);

        if (!gameState) {
            return false;
        }

        const playerIndex = gameState.players.findIndex(p => p.socketId === socketId);

        if (playerIndex === -1) {
            return false;
        }

        const removedPlayer = gameState.players[playerIndex];
        gameState.players.splice(playerIndex, 1);

        // If removed player was the drawer, need to handle turn change
        if (gameState.currentDrawerIndex === playerIndex) {
            // Mark that drawer left mid-turn
            gameState.drawerLeft = true;
        } else if (gameState.currentDrawerIndex > playerIndex) {
            // Adjust drawer index if needed
            gameState.currentDrawerIndex--;
        }

        console.log(`➖ Player ${removedPlayer.username} removed from room: ${roomId}`);
        gameState.lastActivity = new Date();

        return true;
    }

    /**
     * Start the game
     * @param {string} roomId - Room ID
     * @returns {object|null} Updated game state or null
     */
    startGame(roomId) {
        const gameState = this.games.get(roomId);

        if (!gameState) {
            console.error(`Game not found for room: ${roomId}`);
            return null;
        }

        // Validate minimum players
        if (gameState.players.length < GAME_CONFIG.MIN_PLAYERS_TO_START) {
            console.error(`Not enough players to start game in room: ${roomId}`);
            return null;
        }

        // Set game status to playing
        gameState.gameStatus = GAME_CONFIG.GAME_STATUS.PLAYING;
        gameState.roundNumber = 1;

        // Get first drawer
        const firstDrawer = TurnManager.getFirstDrawer(gameState);
        if (firstDrawer) {
            gameState.currentDrawerIndex = firstDrawer.index;
            gameState.currentDrawerSocketId = firstDrawer.socketId;
        }

        // Generate word options
        gameState.wordOptions = WordManager.getWordOptions();

        gameState.lastActivity = new Date();

        console.log(`🎮 Game started in room: ${roomId}`);
        return gameState;
    }

    /**
     * Start a new round
     * @param {string} roomId - Room ID
     * @returns {object|null} Updated game state or null
     */
    startNewRound(roomId) {
        const gameState = this.games.get(roomId);

        if (!gameState) {
            return null;
        }

        // Get next drawer
        const nextDrawer = TurnManager.getNextDrawer(gameState);
        if (nextDrawer) {
            console.log('\ud83d\udd0d DEBUG - Turn Rotation:', {
                previousDrawerIndex: gameState.currentDrawerIndex,
                nextDrawerIndex: nextDrawer.index,
                nextDrawerUsername: nextDrawer.username,
                nextDrawerSocketId: nextDrawer.socketId,
                totalPlayers: gameState.players.length
            });

            gameState.currentDrawerIndex = nextDrawer.index;
            gameState.currentDrawerSocketId = nextDrawer.socketId;

            console.log(`\ud83d\udd04 Turn rotated to: ${nextDrawer.username} (index ${nextDrawer.index})`);
        }

        // Check if we completed a full round (back to first player)
        if (TurnManager.isRoundComplete(gameState)) {
            gameState.roundNumber++;
            console.log(`\ud83c\udfc1 Round ${gameState.roundNumber - 1} complete! Starting round ${gameState.roundNumber}`);
        }

        // Reset round state
        gameState.currentWord = null;
        gameState.wordOptions = WordManager.getWordOptions();
        gameState.guessedPlayers = [];
        gameState.roundTimeRemaining = GAME_CONFIG.ROUND_DURATION;
        gameState.gameStatus = GAME_CONFIG.GAME_STATUS.PLAYING;

        // Reset scoring metadata
        gameState.firstCorrectGuessTime = null;
        gameState.playerGuessTimes = {};
        gameState.roundScores = {};
        gameState.roundStartTime = null;

        gameState.lastActivity = new Date();

        return gameState;
    }

    /**
     * End the current round
     * @param {string} roomId - Room ID
     * @returns {object|null} Updated game state or null
     */
    endRound(roomId) {
        const gameState = this.games.get(roomId);

        if (!gameState) {
            return null;
        }

        gameState.gameStatus = GAME_CONFIG.GAME_STATUS.ROUND_END;
        gameState.lastActivity = new Date();

        console.log(`🏁 Round ended in room: ${roomId}`);
        return gameState;
    }

    /**
     * Record a correct guess (Enhanced with time-decay scoring)
     * @param {string} roomId - Room ID
     * @param {string} userId - User ID who guessed
     * @param {number} timeRemaining - Time remaining when guessed
     * @returns {object} Scoring info { guesserPoints, drawerPoints }
     */
    recordCorrectGuess(roomId, userId, timeRemaining) {
        const gameState = this.games.get(roomId);

        if (!gameState) {
            return { guesserPoints: 0, drawerPoints: 0 };
        }

        // Prevent duplicate scoring
        if (gameState.guessedPlayers.includes(userId)) {
            return { guesserPoints: 0, drawerPoints: 0 };
        }

        // Calculate time since round start
        const currentTime = Date.now();
        const guessTime = gameState.roundStartTime ? currentTime - gameState.roundStartTime : 0;

        // Track first correct guess time
        if (gameState.firstCorrectGuessTime === null) {
            gameState.firstCorrectGuessTime = guessTime;
        }

        // Record player guess time
        gameState.playerGuessTimes[userId] = guessTime;

        // Add to guessed players
        gameState.guessedPlayers.push(userId);

        // Calculate guesser points using time-decay
        const guesserPoints = ScoreCalculator.calculateGuesserScore(
            guessTime,
            gameState.firstCorrectGuessTime,
            GAME_CONFIG.ROUND_DURATION
        );

        // Validate and update guesser score
        const validatedPoints = ScoreCalculator.validateScore(guesserPoints);
        gameState.scores[userId] = (gameState.scores[userId] || 0) + validatedPoints;
        gameState.roundScores[userId] = validatedPoints;

        // Calculate drawer score (will be finalized at round end)
        // For now, just track that someone guessed
        const drawer = gameState.players[gameState.currentDrawerIndex];
        let drawerPoints = 0;

        if (drawer) {
            const totalGuessers = gameState.players.length - 1;
            const correctGuessCount = gameState.guessedPlayers.length;

            drawerPoints = ScoreCalculator.calculateDrawerScore(correctGuessCount, totalGuessers);

            // Update drawer's round score (will be added to total at round end)
            gameState.roundScores[drawer.userId] = drawerPoints;
        }

        gameState.lastActivity = new Date();

        return { guesserPoints: validatedPoints, drawerPoints };
    }

    /**
     * Check if game exists
     * @param {string} roomId - Room ID
     * @returns {boolean} True if game exists
     */
    gameExists(roomId) {
        return this.games.has(roomId);
    }

    /**
     * Get all active game room IDs
     * @returns {string[]} Array of room IDs
     */
    getActiveGameRooms() {
        return Array.from(this.games.keys());
    }

    /**
     * Clean up inactive games
     */
    cleanupInactiveGames() {
        const now = Date.now();
        const timeout = GAME_CONFIG.INACTIVE_GAME_TIMEOUT;

        this.games.forEach((gameState, roomId) => {
            const inactiveTime = now - gameState.lastActivity.getTime();

            if (inactiveTime > timeout) {
                console.log(`🧹 Cleaning up inactive game: ${roomId}`);
                this.deleteGame(roomId);
            }
        });
    }

    /**
     * Finalize round scoring (called at round end)
     * @param {string} roomId - Room ID
     * @returns {object} Final round scores
     */
    finalizeRoundScoring(roomId) {
        const gameState = this.games.get(roomId);

        if (!gameState) {
            return {};
        }

        // Calculate final drawer score
        const drawer = gameState.players[gameState.currentDrawerIndex];
        if (drawer) {
            const totalGuessers = gameState.players.length - 1;
            const correctGuessCount = gameState.guessedPlayers.length;

            const drawerPoints = ScoreCalculator.calculateDrawerScore(correctGuessCount, totalGuessers);
            const validatedDrawerPoints = ScoreCalculator.validateScore(drawerPoints);

            // Add drawer points to total score
            gameState.scores[drawer.userId] = (gameState.scores[drawer.userId] || 0) + validatedDrawerPoints;
            gameState.roundScores[drawer.userId] = validatedDrawerPoints;
        }

        return gameState.roundScores;
    }

    /**
     * Get current leaderboard
     * @param {string} roomId - Room ID
     * @returns {array} Sorted leaderboard
     */
    getLeaderboard(roomId) {
        const gameState = this.games.get(roomId);

        if (!gameState) {
            return [];
        }

        return ScoreCalculator.getLeaderboard(gameState.scores, gameState.players);
    }

    /**
     * Set round start time (called when word is selected)
     * @param {string} roomId - Room ID
     */
    setRoundStartTime(roomId) {
        const gameState = this.games.get(roomId);

        if (gameState) {
            gameState.roundStartTime = Date.now();
        }
    }
}

module.exports = new GameStateManager();
