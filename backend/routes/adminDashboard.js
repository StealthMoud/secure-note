const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Apply authentication and admin authorization to all routes in this file.
router.use(authenticate);
router.use(authorizeAdmin);

/**
 * GET /admin/users
 * Retrieves all users (excluding passwords), optionally with pagination.
 */
router.get('/users', async (req, res) => {
    try {
        // For simplicity, we fetch all users here.
        // In production, consider adding pagination (limit, skip, etc.).
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * PUT /admin/users/:id/verify
 * Verifies a user.
 */
router.put('/users/:id/verify', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { verified: true },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User verified successfully', user });
    } catch (err) {
        console.error('Error verifying user:', err);
        res.status(500).json({ error: 'Failed to verify user' });
    }
});

/**
 * PUT /admin/users/:id/deactivate
 * Deactivates a user.
 */
router.put('/users/:id/deactivate', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deactivated successfully', user });
    } catch (err) {
        console.error('Error deactivating user:', err);
        res.status(500).json({ error: 'Failed to deactivate user' });
    }
});

/**
 * DELETE /admin/users/:id
 * Permanently removes a user.
 */
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User removed successfully' });
    } catch (err) {
        console.error('Error removing user:', err);
        res.status(500).json({ error: 'Failed to remove user' });
    }
});

/**
 * GET /admin/logs
 * Retrieves recent security logs.
 */
router.get('/logs', async (req, res) => {
    try {
        // Retrieve the 100 most recent security logs, populated with user info.
        const logs = await SecurityLog.find()
            .populate('user', 'username email')
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(logs);
    } catch (err) {
        console.error('Error fetching security logs:', err);
        res.status(500).json({ error: 'Failed to fetch security logs' });
    }
});

module.exports = router;
