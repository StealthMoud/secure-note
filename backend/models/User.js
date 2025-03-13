const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        sparse: true, // sparse allows null values
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
    },
    avatar: {
        type: String,
        default: '',
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    verified: {
        type: Boolean,
        default: false,
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true
    },
    totpSecret: {
        type: String,
        default: null,
    },
    isTotpEnabled: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    publicKey: {
        type: String,
        required: [true, 'Public key is required for encryption'],
    },
    privateKey: {
        type: String,
        required: [true, 'Private key is required for decryption'],
    },
    verificationToken: {
        type: String
    },
    verificationExpires: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    verificationPending: {
        type: Boolean,
        default: false
    },
    friends: [{
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'} // Only accepted friends, no status field
    }],
    friendRequests: [{
        sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // Who sent the request
        receiver: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // Who received the request
        status: {type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending'},
        createdAt: {type: Date, default: Date.now}, // When the request was made
        updatedAt: {type: Date, default: Date.now} // When the status last changed
    }]
}, {
    timestamps: true,
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (err) {
        console.error('Error hashing password:', err);
        next(err);
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.privateKey;
    delete obj.totpSecret;
    return obj;
};

// Indexes for performance
UserSchema.index({email: 1});
UserSchema.index({username: 1});
UserSchema.index({'friendRequests.sender': 1});
UserSchema.index({'friendRequests.receiver': 1});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);