// bits and bobs to help out
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// try to parse json but dont crash if it fails
const safeJsonParse = (str, fallback = null) => {
    try {
        return JSON.parse(str);
    } catch (e) {
        return fallback;
    }
};

// make a random string. usually for tokens.
const generateRandomString = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// get that iso format
const formatDate = (date) => {
    return new Date(date).toISOString();
};

// just check if there is anything inside
const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};

// quick and dirty deep clone
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
