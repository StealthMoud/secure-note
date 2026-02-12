const SecurityLog = require('../models/SecurityLog');

// how bad is the event?
const SEVERITY_MAPPING = {
    'failed_login': 'high',
    'user_deleted': 'critical',
    'password_changed': 'high',
    'user_created': 'medium',
    'password_reset': 'medium',
    'totp_disabled': 'high',
    'totp_enabled': 'medium',
};

// save security events to the db so we can audit later
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

// pull useful stuff from the request for logging. saves us retyping it everywhere.
const getRequestMetadata = (req) => ({
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    location: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    referrer: req.headers['referer']
});

// log a user event and grab the request metadata automatically
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
