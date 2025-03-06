const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');

// All endpoints require the user to be authenticated.
router.use(authenticate);

/**
 * GET /totp/setup
 * Generates a TOTP secret for the authenticated user and returns a QR code data URL.
 * The secret is stored (in base32 format) in the user's record for later verification.
 */
router.get('/setup', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.isTotpEnabled) {
            return res.status(400).json({ error: 'TOTP is already enabled.' });
        }

        // Generate a secret with a name (helpful for authenticator apps)
        const secret = speakeasy.generateSecret({
            length: 20,
            name: `SecureNote (${user.email})`
        });

        // Save the secret temporarily to the user's record (not enabled until verified)
        user.totpSecret = secret.base32;
        await user.save();

        // Generate a QR code to make it easier for the user to add the TOTP to an authenticator app.
        const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

        res.json({
            message: 'TOTP setup initiated.',
            secret: secret.base32,  // Optionally, you might not send this to the client.
            otpauthUrl: secret.otpauth_url,
            qrCodeDataURL
        });
    } catch (err) {
        console.error('TOTP Setup Error:', err);
        res.status(500).json({ error: 'Failed to setup TOTP.' });
    }
});

/**
 * POST /totp/verify
 * Verifies a TOTP token provided by the user. If valid, marks TOTP as enabled.
 * Expects a JSON body with a "token" field.
 */
router.post(
    '/verify',
    [
        body('token')
            .notEmpty()
            .withMessage('TOTP token is required')
            .isNumeric()
            .withMessage('TOTP token must be numeric')
    ],
    async (req, res) => {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { token } = req.body;
            const user = await User.findById(req.user.id);
            if (!user || !user.totpSecret) {
                return res.status(400).json({ error: 'TOTP is not setup for this user.' });
            }

            // Verify the token using the stored secret
            const verified = speakeasy.totp.verify({
                secret: user.totpSecret,
                encoding: 'base32',
                token
            });

            if (!verified) {
                return res.status(400).json({ error: 'Invalid TOTP token.' });
            }

            // Mark TOTP as enabled and save the user record
            user.isTotpEnabled = true;
            await user.save();

            res.json({ message: 'TOTP has been enabled successfully.' });
        } catch (err) {
            console.error('TOTP Verification Error:', err);
            res.status(500).json({ error: 'Failed to verify TOTP.' });
        }
    }
);

/**
 * POST /totp/disable
 * Disables TOTP for the user.
 * Optionally, requires a valid TOTP token to disable.
 * Expects an optional JSON body with a "token" field.
 */
router.post(
    '/disable',
    [
        // Token is optional but if provided, must be numeric.
        body('token')
            .optional()
            .isNumeric()
            .withMessage('TOTP token must be numeric')
    ],
    async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user || !user.isTotpEnabled || !user.totpSecret) {
                return res.status(400).json({ error: 'TOTP is not enabled for this user.' });
            }

            // Optionally verify the token before disabling for extra security.
            if (req.body.token) {
                const verified = speakeasy.totp.verify({
                    secret: user.totpSecret,
                    encoding: 'base32',
                    token: req.body.token
                });
                if (!verified) {
                    return res.status(400).json({ error: 'Invalid TOTP token. Unable to disable.' });
                }
            }

            // Clear the TOTP settings
            user.totpSecret = null;
            user.isTotpEnabled = false;
            await user.save();

            res.json({ message: 'TOTP has been disabled successfully.' });
        } catch (err) {
            console.error('TOTP Disable Error:', err);
            res.status(500).json({ error: 'Failed to disable TOTP.' });
        }
    }
);

module.exports = router;
