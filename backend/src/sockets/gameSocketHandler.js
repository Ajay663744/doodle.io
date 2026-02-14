/**
 * Game Socket Handler
 * Handles all game-related socket events
 */

const GameStateManager = require('../game/GameStateManager');
const TurnManager = require('../game/TurnManager');
const TimerManager = require('../game/TimerManager');
const WordManager = require('../game/WordManager');
const GameLifecycleManager = require('../game/GameLifecycleManager');
const { initializeLobbyHandlers, getLobbyStatus, createRoundSummary } = require('./lobbySocketHandler');
const GAME_CONFIG = require('../config/gameConfig');

/**
 * Initialize game socket event handlers
 * @param {object} io - Socket.io server instance
 */
const initializeGameSocketHandlers = (io) => {
    io.on('connection', (socket) => {

        // Initialize lobby handlers
        initializeLobbyHandlers(io, socket);

        /**
         * Join game room
         * Player joins a game room and gets added to game state
         */
        socket.on('join_game_room', ({ roomId, userId, username }) => {
            try {
                console.log(`🎮 ${username} joining game room: ${roomId}`);

                // Join socket room
                socket.join(roomId);

                // Check if game exists, if not create it
                let gameState = GameStateManager.getGame(roomId);

                if (!gameState) {
                    // Create new game
                    gameState = GameStateManager.createGame(roomId, [
                        { socketId: socket.id, userId, username }
                    ]);
                } else {
                    // Add player to existing game
                    GameStateManager.addPlayer(roomId, {
                        socketId: socket.id,
                        userId,
                        username
                    });
                    gameState = GameStateManager.getGame(roomId);
                }

                // Send current game state to the joining player
                socket.emit('game_state_update', {
                    gameState: sanitizeGameStateForClient(gameState, userId)
                });

                // Notify other players
                socket.to(roomId).emit('player_joined_game', {
                    player: { userId, username, socketId: socket.id },
                    playerCount: gameState.players.length
                });

                // Emit lobby status update to all players
                const lobbyStatus = getLobbyStatus(gameState);
                io.to(roomId).emit('lobby_status_update', lobbyStatus);

                console.log(`✅ ${username} joined game room: ${roomId}`);

            } catch (error) {
                console.error('Error joining game room:', error);
                socket.emit('game_error', { message: 'Failed to join game room' });
            }
        });

        /**
         * Start game
         * Host starts the game
         */
        socket.on('start_game', ({ roomId, userId }) => {
            try {
                console.log('🎮 START_GAME event received:', { roomId, userId, socketId: socket.id });

                const gameState = GameStateManager.getGame(roomId);

                if (!gameState) {
                    console.error('❌ Game not found for room:', roomId);
                    socket.emit('game_error', { message: 'Game not found' });
                    return;
                }

                console.log('🔍 Game State:', {
                    players: gameState.players.length,
                    gameStatus: gameState.gameStatus,
                    playersList: gameState.players.map(p => ({ userId: p.userId, username: p.username, isHost: p.isHost, isReady: p.isReady }))
                });

                // Verify player is host
                const player = gameState.players.find(p => p.userId === userId);
                if (!player) {
                    console.error('❌ Player not found in game:', userId);
                    socket.emit('game_error', { message: 'Player not found in game' });
                    return;
                }

                if (!player.isHost) {
                    console.error('❌ Player is not host:', userId);
                    socket.emit('game_error', { message: 'Only host can start the game' });
                    return;
                }

                console.log('✅ Host verified:', player.username);

                // Verify minimum players
                if (gameState.players.length < GAME_CONFIG.MIN_PLAYERS_TO_START) {
                    console.error(`❌ Not enough players: ${gameState.players.length} < ${GAME_CONFIG.MIN_PLAYERS_TO_START}`);
                    socket.emit('game_error', {
                        message: `Need at least ${GAME_CONFIG.MIN_PLAYERS_TO_START} players to start`
                    });
                    return;
                }

                console.log('✅ Minimum players met:', gameState.players.length);

                // Validate game can start
                const validation = GameLifecycleManager.validateGameStart(gameState);
                console.log('🔍 Validation result:', validation);

                if (!validation.valid) {
                    console.error('❌ Game validation failed:', validation.reason);
                    socket.emit('game_error', { message: validation.reason });
                    return;
                }

                console.log('✅ All validations passed, starting game...');

                // Start the game
                const updatedGameState = GameStateManager.startGame(roomId);

                // Debug log for turn system
                console.log('🔍 DEBUG - Game Start Turn Info:', {
                    currentDrawerIndex: updatedGameState.currentDrawerIndex,
                    currentDrawerSocketId: updatedGameState.currentDrawerSocketId,
                    totalPlayers: updatedGameState.players.length,
                    players: updatedGameState.players.map(p => ({ username: p.username, socketId: p.socketId }))
                });

                // Emit game started to all players
                io.to(roomId).emit('game_started', {
                    gameState: sanitizeGameStateForBroadcast(updatedGameState),
                    message: 'Game has started!'
                });

                // Get the first drawer
                const drawer = updatedGameState.players[updatedGameState.currentDrawerIndex];
                if (drawer) {
                    console.log(`🎨 First drawer: ${drawer.username} (${drawer.socketId})`);

                    // Send word options to the drawer only
                    io.to(drawer.socketId).emit('word_options', {
                        options: updatedGameState.wordOptions,
                        roundNumber: updatedGameState.roundNumber
                    });

                    // CRITICAL: Emit turn_started so frontend knows who the drawer is!
                    // This was missing - causing everyone to be viewers
                    const wordHint = WordManager.getWordLengthHint(updatedGameState.wordOptions[0] || 'word');
                    io.to(roomId).emit('turn_started', {
                        drawer: {
                            socketId: drawer.socketId,
                            userId: drawer.userId,
                            username: drawer.username
                        },
                        wordHint: '_ _ _ _ _', // Placeholder until word is selected
                        roundNumber: updatedGameState.roundNumber,
                        roundDuration: GAME_CONFIG.ROUND_DURATION,
                        waitingForWordSelection: true // Indicate drawer needs to select word
                    });

                    console.log(`✅ turn_started event emitted for drawer: ${drawer.username}`);
                } else {
                    console.error('❌ No drawer found on game start!');
                }

                console.log(`🎮 Game started in room: ${roomId}`);

            } catch (error) {
                console.error('Error starting game:', error);
                socket.emit('game_error', { message: 'Failed to start game' });
            }
        });

        /**
         * Select word
         * Drawer selects a word from the options
         */
        socket.on('select_word', ({ roomId, userId, word }) => {
            try {
                const gameState = GameStateManager.getGame(roomId);

                if (!gameState) {
                    socket.emit('game_error', { message: 'Game not found' });
                    return;
                }

                // Verify player is the current drawer
                const drawer = gameState.players[gameState.currentDrawerIndex];
                if (!drawer || drawer.userId !== userId) {
                    socket.emit('game_error', { message: 'Only the drawer can select a word' });
                    return;
                }

                // Verify word is in the options
                if (!gameState.wordOptions.includes(word)) {
                    socket.emit('game_error', { message: 'Invalid word selection' });
                    return;
                }

                // Set the current word
                GameStateManager.updateGame(roomId, {
                    currentWord: word,
                    wordOptions: [] // Clear options after selection
                });

                // Set round start time for scoring
                GameStateManager.setRoundStartTime(roomId);

                // Start the round timer
                startRoundTimer(io, roomId);

                // Emit turn started to all players
                const wordHint = WordManager.getWordLengthHint(word);
                io.to(roomId).emit('turn_started', {
                    drawer: {
                        socketId: drawer.socketId,
                        userId: drawer.userId,
                        username: drawer.username
                    },
                    wordHint,
                    roundNumber: gameState.roundNumber,
                    roundDuration: GAME_CONFIG.ROUND_DURATION
                });

                console.log(`🎨 ${drawer.username} selected word in room: ${roomId}`);

            } catch (error) {
                console.error('Error selecting word:', error);
                socket.emit('game_error', { message: 'Failed to select word' });
            }
        });

        /**
         * Send guess
         * Player submits a guess
         */
        socket.on('send_guess', ({ roomId, userId, username, guess }) => {
            try {
                const gameState = GameStateManager.getGame(roomId);

                if (!gameState) {
                    socket.emit('game_error', { message: 'Game not found' });
                    return;
                }

                // Verify game is in playing state
                if (gameState.gameStatus !== GAME_CONFIG.GAME_STATUS.PLAYING) {
                    return;
                }

                // Verify player is not the drawer
                const drawer = gameState.players[gameState.currentDrawerIndex];
                if (drawer && drawer.userId === userId) {
                    socket.emit('game_error', { message: 'Drawer cannot guess' });
                    return;
                }

                // Check if player already guessed correctly
                if (gameState.guessedPlayers.includes(userId)) {
                    return; // Already guessed, ignore
                }

                // Validate guess
                const isCorrect = WordManager.validateGuess(guess, gameState.currentWord);

                if (isCorrect) {
                    // Record correct guess
                    const timeRemaining = TimerManager.getTimeRemaining(roomId) || 0;
                    const scoringResult = GameStateManager.recordCorrectGuess(roomId, userId, timeRemaining);

                    // Emit player scored event
                    io.to(roomId).emit('player_scored', {
                        userId,
                        username,
                        points: scoringResult.guesserPoints,
                        drawerPoints: scoringResult.drawerPoints,
                        guessPosition: gameState.guessedPlayers.length,
                        timestamp: Date.now()
                    });

                    // Emit correct guess (legacy support)
                    io.to(roomId).emit('correct_guess', {
                        userId,
                        username,
                        points: scoringResult.guesserPoints,
                        guessPosition: gameState.guessedPlayers.length
                    });

                    // Update game state for all players
                    const updatedGameState = GameStateManager.getGame(roomId);

                    // Emit round score update
                    io.to(roomId).emit('round_score_update', {
                        roundScores: updatedGameState.roundScores,
                        totalScores: updatedGameState.scores
                    });

                    // Emit game state update
                    io.to(roomId).emit('game_state_update', {
                        gameState: sanitizeGameStateForBroadcast(updatedGameState)
                    });

                    // Emit leaderboard update
                    const leaderboard = GameStateManager.getLeaderboard(roomId);
                    io.to(roomId).emit('leaderboard_update', {
                        leaderboard
                    });

                    // Check if all players have guessed
                    if (TurnManager.haveAllGuessersGuessed(updatedGameState)) {
                        endRound(io, roomId);
                    }

                } else {
                    // Broadcast incorrect guess as chat message
                    io.to(roomId).emit('player_guess', {
                        userId,
                        username,
                        guess,
                        isCorrect: false
                    });
                }

            } catch (error) {
                console.error('Error processing guess:', error);
                socket.emit('game_error', { message: 'Failed to process guess' });
            }
        });

        /**
         * Leave game room
         */
        socket.on('leave_game_room', ({ roomId, userId }) => {
            try {
                socket.leave(roomId);

                const gameState = GameStateManager.getGame(roomId);
                if (gameState) {
                    GameStateManager.removePlayer(roomId, socket.id);

                    // Notify other players
                    socket.to(roomId).emit('player_left_game', {
                        userId,
                        playerCount: gameState.players.length
                    });

                    // If drawer left, end the round
                    if (gameState.drawerLeft) {
                        endRound(io, roomId);
                    }
                }

            } catch (error) {
                console.error('Error leaving game room:', error);
            }
        });

    });
};

/**
 * Start round timer
 * @param {object} io - Socket.io instance
 * @param {string} roomId - Room ID
 */
function startRoundTimer(io, roomId) {
    const gameState = GameStateManager.getGame(roomId);
    if (!gameState) return;

    TimerManager.startTimer(
        roomId,
        GAME_CONFIG.ROUND_DURATION,
        // On tick callback
        (timeRemaining) => {
            // Update game state
            GameStateManager.updateGame(roomId, { roundTimeRemaining: timeRemaining });

            // Broadcast timer update
            io.to(roomId).emit('timer_update', {
                timeRemaining
            });
        },
        // On complete callback
        () => {
            endRound(io, roomId);
        }
    );
}

/**
 * End the current round
 * @param {object} io - Socket.io instance
 * @param {string} roomId - Room ID
 */
function endRound(io, roomId) {
    const gameState = GameStateManager.getGame(roomId);
    if (!gameState) return;

    // Clear timer
    TimerManager.clearTimer(roomId);

    // Finalize round scoring
    const finalRoundScores = GameStateManager.finalizeRoundScoring(roomId);

    // Update game state to round end
    GameStateManager.endRound(roomId);

    // Get updated game state with final scores
    const updatedGameState = GameStateManager.getGame(roomId);

    // Get final leaderboard
    const leaderboard = GameStateManager.getLeaderboard(roomId);

    // Emit round ended with complete scoring info
    io.to(roomId).emit('round_ended', {
        correctWord: gameState.currentWord,
        scores: updatedGameState.scores,
        roundScores: finalRoundScores,
        guessedPlayers: gameState.guessedPlayers,
        drawer: gameState.players[gameState.currentDrawerIndex],
        leaderboard
    });

    console.log(`🏁 Round ended in room: ${roomId}`);

    // Emit round result summary
    const roundSummary = createRoundSummary(gameState, finalRoundScores, leaderboard);
    io.to(roomId).emit('round_result_summary', roundSummary);

    // Check if game should end
    if (GameLifecycleManager.shouldGameEnd(gameState)) {
        // Game is over!
        setTimeout(() => {
            endGame(io, roomId);
        }, 5000); // 5 second delay before showing final results
        return;
    }

    // Start new round after delay
    setTimeout(() => {
        const updatedGameState = GameStateManager.startNewRound(roomId);

        if (updatedGameState) {
            console.log('🔄 Starting new round after previous round ended');
            console.log('🔍 DEBUG - New Round Info:', {
                roundNumber: updatedGameState.roundNumber,
                currentDrawerIndex: updatedGameState.currentDrawerIndex,
                totalPlayers: updatedGameState.players.length
            });

            // Emit new round started
            io.to(roomId).emit('game_state_update', {
                gameState: sanitizeGameStateForBroadcast(updatedGameState)
            });

            // Get the new drawer
            const drawer = updatedGameState.players[updatedGameState.currentDrawerIndex];
            if (drawer) {
                console.log(`🎨 New drawer: ${drawer.username} (index ${updatedGameState.currentDrawerIndex})`);

                // Send word options to new drawer
                io.to(drawer.socketId).emit('word_options', {
                    options: updatedGameState.wordOptions,
                    roundNumber: updatedGameState.roundNumber
                });

                // ✅ CRITICAL FIX: Emit turn_started so frontend knows who the new drawer is!
                io.to(roomId).emit('turn_started', {
                    drawer: {
                        socketId: drawer.socketId,
                        userId: drawer.userId,
                        username: drawer.username
                    },
                    wordHint: '_ _ _ _ _',
                    roundNumber: updatedGameState.roundNumber,
                    roundDuration: GAME_CONFIG.ROUND_DURATION,
                    waitingForWordSelection: true
                });

                console.log(`✅ turn_started event emitted for new drawer: ${drawer.username}`);

                // ✅ Clear canvas for new turn
                io.to(roomId).emit('clear_canvas');
                console.log('🧹 clear_canvas event emitted for turn rotation');
            } else {
                console.error('❌ No drawer found for new round!');
            }
        }
    }, 5000); // 5 second delay before next round
}

/**
 * Sanitize game state for client (hide word from non-drawers)
 * @param {object} gameState - Game state
 * @param {string} userId - User ID requesting the state
 * @returns {object} Sanitized game state
 */
function sanitizeGameStateForClient(gameState, userId) {
    const sanitized = { ...gameState };

    // Hide current word from non-drawers
    const drawer = gameState.players[gameState.currentDrawerIndex];
    if (!drawer || drawer.userId !== userId) {
        sanitized.currentWord = null;
        sanitized.wordOptions = [];
    }

    return sanitized;
}

/**
 * Sanitize game state for broadcast (hide word from everyone)
 * @param {object} gameState - Game state
 * @returns {object} Sanitized game state
 */
function sanitizeGameStateForBroadcast(gameState) {
    const sanitized = { ...gameState };
    sanitized.currentWord = null;
    sanitized.wordOptions = [];
    return sanitized;
}

/**
 * End the game
 * @param {object} io - Socket.io instance
 * @param {string} roomId - Room ID
 */
function endGame(io, roomId) {
    const gameState = GameStateManager.getGame(roomId);
    if (!gameState) return;

    // Get final results
    const finalResults = GameLifecycleManager.getFinalResults(gameState);
    const gameProgress = GameLifecycleManager.getGameProgress(gameState);

    // Update game status to ended
    GameStateManager.updateGame(roomId, {
        gameStatus: GAME_CONFIG.GAME_STATUS.GAME_END
    });

    // Emit game ended event
    io.to(roomId).emit('game_ended', {
        winner: finalResults.winner,
        leaderboard: finalResults.leaderboard,
        finalScores: finalResults.finalScores,
        totalRounds: finalResults.totalRounds,
        gameProgress,
        message: `🎉 Game Over! Winner: ${finalResults.winner?.username || 'No winner'}`
    });

    console.log(`🎮 Game ended in room: ${roomId}. Winner: ${finalResults.winner?.username}`);

    // Optional: Clean up game state after some time
    setTimeout(() => {
        // You can either delete the game or reset it for a new game
        // GameStateManager.deleteGame(roomId);
        console.log(`Game in room ${roomId} can be reset or deleted`);
    }, 60000); // 1 minute
}

module.exports = initializeGameSocketHandlers;
