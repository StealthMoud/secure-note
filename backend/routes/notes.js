const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { createNote, getNotes, updateNote, deleteNote } = require('../controllers/noteController');

router.use(authenticate);

// Create a Note
router.post(
    '/',
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('format')
            .optional()
            .isIn(['plain', 'markdown'])
            .withMessage('Format must be either plain or markdown'),
        body('content')
            .optional()
            .isString()
            .withMessage('Content must be a string'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        createNote(req, res);
    }
);

// Get User's Notes
router.get('/', getNotes);

// Update a Note
router.put(
    '/:noteId',
    [
        body('title').optional().notEmpty().withMessage('Title cannot be empty'),
        body('content').optional().isString().withMessage('Content must be a string'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        updateNote(req, res);
    }
);

// Delete a Note
router.delete('/:noteId', deleteNote);

// Share a Note
router.post(
    '/:noteId/share',
    [
        body('userId').notEmpty().withMessage('User ID is required'),
        body('permission')
            .isIn(['viewer', 'editor'])
            .withMessage('Permission must be either viewer or editor'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        shareNote(req, res);
    }
);

module.exports = router;