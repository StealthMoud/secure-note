const User = require('../models/User');

// admin verification middleware - this is the gatekeeper for sensitive features
// new users can register and create personal notes, but they cant share notes
// until an admin manually verifies their account
// this prevents spam, bots, and malicious users from abusing the sharing system

const requireVerified = async (req, res, next) => {
    try {
        // fetch the user from database to check their verification status
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // if user is not verified, block access to this route
        // they need to wait for admin approval before using protected features
        if (!user.verified) {
            return res.status(403).json({
                error: 'Your account is not verified. Please contact an admin to unlock full functionality.',
            });
        }

        // user is verified, let them through to the actual route handler
        next();
    } catch (err) {
        console.error('Verification Check Error:', err);
        res.status(500).json({ error: 'Server error checking verification status' });
    }
};

// alternative option using jwt payload instead of db query
// const requireVerified = (req, res, next) => {
//     if (!req.user.verified) {
//         return res.status(403).json({
//             error: 'Your account is not verified. Please contact an admin to unlock full functionality.',
//         });
//     }
//     next();
// };

module.exports = requireVerified;