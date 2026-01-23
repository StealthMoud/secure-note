// common validation helper functions

/**
 * check if email format is valid
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * check if password meets minimum requirements
 */
const isStrongPassword = (password) => {
    // at least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password);
};

/**
 * sanitize string input to prevent xss
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[<>]/g, '');
};

/**
 * validate mongodb objectid format
 */
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * validate username format
 */
const isValidUsername = (username) => {
    // 3-30 characters, alphanumeric and underscores only
    return /^[a-zA-Z0-9_]{3,30}$/.test(username);
};

module.exports = {
    isValidEmail,
    isStrongPassword,
    sanitizeString,
    isValidObjectId,
    isValidUsername
};
