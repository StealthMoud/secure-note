const noteService = require('../services/note/noteService');
const userService = require('../services/user/userService');
const User = require('../models/User');
const Note = require('../models/Note');
const { logUserEvent } = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');
const {
    encryptText,
    decryptText,
    generateSymmetricKey,
    encryptSymmetric
} = require('../utils/encryption');
const {
    decryptNoteForUser,
    encryptNoteData,
    reEncryptNoteData
} = require('../services/note/encryptionHelper');

exports.createNote = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.user.id);
    const notes = await noteService.getNotesByUser(req.user.id);
    const noteCount = notes.length;

    if (!user.verified && noteCount >= 1) {
        return res.status(403).json({ error: 'Unverified users can only create one note' });
    }

    const { title, content, format, tags, isPinned } = req.body;
    if (!user.verified && format !== 'plain') {
        return res.status(403).json({ error: 'Unverified users can only create plain text notes' });
    }

    const noteData = {
        title,
        content,
        format: format || 'plain',
        encrypted: false,
        owner: req.user.id,
        tags: tags || [],
        isPinned: isPinned || false,
        images: req.files ? req.files.map(f => `/uploads/${req.user.id}/${f.filename}`) : []
    };

    const newNote = await noteService.createNote(noteData);

    await logUserEvent(req, 'note_created', req.user.id, {
        noteId: newNote._id,
        format
    });

    res.status(201).json({ message: 'Note created', note: newNote });
});

exports.getNotes = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const { search, tag, isPinned } = req.query;

    // build query obj
    let query = {
        $or: [{ owner: req.user.id }, { 'sharedWith.user': req.user.id }],
        deletedAt: null
    };

    if (search) {
        query.$and = query.$and || [];
        query.$and.push({
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ]
        });
    }

    if (tag) {
        query.tags = tag;
    }

    if (isPinned !== undefined) {
        query.isPinned = isPinned === 'true';
    }

    let notes = await Note.find(query)
        .populate('owner', 'username email')
        .populate('sharedWith.user', 'username email')
        .sort({ isPinned: -1, createdAt: -1 });

    const decryptedNotes = notes.map(note => decryptNoteForUser(note.toObject(), user, req.user.id));

    res.json({ message: 'Notes retrieved', notes: decryptedNotes });
});

exports.updateNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const { title, content, format, tags, isPinned, version } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.verified && format !== 'plain') {
        return res.status(403).json({ error: 'Unverified users can only update plain text notes' });
    }

    // Allow owner or users with 'editor' permission to update
    const query = {
        _id: noteId,
        deletedAt: null,
        $or: [
            { owner: req.user.id },
            { 'sharedWith': { $elemMatch: { user: req.user.id, permission: 'editor' } } }
        ]
    };

    if (version !== undefined) {
        query.__v = version;
    }

    const noteToUpdate = await Note.findOne(query);
    if (!noteToUpdate) {
        const exists = await Note.findOne({ _id: noteId });
        if (exists) {
            // Check if it's just a version conflict or a permission issue
            const isSharedEditor = exists.sharedWith.some(e => e.user.toString() === req.user.id && e.permission === 'editor');
            const isOwner = exists.owner.toString() === req.user.id;

            if (!isOwner && !isSharedEditor) {
                return res.status(403).json({ error: 'Access denied: You do not have permission to edit this note' });
            }
            if (version !== undefined && exists.__v !== version) {
                return res.status(409).json({ error: 'Conflict: Note has been modified by another user. Please refresh and try again.' });
            }
        }
        return res.status(404).json({ error: 'Note not found' });
    }

    let updateFields = {
        $inc: { __v: 1 },
        $set: {}
    };

    if (noteToUpdate.encrypted) {
        updateFields.$set.encryptedData = reEncryptNoteData(noteToUpdate, user, { title, content, format });
        updateFields.$set.format = format || noteToUpdate.format;
    } else {
        if (title !== undefined) updateFields.$set.title = title;
        if (content !== undefined) updateFields.$set.content = content;
        if (format !== undefined) updateFields.$set.format = format;
    }

    if (tags !== undefined) updateFields.$set.tags = tags;
    if (isPinned !== undefined) updateFields.$set.isPinned = isPinned;

    if (req.files && req.files.length > 0) {
        updateFields.$set.images = req.files.map(f => `/uploads/${req.user.id}/${f.filename}`);
    }

    const updatedNote = await Note.findOneAndUpdate(query, updateFields, { new: true, runValidators: true });

    const populatedNote = await Note.findById(updatedNote._id)
        .populate('owner', 'username email')
        .populate('sharedWith.user', 'username email');

    const decryptedNote = decryptNoteForUser(populatedNote.toObject(), user, req.user.id);

    await logUserEvent(req, 'note_updated', req.user.id, {
        noteId,
        version: updatedNote.__v
    });

    res.json({ message: 'Note updated', note: decryptedNote });
});

exports.deleteNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const note = await Note.findOneAndUpdate(
        { _id: noteId, owner: req.user.id },
        { deletedAt: new Date() },
        { new: true }
    );

    if (!note) return res.status(404).json({ error: 'Note not found or you do not own it' });

    await logUserEvent(req, 'note_deleted', req.user.id, { noteId });

    res.json({ message: 'Note deleted' });
});

exports.shareNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const { target, permission } = req.body;
    const owner = await User.findById(req.user.id);

    if (!owner.verified) return res.status(403).json({ error: 'unverified users cannot share notes' });

    const note = await Note.findOne({ _id: noteId, owner: req.user.id });
    if (!note) return res.status(404).json({ error: 'Note not found or you do not own it' });

    const targetUser = await User.findOne({ $or: [{ username: target }, { email: target }] });
    if (!targetUser) return res.status(404).json({ error: 'Target user not found' });

    if (!owner.friends.some(f => f.user.toString() === targetUser._id.toString())) {
        return res.status(403).json({ error: 'Can only share with friends' });
    }

    const alreadyShared = note.sharedWith.some(entry => entry.user.toString() === targetUser._id.toString());
    if (alreadyShared) return res.status(400).json({ error: 'Note already shared with this user' });

    let symmetricKey;

    if (!note.encrypted) {
        symmetricKey = generateSymmetricKey();
        note.encryptedData = encryptNoteData({
            title: note.title,
            content: note.content,
            format: note.format
        }, symmetricKey);

        note.ownerEncryptedKey = encryptText(symmetricKey, owner.publicKey);
        note.encrypted = true;
        note.title = 'encrypted note';
        note.content = 'this note is encrypted';
    } else {
        symmetricKey = decryptText(note.ownerEncryptedKey, owner.privateKey);
    }

    const encryptedKeyForTarget = encryptText(symmetricKey, targetUser.publicKey);

    note.sharedWith.push({
        user: targetUser._id,
        permission,
        encryptedKey: encryptedKeyForTarget
    });

    await note.save();

    const populatedNote = await Note.findById(noteId)
        .populate('owner', 'username email')
        .populate('sharedWith.user', 'username email');

    const decryptedNote = decryptNoteForUser(populatedNote.toObject(), owner, req.user.id);

    await logUserEvent(req, 'note_shared', req.user.id, {
        noteId,
        sharedWith: targetUser._id,
        permission
    });

    res.json({ message: 'Note shared', note: decryptedNote });
});

exports.unshareNote = asyncHandler(async (req, res) => {
    const { noteId, targetUserId } = req.body;
    const note = await Note.findOne({ _id: noteId, owner: req.user.id });
    if (!note) return res.status(404).json({ error: 'Note not found or you do not own it' });

    const sharedIndex = note.sharedWith.findIndex(entry => entry.user.toString() === targetUserId);
    if (sharedIndex === -1) return res.status(400).json({ error: 'User not found in shared list' });

    note.sharedWith.splice(sharedIndex, 1);
    await note.save();

    const user = await User.findById(req.user.id);
    const populatedNote = await Note.findById(noteId)
        .populate('owner', 'username email')
        .populate('sharedWith.user', 'username email');

    const decryptedNote = decryptNoteForUser(populatedNote.toObject(), user, req.user.id);

    await logUserEvent(req, 'note_unshared', req.user.id, {
        noteId,
        unsharedFrom: targetUserId
    });

    res.json({ message: 'Note unshared', note: decryptedNote });
});

exports.getTrash = asyncHandler(async (req, res) => {
    const notes = await Note.find({
        owner: req.user.id,
        deletedAt: { $ne: null }
    }).sort({ deletedAt: -1 });

    res.json({ message: 'Trash retrieved', notes });
});

exports.restoreNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const note = await Note.findOneAndUpdate(
        { _id: noteId, owner: req.user.id },
        { deletedAt: null },
        { new: true }
    );

    if (!note) return res.status(404).json({ error: 'Note not found in trash' });

    await logUserEvent(req, 'note_updated', req.user.id, {
        noteId,
        action: 'restored'
    });

    res.json({ message: 'Note restored', note });
});

exports.permanentlyDeleteNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const note = await Note.findOneAndDelete({ _id: noteId, owner: req.user.id });

    if (!note) return res.status(404).json({ error: 'Note not found' });

    await logUserEvent(req, 'note_deleted', req.user.id, {
        noteId,
        action: 'permanent_delete'
    });

    res.json({ message: 'Note deleted permanently' });
});
