const userService = require('../services/user/userService');
const broadcastService = require('../services/shared/broadcastService');
const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');
const Note = require('../models/Note');
const Broadcast = require('../models/Broadcast');
const bcrypt = require('bcryptjs');
const { generateKeyPair } = require('crypto');
const { promisify } = require('util');
const generateKeyPairAsync = promisify(generateKeyPair);
const os = require('os');

// fetch all users with simple pagination
exports.getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const total = await User.countDocuments({});
        const users = await User.find({})
            .limit(Number(limit))
            .skip((page - 1) * Number(limit))
            .select('-password');

        res.json({
            message: 'Users retrieved successfully',
            users,
            total,
            pages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (err) {
        console.error('error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// set a user as verified
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
        }).catch(err => console.error('background log error:', err));

        res.json({ message: 'User verified successfully', user: verifiedUser });
    } catch (err) {
        console.error('error verifying user:', err);
        res.status(500).json({ error: 'Failed to verify user' });
    }
};

// kill a user account for good
exports.deleteUser = async (req, res) => {
    try {
        if (req.params.id === String(req.user._id)) {
            return res.status(400).json({ error: 'Admins cannot delete themselves' });
        }

        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) return res.status(404).json({ error: 'User not found' });

        // only superadmins can touch other privileged accounts
        if (userToDelete.role === 'superadmin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ error: 'Security Violation: Only Super Administrators can delete Super Admin accounts' });
        }

        if (userToDelete.role === 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ error: 'Access Denied: Regular Administrators cannot delete fellow Admin accounts' });
        }

        await userService.deleteFullAccount(req.params.id, { deletedBy: req.user.id });

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

// fetch logs so admins know whats goin on
exports.getSecurityLogs = async (req, res) => {
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
        console.error('error fetching security logs:', err);
        res.status(500).json({ error: 'Failed to fetch security logs' });
    }
};

// general system dashboard stats
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const verifiedUsers = await User.countDocuments({ verified: true });
        const totalNotes = await Note.countDocuments();
        const pendingVerifications = await User.countDocuments({ verificationPending: true });

        // calculate cpu load as percentage of total cores
        const cpus = os.cpus();
        const loadAvg = os.loadavg();
        const cpuLoad = Math.min(Math.round((loadAvg[0] / cpus.length) * 100), 100);

        // check how much ram we are eatin
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
        console.error('error fetching stats:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

// see who is makin the most notes
exports.getNoteStats = async (req, res) => {
    try {
        // factory assembly line for stats
        const stats = await Note.aggregate([
            {
                // station 0: only count notes that aren't soft-deleted
                $match: { deletedAt: null }
            },
            {
                // station 1: count notes per owner
                $group: {
                    _id: '$owner',
                    count: { $sum: 1 }
                }
            },
            {
                // station 2: look up names in the user collection
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userParams'
                }
            },
            {
                // station 3: clean it up and grab the actual username/email
                $project: {
                    username: { $ifNull: [{ $arrayElemAt: ['$userParams.username', 0] }, 'Deleted User'] },
                    email: { $ifNull: [{ $arrayElemAt: ['$userParams.email', 0] }, 'N/A'] },
                    count: 1
                }
            },
            // station 4: put the big shots at the top
            { $sort: { count: -1 } }
        ]);
        res.json({ stats });
    } catch (err) {
        console.error('error fetching note stats:', err);
        res.status(500).json({ error: 'Failed to fetch note stats' });
    }
};

// list every note in the system
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
        console.error('error fetching notes:', err);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
};

// admin power: delete anyone's note if it breaks rules
exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.id);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        logSecurityEvent({
            event: 'note_deleted',
            user: note.owner,
            details: { by: req.user.id, noteId: req.params.id },
        }).catch(err => console.error('background log error:', err));

        res.json({ message: 'Note removed successfully' });
    } catch (err) {
        console.error('error removing note:', err);
        res.status(500).json({ error: 'Failed to remove note' });
    }
};

// create user from admin panel. usually for seedin or manual support.
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

        const { publicKey, privateKey } = await generateKeyPairAsync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });

        const user = new User({
            username,
            email,
            password,
            role,
            verified: role === 'admin', // auto verify admins
            publicKey,
            privateKey,
        });
        await user.save();

        logSecurityEvent({
            event: 'user_created',
            user: user._id,
            details: { by: req.user.id },
        }).catch(err => console.error('background log error:', err));

        res.status(201).json({ message: 'User registered', user: user.toJSON() });
    } catch (err) {
        console.error('error creating user:', err);
        res.status(500).json({ error: 'Failed to create user: ' + err.message });
    }
};

// take away verified status if a user is actin up
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
        }).catch(err => console.error('background log error:', err));

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.privateKey;
        delete userResponse.totpSecret;

        res.json({ message: 'User unverified successfully', user: userResponse });
    } catch (err) {
        console.error('error unverifying user:', err);
        res.status(500).json({ error: 'Failed to unverify user' });
    }
};

// see what a user is up to
exports.getUserActivity = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId)
            .select('friends role')
            .populate('friends.user', 'username');
        if (!user) return res.status(404).json({ error: 'User not found' });

        // only superadmins see other high-level accounts
        if (req.user.role !== 'superadmin') {
            if (user._id.toString() !== req.user.id.toString() && user.role !== 'user') {
                return res.status(403).json({ error: 'Access denied: You do not have permission to view activity for this privilege level' });
            }
        }

        const notesCreated = await Note.countDocuments({ owner: userId });
        const friendsAdded = user.friends ? user.friends.length : 0;
        const friendsList = user.friends
            ? user.friends
                .filter(f => f.user)
                .map(f => f.user.username)
            : [];
        const sharedNotes = await Note.find({ 'sharedWith.user': userId })
            .populate('owner', 'username')
            .select('owner');

        const sharedWith = [...new Set(sharedNotes
            .filter(note => note.owner)
            .map(note => note.owner.username)
        )];

        const adminActions = await SecurityLog.countDocuments({ user: userId });
        const broadcastsSent = await Broadcast.countDocuments({ createdBy: userId });

        res.json({
            message: 'User activity retrieved successfully',
            activity: {
                notesCreated,
                friendsAdded,
                friendsList,
                sharedWith,
                adminActions,
                broadcastsSent
            },
        });
    } catch (err) {
        console.error('error fetching user activity:', err);
        res.status(500).json({ error: 'Failed to fetch user activity' });
    }
};

// handle multiple users at once
exports.bulkUserAction = async (req, res) => {
    const { userIds, action } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: 'No users selected' });
    }

    const targetIds = userIds.filter(id => id !== req.user.id);

    if (targetIds.length === 0) {
        return res.status(400).json({ error: 'Cannot perform this action on yourself' });
    }

    try {
        if (action === 'delete') {
            if (req.user.role !== 'superadmin') {
                const hasPrivileged = await User.exists({ _id: { $in: targetIds }, role: { $in: ['admin', 'superadmin'] } });
                if (hasPrivileged) {
                    return res.status(403).json({ error: 'Security Violation: Regular Administrators cannot delete fellow Admin or Super Admin accounts' });
                }
            }

            const result = await User.deleteMany({ _id: { $in: targetIds } });

            logSecurityEvent({
                event: 'user_deleted',
                user: req.user.id,
                details: { bulk: true, count: result.deletedCount, targetIds }
            }).catch(err => console.error('background log error:', err));

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
            }).catch(err => console.error('background log error:', err));

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
            }).catch(err => console.error('background log error:', err));

            return res.json({ message: `${result.modifiedCount} users unverified successfully` });
        }

        return res.status(400).json({ error: 'Invalid action' });
    } catch (err) {
        console.error('bulk action error:', err);
        res.status(500).json({ error: 'Failed to perform bulk action' });
    }
};

// send a messsage to everyone on the app
exports.sendBroadcast = async (req, res) => {
    try {
        const { message, type, expiresAt } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const broadcast = new Broadcast({
            message,
            type,
            expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000), // default to 1 day
            createdBy: req.user.id
        });
        await broadcast.save();

        res.status(201).json({ message: 'Broadcast sent successfully', broadcast });
    } catch (err) {
        console.error('error sending broadcast:', err);
        res.status(500).json({ error: 'Failed to send broadcast' });
    }
};

// see all past broadcasts
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
        console.error('error fetching broadcasts:', err);
        res.status(500).json({ error: 'Failed to fetch broadcasts' });
    }
};

// change a user's permissions level
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const VALID_ROLES = ['superadmin', 'admin', 'user'];

        if (!VALID_ROLES.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // only superadmins change roles usually
        if (req.user.role !== 'superadmin') {
            // regular admins can only make other admins
            if (user.role !== 'user' || role !== 'admin') {
                return res.status(403).json({
                    error: 'Access denied: Administrators can only promote standard users to admin'
                });
            }
        }

        // dont let admins or superadmins demote themselves
        if (user._id.toString() === req.user.id && VALID_ROLES.indexOf(role) > VALID_ROLES.indexOf(user.role)) {
            return res.status(400).json({ error: 'You cannot decrease your own role' });
        }

        user.role = role;
        await user.save();

        res.json({ message: 'User role updated successfully', user: { id: user._id, username: user.username, role: user.role } });

        logSecurityEvent({
            event: 'role_update',
            user: req.user.id,
            details: { target: user._id, newRole: role }
        }).catch(err => console.error('background log error:', err));
    } catch (err) {
        console.error('error updating user role:', err);
        res.status(500).json({ error: 'Failed to update user role: ' + err.message });
    }
};
