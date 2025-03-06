const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Apply authentication and admin authorization to all routes.
router.use(authenticate);
router.use(authorizeAdmin);

// Get All Users (Admin only)
router.get('/users', async (req, res) => {
    try {
        // Optionally add pagination or filtering if needed.
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Verify User (Admin only)
router.put('/users/:id/verify', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { verified: true },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Error verifying user:', err);
        res.status(500).json({ error: 'Failed to verify user' });
    }
});

module.exports = router;
