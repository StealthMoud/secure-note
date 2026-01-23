const SecurityLog = require('../models/SecurityLog');


// mapping for event type to default severity level
const SEVERITY_MAPPING = {
    'failed_login': 'high',
    'user_deleted': 'critical',
    'password_changed': 'high',
    'user_created': 'medium',
    'password_reset': 'medium',
    'totp_disabled': 'high',
    'totp_enabled': 'medium',
};

// helper function to log security events to database for audit trail
async function logSecurityEvent({ event, user, details, severity }) {
    const logSeverity = severity || SEVERITY_MAPPING[event] || 'low';
    await SecurityLog.create({
        event,
        user,
        timestamp: new Date(),
        details,
        severity: logSeverity,
    });
}

/**
 * extract common request metadata for security logging
 * eliminates duplicate metadata extraction across controllers
 * @param {Object} req - express request object
 * @returns {Object} metadata object with ip, userAgent, location, referrer
 */
const getRequestMetadata = (req) => ({
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    location: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    referrer: req.headers['referer']
});

/**
 * log security event with automatic request metadata extraction
 * @param {Object} req - express request object
 * @param {string} event - event type
 * @param {string} userId - user id
 * @param {Object} additionalDetails - additional event details
 * @param {string} severity - optional severity level
 */
const logUserEvent = async (req, event, userId, additionalDetails = {}, severity) => {
    await logSecurityEvent({
        event,
        user: userId,
        details: {
            ...getRequestMetadata(req),
            ...additionalDetails
        },
        severity
    });
};

module.exports = { logSecurityEvent, getRequestMetadata, logUserEvent };
