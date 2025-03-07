const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const { encryptText, decryptText } = require('../utils/encryption');
const SecurityLog = require('../models/SecurityLog');

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
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user.id);
            const noteCount = await Note.countDocuments({ owner: req.user.id });
            if (!user.verified && noteCount >= 1) {
                return res.status(403).json({
                    error: 'Unverified users can only create one note. Please get verified to add more notes.',
                });
            }

            const noteData = { ...req.body, owner: req.user.id };
            if (noteData.encrypted && noteData.content) {
                // Encrypt with the user's public key
                noteData.content = encryptText(noteData.content, user.publicKey);
            }

            const newNote = new Note(noteData);
            await newNote.save();
            await SecurityLog.create({ event: 'note_created', user: req.user.id, details: { noteId: newNote._id } });
            res.status(201).json({ message: 'Note created', note: newNote });
        } catch (err) {
            console.error('Error creating note:', err);
            res.status(500).json({ error: err.message });
        }
    }
);

// Get User's Notes
router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.user.id); // Fetch user for private key
        let notes = await Note.find({
            $or: [
                { owner: req.user.id },
                { 'sharedWith.user': req.user.id },
            ],
        })
            .populate('owner', 'username email')
            .populate('sharedWith.user', 'username email');

        notes = notes.map(note => {
            const noteObj = note.toObject();
            if (noteObj.encrypted && noteObj.content) {
                try {
                    // Decrypt with the user's private key if owner
                    if (noteObj.owner._id.toString() === req.user.id) {
                        noteObj.content = decryptText(noteObj.content, user.privateKey);
                    } else {
                        // For shared notes, use encryptedContent from sharedWith (handled in sharing.js)
                        const sharedEntry = noteObj.sharedWith.find(
                            entry => entry.user._id.toString() === req.user.id
                        );
                        if (sharedEntry && sharedEntry.encryptedContent) {
                            noteObj.content = decryptText(sharedEntry.encryptedContent, user.privateKey);
                        } else {
                            noteObj.content = '[Encrypted content unavailable]';
                        }
                    }
                } catch (error) {
                    console.error('Error decrypting note:', error);
                    noteObj.content = '[Encrypted content unavailable]';
                }
            }
            return noteObj;
        });

        res.json({ message: 'Notes retrieved', notes });
    } catch (err) {
        console.error('Error fetching notes:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;