const userService = require('../services/user/userService');
const broadcastService = require('../services/shared/broadcastService');
const User = require('../models/User'); // still needed for stats aggregations
const SecurityLog = require('../models/SecurityLog');
const Note = require('../models/Note');
const Broadcast = require('../models/Broadcast');
const bcrypt = require('bcryptjs');
const { generateKeyPairSync } = require('crypto');
const { logSecurityEvent } = require('../utils/logger');
const os = require('os');

// get all users with paginaton for admin dashboard
exports.getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const users = await userService.getAllUsers({});

        // manual pagination since service returns all
        const startIndex = (page - 1) * Number(limit);
        const endIndex = startIndex + Number(limit);
        const paginatedUsers = users.slice(startIndex, endIndex);

        res.json({
            message: 'Users retrieved successfully',
            users: paginatedUsers,
            total: users.length,
            pages: Math.ceil(users.length / limit),
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

        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.role === 'admin') {
            return res.status(400).json({ error: 'Cannot verify admin accounts' });
        }

        const verifiedUser = await userService.verifyUser(req.params.id);

        logSecurityEvent({
            event: 'user_verified',
            user: req.params.id,
            details: { by: req.user.id },
        }).catch(err => console.error('Background log error:', err));

        res.json({ message: 'User verified successfully', user: verifiedUser });
    } catch (err) {
        console.error('Error verifying user:', err);
        res.status(500).json({ error: 'Failed to verify user' });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    try {
        if (req.params.id === String(req.user._id)) {
            return res.status(400).json({ error: 'Admins cannot delete themselves' });
        }

        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) return res.status(404).json({ error: 'User not found' });

        // Security Protocol: Only Superadmin can delete other privileged accounts
        if (userToDelete.role === 'superadmin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ error: 'Security Violation: Only Super Administrators can delete Super Admin accounts' });
        }

        if (userToDelete.role === 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ error: 'Access Denied: Regular Administrators cannot delete fellow Admin accounts' });
        }

        await userService.deleteUser(req.params.id);

        logSecurityEvent({
            event: 'user_deleted',
            user: req.params.id,
            details: { by: req.user.id },
        }).catch(err => console.error('Background log error:', err));

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

// Get security logs with pagination and filtering
exports.getSecurityLogs = async (req, res) => {
    // ... (keep existing getSecurityLogs) ...
    try {
        const { page = 1, limit = 10, severity, userId } = req.query;
        const query = {};
        if (severity) {
            query.severity = severity;
        }
        if (userId) {
            query.user = userId;
        }

        const logs = await SecurityLog.find(query)
            .populate('user', 'username email')
            .sort({ timestamp: -1 })
            .limit(Number(limit))
            .skip((page - 1) * Number(limit))
            .exec();

        const total = await SecurityLog.countDocuments(query);

        res.json({
            message: 'Security logs retrieved successfully',
            logs,
            total,
            pages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
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

        // Calculate real CPU load (1 min average as percentage of total cores)
        const cpus = os.cpus();
        const loadAvg = os.loadavg();
        const cpuLoad = Math.min(Math.round((loadAvg[0] / cpus.length) * 100), 100);

        // Calculate real Memory load percentage
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const memoryPercentage = Math.round(((totalMem - freeMem) / totalMem) * 100);

        res.json({
            message: 'Stats retrieved successfully',
            stats: {
                totalUsers,
                verifiedUsers,
                totalNotes,
                pendingVerifications,
                cpuLoad,
                memoryPercentage,
                memoryUsage: `${Math.round((totalMem - freeMem) / 1024 / 1024 / 1024 * 100) / 100} GB / ${Math.round(totalMem / 1024 / 1024 / 1024 * 100) / 100} GB`,
                uptime: `${Math.round(os.uptime() / 3600 * 100) / 100} hours`
            },
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

// Get note stats (count per user)
exports.getNoteStats = async (req, res) => {
    try {
        const stats = await Note.aggregate([
            {
                $group: {
                    _id: '$owner',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userParams'
                }
            },
            {
                $project: {
                    username: { $arrayElemAt: ['$userParams.username', 0] },
                    email: { $arrayElemAt: ['$userParams.email', 0] },
                    count: 1
                }
            },
            { $sort: { count: -1 } }
        ]);
        res.json({ stats });
    } catch (err) {
        console.error('Error fetching note stats:', err);
        res.status(500).json({ error: 'Failed to fetch note stats' });
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

        logSecurityEvent({
            event: 'note_deleted',
            user: note.owner,
            details: { by: req.user.id, noteId: req.params.id },
        }).catch(err => console.error('Background log error:', err));

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

        // generate rsa key pair for end to end encryption
        const { publicKey, privateKey } = generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });

        const user = new User({
            username,
            email,
            password, // password hashing will be handeled in the user model
            role,
            verified: role === 'admin', // admins are auto verified users are not
            publicKey,
            privateKey,
        });
        await user.save();

        logSecurityEvent({
            event: 'user_created',
            user: user._id,
            details: { by: req.user.id },
        }).catch(err => console.error('Background log error:', err));

        res.status(201).json({ message: 'User registered', user: user.toJSON() });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Failed to create user: ' + err.message });
    }
};

// Unverify a user
exports.unverifyUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: 'Admins cannot unverify themselves' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.role === 'admin') {
            return res.status(400).json({ error: 'Cannot unverify admin accounts' });
        }

        user.verified = false;
        user.verificationToken = null;
        user.verificationExpires = null;
        user.verificationPending = false;
        user.verificationRejected = false;
        await user.save();

        logSecurityEvent({
            event: 'user_unverified',
            user: req.params.id,
            details: { by: req.user.id },
        }).catch(err => console.error('Background log error:', err));

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.privateKey;
        delete userResponse.totpSecret;

        res.json({ message: 'User unverified successfully', user: userResponse });
    } catch (err) {
        console.error('Error unverifying user:', err);
        res.status(500).json({ error: 'Failed to unverify user' });
    }
};

// Get user activity insights
exports.getUserActivity = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('friends role');
        if (!user) return res.status(404).json({ error: 'User not found' });

        // RBAC Check: 
        // 1. Super Admin can see everyone
        // 2. Admin can see themselves and users, but NOT other admins or superadmins
        // 2. Admin can see themselves and users, but NOT other admins or superadmins
        if (req.user.role !== 'superadmin') {
            if (user._id.toString() !== req.user.id.toString() && user.role !== 'user') {
                return res.status(403).json({ error: 'Access denied: You do not have permission to view activity for this privilege level' });
            }
        }

        const notesCreated = await Note.countDocuments({ owner: userId });
        const friendsAdded = user.friends ? user.friends.length : 0;
        const sharedNotes = await Note.find({ 'sharedWith.user': userId })
            .populate('owner', 'username')
            .select('owner');

        const sharedWith = [...new Set(sharedNotes
            .filter(note => note.owner) // filter out notes where owner is null (deleted user)
            .map(note => note.owner.username)
        )];

        // Admin specific stats
        const adminActions = await SecurityLog.countDocuments({ user: userId });
        const broadcastsSent = await Broadcast.countDocuments({ createdBy: userId });

        res.json({
            message: 'User activity retrieved successfully',
            activity: {
                notesCreated,
                friendsAdded,
                sharedWith,
                adminActions,
                broadcastsSent
            },
        });
    } catch (err) {
        console.error('Error fetching user activity:', err);
        res.status(500).json({ error: 'Failed to fetch user activity' });
    }
};
// Bulk user actions
exports.bulkUserAction = async (req, res) => {
    const { userIds, action } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: 'No users selected' });
    }

    // Filter out the current admin to prevent self-lockout
    const targetIds = userIds.filter(id => id !== req.user.id);

    if (targetIds.length === 0) {
        return res.status(400).json({ error: 'Cannot perform this action on yourself' });
    }

    try {
        if (action === 'delete') {
            // Further security check for regular admins
            if (req.user.role !== 'superadmin') {
                const privilegedUsers = await User.find({ _id: { $in: targetIds }, role: { $in: ['admin', 'superadmin'] } });
                if (privilegedUsers.length > 0) {
                    return res.status(403).json({ error: 'Security Violation: Regular Administrators cannot delete fellow Admin or Super Admin accounts' });
                }
            }

            const result = await User.deleteMany({ _id: { $in: targetIds } });

            logSecurityEvent({
                event: 'user_deleted',
                user: req.user.id,
                details: { bulk: true, count: result.deletedCount, targetIds }
            }).catch(err => console.error('Background log error:', err));

            return res.json({ message: `${result.deletedCount} users deleted successfully` });
        }


        if (action === 'verify') {
            const result = await User.updateMany(
                { _id: { $in: targetIds }, role: { $ne: 'admin' } },
                {
                    $set: {
                        verified: true,
                        verificationPending: false,
                        verificationToken: null,
                        verificationExpires: null
                    }
                }
            );

            logSecurityEvent({
                event: 'user_verified',
                user: req.user.id,
                details: { bulk: true, count: result.modifiedCount, targetIds, action: 'bulk_verify' }
            }).catch(err => console.error('Background log error:', err));

            return res.json({ message: `${result.modifiedCount} users verified successfully` });
        }

        if (action === 'unverify') {
            const result = await User.updateMany(
                { _id: { $in: targetIds }, role: { $ne: 'admin' } },
                {
                    $set: {
                        verified: false,
                        verificationPending: false
                    }
                }
            );

            logSecurityEvent({
                event: 'user_unverified',
                user: req.user.id,
                details: { bulk: true, count: result.modifiedCount, targetIds, action: 'bulk_unverify' }
            }).catch(err => console.error('Background log error:', err));

            return res.json({ message: `${result.modifiedCount} users unverified successfully` });
        }

        return res.status(400).json({ error: 'Invalid action' });
    } catch (err) {
        console.error('Bulk action error:', err);
        res.status(500).json({ error: 'Failed to perform bulk action' });
    }
};
// send a system-wide broadcast
exports.sendBroadcast = async (req, res) => {
    try {
        const { message, type, expiresAt } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        // deactivate old active broadcasts - REMOVED per user request to keep history
        // await Broadcast.updateMany({ active: true, type }, { active: false });

        const broadcast = new Broadcast({
            message,
            type,
            expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000), // default 24h
            createdBy: req.user.id
        });
        await broadcast.save();

        res.status(201).json({ message: 'Broadcast sent successfully', broadcast });
    } catch (err) {
        console.error('Error sending broadcast:', err);
        res.status(500).json({ error: 'Failed to send broadcast' });
    }
};

// Get all broadcasts history
exports.getBroadcasts = async (req, res) => {
    try {
        const { userId } = req.query;
        const query = {};
        if (userId) {
            query.createdBy = userId;
        }

        const broadcasts = await Broadcast.find(query)
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });
        res.json({ broadcasts });
    } catch (err) {
        console.error('Error fetching broadcasts:', err);
        res.status(500).json({ error: 'Failed to fetch broadcasts' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const VALID_ROLES = ['superadmin', 'admin', 'user'];

        if (!VALID_ROLES.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Security Check: Role Management Permissions
        if (req.user.role !== 'superadmin') {
            // Admins can only promote 'user' -> 'admin'
            if (user.role !== 'user' || role !== 'admin') {
                return res.status(403).json({
                    error: 'Access denied: Administrators can only promote standard users to admin'
                });
            }
        }

        // Prevent Super Admin from demoting themselves
        if (user._id.toString() === req.user.id && role !== 'superadmin') {
            return res.status(400).json({ error: 'Security Protocol Violation: You cannot demote your own Super Admin account' });
        }

        user.role = role;
        await user.save();

        await logSecurityEvent({
            event: 'role_update',
            user: req.user.id,
            details: { target: user._id, newRole: role }
        });

        res.json({ message: 'User role updated successfully', user: { id: user._id, username: user.username, role: user.role } });
    } catch (err) {
        console.error('Error updating user role:', err);
        res.status(500).json({ error: 'Failed to update user role: ' + err.message });
    }
};
