const SecurityLog = require('../models/SecurityLog');


async function logSecurityEvent({ event, user, details }) {
    await SecurityLog.create({
        event,
        user,
        timestamp: new Date(),
        details,
    });
}

module.exports = { logSecurityEvent };
