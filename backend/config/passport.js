const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const crypto = require('crypto');

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.OAUTH_GOOGLE_CLIENT_ID,
    clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
            const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: { type: 'spki', format: 'pem' },
                privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
            });
            user = new User({
                username: profile.displayName || `google_${profile.id}`,
                email: profile.emails[0].value,
                password: crypto.randomBytes(16).toString('hex'), // Dummy password
                role: 'user',
                publicKey,
                privateKey,
                verified: true, // OAuth users are auto-verified
            });
            await user.save();
        }
        done(null, user);
    } catch (err) {
        done(err);
    }
}));

passport.use(new GitHubStrategy({
    clientID: process.env.OAUTH_GITHUB_CLIENT_ID,
    clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
            const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: { type: 'spki', format: 'pem' },
                privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
            });
            user = new User({
                username: profile.username || `github_${profile.id}`,
                email: profile.emails[0].value,
                password: crypto.randomBytes(16).toString('hex'),
                role: 'user',
                publicKey,
                privateKey,
                verified: true,
            });
            await user.save();
        }
        done(null, user);
    } catch (err) {
        done(err);
    }
}));