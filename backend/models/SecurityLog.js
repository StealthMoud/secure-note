const mongoose = require('mongoose');

const SecurityLogSchema = new mongoose.Schema({
    event: {
        type: String,
        required: [true, 'Event type is required'],
        enum: [
            'login', 'logout', 'register', 'note_created', 'note_shared',
            'user_verified', 'user_deactivated', 'user_deleted', 'failed_login'
        ], // Add more as needed
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required for security logs'], // Made required
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    details: {
        type: mongoose.Schema.Types.Mixed, // Allows flexible key-value pairs
        default: {},
    },
}, { timestamps: true }); // Adds createdAt/updatedAt

// Indexes for performance
SecurityLogSchema.index({ timestamp: -1 }); // For sorting by recency
SecurityLogSchema.index({ user: 1 }); // For filtering by user

module.exports = mongoose.models.SecurityLog || mongoose.model('SecurityLog', SecurityLogSchema);