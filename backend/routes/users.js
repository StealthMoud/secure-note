const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
    getCurrentUser,
    sendFriendRequest,
    respondToFriendRequest,
    getFriends,
} = require('../controllers/userController');

// Get Current User
router.get('/me', authenticate, getCurrentUser);

// Send Friend Request
router.post('/friend/request', authenticate, [
    body('username').notEmpty().withMessage('Username is required'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    sendFriendRequest(req, res);
});

// Respond to Friend Request
router.post('/friend/respond', authenticate, [
    body('username').notEmpty().withMessage('Username is required'),
    body('action').isIn(['accept', 'reject']).withMessage('Action must be accept or reject'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    respondToFriendRequest(req, res);
});

// Get Friends and Pending Requests
router.get('/friends', authenticate, getFriends);

module.exports = router;