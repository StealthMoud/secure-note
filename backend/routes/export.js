const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Note = require('../models/Note');
const { decryptText } = require('../utils/encryption');
const PDFDocument = require('pdfkit');

router.use(authenticate);

// Export a Note
router.get(
    '/:noteId',
    [
        query('format')
            .optional()
            .isIn(['markdown', 'pdf'])
            .withMessage('Format must be "markdown" or "pdf"'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { noteId } = req.params;
        const format = req.query.format || 'markdown';

        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (format === 'pdf' && !user.verified) {
                return res.status(403).json({ error: 'Unverified users cannot export notes as PDF.' });
            }

            const note = await Note.findById(noteId)
                .populate('owner', 'username email')
                .populate('sharedWith.user', 'username email');
            if (!note) return res.status(404).json({ error: 'Note not found' });

            const isOwner = note.owner._id.toString() === req.user.id;
            const sharedEntry = note.sharedWith.find(
                entry => entry.user._id.toString() === req.user.id
            );
            if (!isOwner && !sharedEntry) {
                return res.status(403).json({ error: 'You do not have access to this note' });
            }

            let content = note.content;
            if (note.encrypted) {
                if (isOwner) {
                    content = decryptText(note.content, user.privateKey);
                } else if (sharedEntry && sharedEntry.encryptedContent) {
                    content = decryptText(sharedEntry.encryptedContent, user.privateKey);
                } else {
                    return res.status(403).json({ error: 'Unable to decrypt note content' });
                }
            }

            if (format === 'markdown') {
                res.setHeader('Content-Disposition', `attachment; filename="${note.title}.md"`);
                res.setHeader('Content-Type', 'text/markdown');
                return res.send(`# ${note.title}\n\n${content}`);
            } else if (format === 'pdf') {
                res.setHeader('Content-Disposition', `attachment; filename="${note.title}.pdf"`);
                res.setHeader('Content-Type', 'application/pdf');

                const doc = new PDFDocument();
                doc.pipe(res);
                doc.fontSize(20).text(note.title, { underline: true });
                doc.moveDown();
                doc.fontSize(12).text(content);
                doc.end();
            }
        } catch (err) {
            console.error('Error exporting note:', err);
            res.status(500).json({ error: 'Failed to export note' });
        }
    }
);

module.exports = router;