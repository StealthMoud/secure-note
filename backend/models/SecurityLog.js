const mongoose = require('mongoose');

const SecurityLogSchema = new mongoose.Schema({
    event: {
        type: String,
        required: [true, 'Event type is required'],
        enum: [
            'login', 'logout', 'register', 'note_created', 'note_shared',
            'user_verified', 'user_deactivated', 'user_deleted', 'failed_login',
            'email_verified', 'note_updated', 'note_deleted', 'friend_request_sent',
            'friend_request_accepted', 'friend_request_rejected', 'password_reset_request',
            'password_reset', 'login_google', 'login_github', 'request_verification',
            'approve_verification', 'totp_setup', 'totp_enabled', 'totp_disabled'
        ],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required for security logs'],
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    details: {
        type: mongoose.Schema.Types.Mixed, // Allows flexible key-value pairs
        default: {},
    },
}, { timestamps: true });

// Indexes for performance
SecurityLogSchema.index({ timestamp: -1 });
SecurityLogSchema.index({ user: 1 });

module.exports = mongoose.models.SecurityLog || mongoose.model('SecurityLog', SecurityLogSchema);