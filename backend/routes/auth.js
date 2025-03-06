const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { registerUser, loginUser } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Register Route
router.post(
    '/register',
    [
        body('username').notEmpty().withMessage('Username is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) throw new Error('Passwords do not match');
            return true;
        }),
    ],
    (req, res) => {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        // Delegate to controller
        registerUser(req, res);
    }
);

// Login Route
router.post(
    '/login',
    [
        body('identifier').notEmpty().withMessage('Identifier is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        loginUser(req, res);
    }
);

// Protected Route: Get Current User (example)
router.get('/me', authenticate, async (req, res) => {
    // This logic can also be moved to a controller if desired.
    try {
        const user = await require('../models/User').findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user, role: req.user.role });
    } catch (err) {
        console.error('Get Current User Error:', err);
        res.status(500).json({ error: 'Failed to fetch current user' });
    }
});

module.exports = router;
