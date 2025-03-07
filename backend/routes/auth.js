const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { registerUser, loginUser } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');


// -----------------------
// Authentication Routes
// -----------------------

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
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
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

// Protected Route: Get Current User
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user, role: req.user.role });
    } catch (err) {
        console.error('Get Current User Error:', err);
        res.status(500).json({ error: 'Failed to fetch current user' });
    }
});

// -----------------------
// Password Reset Routes
// -----------------------

const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    message: 'Too many password reset requests, please try again later',
});

// Request Password Reset
router.post(
    '/request-reset', resetPasswordLimiter, [
        body('email').isEmail().withMessage('A valid email is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const resetToken = crypto.randomBytes(20).toString('hex');
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();

            let transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Password Reset Request',
                text: `You requested a password reset. Please click the following link to reset your password:\n\n${resetURL}\n\nIf you did not request this, please ignore this email.`,
            };

            await transporter.sendMail(mailOptions);
            res.json({ message: 'Password reset email sent.' });
        } catch (err) {
            console.error('Request Reset Error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Reset Password
router.post(
    '/reset-password',
    [
        body('token').notEmpty().withMessage('Token is required'),
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { token, newPassword } = req.body;
        try {
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() },
            });
            if (!user) {
                return res.status(400).json({ error: 'Invalid or expired token' });
            }

            user.password = newPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            res.json({ message: 'Password has been reset.' });
        } catch (err) {
            console.error('Reset Password Error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

module.exports = router;