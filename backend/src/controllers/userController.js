const userService = require('../services/user/userService');
const User = require('../models/User');
const Broadcast = require('../models/Broadcast');
const { logUserEvent } = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');
const emailService = require('../services/shared/emailService');

exports.getCurrentUser = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user, role: req.user.role });
});

exports.sendFriendRequest = asyncHandler(async (req, res) => {
    if (!req.user.verified) return res.status(403).json({ error: 'Email verification required to send friend requests' });

    const { target } = req.body;
    const sender = await User.findById(req.user.id);

    if (sender.username === target || sender.email === target) {
        return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    const targetUser = await User.findOne({
        $or: [{ username: target }, { email: target }],
    });

    if (!targetUser) return res.status(404).json({ error: 'Target user not found' });
    if (!targetUser.verified) return res.status(403).json({ error: 'Cannot send friend request to an unverified user' });

    if (sender.friends.some(f => f.user.toString() === targetUser._id.toString())) {
        return res.status(400).json({ error: 'User is already a friend' });
    }

    const alreadyPending = sender.friendRequests.some(
        r => r.receiver.toString() === targetUser._id.toString() && r.status === 'pending'
    );
    if (alreadyPending) {
        return res.status(400).json({ error: 'Friend request already pending' });
    }

    const createdAt = new Date();

    // First, add the request to the receiver and get its _id
    const receiverRequest = {
        sender: req.user.id,
        receiver: targetUser._id,
        status: 'pending',
        createdAt,
        updatedAt: createdAt
    };
    targetUser.friendRequests.push(receiverRequest);
    await targetUser.save();

    // Use the receiver's request _id as a shared identifier
    const receiverRequestId = targetUser.friendRequests[targetUser.friendRequests.length - 1]._id;

    const senderRequest = {
        sender: req.user.id,
        receiver: targetUser._id,
        status: 'pending',
        createdAt,
        updatedAt: createdAt,
        requestId: receiverRequestId // Reference to the receiver's request _id
    };
    sender.friendRequests.push(senderRequest);
    await sender.save();

    await logUserEvent(req, 'friend_request_sent', req.user.id.toString(), {
        receiver: targetUser._id,
    });

    res.json({ message: 'Friend request sent' });
});

exports.respondToFriendRequest = asyncHandler(async (req, res) => {
    if (!req.user.verified) return res.status(403).json({ error: 'Email verification required to respond to friend requests' });

    const { requestId, action } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const request = user.friendRequests.id(requestId);
    if (!request || request.status !== 'pending') {
        return res.status(404).json({ error: 'Friend request not found or already processed' });
    }

    const sender = await User.findById(request.sender);
    if (!sender) return res.status(404).json({ error: 'Sender not found' });

    // Find the sender's request using the receiver's requestId
    const senderRequest = sender.friendRequests.find(
        r => r.requestId && r.requestId.toString() === requestId && r.status === 'pending'
    );
    if (!senderRequest) {
        return res.status(404).json({ error: 'Corresponding pending friend request not found on sender side' });
    }

    const now = new Date();
    if (action === 'accept') {
        request.status = 'accepted';
        senderRequest.status = 'accepted';
        request.updatedAt = now;
        senderRequest.updatedAt = now;

        if (!sender.friends.some(f => f.user.toString() === req.user.id)) {
            sender.friends.push({ user: req.user.id });
        }
        if (!user.friends.some(f => f.user.toString() === sender._id.toString())) {
            user.friends.push({ user: sender._id });
        }
    } else {
        request.status = 'rejected';
        senderRequest.status = 'rejected';
        request.updatedAt = now;
        senderRequest.updatedAt = now;
    }

    await user.save();
    await sender.save();

    await logUserEvent(req, `friend_request_${action}ed`, req.user.id, { from: sender._id });

    res.json({ message: `Friend request ${action}ed` });
});

exports.getFriends = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
        .populate('friends.user', 'username')
        .populate('friendRequests.sender', 'username email')
        .populate('friendRequests.receiver', 'username email');

    if (!user) return res.status(404).json({ error: 'User not found' });

    const friends = user.friends.map(f => ({
        _id: f.user._id,
        username: f.user.username
    }));

    const friendRequests = user.verified
        ? user.friendRequests.map(r => ({
            _id: r._id.toString(),
            sender: { _id: r.sender._id, username: r.sender.username, email: r.sender.email },
            receiver: { _id: r.receiver._id, username: r.receiver.username, email: r.receiver.email },
            status: r.status,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt
        }))
        : [];

    res.json({ friends, friendRequests });
});

exports.getActiveBroadcast = asyncHandler(async (req, res) => {
    const broadcast = await Broadcast.findOne({
        active: true,
        expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    res.json({ broadcast });
});

exports.getBroadcastFeed = asyncHandler(async (req, res) => {
    const broadcasts = await Broadcast.find()
        .select('message type createdAt')
        .sort({ createdAt: -1 })
        .limit(50);
    res.json({ broadcasts });
});

exports.updateUsername = asyncHandler(async (req, res) => {
    const { username } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // check if username is already taken by another user
    if (await User.findOne({ username })) {
        return res.status(400).json({ error: 'Username already taken' });
    }

    user.username = username;
    await user.save();

    logUserEvent(req, 'username_updated', user._id)
        .catch(err => console.error('Background log error:', err));

    res.json({ message: 'Username updated successfully', user: user.toJSON() });
});

exports.updateProfile = asyncHandler(async (req, res) => {
    const { firstName, lastName, nickname, birthday, country } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.nickname = nickname || user.nickname;
    user.birthday = birthday ? new Date(birthday) : user.birthday;
    user.country = country || user.country;

    if (req.file) {
        user.avatar = `/uploads/${req.user.id}/${req.file.filename}`;
    }

    await user.save();

    logUserEvent(req, 'profile_updated', user._id)
        .catch(err => console.error('Background log error:', err));

    res.json({ message: 'Profile updated successfully', user: user.toJSON() });
});

exports.updatePersonalization = asyncHandler(async (req, res) => {
    const { bio, gender } = req.body;
    const files = req.files;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.bio = bio || user.bio;
    user.gender = gender || user.gender;

    if (files?.avatar) user.avatar = `/uploads/${req.user.id}/${files.avatar[0].filename}`;
    if (files?.header) user.header = `/uploads/${req.user.id}/${files.header[0].filename}`;

    await user.save();

    logUserEvent(req, 'personalization_updated', user._id)
        .catch(err => console.error('Background log error:', err));

    res.json({ message: 'Personalization updated successfully', user: user.toJSON() });
});

exports.updateEmail = asyncHandler(async (req, res) => {
    const { newEmail } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (await User.findOne({ email: newEmail })) {
        return res.status(400).json({ error: 'Email already in use' });
    }

    const verificationToken = require('crypto').randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    user.email = newEmail;
    user.verified = false;
    await user.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    // Background email and logging to prevent blocking response (especially on slow local SMTP or DB)
    emailService.sendEmail(newEmail, 'Verify Your New Email', null, `<p>Please verify your new email by clicking <a href="${verificationUrl}">here</a>.</p>`)
        .catch(err => console.error('Background: failed to send email verification for update:', err));

    logUserEvent(req, 'email_change_requested', user._id, { newEmail })
        .catch(err => console.error('Background log error:', err));

    const successMessage = (user.role === 'admin' || user.role === 'superadmin')
        ? 'Administrative verification sent to new relay'
        : 'Verification email sent to new address';

    res.json({ message: successMessage });
});

exports.updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.githubId) return res.status(400).json({ error: 'Password change not allowed for OAuth users' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: 'Current password incorrect' });

    user.password = newPassword;
    await user.save();

    logUserEvent(req, 'password_changed', user._id)
        .catch(err => console.error('Background log error:', err));

    res.json({ message: 'Password changed successfully' });
});

exports.deleteSelfAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // for oauth users we might not have a password
    if (user.password) {
        if (!password) {
            return res.status(400).json({ error: 'Password is required to delete account' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password' });
        }
    }

    const { getRequestMetadata } = require('../utils/logger');
    await userService.deleteFullAccount(req.user.id, getRequestMetadata(req));

    res.json({ message: 'Account and all associated data deleted successfully' });
});