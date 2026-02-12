const User = require('../models/User');
const { logUserEvent } = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');
const tokenService = require('../services/auth/tokenService');
const emailService = require('../services/shared/emailService');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');


exports.registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // stop duplicates. check both mail and name.
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return res.status(400).json({
            error: existingUser.email === email ? 'Email in use' : 'Username in use'
        });
    }

    const { promisify } = require('util');
    const generateKeyPair = promisify(crypto.generateKeyPair);

    // make rsa keys so notes are encrypted properly
    const { publicKey, privateKey } = await generateKeyPair('rsa', {
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

    res.status(201).json({ message: 'User registered successfully!', user: newUser.toJSON() });

    logUserEvent(req, 'register', newUser._id.toString(), {
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        verified: newUser.verified,
        isTotpEnabled: newUser.isTotpEnabled,
        verificationToken: newUser.verificationToken,
        verificationExpires: newUser.verificationExpires,
    }).catch(err => console.error('background log error:', err));
});

exports.loginUser = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;
    const lowerIdentifier = identifier.toLowerCase();

    // let them login with name or mail, dont care about case
    const user = await User.findOne({
        $or: [
            { email: lowerIdentifier },
            { username: { $regex: new RegExp(`^${identifier}$`, 'i') } }
        ]
    });

    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    if (user.isTotpEnabled) {
        // if 2fa is on, we give a temp token and wait for the code
        const tempToken = tokenService.generateTempToken(user);
        return res.json({ requires2FA: true, tempToken, user: user.toJSON() });
    }

    const token = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);
    tokenService.setRefreshTokenCookie(res, refreshToken);

    res.json({ token, user: user.toJSON() });

    logUserEvent(req, 'login', user._id.toString(), {
        email: user.email,
        username: user.username,
        role: user.role,
    }).catch(err => console.error('background log error:', err));
});

exports.verifyTotpLogin = asyncHandler(async (req, res) => {
    const { tempToken, totpCode } = req.body;

    let decoded;
    try {
        decoded = tokenService.verifyToken(tempToken);
    } catch (jwtErr) {
        console.error('JWT verification error:', jwtErr.message);
        return res.status(401).json({ errors: [{ msg: 'Invalid or expired temporary token' }] });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ errors: [{ msg: 'User not found' }] });
    if (!user.totpSecret) return res.status(500).json({ errors: [{ msg: 'TOTP secret not configured' }] });

    const cleanedTotpCode = totpCode.trim();

    const verified = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: cleanedTotpCode,
        window: 2, // bit of wiggle room for clock drift
    });

    if (!verified) {
        return res.status(401).json({ errors: [{ msg: 'Invalid 2FA code' }] });
    }

    const token = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);
    tokenService.setRefreshTokenCookie(res, refreshToken);

    res.json({ token });
});

exports.refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token provided' });

    const decoded = tokenService.verifyToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const newToken = tokenService.generateAccessToken(user);
    res.json({ token: newToken });
});


exports.totpSetup = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ errors: [{ msg: 'User not found' }] });

    const secret = speakeasy.generateSecret({
        length: 20,
        name: `Secure Note (${user.email})`,
    });
    user.totpSecret = secret.base32;
    user.isTotpEnabled = false; // dont turn it on until they prove it works
    await user.save();

    const otpauthUrl = secret.otpauth_url;
    const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);

    res.json({ message: 'TOTP setup initiated', otpauthUrl, qrCodeDataURL });
});

exports.totpVerify = asyncHandler(async (req, res) => {
    const { token } = req.body;
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
        return res.status(401).json({ errors: [{ msg: 'Invalid TOTP code' }] });
    }

    user.isTotpEnabled = true;
    await user.save();

    res.json({ message: '2FA enabled successfully' });
});

exports.totpDisable = asyncHandler(async (req, res) => {
    const { token } = req.body;
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
});


exports.googleCallback = asyncHandler(async (req, res) => {
    const token = tokenService.generateAccessToken(req.user);

    res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);

    logUserEvent(req, 'login_google', req.user._id.toString(), {
        email: req.user.email,
        username: req.user.username,
        role: req.user.role,
    }).catch(err => console.error('background log error:', err));
});

exports.githubCallback = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new Error('GitHub authentication failed');
    }
    const token = tokenService.generateAccessToken(req.user);

    res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);

    logUserEvent(req, 'login_github', req.user._id.toString(), {
        email: req.user.email,
        username: req.user.username,
        role: req.user.role,
    }).catch(err => console.error('background log error:', err));
});


exports.requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    if (!user) {
        // fake success so hackers dont know who has an account
        logUserEvent(req, 'password_reset_request_failed', null, {
            email,
            reason: 'user_not_found',
        }).catch(err => console.error('background log error:', err));
        return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // link lasts an hour
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/forgot-password?token=${resetToken}`;

    // send mail in background
    emailService.sendPasswordResetEmail(user, resetURL).catch(err => {
        console.error('background: failed to send password reset email:', err);
    });

    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    logUserEvent(req, 'password_reset_request', user._id.toString(), {
        username: user.username,
        role: user.role,
    }).catch(err => console.error('background log error:', err));
});


exports.resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    // find user with valid token that hasn't expired yet
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    // cant use the same password as you have now
    const isCurrentMatch = await user.comparePassword(newPassword);
    if (isCurrentMatch) {
        return res.status(400).json({ error: 'New password cannot be the same as the current password' });
    }

    // check against the old hashes we saved
    if (user.passwordHistory && user.passwordHistory.length > 0) {
        for (const oldHash of user.passwordHistory) {
            const isMatch = await bcrypt.compare(newPassword, oldHash);
            if (isMatch) {
                return res.status(400).json({ error: 'Password has been used recently. Please choose a different one.' });
            }
        }
    }

    // save current password to history for next time
    user.passwordHistory = user.passwordHistory || [];
    user.passwordHistory.push(user.password);

    // only keep the last 5
    if (user.passwordHistory.length > 5) {
        user.passwordHistory.shift();
    }

    user.password = newPassword;
    // kill the reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // bump version to log everyone out
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    res.json({ message: 'Password has been reset' });

    logUserEvent(req, 'password_reset', user._id.toString(), {
        email: user.email,
        username: user.username,
        role: user.role,
    }).catch(err => console.error('background log error:', err));
});

exports.requestVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.verified) return res.status(400).json({ error: 'Email already verified' });
    if (user.verificationPending) {
        return res.status(200).json({ message: 'Verification request is already pending. An admin will review it soon.' });
    }

    user.verificationPending = true;
    user.verificationRejected = false;
    await user.save();

    // tell user we got the request
    emailService.sendVerificationRequestEmail(user).catch(err => {
        console.error('failed to send verification request confirmation email:', err);
    });

    res.json({ message: 'Verification request sent. Awaiting admin approval.' });

    logUserEvent(req, 'request_verification', user._id.toString(), {
        email: user.email,
        username: user.username,
        role: user.role,
        verified: user.verified,
        verificationPending: user.verificationPending,
    }).catch(err => {
        console.error('failed to log request_verification event:', err);
    });
});


exports.getPendingUsers = asyncHandler(async (req, res) => {
    if (!['admin', 'superadmin'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    const pendingUsers = await User.find({ verificationPending: true }).select('username email');
    res.json(pendingUsers);
});

exports.approveVerification = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!['admin', 'superadmin'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.verificationPending) {
        return res.status(200).json({ message: 'Verification request already processed' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // good for 24h
    user.verificationPending = false;
    user.verificationRejected = false;
    await user.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    // fire off the mail in the background
    emailService.sendVerificationApprovalEmail(user, verificationUrl).catch(err => {
        console.error('background: failed to send approval email:', err);
    });

    res.json({ message: 'User verification approved. Email sent to user.' });

    logUserEvent(req, 'approve_verification', user._id.toString(), {
        email: user.email,
        username: user.username,
        role: user.role,
        verified: user.verified,
        verificationPending: user.verificationPending,
    }).catch(err => {
        console.error('background: failed to log approve_verification event:', err);
    });
});


exports.verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: 'No verification token provided' });
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        return res.status(400).json({ error: 'Invalid verification token.' });
    }

    // if already verified, just tell them it is fine. 
    if (user.verified) {
        return res.status(200).json({ message: 'Your email has been verified. You can now safely close this application.' });
    }

    // check expiry
    if (user.verificationExpires < Date.now()) {
        return res.status(400).json({ error: 'Your verification link has expired. Please request a new one from your dashboard.' });
    }

    // all good. mark as verified.
    user.verified = true;
    user.verificationPending = false;
    user.verificationExpires = Date.now(); // kill it so it cant be used again
    await user.save();

    res.status(200).json({ message: 'User verified successfully. You can now safely close this application.' });

    logUserEvent(req, 'email_verified', user._id.toString(), {
        email: user.email,
        username: user.username,
        role: user.role,
        verified: user.verified,
        verificationPending: user.verificationPending,
    }).catch(err => console.error('background log error:', err));
});

exports.rejectVerification = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.body;
        if (!['admin', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!user.verificationPending) {
            return res.status(200).json({ message: 'Verification request already processed' });
        }

        user.verificationPending = false;
        user.verificationRejected = true;
        await user.save();

        emailService.sendVerificationRejectionEmail(user).catch(emailError => {
            console.error('background: failed to send rejection email:', emailError);
        });

        res.json({ message: 'User verification request rejected.' });

        logUserEvent(req, 'reject_verification', user._id.toString(), {
            email: user.email,
            username: user.username,
            role: user.role,
            verified: user.verified,
            verificationPending: user.verificationPending,
        }).catch(err => {
            console.error('background: failed to log reject_verification event:', err);
        });
    } catch (error) {
        console.error('reject verification error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

