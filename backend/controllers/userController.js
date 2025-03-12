const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');

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

        const { username } = req.body;
        if (!username) return res.status(400).json({ error: 'Username is required' });

        const sender = await User.findById(req.user.id);
        if (sender.username === username) return res.status(400).json({ error: 'Cannot send friend request to yourself' });

        const targetUser = await User.findOne({ username });
        if (!targetUser) return res.status(404).json({ error: 'Target user not found' });
        if (!targetUser.verified) return res.status(403).json({ error: 'Cannot send friend request to an unverified user' });

        // Check if already friends
        if (sender.friends.some(f => f.user.toString() === targetUser._id.toString())) {
            return res.status(400).json({ error: 'User is already a friend' });
        }

        // Check for pending request from sender to target
        const pendingRequest = sender.friendRequests.find(
            r => r.sender.toString() === req.user.id && r.receiver.toString() === targetUser._id.toString() && r.status === 'pending'
        );
        if (pendingRequest) {
            return res.status(400).json({ error: 'Friend request already pending' });
        }

        // Add request to both users' friendRequests
        const request = {
            sender: req.user.id,
            receiver: targetUser._id,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        sender.friendRequests.push(request);
        targetUser.friendRequests.push(request);

        await sender.save();
        await targetUser.save();
        await SecurityLog.create({ event: 'friend_request_sent', user: req.user.id, details: { to: targetUser._id } });

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

        // Find the specific pending request by ID in receiver's friendRequests
        const request = user.friendRequests.id(requestId);
        if (!request || request.status !== 'pending') {
            return res.status(404).json({ error: 'Friend request not found or already processed' });
        }

        const sender = await User.findById(request.sender);
        if (!sender) return res.status(404).json({ error: 'Sender not found' });

        // Find the corresponding request in sender's friendRequests
        const senderRequest = sender.friendRequests.find(
            r => r.sender.toString() === sender._id.toString() &&
                r.receiver.toString() === req.user.id &&
                r.status === 'pending' &&
                r.createdAt.getTime() === request.createdAt.getTime()
        );
        if (!senderRequest) {
            return res.status(404).json({ error: 'Corresponding pending friend request not found on sender side' });
        }

        // Update statuses
        if (action === 'accept') {
            request.status = 'accepted';
            senderRequest.status = 'accepted';
            request.updatedAt = new Date();
            senderRequest.updatedAt = new Date();

            // Add to friends lists if not already present
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

        await SecurityLog.create({
            event: `friend_request_${action}ed`,
            user: req.user.id,
            details: { from: sender._id }
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
            .populate('friendRequests.sender', 'username')
            .populate('friendRequests.receiver', 'username');
        if (!user) return res.status(404).json({ error: 'User not found' });

        const friends = user.friends.map(f => ({ _id: f.user._id, username: f.user.username }));

        const friendRequests = user.verified
            ? user.friendRequests.map(r => ({
                sender: { _id: r.sender._id, username: r.sender.username },
                receiver: { _id: r.receiver._id, username: r.receiver.username },
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