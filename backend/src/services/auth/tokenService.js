const jwt = require('jsonwebtoken');

// token service for managin all our jwts.
// keeps generation logic in one place so controllers stay clean.

// creates short lived access tokens for normal api calls
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            tokenVersion: user.tokenVersion || 0
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

// creates long lived refresh tokens to keep users logged in
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// helper to get both tokens at once
const generateTokenPair = (user) => ({
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
});

// temp token for 2fa flow. expires fast so they gotta be quick.
const generateTempToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
    );
};

// saves refresh token in an httponly cookie for security
const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

// verify n decode token or throw error if its bad
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateTokenPair,
    generateTempToken,
    setRefreshTokenCookie,
    verifyToken
};
