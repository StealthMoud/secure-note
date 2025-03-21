const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { getCurrentUser, sendFriendRequest, respondToFriendRequest, getFriends } = require('../controllers/userController');
const User = require('../models/User');
const { logSecurityEvent } = require('../utils/logger');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const uploadBaseDir = path.join(__dirname, '../uploads'); // Base uploads folder

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.user.id;
        const userUploadDir = path.join(uploadBaseDir, userId.toString());
        if (!fs.existsSync(userUploadDir)) {
            fs.mkdirSync(userUploadDir, { recursive: true });
        }
        cb(null, userUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) return cb(null, true);
        cb(new Error('Only JPEG/JPG/PNG images are allowed'));
    },
});


router.get('/me', authenticate, getCurrentUser);

router.put('/username', authenticate, [
    body('username').notEmpty().withMessage('Username is required').trim(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { username } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (await User.findOne({ username })) return res.status(400).json({ error: 'Username already taken' });

        user.username = username;
        await user.save();
        await logSecurityEvent({ event: 'username_updated', user: user._id, details: { ip: req.ip } });
        res.json({ message: 'Username updated successfully', user: user.toJSON() });
    } catch (err) {
        console.error('Update Username Error:', err);
        res.status(500).json({ error: 'Failed to update username' });
    }
});

router.put('/profile', authenticate, [
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('nickname').optional().trim(),
    body('birthday').optional().isISO8601().withMessage('Invalid date format'),
    body('country').optional().trim(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { firstName, lastName, nickname, birthday, country } = req.body;
        console.log('Received profile update:', { firstName, lastName, nickname, birthday, country });
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.nickname = nickname || user.nickname;
        user.birthday = birthday ? new Date(birthday) : user.birthday;
        user.country = country || user.country;

        await user.save();
        console.log('Updated user profile:', user.toJSON());
        await logSecurityEvent({ event: 'profile_updated', user: user._id, details: { ip: req.ip } });
        res.json({ message: 'Profile updated successfully', user: user.toJSON() });
    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

router.put('/personalization', authenticate, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'header', maxCount: 1 }]), [
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
    body('gender').optional().isIn(['male', 'female', 'other', 'prefer-not-to-say']).withMessage('Invalid gender'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { bio, gender } = req.body;
        const files = req.files;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.bio = bio || user.bio;
        user.gender = gender || user.gender;
        if (files?.avatar) user.avatar = `/uploads/${req.user.id}/${files.avatar[0].filename}`;
        if (files?.header) user.header = `/uploads/${req.user.id}/${files.header[0].filename}`;

        await user.save();
        await logSecurityEvent({ event: 'personalization_updated', user: user._id, details: { ip: req.ip } });
        res.json({ message: 'Personalization updated successfully', user: user.toJSON() });
    } catch (err) {
        console.error('Update Personalization Error:', err);
        res.status(500).json({ error: 'Failed to update personalization' });
    }
});

router.put('/email', authenticate, [
    body('newEmail').isEmail().withMessage('Valid email required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { newEmail } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (await User.findOne({ email: newEmail })) return res.status(400).json({ error: 'Email already in use' });

        const verificationToken = require('crypto').randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
        user.email = newEmail;
        user.verified = false;
        await user.save();

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        await transporter.sendMail({
            from: `"Secure Note" <${process.env.EMAIL_USER}>`,
            to: newEmail,
            subject: 'Verify Your New Email',
            html: `<p>Please verify your new email by clicking <a href="${verificationUrl}">here</a>.</p>`,
        });

        await logSecurityEvent({ event: 'email_change_requested', user: user._id, details: { ip: req.ip, newEmail } });
        res.json({ message: 'Verification email sent to new address' });
    } catch (err) {
        console.error('Change Email Error:', err);
        res.status(500).json({ error: 'Failed to change email' });
    }
});

router.put('/password', authenticate, [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.githubId) return res.status(400).json({ error: 'Password change not allowed for OAuth users' });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(401).json({ error: 'Current password incorrect' });

        user.password = newPassword;
        await user.save();
        await logSecurityEvent({ event: 'password_changed', user: user._id, details: { ip: req.ip } });
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Change Password Error:', err);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

router.post('/friend/request', authenticate, [
    body('target').notEmpty().withMessage('Username or email is required'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    sendFriendRequest(req, res);
});

router.post('/friend/respond', authenticate, [
    body('requestId').notEmpty().withMessage('Request ID is required'),
    body('action').isIn(['accept', 'reject']).withMessage('Action must be accept or reject'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    respondToFriendRequest(req, res);
});

router.get('/friends', authenticate, getFriends);

module.exports = router;