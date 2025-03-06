const mongoose = require('mongoose');

const SecurityLogSchema = new mongoose.Schema({
    event: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    details: { type: String },
});

module.exports = mongoose.models.SecurityLog || mongoose.model('SecurityLog', SecurityLogSchema);
