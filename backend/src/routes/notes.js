const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const requireVerified = require('../middleware/verification');
const { validateRequest } = require('../middleware/validationMiddleware');
const {
    createNote,
    getNotes,
    updateNote,
    deleteNote,
    shareNote,
    unshareNote,
    getTrash,
    restoreNote,
    permanentlyDeleteNote
} = require('../controllers/noteController');

router.use(authenticate);

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadBaseDir = path.join(__dirname, '../uploads');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.user.id;
        const userUploadDir = path.join(uploadBaseDir, userId.toString());
        if (!fs.existsSync(userUploadDir)) fs.mkdirSync(userUploadDir, { recursive: true });
        cb(null, userUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `note-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5mb limit 
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) return cb(null, true);
        cb(new Error('Only images are allowed'));
    },
});

// Note Routes

router.get('/', getNotes);
router.post('/', upload.array('images', 5), [
    body('title').notEmpty().withMessage('Title is required'),
], validateRequest, createNote);

router.put('/:noteId', upload.array('images', 5), [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
], validateRequest, updateNote);

router.delete('/:noteId', deleteNote);

// Trash Management
router.get('/trash/all', getTrash);
router.post('/:noteId/restore', restoreNote);
router.delete('/:noteId/permanent', permanentlyDeleteNote);

// Note Sharing
router.post('/:noteId/share', [
    body('target').notEmpty().withMessage('Friend username or email is required'),
    body('permission').isIn(['viewer', 'editor']).withMessage('Permission must be either viewer or editor'),
], validateRequest, requireVerified, shareNote);

router.post('/unshare', [
    body('noteId').notEmpty().withMessage('Note ID is required'),
    body('targetUserId').notEmpty().withMessage('Target user ID is required'),
], validateRequest, unshareNote);

module.exports = router;