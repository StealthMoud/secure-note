const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    avatar: String,
    role: {type: String, enum: ['admin', 'user'], default: 'user'},
    verified: {type: Boolean, default: false},
    totpSecret: String,
    isTotpEnabled: {type: Boolean, default: false},
});

// Hash the password before saving the user
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Check if the model exists before compiling
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);