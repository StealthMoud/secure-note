const User = require('../models/User');

// helper to get user count with filters
async function getUserCount(filter = {}) {
    return await User.countDocuments(filter);
}

module.exports = { getUserCount };
