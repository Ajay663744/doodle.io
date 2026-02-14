/**
 * Game Socket Service
 * Handles all game-related socket events
 */

import { getSocket } from './socketService';

/**
 * Join game room
 */
export const joinGameRoom = (roomId, userId, username) => {
    const socket = getSocket();
    if (socket && socket.connected) {
        socket.emit('join_game_room', { roomId, userId, username });
    }
};

/**
 * Start game
 */
export const startGame = (roomId, userId) => {
    const socket = getSocket();
    console.log('🚀 START GAME button clicked:', { roomId, userId, socketConnected: socket?.connected });
    if (socket && socket.connected) {
        console.log('✅ Emitting start_game event to backend');
        socket.emit('start_game', { roomId, userId });
    } else {
        console.error('❌ Socket not connected, cannot start game');
    }
};

/**
 * Select word (drawer only)
 */
export const selectWord = (roomId, userId, word) => {
    const socket = getSocket();
    if (socket && socket.connected) {
        socket.emit('select_word', { roomId, userId, word });
    }
};

/**
 * Send guess
 */
export const sendGuess = (roomId, userId, username, guess) => {
    const socket = getSocket();
    if (socket && socket.connected) {
        socket.emit('send_guess', { roomId, userId, username, guess });
    }
};

/**
 * Toggle player ready status
 */
export const togglePlayerReady = (roomId, userId) => {
    const socket = getSocket();
    if (socket && socket.connected) {
        socket.emit('player_ready_toggle', { roomId, userId });
    }
};

/**
 * Listen for game started event
 */
export const onGameStarted = (callback) => {
    const socket = getSocket();
    if (socket) {
        socket.on('game_started', callback);
    }
};

/**
 * Listen for turn started event
 */
export const onTurnStarted = (callback) => {
    const socket = getSocket();
    if (socket) {
        socket.on('turn_started', callback);
    }
};

/**
 * Listen for word options (drawer only)
 */
export const onWordOptions = (callback) => {
    const socket = getSocket();
    if (socket) {
        socket.on('word_options', callback);
    }
};

/**
 * Listen for timer updates
 */
export const onTimerUpdate = (callback) => {
    const socket = getSocket();
    if (socket) {
        socket.on('timer_update', callback);
    }
};

/**
 * Listen for correct guess
 */
export const onCorrectGuess = (callback) => {
    const socket = getSocket();
    if (socket) {
        socket.on('correct_guess', callback);
    }
};

/**
 * Listen for player guess (chat)
 */
export const onPlayerGuess = (callback) => {
    const socket = getSocket();
    if (socket) {
        socket.on('player_guess', callback);
    }
};

/**
 * Listen for round ended
 */
export const onRoundEnded = (callback) => {
    const socket = getSocket();
    if (socket) {
        socket.on('round_ended', callback);
    }
};

/**
 * Listen for game ended
 */
export const onGameEnded = (callback) => {
    const socket = getSocket();
    if (socket) {
        socket.on('game_ended', callback);
    }
};

/**
 * Listen for lobby status update
 */
export const onLobbyStatusUpdate = (callback) => {
    const socket = getSocket();
    if (socket) {
        socket.on('lobby_status_update', callback);
    }
};

/**
 * Listen for round result summary
 */
export const onRoundResultSummary = (callback) => {
    const socket = getSocket();
    if (socket) {
        socket.on('round_result_summary', callback);
    }
};

/**
 * Listen for leaderboard update
 */
export const onLeaderboardUpdate = (callback) => {
    const socket = getSocket();
    if (socket) {
        socket.on('leaderboard_update', callback);
    }
};

/**
 * Listen for game state update
 */
export const onGameStateUpdate = (callback) => {
    const socket = getSocket();
    if (socket) {
        socket.on('game_state_update', callback);
    }
};

/**
 * Listen for game errors
 */
export const onGameError = (callback) => {
    const socket = getSocket();
    if (socket) {
        socket.on('game_error', callback);
    }
};

/**
 * Remove game error listener
 */
export const offGameError = () => {
    const socket = getSocket();
    if (socket) {
        socket.off('game_error');
    }
};

/**
 * Remove all game event listeners
 */
export const removeGameListeners = () => {
    const socket = getSocket();
    if (socket) {
        socket.off('game_started');
        socket.off('turn_started');
        socket.off('word_options');
        socket.off('timer_update');
        socket.off('correct_guess');
        socket.off('player_guess');
        socket.off('round_ended');
        socket.off('game_ended');
        socket.off('lobby_status_update');
        socket.off('round_result_summary');
        socket.off('leaderboard_update');
        socket.off('game_state_update');
        socket.off('game_error');
    }
};

export default {
    joinGameRoom,
    startGame,
    selectWord,
    sendGuess,
    togglePlayerReady,
    onGameStarted,
    onTurnStarted,
    onWordOptions,
    onTimerUpdate,
    onCorrectGuess,
    onPlayerGuess,
    onRoundEnded,
    onGameEnded,
    onLobbyStatusUpdate,
    onRoundResultSummary,
    onLeaderboardUpdate,
    onGameStateUpdate,
    onGameError,
    offGameError,
    removeGameListeners
};
