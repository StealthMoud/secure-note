const User = require('../models/User');

// Option 1: Keep DB query for freshness
const requireVerified = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
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

// Option 2: Use JWT payload (requires updating authController.js)
// const requireVerified = (req, res, next) => {
//     if (!req.user.verified) {
//         return res.status(403).json({
//             error: 'Your account is not verified. Please contact an admin to unlock full functionality.',
//         });
//     }
//     next();
// };

module.exports = requireVerified;