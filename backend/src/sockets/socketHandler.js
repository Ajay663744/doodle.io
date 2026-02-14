const Room = require('../models/Room');
const initializeGameSocketHandlers = require('./gameSocketHandler');

/**
 * Initialize Socket.io event handlers
 * @param {object} io - Socket.io server instance
 */
const initializeSocketHandlers = (io) => {
    // Initialize game socket handlers
    initializeGameSocketHandlers(io);

    io.on('connection', (socket) => {
        console.log(`✅ New client connected: ${socket.id}`);

        /**
         * Join a room
         */
        socket.on('join-room', async ({ roomId, userId }) => {
            try {
                // Join the socket room
                socket.join(roomId);

                // Update room's active users in database
                const room = await Room.findOne({ roomId });
                if (room && !room.activeUsers.includes(userId)) {
                    room.activeUsers.push(userId);
                    await room.save();
                }

                console.log(`👤 User ${userId} joined room: ${roomId}`);

                // Notify other users in the room
                socket.to(roomId).emit('user-joined', {
                    userId,
                    socketId: socket.id,
                    timestamp: new Date()
                });

                // Send confirmation to the user
                socket.emit('room-joined', {
                    roomId,
                    message: 'Successfully joined room'
                });

            } catch (error) {
                console.error('Error joining room:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        /**
         * Leave a room
         */
        socket.on('leave-room', async ({ roomId, userId }) => {
            try {
                socket.leave(roomId);

                // Remove user from room's active users
                const room = await Room.findOne({ roomId });
                if (room) {
                    room.activeUsers = room.activeUsers.filter(
                        id => id.toString() !== userId
                    );
                    await room.save();
                }

                console.log(`👋 User ${userId} left room: ${roomId}`);

                // Notify other users
                socket.to(roomId).emit('user-left', {
                    userId,
                    socketId: socket.id,
                    timestamp: new Date()
                });

            } catch (error) {
                console.error('Error leaving room:', error);
            }
        });

        /**
         * Drawing event - Real-time drawing synchronization
         * Broadcasts drawing strokes to all users in room except sender
         * PERMISSION CHECK: Only current drawer can draw
         */
        socket.on('draw', ({ roomId, strokeData }) => {
            const GameStateManager = require('../game/GameStateManager');
            const gameState = GameStateManager.getGame(roomId);

            // Check if game exists and user has permission to draw
            if (gameState) {
                // Verify socket is the current drawer
                if (socket.id !== gameState.currentDrawerSocketId) {
                    socket.emit('game_error', {
                        message: 'Only the current drawer can draw',
                        code: 'PERMISSION_DENIED'
                    });
                    console.log(`🚫 Non-drawer ${socket.id} attempted to draw in room: ${roomId}`);
                    return;
                }
            }

            // Broadcast drawing data to all users in the room except sender
            socket.to(roomId).emit('receive_draw', { strokeData });
            console.log(`🎨 Drawing broadcasted in room: ${roomId} by drawer ${socket.id}`);
        });

        /**
         * Clear canvas event
         */
        socket.on('clear-canvas', ({ roomId }) => {
            socket.to(roomId).emit('clear-canvas');
        });

        /**
         * Handle disconnection
         * Clean up player from rooms and game state
         */
        socket.on('disconnect', async () => {
            console.log(`❌ Client disconnected: ${socket.id}`);

            const GameStateManager = require('../game/GameStateManager');
            const TimerManager = require('../game/TimerManager');

            // Find all rooms this socket was in
            const activeRooms = GameStateManager.getActiveGameRooms();

            for (const roomId of activeRooms) {
                const gameState = GameStateManager.getGame(roomId);

                if (gameState) {
                    // Check if this socket is in this room
                    const player = gameState.players.find(p => p.socketId === socket.id);

                    if (player) {
                        console.log(`🚪 Player ${player.username} (${socket.id}) left room: ${roomId}`);

                        // Remove player from game state
                        GameStateManager.removePlayer(roomId, socket.id);

                        // Get updated game state
                        const updatedGameState = GameStateManager.getGame(roomId);

                        if (updatedGameState) {
                            // Notify other players
                            io.to(roomId).emit('player_left', {
                                userId: player.userId,
                                username: player.username,
                                playerCount: updatedGameState.players.length
                            });

                            // If drawer left during active game, end the round
                            if (updatedGameState.drawerLeft && updatedGameState.gameStatus === 'playing') {
                                console.log(`🎨 Drawer left room ${roomId}, ending round`);
                                // Import endRound from gameSocketHandler if needed
                                // For now, just clear the timer
                                TimerManager.clearTimer(roomId);
                            }

                            // If no players left, clean up the room
                            if (updatedGameState.players.length === 0) {
                                console.log(`🗑️  Room ${roomId} is empty, cleaning up`);
                                TimerManager.clearTimer(roomId);
                                GameStateManager.deleteGame(roomId);

                                io.to(roomId).emit('room_deleted', {
                                    message: 'Room has been deleted due to inactivity'
                                });
                            }
                        }

                        // Also remove from database room
                        try {
                            const room = await Room.findOne({ roomId });
                            if (room) {
                                room.activeUsers = room.activeUsers.filter(
                                    id => id.toString() !== player.userId
                                );
                                await room.save();
                            }
                        } catch (error) {
                            console.error('Error updating room in database:', error);
                        }
                    }
                }
            }
        });
    });
};

module.exports = initializeSocketHandlers;
