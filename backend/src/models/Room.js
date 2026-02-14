const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: [true, 'Room ID is required'],
        unique: true,
        trim: true,
        uppercase: true,
        match: [/^[A-Z0-9]{6}$/, 'Room ID must be 6 alphanumeric characters']
    },
    name: {
        type: String,
        required: [true, 'Room name is required'],
        trim: true,
        maxlength: [100, 'Room name cannot exceed 100 characters']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    password: {
        type: String,
        default: null,
        select: false // Don't include password in queries by default
    },
    isPasswordProtected: {
        type: Boolean,
        default: false
    },
    activeUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
roomSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Room', roomSchema);
