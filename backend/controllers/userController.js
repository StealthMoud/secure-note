const User = require('../models/User');
const {logSecurityEvent} = require('../utils/logger');

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -privateKey -totpSecret');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user, role: req.user.role });
    } catch (err) {
        console.error('Get Current User Error:', err);
        res.status(500).json({ error: 'Failed to fetch current user' });
    }
};

exports.sendFriendRequest = async (req, res) => {
    try {
        if (!req.user.verified) return res.status(403).json({ error: 'Email verification required to send friend requests' });

        const { target } = req.body;
        if (!target) return res.status(400).json({ error: 'Username or email is required' });

        const sender = await User.findById(req.user.id);
        if (sender.username === target || sender.email === target) return res.status(400).json({ error: 'Cannot send friend request to yourself' });

        const targetUser = await User.findOne({
            $or: [{ username: target }, { email: target }],
        });
        if (!targetUser) return res.status(404).json({ error: 'Target user not found' });
        if (!targetUser.verified) return res.status(403).json({ error: 'Cannot send friend request to an unverified user' });

        if (sender.friends.some(f => f.user.toString() === targetUser._id.toString())) {
            return res.status(400).json({ error: 'User is already a friend' });
        }

        const pendingRequest = sender.friendRequests.find(
            r => r.sender.toString() === req.user.id && r.receiver.toString() === targetUser._id.toString() && r.status === 'pending'
        );
        if (pendingRequest) {
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
            requestId: receiverRequestId // Add a reference to the receiver's request _id
        };
        sender.friendRequests.push(senderRequest);
        await sender.save();

        await logSecurityEvent({
            event: 'friend_request_sent',
            user: req.user.id.toString(),
            details: {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                referrer: req.headers['referer'],
                email: req.user.email,
                username: req.user.username,
                role: req.user.role,
                sender: req.user.id,
                receiver: targetUser._id,
                status: 'pending',
                createdAt: createdAt.toISOString(),
                updatedAt: createdAt.toISOString(),
            },
        });

        res.json({ message: 'Friend request sent' });
    } catch (err) {
        console.error('Error sending friend request:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.respondToFriendRequest = async (req, res) => {
    try {
        if (!req.user.verified) return res.status(403).json({ error: 'Email verification required to respond to friend requests' });

        const { requestId, action } = req.body;
        if (!requestId || !['accept', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Request ID and valid action (accept or reject) are required' });
        }

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
            console.log('Sender friendRequests:', sender.friendRequests); // Debug
            return res.status(404).json({ error: 'Corresponding pending friend request not found on sender side' });
        }

        if (action === 'accept') {
            request.status = 'accepted';
            senderRequest.status = 'accepted';
            request.updatedAt = new Date();
            senderRequest.updatedAt = new Date();

            if (!sender.friends.some(f => f.user.toString() === req.user.id)) {
                sender.friends.push({ user: req.user.id });
            }
            if (!user.friends.some(f => f.user.toString() === sender._id.toString())) {
                user.friends.push({ user: sender._id });
            }
        } else if (action === 'reject') {
            request.status = 'rejected';
            senderRequest.status = 'rejected';
            request.updatedAt = new Date();
            senderRequest.updatedAt = new Date();
        }

        await user.save();
        await sender.save();

        await logSecurityEvent({
            event: `friend_request_${action}ed`,
            user: req.user.id,
            details: { from: sender._id },
        });

        res.json({ message: `Friend request ${action}ed` });
    } catch (err) {
        console.error('Error responding to friend request:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('friends.user', 'username')
            .populate('friendRequests.sender', 'username email')
            .populate('friendRequests.receiver', 'username email');
        if (!user) return res.status(404).json({ error: 'User not found' });

        const friends = user.friends.map(f => ({ _id: f.user._id, username: f.user.username }));

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
    } catch (err) {
        console.error('Error fetching friends:', err);
        res.status(500).json({ error: err.message });
    }
};