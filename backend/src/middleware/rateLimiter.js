const rateLimit = require('express-rate-limit');

// general api rate limiter - prevents abuse
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2500, // limit each ip to 2500 requests per window (standard for dashboard)
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// strict limiter for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, // standard threshold for auth attempts
    message: 'Too many authentication attempts, please try again after 15 minutes',
    skipSuccessfulRequests: true, // don't count successful logins
});

// limiter for password reset to prevent abuse
const resetPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Too many password reset requests, please try again later',
});

// limiter for user creation (registration + admin create)
const createUserLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many account creation attempts, please try again later',
});

// limiter for sensitive operations (delete, unverify, etc)
const sensitiveOperationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many sensitive operations, please slow down',
});

module.exports = {
    apiLimiter,
    authLimiter,
    resetPasswordLimiter,
    createUserLimiter,
    sensitiveOperationLimiter,
};
