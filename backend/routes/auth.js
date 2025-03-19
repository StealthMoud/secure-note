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
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');

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

router.post('/login', [
    body('identifier').notEmpty().withMessage('Email or Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { identifier, password } = req.body;
    try {
        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });
        }

        if (user.isTotpEnabled) {
            const tempToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5m' });
            return res.json({ requires2FA: true, tempToken, user: user.toJSON() });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: user.toJSON() });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ errors: [{ msg: 'Login failed' }] });
    }
});

router.post('/verify-totp-login', [
    body('tempToken').notEmpty().withMessage('Temporary token is required'),
    body('totpCode').notEmpty().withMessage('2FA code is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { tempToken, totpCode } = req.body;
    try {
        let decoded;
        try {
            decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        } catch (jwtErr) {
            console.error('JWT verification error:', jwtErr.message);
            return res.status(401).json({ errors: [{ msg: 'Invalid or expired temporary token' }] });
        }

        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ errors: [{ msg: 'User not found' }] });
        if (!user.totpSecret) return res.status(500).json({ errors: [{ msg: 'TOTP secret not configured' }] });

        const cleanedTotpCode = totpCode.trim();
        console.log('Verifying TOTP', { userId: user._id, totpCode: cleanedTotpCode, secret: user.totpSecret });

        const verified = speakeasy.totp.verify({
            secret: user.totpSecret,
            encoding: 'base32',
            token: cleanedTotpCode,
            window: 2,
        });
        if (!verified) {
            console.log('TOTP verification failed', { secret: user.totpSecret, totpCode: cleanedTotpCode });
            return res.status(401).json({ errors: [{ msg: 'Invalid 2FA code' }] });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('TOTP verified successfully for user:', user._id);
        res.json({ token });
    } catch (err) {
        console.error('Unexpected error in 2FA verification:', err);
        res.status(500).json({ errors: [{ msg: 'Server error during 2FA verification' }] });
    }
});

router.get('/totp/setup', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ errors: [{ msg: 'User not found' }] });

        const secret = speakeasy.generateSecret({
            length: 20,
            name: `Secure Note (${user.email})`,
        });
        user.totpSecret = secret.base32;
        user.isTotpEnabled = false;
        await user.save();

        const otpauthUrl = secret.otpauth_url;
        const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);

        res.json({ message: 'TOTP setup initiated', otpauthUrl, qrCodeDataURL });
    } catch (err) {
        console.error('TOTP setup error:', err);
        res.status(500).json({ errors: [{ msg: 'Failed to setup TOTP' }] });
    }
});

router.post('/totp/verify', authenticate, [
    body('token').notEmpty().withMessage('TOTP code is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { token } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ errors: [{ msg: 'User not found' }] });
        if (!user.totpSecret) return res.status(400).json({ errors: [{ msg: 'TOTP not set up' }] });

        const verified = speakeasy.totp.verify({
            secret: user.totpSecret,
            encoding: 'base32',
            token,
            window: 2,
        });
        if (!verified) {
            console.log('TOTP verification failed during setup', { secret: user.totpSecret, token });
            return res.status(401).json({ errors: [{ msg: 'Invalid TOTP code' }] });
        }

        user.isTotpEnabled = true;
        await user.save();

        res.json({ message: '2FA enabled successfully' });
    } catch (err) {
        console.error('TOTP verify error:', err);
        res.status(500).json({ errors: [{ msg: 'Failed to verify TOTP' }] });
    }
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleCallback);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false }), githubCallback);

// Request Password Reset
router.post('/request-password-reset', resetPasswordLimiter, [
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

// Verify Email
router.post('/request-verification', authenticate, requestVerification);
router.get('/users/pending', authenticate, getPendingUsers);
router.post('/approve-verification', authenticate, approveVerification);
router.get('/verify-email', verifyEmail);

module.exports = router;