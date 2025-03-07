const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const requireVerified = require('../middleware/verification');
const Note = require('../models/Note');
const User = require('../models/User');
const { encryptText, decryptText } = require('../utils/encryption');
const SecurityLog = require('../models/SecurityLog');

router.use(authenticate);
router.use(requireVerified);

// Share a Note
router.post(
    '/share',
    [
        body('noteId').notEmpty().withMessage('Note ID is required'),
        body('recipientEmail').isEmail().withMessage('Valid recipient email is required'),
        body('permission')
            .optional()
            .isIn(['viewer', 'editor', 'admin'])
            .withMessage('Permission must be viewer, editor, or admin'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { noteId, recipientEmail, permission } = req.body;
        try {
            const note = await Note.findById(noteId);
            if (!note) return res.status(404).json({ error: 'Note not found' });

            if (note.owner.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Only the owner can share this note' });
            }

            const recipient = await User.findOne({ email: recipientEmail });
            if (!recipient) return res.status(404).json({ error: 'Recipient user not found' });

            const alreadyShared = note.sharedWith.some(
                entry => entry.user.toString() === recipient._id.toString()
            );
            if (alreadyShared) {
                return res.status(400).json({ error: 'Note is already shared with this user' });
            }

            const owner = await User.findById(req.user.id);
            if (note.encrypted && note.content) {
                const decryptedContent = decryptText(note.content, owner.privateKey);
                const recipientEncryptedContent = encryptText(decryptedContent, recipient.publicKey);
                note.sharedWith.push({
                    user: recipient._id,
                    permission: permission || 'viewer',
                    encryptedContent: recipientEncryptedContent,
                });
            } else {
                note.sharedWith.push({
                    user: recipient._id,
                    permission: permission || 'viewer',
                });
            }
            await note.save();
            await SecurityLog.create({ event: 'note_shared', user: req.user.id, details: { noteId: noteId, recipient: recipient._id } });

            const populatedNote = await Note.findById(noteId).populate('sharedWith.user', 'username email');
            res.json({ message: 'Note shared successfully', note: populatedNote });
        } catch (err) {
            console.error('Error sharing note:', err);
            res.status(500).json({ error: 'Failed to share note' });
        }
    }
);

// Update Sharing Permissions
router.put(
    '/share/:noteId/:userId',
    [
        body('permission')
            .notEmpty()
            .isIn(['viewer', 'editor', 'admin'])
            .withMessage('Permission must be viewer, editor, or admin'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { noteId, userId } = req.params;
        const { permission } = req.body;
        try {
            const note = await Note.findById(noteId);
            if (!note) return res.status(404).json({ error: 'Note not found' });

            if (note.owner.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Only the owner can update sharing permissions' });
            }

            const sharedEntry = note.sharedWith.find(
                entry => entry.user.toString() === userId
            );
            if (!sharedEntry) {
                return res.status(404).json({ error: 'Shared user not found' });
            }

            sharedEntry.permission = permission;
            await note.save();
            const populatedNote = await Note.findById(noteId).populate('sharedWith.user', 'username email');
            res.json({ message: 'Sharing permissions updated', note: populatedNote });
        } catch (err) {
            console.error('Error updating sharing permissions:', err);
            res.status(500).json({ error: 'Failed to update sharing permissions' });
        }
    }
);

// Remove a Shared User
router.delete('/share/:noteId/:userId', async (req, res) => {
    const { noteId, userId } = req.params;
    try {
        const note = await Note.findById(noteId);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        if (note.owner.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Only the owner can remove shared users' });
        }

        const initialLength = note.sharedWith.length;
        note.sharedWith = note.sharedWith.filter(
            entry => entry.user.toString() !== userId
        );
        if (note.sharedWith.length === initialLength) {
            return res.status(404).json({ error: 'Shared user not found' });
        }
        await note.save();
        const populatedNote = await Note.findById(noteId).populate('sharedWith.user', 'username email');
        res.json({ message: 'Shared user removed successfully', note: populatedNote });
    } catch (err) {
        console.error('Error removing shared user:', err);
        res.status(500).json({ error: 'Failed to remove shared user' });
    }
});

// Get Notes Shared With Me
router.get('/shared-with-me', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        let notes = await Note.find({ 'sharedWith.user': req.user.id })
            .populate('owner', 'username email')
            .populate('sharedWith.user', 'username email');

        notes = notes.map(note => {
            const noteObj = note.toObject();
            if (noteObj.encrypted) {
                const sharedEntry = noteObj.sharedWith.find(
                    entry => entry.user._id.toString() === req.user.id
                );
                if (sharedEntry && sharedEntry.encryptedContent) {
                    try {
                        noteObj.content = decryptText(sharedEntry.encryptedContent, user.privateKey);
                    } catch (error) {
                        console.error('Error decrypting shared note:', error);
                        noteObj.content = '[Encrypted content unavailable]';
                    }
                } else {
                    noteObj.content = '[Encrypted content unavailable]';
                }
            }
            return noteObj;
        });

        res.json({ message: 'Shared notes retrieved', notes });
    } catch (err) {
        console.error('Error fetching shared notes:', err);
        res.status(500).json({ error: 'Failed to fetch shared notes' });
    }
});

module.exports = router;