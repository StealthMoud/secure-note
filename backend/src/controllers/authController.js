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

    // check if user already exists with same email or username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return res.status(400).json({
            error: existingUser.email === email ? 'Email in use' : 'Username in use'
        });
    }

    // generate rsa key pair for end to end encryption of notes
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');

    // create new user with generated keys and verification token
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

    logUserEvent(req, 'register', newUser._id.toString(), {
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        verified: newUser.verified,
        isTotpEnabled: newUser.isTotpEnabled,
        verificationToken: newUser.verificationToken,
        verificationExpires: newUser.verificationExpires,
    }).catch(err => console.error('Background log error:', err));

    res.status(201).json({ message: 'User registered successfully!', user: newUser.toJSON() });
});

exports.loginUser = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;
    const lowerIdentifier = identifier.toLowerCase();

    // allow case-insensitive login for both email and username
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
        // return temporary token if 2fa is enabled user must verify totp code next
        const tempToken = tokenService.generateTempToken(user);
        return res.json({ requires2FA: true, tempToken, user: user.toJSON() });
    }

    const token = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);
    tokenService.setRefreshTokenCookie(res, refreshToken);

    logUserEvent(req, 'login', user._id.toString(), {
        email: user.email,
        username: user.username,
        role: user.role,
    }).catch(err => console.error('Background log error:', err));

    res.json({ token, user: user.toJSON() });
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

    // clean up totp code by removing whitespace
    const cleanedTotpCode = totpCode.trim();

    const verified = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: cleanedTotpCode,
        window: 2, // allow 2 time windows before and after for clock drift
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
    user.isTotpEnabled = false; // not enabled until user verifies the code
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

    logUserEvent(req, 'login_google', req.user._id.toString(), {
        email: req.user.email,
        username: req.user.username,
        role: req.user.role,
    }).catch(err => console.error('Background log error:', err));

    res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
});

exports.githubCallback = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new Error('GitHub authentication failed');
    }
    const token = tokenService.generateAccessToken(req.user);

    logUserEvent(req, 'login_github', req.user._id.toString(), {
        email: req.user.email,
        username: req.user.username,
        role: req.user.role,
    }).catch(err => console.error('Background log error:', err));

    res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
});


exports.requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;
    // Case insensitive search using regex
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    if (!user) {
        // Security: Don't reveal user doesn't exist. Simulate success.
        logUserEvent(req, 'password_reset_request_failed', null, {
            email,
            reason: 'user_not_found',
        }).catch(err => console.error('Background log error:', err));
        // Return generic success to prevent email enumeration
        return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // token expires in 1 hour
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/forgot-password?token=${resetToken}`;

    // Background email and logging
    emailService.sendPasswordResetEmail(user, resetURL).catch(err => {
        console.error('Background: failed to send password reset email:', err);
    });

    logUserEvent(req, 'password_reset_request', user._id.toString(), {
        email: user.email,
        username: user.username,
        role: user.role,
    }).catch(err => console.error('Background log error:', err));

    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
});


exports.resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    // find user with valid reset token that hasnt expired
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    // Check if new password was used before (check current password and history)
    const isCurrentMatch = await user.comparePassword(newPassword);
    if (isCurrentMatch) {
        return res.status(400).json({ error: 'New password cannot be the same as the current password' });
    }

    // check against history
    if (user.passwordHistory && user.passwordHistory.length > 0) {
        for (const oldHash of user.passwordHistory) {
            const isMatch = await bcrypt.compare(newPassword, oldHash);
            if (isMatch) {
                return res.status(400).json({ error: 'Password has been used recently. Please choose a different one.' });
            }
        }
    }

    // Add current password to history before updating
    user.passwordHistory = user.passwordHistory || [];
    user.passwordHistory.push(user.password);

    // Keep only last 5 passwords
    if (user.passwordHistory.length > 5) {
        user.passwordHistory.shift();
    }

    user.password = newPassword;
    // clear reset token after successfull password reset (one-time use)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // invalidate all existing sessions
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    logUserEvent(req, 'password_reset', user._id.toString(), {
        email: user.email,
        username: user.username,
        role: user.role,
    }).catch(err => console.error('Background log error:', err));

    res.json({ message: 'Password has been reset' });
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

    // send confirmation email and log event in background to avoid blocking the response
    emailService.sendVerificationRequestEmail(user).catch(err => {
        console.error('Failed to send verification request confirmation email:', err);
    });

    logUserEvent(req, 'request_verification', user._id.toString(), {
        email: user.email,
        username: user.username,
        role: user.role,
        verified: user.verified,
        verificationPending: user.verificationPending,
    }).catch(err => {
        console.error('Failed to log request_verification event:', err);
    });

    res.json({ message: 'Verification request sent. Awaiting admin approval.' });
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
    user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // valid for 24 hours
    user.verificationPending = false;
    user.verificationRejected = false;
    await user.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    // send email and log event in background
    emailService.sendVerificationApprovalEmail(user, verificationUrl).catch(err => {
        console.error('Background: failed to send approval email:', err);
    });

    logUserEvent(req, 'approve_verification', user._id.toString(), {
        email: user.email,
        username: user.username,
        role: user.role,
        verified: user.verified,
        verificationPending: user.verificationPending,
    }).catch(err => {
        console.error('Background: failed to log approve_verification event:', err);
    });

    res.json({ message: 'User verification approved. Email sent to user.' });
});


exports.verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: 'No verification token provided' });
    }

    // Find user by verification token, regardless of expiry first
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        return res.status(400).json({ error: 'Invalid verification token.' });
    }

    // 1. Check if user is already verified - Allow this even if token is expired
    if (user.verified) {
        return res.status(200).json({ message: 'Your email has been verified. You can now safely close this application.' });
    }

    // 2. Now check if token is expired
    if (user.verificationExpires < Date.now()) {
        return res.status(400).json({ error: 'Your verification link has expired. Please request a new one from your dashboard.' });
    }

    // 3. Mark as verified and expire the token immediately
    user.verified = true;
    user.verificationPending = false;
    user.verificationExpires = Date.now(); // Expire immediately to prevent reuse
    await user.save();

    logUserEvent(req, 'email_verified', user._id.toString(), {
        email: user.email,
        username: user.username,
        role: user.role,
        verified: user.verified,
        verificationPending: user.verificationPending,
    }).catch(err => console.error('Background log error:', err));

    return res.status(200).json({ message: 'User verified successfully. You can now safely close this application.' });
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

        // keep the user but mark as not pending and rejected
        user.verificationPending = false;
        user.verificationRejected = true;
        await user.save();

        // send email and log event in background
        emailService.sendVerificationRejectionEmail(user).catch(emailError => {
            console.error('Background: failed to send rejection email:', emailError);
        });

        logUserEvent(req, 'reject_verification', user._id.toString(), {
            email: user.email,
            username: user.username,
            role: user.role,
            verified: user.verified,
            verificationPending: user.verificationPending,
        }).catch(err => {
            console.error('Background: failed to log reject_verification event:', err);
        });

        res.json({ message: 'User verification request rejected.' });
    } catch (error) {
        console.error('Reject verification error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

