const User = require('../models/User');
const { logSecurityEvent } = require('../utils/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Existing registerUser function
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: existingUser.email === email ? 'Email in use' : 'Username in use' });
        }

        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const newUser = new User({
            username,
            email,
            password,
            role: 'user',
            publicKey,
            privateKey,
            verificationToken,
        });
        await newUser.save();

        await logSecurityEvent({
            event: 'register',
            user: newUser._id.toString(),
            details: {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                referrer: req.headers['referer'],
                email: newUser.email,
                username: newUser.username,
                role: newUser.role,
                verified: newUser.verified,
                isActive: newUser.isActive,
                isTotpEnabled: newUser.isTotpEnabled,
                verificationToken: newUser.verificationToken,
                verificationExpires: newUser.verificationExpires,
            },
        });

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
};

exports.loginUser = async (req, res) => {
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
        await logSecurityEvent({
            event: 'login',
            user: user._id.toString(),
            details: {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                referrer: req.headers['referer'],
                email: user.email,
                username: user.username,
                role: user.role,
                verified: user.verified,
                isActive: user.isActive,
                isTotpEnabled: user.isTotpEnabled,
            },
        });

        res.json({ token, user: user.toJSON() });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ errors: [{ msg: 'Login failed' }] });
    }
};

exports.verifyTotpLogin = async (req, res) => {
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
};

// Moved totpSetup function
exports.totpSetup = async (req, res) => {
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
};

// Moved totpVerify function
exports.totpVerify = async (req, res) => {
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
};

exports.totpDisable = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { token } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ errors: [{ msg: 'User not found' }] });
        if (!user.isTotpEnabled) return res.status(400).json({ errors: [{ msg: '2FA is not enabled' }] });

        if (token) {
            const verified = speakeasy.totp.verify({
                secret: user.totpSecret,
                encoding: 'base32',
                token,
                window: 2,
            });
            if (!verified) return res.status(401).json({ errors: [{ msg: 'Invalid TOTP code' }] });
        }

        user.isTotpEnabled = false;
        user.totpSecret = null;
        await user.save();

        res.json({ message: '2FA disabled successfully' });
    } catch (err) {
        console.error('TOTP disable error:', err);
        res.status(500).json({ errors: [{ msg: 'Failed to disable TOTP' }] });
    }
};

// Existing googleCallback function
exports.googleCallback = async (req, res) => {
    try {
        const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await logSecurityEvent({
            event: 'login_google',
            user: req.user._id.toString(),
            details: {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                referrer: req.headers['referer'],
                email: req.user.email,
                username: req.user.username,
                role: req.user.role,
            },
        });

        res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
    } catch (err) {
        console.error('Google Callback Error:', err);
        res.status(500).json({ error: 'OAuth login failed' });
    }
};

// Existing githubCallback function
exports.githubCallback = async (req, res) => {
    try {
        if (!req.user) {
            throw new Error('GitHub authentication failed');
        }
        const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await logSecurityEvent({
            event: 'login_github',
            user: req.user._id.toString(),
            details: {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                referrer: req.headers['referer'],
                email: req.user.email,
                username: req.user.username,
                role: req.user.role,
            },
        });

        res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
    } catch (err) {
        console.error('GitHub Callback Error:', err.message);
        res.status(500).json({ error: err.message || 'OAuth login failed' });
    }
};

// Existing requestPasswordReset function
exports.requestPasswordReset = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetURL = `${process.env.FRONTEND_URL}/forgot-password?token=${resetToken}`;
        await transporter.sendMail({
            from: `"Secure Note" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Password Reset Request',
            text: `Click here to reset your password:\n${resetURL}\nIf you didn’t request this, ignore this email.`,
        });

        await logSecurityEvent({
            event: 'password_reset_request',
            user: user._id.toString(),
            details: {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                referrer: req.headers['referer'],
                email: user.email,
                username: user.username,
                role: user.role,
            },
        });

        res.json({ message: 'Password reset email sent' });
    } catch (err) {
        console.error('Request Reset Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Existing resetPassword function
exports.resetPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        await logSecurityEvent({
            event: 'password_reset',
            user: user._id.toString(),
            details: {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                referrer: req.headers['referer'],
                email: user.email,
                username: user.username,
                role: user.role,
            },
        });

        res.json({ message: 'Password has been reset' });
    } catch (err) {
        console.error('Reset Password Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Existing requestVerification function
exports.requestVerification = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.verified) return res.status(400).json({ error: 'Email already verified' });
        if (user.verificationPending) return res.status(400).json({ error: 'Verification already requested' });

        user.verificationPending = true;
        await user.save();

        await transporter.sendMail({
            from: `"Secure Note" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Verification Request Received',
            html: `<p>Your verification request has been received. An admin will review it soon.</p>`,
        });

        await logSecurityEvent({
            event: 'request_verification',
            user: user._id.toString(),
            details: {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                referrer: req.headers['referer'],
                email: user.email,
                username: user.username,
                role: user.role,
                verified: user.verified,
                verificationPending: user.verificationPending,
            },
        });

        res.json({ message: 'Verification request sent. Awaiting admin approval.' });
    } catch (err) {
        console.error('Request Verification Error:', err);
        res.status(500).json({ error: 'Failed to request verification' });
    }
};

// Existing getPendingUsers function
exports.getPendingUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
        const pendingUsers = await User.find({ verificationPending: true }).select('username email');
        res.json(pendingUsers);
    } catch (err) {
        console.error('Get Pending Users Error:', err);
        res.status(500).json({ error: 'Failed to fetch pending users' });
    }
};

exports.approveVerification = async (req, res) => {
    try {
        const { userId } = req.body;
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!user.verificationPending) return res.status(400).json({ error: 'No pending verification request' });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        user.verificationPending = false; // Clear pending
        await user.save();

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        await transporter.sendMail({
            from: `"Secure Note" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Email Verification Approved',
            html: `<p>An admin has approved your request. Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
        });

        await logSecurityEvent({
            event: 'approve_verification',
            user: user._id.toString(),
            details: {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                referrer: req.headers['referer'],
                email: user.email,
                username: user.username,
                role: user.role,
                verified: user.verified,
                verificationPending: user.verificationPending,
            },
        });

        res.json({ message: 'User verification approved. Email sent to user.' });
    } catch (err) {
        console.error('Approve Verification Error:', err);
        res.status(500).json({ error: 'Failed to approve verification' });
    }
};


exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            console.log('No token provided in verifyEmail request');
            return res.status(400).json({ error: 'No verification token provided' });
        }

        console.log('Verifying email with token:', token);
        const user = await User.findOne({
            verificationToken: token,
            verificationExpires: { $gt: Date.now() },
        });

        if (!user) {
            // Check if user is already verified
            const verifiedUser = await User.findOne({
                verificationToken: null,
                verified: true,
                email: { $exists: true }, // Ensure user has an email
            });
            if (verifiedUser) {
                console.log('User already verified:', verifiedUser.email);
                return res.status(200).json({ message: 'Email successfully verified, close this page.' });
            }
            console.log('No user found for token:', token);
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        console.log('User found for verification:', user.email);
        user.verified = true;
        user.verificationToken = null;
        user.verificationExpires = null;
        await user.save();

        await logSecurityEvent({
            event: 'email_verified',
            user: user._id.toString(),
            details: {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                referrer: req.headers['referer'],
                email: user.email,
                username: user.username,
                role: user.role,
                verified: user.verified,
                verificationPending: user.verificationPending,
            },
        });

        console.log('Email verified successfully for user:', user.email);
        return res.status(200).json({ message: 'Email verified successfully' });
    } catch (err) {
        console.error('Email Verification Error:', err);
        return res.status(500).json({ error: 'Failed to verify email' });
    }
};

exports.rejectVerification = async (req, res) => {
    try {
        const { userId } = req.body;
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!user.verificationPending) {
            return res.status(400).json({ error: 'No pending verification request' });
        }

        user.verificationPending = false;
        await user.save();

        await transporter.sendMail({
            from: `"Secure Note" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Email Verification Request Rejected',
            html: `<p>Your email verification request was rejected by an admin. Please contact support for further assistance.</p>`,
        });

        await logSecurityEvent({
            event: 'reject_verification',
            user: user._id.toString(),
            details: {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                referrer: req.headers['referer'],
                email: user.email,
                username: user.username,
                role: user.role,
                verified: user.verified,
                verificationPending: user.verificationPending,
            },
        });

        res.json({ message: 'User verification request rejected. Email sent to user.' });
    } catch (err) {
        console.error('Reject Verification Error:', err);
        res.status(500).json({ error: 'Failed to reject verification' });
    }
};

