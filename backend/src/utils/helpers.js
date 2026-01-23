// general helper functions

/**
 * create a delay promise for async operations
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * safely parse json without throwing
 */
const safeJsonParse = (str, fallback = null) => {
    try {
        return JSON.parse(str);
    } catch (e) {
        return fallback;
    }
};

/**
 * generate random string for tokens
 */
const generateRandomString = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * format date to iso string
 */
const formatDate = (date) => {
    return new Date(date).toISOString();
};

/**
 * check if object is empty
 */
const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};

/**
 * deep clone object
 */
const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

module.exports = {
    delay,
    safeJsonParse,
    generateRandomString,
    formatDate,
    isEmpty,
    deepClone
};
