const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
    },
    content: {
        type: String,
        default: '',
    },
    format: {
        type: String,
        enum: ['plain', 'markdown', 'pdf'],
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
            permission: { type: String, enum: ['viewer', 'editor', 'admin'], default: 'viewer' }
        }
    ],
}, {
    timestamps: true,
});

module.exports = mongoose.models.Note || mongoose.model('Note', NoteSchema);
