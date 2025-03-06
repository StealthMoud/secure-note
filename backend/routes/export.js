const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Note = require('../models/Note');
const PDFDocument = require('pdfkit');

// Protect all export endpoints.
router.use(authenticate);

/**
 * GET /export/:noteId
 * Query parameter: format (either "markdown" or "pdf"; defaults to markdown)
 */
router.get('/export/:noteId', async (req, res) => {
    const { noteId } = req.params;
    const format = req.query.format || 'markdown';

    try {
        // Get latest user info
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // For PDF export, require verification.
        if (format === 'pdf' && !user.verified) {
            return res.status(403).json({ error: 'Unverified users cannot export notes as PDF.' });
        }

        const note = await Note.findById(noteId);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        // Check access: the user must be the owner or have been shared the note.
        if (
            note.owner.toString() !== req.user.id &&
            !note.sharedWith.some(entry => entry.user.toString() === req.user.id)
        ) {
            return res.status(403).json({ error: 'You do not have access to this note' });
        }

        if (format === 'markdown') {
            res.setHeader('Content-Disposition', `attachment; filename="${note.title}.md"`);
            res.setHeader('Content-Type', 'text/markdown');
            return res.send(`# ${note.title}\n\n${note.content}`);
        } else if (format === 'pdf') {
            res.setHeader('Content-Disposition', `attachment; filename="${note.title}.pdf"`);
            res.setHeader('Content-Type', 'application/pdf');

            // Create a PDF document
            const doc = new PDFDocument();
            doc.pipe(res);
            doc.fontSize(20).text(note.title, { underline: true });
            doc.moveDown();
            doc.fontSize(12).text(note.content);
            doc.end();
        } else {
            return res.status(400).json({ error: 'Unsupported export format' });
        }
    } catch (err) {
        console.error('Error exporting note:', err);
        res.status(500).json({ error: 'Failed to export note' });
    }
});

module.exports = router;
