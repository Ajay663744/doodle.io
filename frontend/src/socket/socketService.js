import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Initialize socket connection (will connect when needed)
let socket = null;

/**
 * Initialize socket connection
 * @returns {Socket} Socket instance
 */
export const initializeSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            autoConnect: false, // Don't connect automatically
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        // Connection event handlers
        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    return socket;
};

/**
 * Connect to socket server
 */
export const connectSocket = () => {
    if (socket && !socket.connected) {
        socket.connect();
    }
};

/**
 * Disconnect from socket server
 */
export const disconnectSocket = () => {
    if (socket && socket.connected) {
        socket.disconnect();
    }
};

/**
 * Join a room
 * @param {string} roomId - Room ID to join
 * @param {string} userId - User ID
 */
export const joinRoom = (roomId, userId) => {
    if (socket && socket.connected) {
        socket.emit('join-room', { roomId, userId });
    }
};

/**
 * Leave a room
 * @param {string} roomId - Room ID to leave
 * @param {string} userId - User ID
 */
export const leaveRoom = (roomId, userId) => {
    if (socket && socket.connected) {
        socket.emit('leave-room', { roomId, userId });
    }
};

/**
 * Get socket instance
 * @returns {Socket} Socket instance
 */
export const getSocket = () => {
    return socket;
};

/**
 * Emit drawing stroke to room
 * @param {string} roomId - Room ID
 * @param {object} strokeData - Stroke data (points, color, brushSize, tool)
 */
export const emitDraw = (roomId, strokeData) => {
    if (socket && socket.connected) {
        socket.emit('draw', { roomId, strokeData });
    }
};

/**
 * Listen for remote drawing events
 * @param {function} callback - Callback function to handle received stroke
 */
export const onReceiveDraw = (callback) => {
    if (socket) {
        socket.on('receive_draw', callback);
    }
};

/**
 * Remove draw event listener
 */
export const offReceiveDraw = () => {
    if (socket) {
        socket.off('receive_draw');
    }
};

/**
 * Listen for canvas clear event
 */
export const onClearCanvas = (callback) => {
    if (socket) {
        socket.on('clear_canvas', callback);
    }
};

/**
 * Remove clear canvas listener
 */
export const offClearCanvas = () => {
    if (socket) {
        socket.off('clear_canvas');
    }
};

export default {
    initializeSocket,
    connectSocket,
    disconnectSocket,
    joinRoom,
    leaveRoom,
    getSocket,
    emitDraw,
    onReceiveDraw,
    offReceiveDraw,
    onClearCanvas,
    offClearCanvas,
};
