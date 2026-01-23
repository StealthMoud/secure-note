const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Note = require('../models/Note');
const { decryptText, decryptSymmetric } = require('../utils/encryption');
const PDFDocument = require('pdfkit');

router.use(authenticate);

router.get(
    '/:noteId',
    [
        query('format')
            .optional()
            .isIn(['plain', 'markdown', 'pdf'])
            .withMessage('Format must be "plain", "markdown", or "pdf"'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { noteId } = req.params;
        const format = req.query.format || 'plain';
        const user = await User.findById(req.user.id);

        // unverified users can only export plain text formt
        if (!user.verified && (format === 'markdown' || format === 'pdf')) {
            return res.status(403).json({ error: 'Unverified users can only export plain text' });
        }

        try {
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

            // decrypt content based on ownership or shared access
            let content = note.content;
            let title = note.title;
            if (note.encrypted) {
                try {
                    let symmetricKey;
                    if (isOwner) {
                        if (!note.ownerEncryptedKey || !note.encryptedData) {
                            throw new Error('Encrypted note is missing key or data');
                        }
                        symmetricKey = decryptText(note.ownerEncryptedKey, user.privateKey);
                    } else if (sharedEntry) {
                        if (!sharedEntry.encryptedKey || !note.encryptedData) {
                            throw new Error('Shared encrypted note is missing key or data');
                        }
                        symmetricKey = decryptText(sharedEntry.encryptedKey, user.privateKey);
                    }

                    if (symmetricKey) {
                        const decryptedDataJSON = decryptSymmetric(note.encryptedData, symmetricKey);
                        const decryptedData = JSON.parse(decryptedDataJSON);
                        title = decryptedData.title;
                        content = decryptedData.content;
                    } else {
                        return res.status(403).json({ error: 'Unable to decrypt note content' });
                    }
                } catch (error) {
                    console.error('Decryption failed during export:', error);
                    return res.status(500).json({ error: 'Decryption failed during export' });
                }
            }

            if (format === 'plain') {
                res.setHeader('Content-Disposition', `attachment; filename="${title}.txt"`);
                res.setHeader('Content-Type', 'text/plain');
                return res.send(content);
            } else if (format === 'markdown') {
                res.setHeader('Content-Disposition', `attachment; filename="${title}.md"`);
                res.setHeader('Content-Type', 'text/markdown');
                return res.send(`# ${title}\n\n${content}`);
            } else if (format === 'pdf') {
                res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);
                res.setHeader('Content-Type', 'application/pdf');
                const doc = new PDFDocument();
                doc.pipe(res);
                doc.fontSize(20).text(title, { underline: true });
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