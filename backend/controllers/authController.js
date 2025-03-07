const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog'); // Add this import
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');

exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ error: 'Email is already in use' });
            } else {
                return res.status(400).json({ error: 'Username is already in use' });
            }
        }

        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });

        const newUser = new User({
            username,
            email,
            password,
            role: 'user',
            publicKey,
            privateKey,
        });
        await newUser.save();

        // Add logging after successful registration
        await SecurityLog.create({
            event: 'register',
            user: newUser._id,
            details: { ip: req.ip },
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { identifier, password, totpToken } = req.body; // Add totpToken
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });
        if (!user) {
            return res.status(404).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check TOTP if enabled
        if (user.isTotpEnabled && user.totpSecret) {
            if (!totpToken) {
                return res.status(401).json({ error: 'TOTP token required' });
            }
            const verified = speakeasy.totp.verify({
                secret: user.totpSecret,
                encoding: 'base32',
                token: totpToken,
                window: 1,
            });
            if (!verified) {
                return res.status(401).json({ error: 'Invalid TOTP token' });
            }
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        await SecurityLog.create({
            event: 'login',
            user: user._id,
            details: { ip: req.ip },
        });

        res.json({
            token,
            user: { _id: user._id, username: user.username, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
};