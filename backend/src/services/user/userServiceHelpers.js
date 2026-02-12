const User = require('../models/User');

// helper for simple user count. useful for stats.
async function getUserCount(filter = {}) {
    return await User.countDocuments(filter);
}

module.exports = { getUserCount };
