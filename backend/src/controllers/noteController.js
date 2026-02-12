const noteService = require('../services/note/noteService');
const userService = require('../services/user/userService');
const User = require('../models/User');
const Note = require('../models/Note');
const { logUserEvent } = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');

exports.createNote = asyncHandler(async (req, res) => {
    // get full user with keys. req.user only has the basics.
    const user = await User.findById(req.user.id);
    const noteCount = await noteService.countNotes(req.user.id);

    // unverified users are capped at 1 note to slow down spam
    if (!user.verified && noteCount >= 1) {
        return res.status(403).json({ error: 'Unverified users can only create one note' });
    }

    const { title, content, format, tags, isPinned } = req.body;
    // only plain text for unverified folks
    if (!user.verified && format !== 'plain') {
        return res.status(403).json({ error: 'Unverified users can only create plain text notes' });
    }

    const noteData = {
        title,
        content,
        format: format || 'plain',
        tags: tags || [],
        isPinned: isPinned || false,
        images: req.files ? req.files.map(f => `/uploads/${req.user.id}/${f.filename}`) : []
    };

    // let the service handle the heavy liftin with encryption
    const newNote = await noteService.createNote(noteData, user);

    res.status(201).json({ message: 'Note created', note: newNote });

    logUserEvent(req, 'note_created', req.user.id, {
        noteId: newNote._id,
        format
    }).catch(err => console.error('background log error:', err));
});

exports.getNotes = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    // service handles searchin decrypted content in memory
    const notes = await noteService.getNotes(req.user.id, user, req.query);

    res.json({ message: 'Notes retrieved', notes });
});

exports.getNoteById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const note = await noteService.getNoteById(req.params.id, user);

    if (!note) return res.status(404).json({ error: 'Note not found' });

    res.json({ message: 'Note retrieved', note });
});

exports.updateNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const { title, content, format, tags, isPinned, version } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.verified && format !== 'plain') {
        return res.status(403).json({ error: 'Unverified users can only update plain text notes' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (format !== undefined) updateData.format = format;
    if (tags !== undefined) updateData.tags = tags;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (req.files && req.files.length > 0) {
        updateData.images = req.files.map(f => `/uploads/${req.user.id}/${f.filename}`);
    }

    // service handles re-encryptin the whole payload if title/content changed
    try {
        const updatedNote = await noteService.updateNote(noteId, updateData, user, version);

        res.json({ message: 'Note updated', note: updatedNote });

        logUserEvent(req, 'note_updated', req.user.id, {
            noteId,
            version: updatedNote.__v
        }).catch(err => console.error('background log error:', err));
    } catch (err) {
        if (err.message === 'Access denied') {
            return res.status(403).json({ error: 'Access denied' });
        }
        if (err.message.includes('modified by another user')) {
            return res.status(409).json({ error: err.message });
        }
        throw err;
    }
});

exports.deleteNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;

    // check ownership before tellin service to kill it
    const exists = await Note.findOne({ _id: noteId, owner: req.user.id });
    if (!exists) return res.status(404).json({ error: 'Note not found or you do not own it' });

    await noteService.deleteNote(noteId);

    res.json({ message: 'Note deleted' });

    logUserEvent(req, 'note_deleted', req.user.id, { noteId })
        .catch(err => console.error('background log error:', err));
});

exports.shareNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const { target, permission } = req.body;

    const owner = await User.findById(req.user.id);

    if (!owner.verified) return res.status(403).json({ error: 'unverified users cannot share notes' });

    // find target by username or mail
    const targetUser = await User.findOne({ $or: [{ username: target }, { email: target }] });
    if (!targetUser) return res.status(404).json({ error: 'Target user not found' });

    // check if they are actually friends
    if (!owner.friends.some(f => f.user.toString() === targetUser._id.toString())) {
        return res.status(403).json({ error: 'Can only share with friends' });
    }

    // service wraps sym-key with targets pub-key
    await noteService.shareNote(noteId, [targetUser._id], owner);

    const result = await noteService.getNoteById(noteId, owner);

    res.json({ message: 'Note shared', note: result });

    logUserEvent(req, 'note_shared', req.user.id, {
        noteId,
        sharedWith: targetUser._id,
        permission
    }).catch(err => console.error('background log error:', err));
});

exports.unshareNote = asyncHandler(async (req, res) => {
    const { noteId, targetUserId } = req.body;

    // gotta be the owner to unshare
    const note = await Note.findOne({ _id: noteId, owner: req.user.id });
    if (!note) return res.status(404).json({ error: 'Note not found or you do not own it' });

    await noteService.unshareNote(noteId, targetUserId);

    const owner = await User.findById(req.user.id);
    const result = await noteService.getNoteById(noteId, owner);

    res.json({ message: 'Note unshared', note: result });

    logUserEvent(req, 'note_unshared', req.user.id, {
        noteId,
        unsharedFrom: targetUserId
    }).catch(err => console.error('background log error:', err));
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

    res.json({ message: 'Note restored', note });

    logUserEvent(req, 'note_updated', req.user.id, {
        noteId,
        action: 'restored'
    }).catch(err => console.error('background log error:', err));
});

exports.permanentlyDeleteNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const note = await Note.findOneAndDelete({ _id: noteId, owner: req.user.id });

    if (!note) return res.status(404).json({ error: 'Note not found' });

    res.json({ message: 'Note deleted permanently' });

    logUserEvent(req, 'note_deleted', req.user.id, {
        noteId,
        action: 'permanent_delete'
    }).catch(err => console.error('background log error:', err));
});
