const jwt = require('jsonwebtoken');

/**
 * token service for centralized jwt token management
 * eliminates duplicate token generation logic across controllers
 */

/**
 * generate access token for authenticated user
 * @param {Object} user - user document with _id, role, tokenVersion
 * @returns {string} signed jwt access token
 */
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

/**
 * generate refresh token for user session
 * @param {Object} user - user document with _id
 * @returns {string} signed jwt refresh token
 */
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * generate both access and refresh tokens
 * @param {Object} user - user document
 * @returns {Object} object with accessToken and refreshToken
 */
const generateTokenPair = (user) => ({
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
});

/**
 * generate temporary token for 2fa flow
 * @param {Object} user - user document
 * @returns {string} temporary token valid for 5 minutes
 */
const generateTempToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
    );
};

/**
 * set refresh token as httponly cookie
 * @param {Object} res - express response object
 * @param {string} refreshToken - jwt refresh token
 */
const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

/**
 * verify and decode jwt token
 * @param {string} token - jwt token to verify
 * @returns {Object} decoded token payload
 * @throws {Error} if token is invalid or expired
 */
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
