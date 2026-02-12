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
    // gotta be verified to make friends. stops spam accounts.
    if (!req.user.verified) return res.status(403).json({ error: 'Email verification required to send friend requests' });

    const { target } = req.body;
    const sender = await User.findById(req.user.id);

    // check if they are tryin to friend themselves
    if (sender.username === target || sender.email === target) {
        return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    const targetUser = await User.findOne({
        $or: [{ username: target }, { email: target }],
    });

    if (!targetUser) return res.status(404).json({ error: 'Target user not found' });
    if (!targetUser.verified) return res.status(403).json({ error: 'Cannot send friend request to an unverified user' });

    // check if they are already friends
    if (sender.friends.some(f => f.user.toString() === targetUser._id.toString())) {
        return res.status(400).json({ error: 'User is already a friend' });
    }

    // check if a request is already out there
    const alreadyPending = sender.friendRequests.some(
        r => r.receiver.toString() === targetUser._id.toString() && r.status === 'pending'
    );
    if (alreadyPending) {
        return res.status(400).json({ error: 'Friend request already pending' });
    }

    const createdAt = new Date();

    // first add the request to the receiver so we get an id
    const receiverRequest = {
        sender: req.user.id,
        receiver: targetUser._id,
        status: 'pending',
        createdAt,
        updatedAt: createdAt
    };
    targetUser.friendRequests.push(receiverRequest);
    await targetUser.save();

    // use that id for the sender side too so they match
    const receiverRequestId = targetUser.friendRequests[targetUser.friendRequests.length - 1]._id;

    const senderRequest = {
        sender: req.user.id,
        receiver: targetUser._id,
        status: 'pending',
        createdAt,
        updatedAt: createdAt,
        requestId: receiverRequestId
    };
    sender.friendRequests.push(senderRequest);
    await sender.save();

    res.json({ message: 'Friend request sent' });

    logUserEvent(req, 'friend_request_sent', req.user.id.toString(), {
        receiver: targetUser._id,
    }).catch(err => console.error('background log error:', err));
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

    // find the other half of the request
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

        // update both friend lists
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

    res.json({ message: `Friend request ${action}ed` });

    logUserEvent(req, `friend_request_${action}ed`, req.user.id, { from: sender._id })
        .catch(err => console.error('background log error:', err));
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

    // make sure nobody else has this name first
    if (await User.findOne({ username })) {
        return res.status(400).json({ error: 'Username already taken' });
    }

    user.username = username;
    await user.save();

    res.json({ message: 'Username updated successfully', user: user.toJSON() });

    logUserEvent(req, 'username_updated', user._id)
        .catch(err => console.error('background log error:', err));
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

    res.json({ message: 'Profile updated successfully', user: user.toJSON() });

    logUserEvent(req, 'profile_updated', user._id)
        .catch(err => console.error('background log error:', err));
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

    res.json({ message: 'Personalization updated successfully', user: user.toJSON() });

    logUserEvent(req, 'personalization_updated', user._id)
        .catch(err => console.error('background log error:', err));
});

exports.updateEmail = asyncHandler(async (req, res) => {
    const { newEmail } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // check if the new mail is already taken
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

    // fire n forget the mail so we dont hold up the response
    emailService.sendEmail(newEmail, 'Verify Your New Email', null, `<p>Please verify your new email by clicking <a href="${verificationUrl}">here</a>.</p>`)
        .catch(err => console.error('background: failed to send email verification for update:', err));

    res.json({ message: successMessage });

    logUserEvent(req, 'email_change_requested', user._id, { newEmail })
        .catch(err => console.error('background log error:', err));
});

exports.updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // oauth users dont have passwords here
    if (user.githubId) return res.status(400).json({ error: 'Password change not allowed for OAuth users' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: 'Current password incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

    logUserEvent(req, 'password_changed', user._id)
        .catch(err => console.error('background log error:', err));
});

exports.deleteSelfAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // for regular users we need their password to be sure
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