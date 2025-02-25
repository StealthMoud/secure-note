const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    title: String,
    content: String,
    format: { type: String, enum: ['plain', 'markdown'], default: 'plain' },
    encrypted: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Note', NoteSchema);
