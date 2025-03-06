const User = require('../models/User');

/**
 * Middleware that checks if the user is verified.
 * If not, it blocks access to routes that require a verified account.
 */
const requireVerified = async (req, res, next) => {
    try {
        // Refresh the user's data from the database
        const user = await User.findById(req.user.id);
        if (!user.verified) {
            return res.status(403).json({
                error: 'Your account is not verified. Please contact an admin to unlock full functionality.',
            });
        }
        next();
    } catch (err) {
        console.error('Verification Check Error:', err);
        res.status(500).json({ error: 'Server error checking verification status' });
    }
};

module.exports = requireVerified;
