const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: [true, 'Username is required'], unique: true, trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, sparse: true, trim: true, lowercase: true, match: [/\S+@\S+\.\S+/, 'Please use a valid email address'] },
    password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters long'] },
    passwordHistory: { type: [String], default: [] },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['superadmin', 'admin', 'user'], default: 'user' },
    verified: { type: Boolean, default: false },
    githubId: { type: String, unique: true, sparse: true },
    totpSecret: { type: String, default: null },
    isTotpEnabled: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    publicKey: { type: String, required: [true, 'Public key is required for encryption'] },
    privateKey: { type: String, required: [true, 'Private key is required for decryption'] },
    verificationToken: { type: String },
    verificationExpires: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
    verificationPending: { type: Boolean, default: false },
    verificationRejected: { type: Boolean, default: false },
    friends: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
    friendRequests: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        requestId: { type: mongoose.Schema.Types.ObjectId }
    }],
    firstName: { type: String, trim: true, default: '' },
    lastName: { type: String, trim: true, default: '' },
    nickname: { type: String, trim: true, default: '' },
    birthday: { type: Date, default: null },
    country: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, default: '', maxlength: [500, 'Bio cannot exceed 500 characters'] },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'], default: 'prefer-not-to-say' },
    header: { type: String, default: '' }, // url or path to header image
}, { timestamps: true });

// pre-save hook for password hashin
UserSchema.pre('save', async function () {
    // only hash password if it was modified to avoid rehashing on every save
    if (!this.isModified('password')) return;
    try {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    } catch (err) {
        console.error('Error hashing password:', err);
        throw err;
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.toJSON = function () {
    // remove sensitive fields from json output to prevent leaking secrets
    const obj = this.toObject();
    delete obj.password;
    delete obj.privateKey;
    delete obj.totpSecret;
    return obj;
};

// create indexes for friend request queries to improve performence
UserSchema.index({ 'friendRequests.sender': 1 });
UserSchema.index({ 'friendRequests.receiver': 1 });
// index role and verified status for admin panel
UserSchema.index({ role: 1 });
UserSchema.index({ verified: 1 });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);