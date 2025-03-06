const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const requireVerified = require('../middleware/verification');
const Note = require('../models/Note');
const User = require('../models/User');

// Protect all endpoints with authentication.
router.use(authenticate);
router.use(requireVerified);

/**
 * 1. Share a Note
 * POST /share
 * Body: { noteId, recipientEmail, permission }
 */
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
            // Find note by ID.
            const note = await Note.findById(noteId);
            if (!note) return res.status(404).json({ error: 'Note not found' });

            // Only the owner can share the note.
            if (note.owner.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Only the owner can share this note' });
            }

            // Find the recipient by email.
            const recipient = await User.findOne({ email: recipientEmail });
            if (!recipient) return res.status(404).json({ error: 'Recipient user not found' });

            // Ensure the note isn’t already shared with this user.
            const alreadyShared = note.sharedWith.some(
                entry => entry.user.toString() === recipient._id.toString()
            );
            if (alreadyShared) {
                return res.status(400).json({ error: 'Note is already shared with this user' });
            }

            // Add the recipient to the sharedWith array.
            note.sharedWith.push({
                user: recipient._id,
                permission: permission || 'viewer',
            });
            await note.save();

            res.json({ message: 'Note shared successfully', note });
        } catch (err) {
            console.error('Error sharing note:', err);
            res.status(500).json({ error: 'Failed to share note' });
        }
    }
);

/**
 * 2. Update Sharing Permissions
 * PUT /share/:noteId/:userId
 * Body: { permission }
 */
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

            // Only the owner can update sharing permissions.
            if (note.owner.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Only the owner can update sharing permissions' });
            }

            // Find the shared entry.
            const sharedEntry = note.sharedWith.find(
                entry => entry.user.toString() === userId
            );
            if (!sharedEntry) {
                return res.status(404).json({ error: 'Shared user not found' });
            }

            sharedEntry.permission = permission;
            await note.save();
            res.json({ message: 'Sharing permissions updated', note });
        } catch (err) {
            console.error('Error updating sharing permissions:', err);
            res.status(500).json({ error: 'Failed to update sharing permissions' });
        }
    }
);

/**
 * 3. Remove a Shared User
 * DELETE /share/:noteId/:userId
 */
router.delete('/share/:noteId/:userId', async (req, res) => {
    const { noteId, userId } = req.params;
    try {
        const note = await Note.findById(noteId);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        // Only the owner can remove shared users.
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
        res.json({ message: 'Shared user removed successfully', note });
    } catch (err) {
        console.error('Error removing shared user:', err);
        res.status(500).json({ error: 'Failed to remove shared user' });
    }
});

/**
 * 4. Get Notes Shared With Me
 * GET /shared-with-me
 */
router.get('/shared-with-me', async (req, res) => {
    try {
        // Find notes where the authenticated user's ID is in the sharedWith array.
        const notes = await Note.find({ 'sharedWith.user': req.user.id });
        res.json(notes);
    } catch (err) {
        console.error('Error fetching shared notes:', err);
        res.status(500).json({ error: 'Failed to fetch shared notes' });
    }
});

module.exports = router;
