const User = require('../models/User');
const {logSecurityEvent} = require('../utils/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS},
});

exports.registerUser = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        const existingUser = await User.findOne({$or: [{email}, {username}]});
        if (existingUser) {
            return res.status(400).json({error: existingUser.email === email ? 'Email in use' : 'Username in use'});
        }

        const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {type: 'spki', format: 'pem'},
            privateKeyEncoding: {type: 'pkcs8', format: 'pem'},
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
            }
        });

        res.status(201).json({message: 'User registered successfully!'});
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({error: 'Registration failed'});
    }
};

exports.loginUser = async (req, res) => {
    try {
        const {identifier, password, totpToken} = req.body;
        const user = await User.findOne({$or: [{email: identifier}, {username: identifier}]});
        if (!user) return res.status(404).json({error: 'Invalid credentials'});

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({error: 'Invalid credentials'});

        if (user.isTotpEnabled && user.totpSecret) {
            if (!totpToken) return res.status(401).json({error: 'TOTP token required'});
            const verified = speakeasy.totp.verify({
                secret: user.totpSecret,
                encoding: 'base32',
                token: totpToken,
                window: 1,
            });
            if (!verified) return res.status(401).json({error: 'Invalid TOTP token'});
        }

        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1h'});

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
            }
        });

        res.json({
            token,
            user: {_id: user._id, username: user.username, email: user.email, role: user.role},
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({error: 'An unexpected error occurred during login. Please try again later.'});
    }
};

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
            }
        });

        // Redirect to frontend with token in query string
        res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
    } catch (err) {
        console.error('Google Callback Error:', err);
        res.status(500).json({ error: 'OAuth login failed' });
    }
};

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
            }
        });

        res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
    } catch (err) {
        console.error('GitHub Callback Error:', err.message);
        res.status(500).json({ error: err.message || 'OAuth login failed' });
    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({email});
        if (!user) return res.status(404).json({error: 'User not found'});

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
            }
        });

        res.json({message: 'Password reset email sent'});
    } catch (err) {
        console.error('Request Reset Error:', err);
        res.status(500).json({error: 'Server error'});
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const {token, newPassword} = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: {$gt: Date.now()},
        });
        if (!user) return res.status(400).json({error: 'Invalid or expired token'});

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
            }
        });

        res.json({message: 'Password has been reset'});
    } catch (err) {
        console.error('Reset Password Error:', err);
        res.status(500).json({error: 'Server error'});
    }
};

exports.requestVerification = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({error: 'User not found'});
        if (user.verified) return res.status(400).json({error: 'Email already verified'});
        if (user.verificationPending) return res.status(400).json({error: 'Verification already requested'});

        user.verificationPending = true; // Mark as pending
        await user.save();

        await transporter.sendMail({
            from: `"Secure Note" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Verification Request Received',
            html: `<p>Your verification request has been received. An admin will review it soon.</p>`,
        });

        res.json({message: 'Verification request sent. Awaiting admin approval.'});
    } catch (err) {
        console.error('Request Verification Error:', err);
        res.status(500).json({error: 'Failed to request verification'});
    }
};

exports.approveVerification = async (req, res) => {
    try {
        const {userId} = req.body;
        if (req.user.role !== 'admin') return res.status(403).json({error: 'Admin access required'});

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({error: 'User not found'});
        if (!user.verificationPending) return res.status(400).json({error: 'No pending verification request'});

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

        res.json({message: 'User verification approved. Email sent to user.'});
    } catch (err) {
        console.error('Approve Verification Error:', err);
        res.status(500).json({error: 'Failed to approve verification'});
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const {token} = req.query;
        const user = await User.findOne({
            verificationToken: token,
            verificationExpires: {$gt: Date.now()} // Check expiration
        });
        if (!user) return res.status(400).json({error: 'Invalid or expired verification token'});

        user.verified = true;            // Fully verify the user
        user.verificationToken = null;   // Clear token
        user.verificationExpires = null; // Clear expiration
        await user.save();

        await SecurityLog.create({event: 'email_verified', user: user._id, details: {ip: req.ip}});

        res.json({message: 'Email verified successfully'});
    } catch (err) {
        console.error('Email Verification Error:', err);
        res.status(500).json({error: 'Failed to verify email'});
    }
};

exports.getPendingUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({error: 'Admin access required'});
        const pendingUsers = await User.find({verificationPending: true}).select('username email');
        res.json(pendingUsers);
    } catch (err) {
        console.error('Get Pending Users Error:', err);
        res.status(500).json({error: 'Failed to fetch pending users'});
    }
};
