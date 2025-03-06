const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Endpoint: Request Password Reset
// POST /api/auth/request-reset
router.post(
    '/request-reset',
    [
        body('email').isEmail().withMessage('A valid email is required'),
    ],
    async (req, res) => {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Generate a reset token and set expiration (e.g., 1 hour)
            const resetToken = crypto.randomBytes(20).toString('hex');
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            await user.save();

            // Configure the transporter (ensure you set EMAIL_HOST, EMAIL_PORT, etc. in .env)
            let transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST, // e.g., 'smtp.gmail.com'
                port: process.env.EMAIL_PORT, // e.g., 587
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            // Construct reset URL (adjust the frontend URL as needed)
            const resetURL = `http://your-frontend-url/reset-password?token=${resetToken}`;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Password Reset Request',
                text: `You requested a password reset. Please click the following link to reset your password:\n\n${resetURL}\n\nIf you did not request this, please ignore this email.`
            };

            await transporter.sendMail(mailOptions);
            res.json({ message: 'Password reset email sent.' });
        } catch (err) {
            console.error('Request Reset Error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Endpoint: Reset Password
// POST /api/auth/reset-password
router.post(
    '/reset-password',
    [
        body('token').notEmpty().withMessage('Token is required'),
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
    ],
    async (req, res) => {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { token, newPassword } = req.body;
        try {
            // Find the user with the matching reset token and ensure it hasn't expired
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });
            if (!user) {
                return res.status(400).json({ error: 'Invalid or expired token' });
            }

            // Update the user's password. The pre-save hook on the User model will hash it.
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
