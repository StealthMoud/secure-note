const mongoose = require('mongoose');

const SecurityLogSchema = new mongoose.Schema({
    event: {
        type: String,
        required: [true, 'Event type is required'],
        enum: [
            'login', 'logout', 'register', 'note_created', 'note_shared',
            'user_verified', 'user_deleted', 'failed_login',
            'email_verified', 'note_updated', 'note_deleted', 'note_unshared', 'friend_request_sent',
            'friend_request_accepted', 'friend_request_rejected', 'password_reset_request',
            'password_reset', 'login_google', 'login_github', 'request_verification',
            'approve_verification', 'totp_setup', 'totp_enabled', 'totp_disabled', 'profile_updated',
            'username_updated', 'personalization_updated', 'password_changed', 'email_change_requested',
            'user_created', 'reject_verification', 'user_unverified',
            'role_update', 'authentication_failed', 'authorization_failed',
            'bulk_users_verified', 'bulk_users_unverified', 'bulk_users_deleted'
        ],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    details: {
        type: mongoose.Schema.Types.Mixed, // Allows flexible key-value pairs
        default: {},
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low',
    },
}, { timestamps: true });

// indexes for performance
SecurityLogSchema.index({ timestamp: -1 });
SecurityLogSchema.index({ user: 1 });
SecurityLogSchema.index({ severity: 1 });
// index event type for dashboard stats
SecurityLogSchema.index({ event: 1 });

module.exports = mongoose.models.SecurityLog || mongoose.model('SecurityLog', SecurityLogSchema);