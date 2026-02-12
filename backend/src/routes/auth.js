const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validationMiddleware');
const {
    authLimiter,
    resetPasswordLimiter
} = require('../middleware/rateLimiter');
const {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    verifyTotpValidation,
    totpVerifyValidation,
    totpDisableValidation,
    rejectVerificationValidation
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
const passport = require('passport');

// Authentication Routes

// 1. Basic Auth
router.post('/register', registerValidation, validateRequest, registerUser);
router.post('/login', authLimiter, loginValidation, validateRequest, loginUser);
router.post('/refresh', refreshToken);

// 2. 2FA / TOTP
router.post('/verify-totp-login', verifyTotpValidation, validateRequest, verifyTotpLogin);

router.get('/totp/setup', authenticate, totpSetup);

router.post('/totp/verify', authenticate, totpVerifyValidation, validateRequest, totpVerify);

router.post('/totp/disable', authenticate, totpDisableValidation, validateRequest, totpDisable);

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

router.post('/reject-verification', authenticate, rejectVerificationValidation, validateRequest, rejectVerification);

router.get('/verify-email', verifyEmail);

module.exports = router;