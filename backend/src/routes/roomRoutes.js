const express = require('express');
const { body } = require('express-validator');
const { createRoom, getRooms, getRoom, deleteRoom, verifyRoomPassword, joinRoom } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const createRoomValidation = [
    body('name').trim().notEmpty().withMessage('Room name is required')
        .isLength({ max: 100 }).withMessage('Room name cannot exceed 100 characters')
];

// All routes are protected
router.use(protect);

// Routes
router.post('/', createRoomValidation, createRoom);
router.post('/join', joinRoom);                              // POST: join an existing room
router.get('/', getRooms);
router.get('/:roomId', getRoom);
router.post('/:roomId/verify-password', verifyRoomPassword);
router.delete('/:roomId', deleteRoom);

module.exports = router;
