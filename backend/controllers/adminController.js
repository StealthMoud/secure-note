const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');
const Note = require('../models/Note');
const bcrypt = require('bcryptjs');
const { generateKeyPairSync } = require('crypto');

// Get all users with pagination
exports.getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const users = await User.find()
            .select('-password -privateKey -totpSecret')
            .limit(Number(limit))
            .skip((page - 1) * Number(limit))
            .exec();
        const total = await User.countDocuments();

        res.json({
            message: 'Users retrieved successfully',
            users,
            total,
            pages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Verify a user
exports.verifyUser = async (req, res) => {
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
};

// Deactivate a user
exports.deactivateUser = async (req, res) => {
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
};

// Delete a user
exports.deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: 'Admins cannot delete themselves' });
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

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
};

// Get security logs
exports.getSecurityLogs = async (req, res) => {
    try {
        const logs = await SecurityLog.find()
            .populate('user', 'username email')
            .sort({ timestamp: -1 });
        res.json({ message: 'Security logs retrieved successfully', logs });
    } catch (err) {
        console.error('Error fetching security logs:', err);
        res.status(500).json({ error: 'Failed to fetch security logs' });
    }
};

// Get system stats
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const verifiedUsers = await User.countDocuments({ verified: true });
        const totalNotes = await Note.countDocuments();
        const pendingVerifications = await User.countDocuments({ verificationPending: true });

        res.json({
            message: 'Stats retrieved successfully',
            stats: {
                totalUsers,
                verifiedUsers,
                totalNotes,
                pendingVerifications,
            },
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

// Get all notes
exports.getNotes = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const notes = await Note.find()
            .populate('owner', 'username email')
            .limit(Number(limit))
            .skip((page - 1) * Number(limit))
            .exec();
        const total = await Note.countDocuments();

        res.json({
            message: 'Notes retrieved successfully',
            notes,
            total,
            pages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (err) {
        console.error('Error fetching notes:', err);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
};

// Delete a note
exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.id);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        await SecurityLog.create({
            event: 'note_deleted',
            user: note.owner,
            details: { by: req.user.id, noteId: req.params.id },
        });

        res.json({ message: 'Note removed successfully' });
    } catch (err) {
        console.error('Error removing note:', err);
        res.status(500).json({ error: 'Failed to remove note' });
    }
};

// Create a new user/admin
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already in use' });
        }

        // Generate RSA key pair
        const { publicKey, privateKey } = generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });

        const user = new User({
            username,
            email,
            password, // Password hashing will be handled in the User model
            role,
            verified: role === 'admin', // Set verified: true for admin, false for user
            isActive: true,
            publicKey,
            privateKey,
        });
        await user.save();

        await SecurityLog.create({
            event: 'user_created',
            user: user._id,
            details: { by: req.user.id },
        });

        res.status(201).json({ message: 'User registered', user: user.toJSON() });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

// Unverify a user
exports.unverifyUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: 'Admins cannot unverify themselves' });
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { verified: false },
            { new: true }
        ).select('-password -privateKey -totpSecret');
        if (!user) return res.status(404).json({ error: 'User not found' });

        await SecurityLog.create({
            event: 'user_unverified',
            user: req.params.id,
            details: { by: req.user.id },
        });

        res.json({ message: 'User unverified successfully', user });
    } catch (err) {
        console.error('Error unverifying user:', err);
        res.status(500).json({ error: 'Failed to unverify user' });
    }
};

// Get user activity insights
exports.getUserActivity = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('friends');
        if (!user) return res.status(404).json({ error: 'User not found' });

        const notesCreated = await Note.countDocuments({ owner: userId });
        const friendsAdded = user.friends.length;
        const sharedNotes = await Note.find({ 'sharedWith.user': userId })
            .populate('owner', 'username')
            .select('owner');
        const sharedWith = [...new Set(sharedNotes.map(note => note.owner.username))];

        res.json({
            message: 'User activity retrieved successfully',
            activity: {
                notesCreated,
                friendsAdded,
                sharedWith,
            },
        });
    } catch (err) {
        console.error('Error fetching user activity:', err);
        res.status(500).json({ error: 'Failed to fetch user activity' });
    }
};