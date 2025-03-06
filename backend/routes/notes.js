const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const { encryptText, decryptText } = require('../utils/encryption');

// Apply authentication middleware to all routes.
router.use(authenticate);

// Create a Note
router.post(
    '/',
    [
        // Validate that title is not empty.
        body('title').notEmpty().withMessage('Title is required'),
        // Validate that if format is provided, it must be either 'plain' or 'markdown'
        body('format')
            .optional()
            .isIn(['plain', 'markdown', 'pdf'])
            .withMessage('Format must be either plain or markdown'),
        // Optionally, validate content if you have specific requirements:
        body('content')
            .optional()
            .isString()
            .withMessage('Content must be a string'),
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Check the user's verification status
            const user = await User.findById(req.user.id);
            const noteCount = await Note.countDocuments({ owner: req.user.id });
            if (!user.verified && noteCount >= 1) {
                return res.status(403).json({
                    error: 'Unverified users can only create one note. Please get verified to add more notes.',
                });
            }

            // Ensure that the note is associated with the authenticated user.
            const noteData = { ...req.body, owner: req.user.id };

            // If encryption is enabled and content is provided, encrypt the content
            if (noteData.encrypted && noteData.content) {
                noteData.content = encryptText(noteData.content);
            }

            const newNote = new Note(noteData);
            await newNote.save();
            res.status(201).json(newNote);
        } catch (err) {
            console.error('Error creating note:', err);
            res.status(500).json({ error: err.message });
        }
    }
);

// Get User's Notes
router.get('/', async (req, res) => {
    try {
        let notes = await Note.find({ owner: req.user.id });

        // Decrypt content for notes that are marked as encrypted
        notes = notes.map(note => {
            const noteObj = note.toObject();
            if (noteObj.encrypted && noteObj.content) {
                try {
                    noteObj.content = decryptText(noteObj.content);
                } catch (error) {
                    console.error('Error decrypting note:', error);
                    // Optionally, handle decryption failures (e.g., leave content as-is or notify the client)
                }
            }
            return noteObj;
        });

        res.json(notes);
    } catch (err) {
        console.error('Error fetching notes:', err);
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
