const Room = require('../models/Room');
const bcrypt = require('bcryptjs');

/**
 * Generate random room ID
 */
const generateRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomId = '';
    for (let i = 0; i < 6; i++) {
        roomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return roomId;
};

/**
 * @desc    Create a new room
 * @route   POST /api/rooms
 * @access  Private
 */
const createRoom = async (req, res) => {
    try {
        const { name, password } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a room name'
            });
        }

        // Generate unique room ID
        let roomId;
        let roomExists = true;

        while (roomExists) {
            roomId = generateRoomId();
            roomExists = await Room.findOne({ roomId });
        }

        // Prepare room data
        const roomData = {
            roomId,
            name,
            createdBy: req.user.id,
            activeUsers: [req.user.id]
        };

        // If password provided, hash it and set protection flag
        if (password && password.trim()) {
            const salt = await bcrypt.genSalt(10);
            roomData.password = await bcrypt.hash(password, salt);
            roomData.isPasswordProtected = true;
        }

        // Create room
        const room = await Room.create(roomData);

        // Populate creator info
        await room.populate('createdBy', 'name email');

        // Return room with plain password for creator (only this once)
        const response = {
            success: true,
            data: {
                ...room.toObject(),
                plainPassword: password || null // Only for creator, only once
            }
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error creating room'
        });
    }
};

/**
 * @desc    Get all rooms
 * @route   GET /api/rooms
 * @access  Private
 */
const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find()
            .populate('createdBy', 'name email')
            .populate('activeUsers', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });
    } catch (error) {
        console.error('Get rooms error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching rooms'
        });
    }
};

/**
 * @desc    Get single room by roomId
 * @route   GET /api/rooms/:roomId
 * @access  Private
 */
const getRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findOne({ roomId })
            .populate('createdBy', 'name email')
            .populate('activeUsers', 'name email');

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        console.error('Get room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching room'
        });
    }
};

/**
 * @desc    Delete a room
 * @route   DELETE /api/rooms/:roomId
 * @access  Private (Room creator only)
 */
const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findOne({ roomId });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Debug logging
        console.log('Delete room request:', {
            roomId,
            requestUserId: req.user.id,
            roomCreatorId: room.createdBy.toString(),
            match: room.createdBy.toString() === req.user.id
        });

        // Check if user is the room creator
        // Convert both to strings for comparison
        if (room.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the room creator can delete this room'
            });
        }

        await Room.deleteOne({ roomId });

        console.log(`✅ Room ${roomId} deleted successfully by user ${req.user.id}`);

        res.status(200).json({
            success: true,
            message: 'Room deleted successfully'
        });
    } catch (error) {
        console.error('Delete room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting room'
        });
    }
};

/**
 * @desc    Verify room password
 * @route   POST /api/rooms/:roomId/verify-password
 * @access  Private
 */
const verifyRoomPassword = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { password } = req.body;

        // Find room and include password field
        const room = await Room.findOne({ roomId }).select('+password');

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // If room is not password protected, allow access
        if (!room.isPasswordProtected) {
            return res.status(200).json({
                success: true,
                message: 'Room is not password protected'
            });
        }

        // Check if password provided
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password required for this room'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, room.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Password verified successfully'
        });
    } catch (error) {
        console.error('Verify password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error verifying password'
        });
    }
};

module.exports = {
    createRoom,
    getRooms,
    getRoom,
    deleteRoom,
    verifyRoomPassword
};
