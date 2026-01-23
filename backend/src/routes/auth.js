const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validationMiddleware');
const {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
} = require('../validators/authValidator');
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
    refreshToken,
} = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const passport = require('passport');

// limit password reset requests to prevent abuse
const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, // standard threshold
    message: 'Too many password reset requests, please try again later',
});

// rate limit login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, // standard threshold
    message: 'Too many login attempts, please try again after 15 minutes',
    skipSuccessfulRequests: true, // don't count successful logins
});

// Authentication Routes

// 1. Basic Auth
router.post('/register', registerValidation, validateRequest, registerUser);
router.post('/login', loginLimiter, loginValidation, validateRequest, loginUser);
router.post('/refresh', refreshToken);

// 2. 2FA / TOTP
router.post('/verify-totp-login', [
    body('tempToken').notEmpty().withMessage('Temporary token is required'),
    body('totpCode').notEmpty().withMessage('2FA code is required'),
], validateRequest, verifyTotpLogin);

router.get('/totp/setup', authenticate, totpSetup);

router.post('/totp/verify', authenticate, [
    body('token').notEmpty().withMessage('TOTP code is required'),
], validateRequest, totpVerify);

router.post('/totp/disable', authenticate, [
    body('token').optional().notEmpty().withMessage('TOTP code is required if provided'),
], validateRequest, totpDisable);

// 3. OAuth (Google & GitHub)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleCallback);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false }), githubCallback);

// 4. Password Recovery
router.post('/forgot-password', resetPasswordLimiter, forgotPasswordValidation, validateRequest, requestPasswordReset);
router.post('/reset-password', resetPasswordValidation, validateRequest, resetPassword);

// 5. Email Verification & User Management
router.post('/request-verification', authenticate, requestVerification);
router.get('/users/pending', authenticate, getPendingUsers);
router.post('/approve-verification', authenticate, approveVerification);

router.post('/reject-verification', authenticate, [
    body('userId').notEmpty().withMessage('User ID is required'),
], validateRequest, rejectVerification);

router.get('/verify-email', verifyEmail);

module.exports = router;