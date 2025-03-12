const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
    registerUser,
    loginUser,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    googleCallback,
    githubCallback,
    requestVerification,
    approveVerification,
    getPendingUsers,
} = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const passport = require('passport');

const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many password reset requests, please try again later',
});


router.post('/register', [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) throw new Error('Passwords do not match');
        return true;
    }),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    registerUser(req, res);
});

// Login
router.post('/login', [
    body('identifier').notEmpty().withMessage('Identifier is required'),
    body('password').notEmpty().withMessage('Password is required'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    loginUser(req, res);
});

// Verify Email
router.get('/verify-email', verifyEmail);

// Request Password Reset
router.post('/request-reset', resetPasswordLimiter, [
    body('email').isEmail().withMessage('A valid email is required'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    requestPasswordReset(req, res);
});

// Reset Password
router.post('/reset-password', [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    resetPassword(req, res);
});

router.post('/request-verification', authenticate, requestVerification);
router.post('/approve-verification', authenticate, approveVerification);
router.get('/users/pending', authenticate, getPendingUsers);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleCallback);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false }), githubCallback);

module.exports = router;