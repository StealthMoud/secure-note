const Note = require('../models/Note');
const User = require('../models/User');
const { logSecurityEvent } = require('../utils/logger');
const { encryptText, decryptText } = require('../utils/encryption');

exports.createNote = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const noteCount = await Note.countDocuments({ owner: req.user.id });
        if (!user.verified && noteCount >= 1) {
            return res.status(403).json({ error: 'Unverified users can only create one note' });
        }

        const { title, content, format } = req.body;
        if (!user.verified && format !== 'plain') {
            return res.status(403).json({ error: 'Unverified users can only create plain text notes' });
        }

        const noteData = {
            title,
            content, // Store unencrypted
            format: format || 'plain',
            encrypted: false, // Default to unencrypted
            owner: req.user.id
        };
        const newNote = new Note(noteData);
        await newNote.save();

        await logSecurityEvent({
            event: 'note_created',
            user: req.user.id,
            details: { noteId: newNote._id, format }
        });

        res.status(201).json({ message: 'Note created', note: newNote });
    } catch (err) {
        console.error('Error creating note:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getNotes = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        let notes = await Note.find({
            $or: [{ owner: req.user.id }, { 'sharedWith.user': req.user.id }],
        })
            .populate('owner', 'username email')
            .populate('sharedWith.user', 'username email');

        notes = notes.map(note => {
            const noteObj = note.toObject();

            if (noteObj.owner._id.toString() === req.user.id) {
                // Owner: Return plaintext unless explicitly encrypted
                if (noteObj.encrypted && noteObj.encryptedTitle && noteObj.encryptedContent) {
                    try {
                        noteObj.title = decryptText(noteObj.encryptedTitle, user.privateKey);
                        noteObj.content = decryptText(noteObj.encryptedContent, user.privateKey);
                    } catch (error) {
                        console.error('Error decrypting owner note:', error);
                        noteObj.title = '[Decryption failed]';
                        noteObj.content = '[Decryption failed]';
                    }
                } // If not encrypted, title and content are already plaintext
            } else {
                // Shared user: Decrypt from sharedWith entry
                const sharedEntry = noteObj.sharedWith.find(
                    entry => entry.user._id.toString() === req.user.id
                );
                if (sharedEntry && sharedEntry.encryptedTitle && sharedEntry.encryptedContent) {
                    try {
                        noteObj.title = decryptText(sharedEntry.encryptedTitle, user.privateKey);
                        noteObj.content = decryptText(sharedEntry.encryptedContent, user.privateKey);
                    } catch (error) {
                        console.error('Error decrypting shared note:', error);
                        noteObj.title = '[Decryption failed]';
                        noteObj.content = '[Decryption failed]';
                    }
                } else {
                    // If no valid shared entry or encryption data, use placeholder
                    noteObj.title = noteObj.title || '[Access denied]';
                    noteObj.content = noteObj.content || '[Access denied]';
                }
            }

            return noteObj;
        });

        res.json({ message: 'Notes retrieved', notes });
    } catch (err) {
        console.error('Error fetching notes:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { title, content, format } = req.body;
        const user = await User.findById(req.user.id);

        if (!user.verified && format !== 'plain') {
            return res.status(403).json({ error: 'Unverified users can only update plain text notes' });
        }

        const note = await Note.findOne({ _id: noteId, owner: req.user.id });
        if (!note) return res.status(404).json({ error: 'Note not found or you do not own it' });

        note.title = title || note.title;
        note.content = content || note.content; // Store unencrypted
        note.format = format || note.format;
        // Keep encrypted: false unless explicitly set elsewhere

        await note.save();
        await logSecurityEvent({
            event: 'note_updated',
            user: req.user.id,
            details: { noteId }
        });

        res.json({ message: 'Note updated', note });
    } catch (err) {
        console.error('Error updating note:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const note = await Note.findOneAndDelete({ _id: noteId, owner: req.user.id });
        if (!note) return res.status(404).json({ error: 'Note not found or you do not own it' });

        await logSecurityEvent({
            event: 'note_deleted',
            user: req.user.id,
            details: { noteId }
        });

        res.json({ message: 'Note deleted' });
    } catch (err) {
        console.error('Error deleting note:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.shareNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { target, permission } = req.body;
        const owner = await User.findById(req.user.id);
        if (!owner.verified) return res.status(403).json({ error: 'Unverified users cannot share notes' });

        const note = await Note.findOne({ _id: noteId, owner: req.user.id });
        if (!note) return res.status(404).json({ error: 'Note not found or you do not own it' });

        const targetUser = await User.findOne({ $or: [{ username: target }, { email: target }] });
        if (!targetUser) return res.status(404).json({ error: 'Target user not found' });

        if (!owner.friends.some(f => f.user.toString() === targetUser._id.toString())) {
            return res.status(403).json({ error: 'Can only share with friends' });
        }

        const alreadyShared = note.sharedWith.some(entry => entry.user.toString() === targetUser._id.toString());
        if (alreadyShared) return res.status(400).json({ error: 'Note already shared with this user' });

        // Encrypt for the target user only
        const encryptedTitleForTarget = encryptText(note.title, targetUser.publicKey);
        const encryptedContentForTarget = encryptText(note.content, targetUser.publicKey);

        note.sharedWith.push({
            user: targetUser._id,
            permission,
            encryptedTitle: encryptedTitleForTarget,
            encryptedContent: encryptedContentForTarget,
        });

        await note.save();
        await logSecurityEvent({
            event: 'note_shared',
            user: req.user.id,
            details: { noteId, sharedWith: targetUser._id, permission }
        });

        res.json({ message: 'Note shared', note });
    } catch (err) {
        console.error('Error sharing note:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.unshareNote = async (req, res) => {
    try {
        const { noteId, targetUserId } = req.body;
        const note = await Note.findOne({ _id: noteId, owner: req.user.id });
        if (!note) return res.status(404).json({ error: 'Note not found or you do not own it' });

        const sharedIndex = note.sharedWith.findIndex(entry => entry.user.toString() === targetUserId);
        if (sharedIndex === -1) return res.status(400).json({ error: 'User not found in shared list' });

        note.sharedWith.splice(sharedIndex, 1);
        await note.save();

        await logSecurityEvent({
            event: 'note_unshared',
            user: req.user.id,
            details: { noteId, unsharedFrom: targetUserId }
        });

        res.json({ message: 'Note unshared', note });
    } catch (err) {
        console.error('Error unsharing note:', err);
        res.status(500).json({ error: err.message });
    }
};