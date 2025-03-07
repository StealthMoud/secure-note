const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.use(authenticate);
router.use(authorizeAdmin);

router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const users = await User.find()
            .select('-password -privateKey -totpSecret')
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        const total = await User.countDocuments();

        res.json({
            message: 'Users retrieved successfully',
            users,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.put('/users/:id/verify', async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: 'Admins cannot verify themselves' });
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { verified: true },
            { new: true }
        ).select('-password -privateKey -totpSecret');
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Add logging after successful verification
        await SecurityLog.create({
            event: 'user_verified',
            user: req.params.id,
            details: { by: req.user.id },
        });

        res.json({ message: 'User verified successfully', user });
    } catch (err) {
        console.error('Error verifying user:', err);
        res.status(500).json({ error: 'Failed to verify user' });
    }
});

router.put('/users/:id/deactivate', async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: 'Admins cannot deactivate themselves' });
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        ).select('-password -privateKey -totpSecret');
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Add logging after successful deactivation
        await SecurityLog.create({
            event: 'user_deactivated',
            user: req.params.id,
            details: { by: req.user.id },
        });

        res.json({ message: 'User deactivated successfully', user });
    } catch (err) {
        console.error('Error deactivating user:', err);
        res.status(500).json({ error: 'Failed to deactivate user' });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: 'Admins cannot delete themselves' });
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Add logging after successful deletion
        await SecurityLog.create({
            event: 'user_deleted',
            user: req.params.id,
            details: { by: req.user.id },
        });

        res.json({ message: 'User removed successfully' });
    } catch (err) {
        console.error('Error removing user:', err);
        res.status(500).json({ error: 'Failed to remove user' });
    }
});

router.get('/logs', async (req, res) => {
    try {
        const logs = await SecurityLog.find()
            .populate('user', 'username email')
            .sort({ timestamp: -1 })
            .limit(100);
        res.json({ message: 'Security logs retrieved successfully', logs });
    } catch (err) {
        console.error('Error fetching security logs:', err);
        res.status(500).json({ error: 'Failed to fetch security logs' });
    }
});

module.exports = router;