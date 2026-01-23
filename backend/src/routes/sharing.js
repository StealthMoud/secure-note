const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const requireVerified = require('../middleware/verification');
const { shareNote, unshareNote, getNotes } = require('../controllers/noteController');
const Note = require('../models/Note');

// all sharing routes requir authentcation and email verificaton
router.use(authenticate);
router.use(requireVerified);

router.post(
    '/share',
    [
        body('noteId').notEmpty().withMessage('Note ID is required'),
        body('recipientEmail').isEmail().withMessage('Valid recipient email is required'),
        body('permission')
            .optional()
            .isIn(['viewer', 'editor'])
            .withMessage('Permission must be viewer or editor'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { noteId, recipientEmail, permission } = req.body;
        // map recipientEmail to target for shareNote controller
        req.body.target = recipientEmail;
        req.params.noteId = noteId;
        return shareNote(req, res);
    }
);

// Update Sharing Permissions
router.put(
    '/share/:noteId/:userId',
    [
        body('permission')
            .notEmpty()
            .isIn(['viewer', 'editor'])
            .withMessage('Permission must be viewer or editor'),
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
    req.body.noteId = req.params.noteId;
    req.body.targetUserId = req.params.userId;
    return unshareNote(req, res);
});

// Get Notes Shared With Me
router.get('/shared-with-me', async (req, res) => {
    return getNotes(req, res);
});

module.exports = router;