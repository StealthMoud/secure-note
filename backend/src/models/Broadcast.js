const mongoose = require('mongoose');

// broadcast messagges for global alerts
const broadcastSchema = new mongoose.Schema({
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'alert'], default: 'info' },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
});

// indexes to find active stuff fast
broadcastSchema.index({ active: 1 });
broadcastSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Broadcast', broadcastSchema);
