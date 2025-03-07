const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

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

        await SecurityLog.create({ event: 'register', user: newUser._id, details: { ip: req.ip } });

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        await transporter.sendMail({
            from: `"Secure Note" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email',
            html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
        });

        res.status(201).json({ message: 'User registered. Check your email to verify.' });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { identifier, password, totpToken } = req.body;
        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
        if (!user) return res.status(404).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        if (user.isTotpEnabled && user.totpSecret) {
            if (!totpToken) return res.status(401).json({ error: 'TOTP token required' });
            const verified = speakeasy.totp.verify({
                secret: user.totpSecret,
                encoding: 'base32',
                token: totpToken,
                window: 1,
            });
            if (!verified) return res.status(401).json({ error: 'Invalid TOTP token' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await SecurityLog.create({ event: 'login', user: user._id, details: { ip: req.ip } });

        res.json({
            token,
            user: { _id: user._id, username: user.username, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ verificationToken: token });
        if (!user) return res.status(400).json({ error: 'Invalid or expired verification token' });

        user.verified = true;
        user.verificationToken = null;
        await user.save();

        await SecurityLog.create({ event: 'email_verified', user: user._id, details: { ip: req.ip } });

        res.json({ message: 'Email verified successfully' });
    } catch (err) {
        console.error('Email Verification Error:', err);
        res.status(500).json({ error: 'Failed to verify email' });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -privateKey -totpSecret');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user, role: req.user.role });
    } catch (err) {
        console.error('Get Current User Error:', err);
        res.status(500).json({ error: 'Failed to fetch current user' });
    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await transporter.sendMail({
            from: `"Secure Note" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Password Reset Request',
            text: `Click here to reset your password:\n${resetURL}\nIf you didn’t request this, ignore this email.`,
        });

        res.json({ message: 'Password reset email sent' });
    } catch (err) {
        console.error('Request Reset Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
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

        res.json({ message: 'Password has been reset' });
    } catch (err) {
        console.error('Reset Password Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.googleCallback = async (req, res) => {
    try {
        const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await SecurityLog.create({ event: 'login_google', user: req.user._id, details: { ip: req.ip } });
        res.json({ token, user: { _id: req.user._id, username: req.user.username, email: req.user.email, role: req.user.role } });
    } catch (err) {
        console.error('Google Callback Error:', err);
        res.status(500).json({ error: 'OAuth login failed' });
    }
};

exports.githubCallback = async (req, res) => {
    try {
        const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await SecurityLog.create({ event: 'login_github', user: req.user._id, details: { ip: req.ip } });
        res.json({ token, user: { _id: req.user._id, username: req.user.username, email: req.user.email, role: req.user.role } });
    } catch (err) {
        console.error('GitHub Callback Error:', err);
        res.status(500).json({ error: 'OAuth login failed' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    getCurrentUser,
    requestPasswordReset,
    resetPassword,
    googleCallback,
    githubCallback,
};