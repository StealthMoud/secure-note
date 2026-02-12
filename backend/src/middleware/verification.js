const User = require('../models/User');

// admin verification check. new users can create notes but cant share them
// until an admin says they are cool n verifies the account. prevents bots n spam.
const requireVerified = async (req, res, next) => {
    try {
        // fetch user to check status. better to do db check than trust old jwt
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // if not verified, block them. they gotta wait for admin approval.
        if (!user.verified) {
            return res.status(403).json({
                error: 'Your account is not verified. Please contact an admin to unlock full functionality.',
            });
        }

        // all good, let them use the feature
        next();
    } catch (err) {
        console.error('verification check error:', err);
        res.status(500).json({ error: 'server error checking verification status' });
    }
};

module.exports = requireVerified;