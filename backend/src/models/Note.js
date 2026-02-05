const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    content: {
        type: String,
        default: '',
    },
    encryptedData: {
        type: String,
        default: null
    },
    ownerEncryptedKey: {
        type: String,
        default: null
    },
    format: {
        type: String,
        enum: ['plain', 'markdown'],
        default: 'plain',
    },
    encrypted: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner is required'],
    },
    sharedWith: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            permission: { type: String, enum: ['viewer', 'editor'], default: 'viewer' },
            encryptedKey: { type: String }, // Encrypted Symmetric Key for this user
        },
    ],
    // images attached to notes
    images: [{ type: String }],
    // tags for organizing notes
    tags: [{ type: String, trim: true }],
    // keep important notes at the top
    isPinned: { type: Boolean, default: false },
    // soft delte logic so user dont lose stuff by accident
    deletedAt: { type: Date, default: null },
}, {
    timestamps: true,
});

// indexes for better query performance
NoteSchema.index({ owner: 1 });
NoteSchema.index({ 'sharedWith.user': 1 });
// index tags for fast searchin
NoteSchema.index({ tags: 1 });
// index deletedAt for soft delete filterin
NoteSchema.index({ deletedAt: 1 });
// index isPinned for dashboard sortin
NoteSchema.index({ isPinned: -1 });

module.exports = mongoose.models.Note || mongoose.model('Note', NoteSchema);