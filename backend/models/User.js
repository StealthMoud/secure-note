const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,       // Ensures uniqueness at the database level.
        trim: true,         // Removes extra spaces.
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,       // Ensures each email is unique.
        trim: true,
        lowercase: true,    // Converts the email to lowercase.
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
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
    totpSecret: String,
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
}, {
    timestamps: true,
});

// Pre-save middleware to hash the password if it has been modified.
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (err) {
        next(err);
    }
});

// Instance method to compare a candidate password with the stored hash.
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Override toJSON method to remove sensitive fields when returning user data.
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

// Check if the model already exists (to avoid recompiling the model in watch mode)
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
