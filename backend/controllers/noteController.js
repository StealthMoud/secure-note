const Note = require('../models/Note');
const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');
const { encryptText, decryptText } = require('../utils/encryption');

exports.createNote = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const noteCount = await Note.countDocuments({ owner: req.user.id });
        if (!user.verified && noteCount >= 1) {
            return res.status(403).json({
                error: 'Unverified users can only create one note. Please get verified to add more notes.',
            });
        }

        const { title, content, format, encrypted } = req.body;
        const noteData = { title, content, format, encrypted, owner: req.user.id };
        if (noteData.encrypted && noteData.content) {
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
};

exports.getNotes = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
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
                    if (noteObj.owner._id.toString() === req.user.id) {
                        noteObj.content = decryptText(noteObj.content, user.privateKey);
                    } else {
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
};

exports.updateNote = async (req, res) => {
    try {
        if (!req.user.verified) return res.status(403).json({ error: 'Email verification required to edit notes' });

        const { noteId } = req.params;
        const { title, content, encrypted } = req.body;

        const note = await Note.findOne({ _id: noteId, owner: req.user.id });
        if (!note) return res.status(404).json({ error: 'Note not found or you do not own it' });

        const user = await User.findById(req.user.id);
        note.title = title || note.title;
        note.content = (encrypted && content) ? encryptText(content, user.publicKey) : content || note.content;
        note.encrypted = encrypted !== undefined ? encrypted : note.encrypted;

        await note.save();
        await SecurityLog.create({ event: 'note_updated', user: req.user.id, details: { noteId } });

        res.json({ message: 'Note updated', note });
    } catch (err) {
        console.error('Error updating note:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        if (!req.user.verified) return res.status(403).json({ error: 'Email verification required to delete notes' });

        const { noteId } = req.params;
        const note = await Note.findOneAndDelete({ _id: noteId, owner: req.user.id });
        if (!note) return res.status(404).json({ error: 'Note not found or you do not own it' });

        await SecurityLog.create({ event: 'note_deleted', user: req.user.id, details: { noteId } });

        res.json({ message: 'Note deleted' });
    } catch (err) {
        console.error('Error deleting note:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.shareNote = async (req, res) => {
    try {
        if (!req.user.verified) return res.status(403).json({ error: 'Email verification required to share notes' });

        const { noteId } = req.params;
        const { userId, permission } = req.body;

        // Validate inputs
        if (!userId || !['viewer', 'editor'].includes(permission)) {
            return res.status(400).json({ error: 'userId and valid permission (viewer or editor) are required' });
        }

        // Check note ownership
        const note = await Note.findOne({ _id: noteId, owner: req.user.id });
        if (!note) return res.status(404).json({ error: 'Note not found or you do not own it' });

        // Check target user exists
        const targetUser = await User.findById(userId);
        if (!targetUser) return res.status(400).json({ error: 'Target user not found' });

        // Check if already shared with this user
        const alreadyShared = note.sharedWith.some(entry => entry.user.toString() === userId);
        if (alreadyShared) return res.status(400).json({ error: 'Note already shared with this user' });

        // Encrypt content for the target user if note is encrypted
        let encryptedContent = '';
        if (note.encrypted && note.content) {
            const owner = await User.findById(req.user.id);
            const decryptedContent = decryptText(note.content, owner.privateKey);
            encryptedContent = encryptText(decryptedContent, targetUser.publicKey);
        }

        // Add to sharedWith
        note.sharedWith.push({
            user: userId,
            permission,
            encryptedContent: note.encrypted ? encryptedContent : undefined,
        });

        await note.save();
        await SecurityLog.create({
            event: 'note_shared',
            user: req.user.id,
            details: { noteId, sharedWith: userId, permission },
        });

        res.json({ message: 'Note shared', note });
    } catch (err) {
        console.error('Error sharing note:', err);
        res.status(500).json({ error: err.message });
    }
};