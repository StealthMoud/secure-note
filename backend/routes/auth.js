const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
    registerUser,
    loginUser,
    verifyTotpLogin,
    totpSetup,
    totpVerify,
    totpDisable,
    googleCallback,
    githubCallback,
    requestPasswordReset,
    resetPassword,
    requestVerification,
    approveVerification,
    getPendingUsers,
    verifyEmail,
    rejectVerification,
} = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const passport = require('passport');

const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many password reset requests, please try again later',
});

// Register
router.post('/register', [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) throw new Error('Passwords do not match');
        return true;
    }),
], registerUser);

// Login
router.post('/login', [
    body('identifier').notEmpty().withMessage('Email or Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
], loginUser);

// Verify TOTP Login
router.post('/verify-totp-login', [
    body('tempToken').notEmpty().withMessage('Temporary token is required'),
    body('totpCode').notEmpty().withMessage('2FA code is required'),
], verifyTotpLogin);

// TOTP Setup
router.get('/totp/setup', authenticate, totpSetup);

// TOTP Verify
router.post('/totp/verify', authenticate, [
    body('token').notEmpty().withMessage('TOTP code is required'),
], totpVerify);

// TOTP Disable
router.post('/totp/disable', authenticate, [
    body('token').optional().notEmpty().withMessage('TOTP code is required if provided'),
], totpDisable);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleCallback);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false }), githubCallback);

// Request Password Reset
router.post('/request-password-reset', resetPasswordLimiter, [
    body('email').isEmail().withMessage('A valid email is required'),
], requestPasswordReset);

// Reset Password
router.post('/reset-password', [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], resetPassword);

// Verification Routes
router.post('/request-verification', authenticate, requestVerification);
router.get('/users/pending', authenticate, getPendingUsers);
router.post('/approve-verification', authenticate, approveVerification);
router.post('/reject-verification', authenticate, [
    body('userId').notEmpty().withMessage('User ID is required'),
], rejectVerification);
router.get('/verify-email', verifyEmail);

module.exports = router;