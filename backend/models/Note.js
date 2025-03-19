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
    encryptedTitle: {
        type: String,
        default: null
    },
    encryptedContent: {
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
            encryptedTitle: { type: String },
            encryptedContent: { type: String },
        },
    ],
}, {
    timestamps: true,
});

// Indexes for better query performance
NoteSchema.index({ owner: 1 });
NoteSchema.index({ 'sharedWith.user': 1 });

module.exports = mongoose.models.Note || mongoose.model('Note', NoteSchema);