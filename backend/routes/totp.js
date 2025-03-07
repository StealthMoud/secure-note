const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog'); // Add for logging

router.use(authenticate);

router.get('/setup', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.isTotpEnabled) {
            return res.status(400).json({ error: 'TOTP is already enabled' });
        }

        const secret = speakeasy.generateSecret({
            length: 20,
            name: `SecureNote (${user.email})`,
        });

        user.totpSecret = secret.base32;
        await user.save();

        await SecurityLog.create({
            event: 'totp_setup',
            user: user._id,
            details: { ip: req.ip },
        });

        const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

        res.json({
            message: 'TOTP setup initiated',
            otpauthUrl: secret.otpauth_url,
            qrCodeDataURL, // Secret omitted for security
        });
    } catch (err) {
        console.error('TOTP Setup Error:', err);
        res.status(500).json({ error: 'Failed to setup TOTP' });
    }
});

router.post(
    '/verify',
    [
        body('token')
            .notEmpty()
            .withMessage('TOTP token is required')
            .isNumeric()
            .withMessage('TOTP token must be numeric'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { token } = req.body;
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ error: 'User not found' });
            if (!user.totpSecret) {
                return res.status(400).json({ error: 'TOTP is not set up for this user' });
            }

            const verified = speakeasy.totp.verify({
                secret: user.totpSecret,
                encoding: 'base32',
                token,
                window: 1, // Allow 30s before/after
            });

            if (!verified) {
                return res.status(400).json({ error: 'Invalid TOTP token' });
            }

            user.isTotpEnabled = true;
            await user.save();

            await SecurityLog.create({
                event: 'totp_enabled',
                user: user._id,
                details: { ip: req.ip },
            });

            res.json({ message: 'TOTP has been enabled successfully' });
        } catch (err) {
            console.error('TOTP Verification Error:', err);
            res.status(500).json({ error: 'Failed to verify TOTP' });
        }
    }
);

router.post(
    '/disable',
    [
        body('token')
            .optional()
            .isNumeric()
            .withMessage('TOTP token must be numeric'),
    ],
    async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ error: 'User not found' });
            if (!user.isTotpEnabled || !user.totpSecret) {
                return res.status(400).json({ error: 'TOTP is not enabled for this user' });
            }

            if (req.body.token) {
                const verified = speakeasy.totp.verify({
                    secret: user.totpSecret,
                    encoding: 'base32',
                    token: req.body.token,
                    window: 1,
                });
                if (!verified) {
                    return res.status(400).json({ error: 'Invalid TOTP token. Unable to disable' });
                }
            }

            user.totpSecret = null;
            user.isTotpEnabled = false;
            await user.save();

            await SecurityLog.create({
                event: 'totp_disabled',
                user: user._id,
                details: { ip: req.ip },
            });

            res.json({ message: 'TOTP has been disabled successfully' });
        } catch (err) {
            console.error('TOTP Disable Error:', err);
            res.status(500).json({ error: 'Failed to disable TOTP' });
        }
    }
);

module.exports = router;