const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validationMiddleware');
const {
    getCurrentUser,
    sendFriendRequest,
    respondToFriendRequest,
    getFriends,
    getActiveBroadcast,
    getBroadcastFeed,
    updateUsername,
    updateProfile,
    updatePersonalization,
    updateEmail,
    updatePassword,
    deleteSelfAccount
} = require('../controllers/userController');
const {
    updateProfileValidation,
    updateUsernameValidation,
    updateEmailValidation,
    updatePasswordValidation
} = require('../validators/userValidator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// base directory for all user uploads
// base directory for all user uploads
const uploadBaseDir = path.join(__dirname, '../../uploads');

// configure multer to store files in user specific directories
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
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) return cb(null, true);
        cb(new Error('Only JPEG/JPG/PNG images are allowed'));
    },
});

// User Management Routes

router.get('/me', authenticate, getCurrentUser);

router.put('/update-username', authenticate, updateUsernameValidation, validateRequest, updateUsername);

router.put('/update-profile', authenticate, upload.single('avatar'), updateProfileValidation, validateRequest, updateProfile);

router.put('/personalization', authenticate, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'header', maxCount: 1 }]), [
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
    body('gender').optional().isIn(['male', 'female', 'other', 'prefer-not-to-say']).withMessage('Invalid gender'),
], validateRequest, updatePersonalization);

router.put('/email', authenticate, [
    body('newEmail').isEmail().withMessage('Valid email required'),
], validateRequest, updateEmail);

router.put('/password', authenticate, updatePasswordValidation, validateRequest, updatePassword);

router.delete('/me', authenticate, deleteSelfAccount);

// Friend Management Routes

router.get('/friends', authenticate, getFriends);

router.post('/friend/request', authenticate, [
    body('target').notEmpty().withMessage('Username or email is required'),
], validateRequest, sendFriendRequest);

router.post('/friend/respond', authenticate, [
    body('requestId').notEmpty().withMessage('Request ID is required'),
    body('action').isIn(['accept', 'reject']).withMessage('Action must be accept or reject'),
], validateRequest, respondToFriendRequest);

// Broadcast Routes

router.get('/broadcast', authenticate, getActiveBroadcast);
router.get('/broadcast/feed', authenticate, getBroadcastFeed);

module.exports = router;