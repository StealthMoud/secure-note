const crypto = require('crypto');

// Ensure your RSA keys are defined in your environment variables (PEM format).
const publicKey = process.env.RSA_PUBLIC_KEY;
const privateKey = process.env.RSA_PRIVATE_KEY;

if (!publicKey || !privateKey) {
    throw new Error('RSA_PUBLIC_KEY and RSA_PRIVATE_KEY must be defined in the environment variables.');
}

/**
 * Encrypts a given text using the RSA public key.
 * @param {string} text - The plain text to encrypt.
 * @returns {string} - The encrypted text in base64 encoding.
 */
function encryptText(text) {
    const buffer = Buffer.from(text, 'utf8');
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString('base64');
}

/**
 * Decrypts a given encrypted text using the RSA private key.
 * @param {string} encryptedText - The encrypted text in base64 encoding.
 * @returns {string} - The decrypted plain text.
 */
function decryptText(encryptedText) {
    const buffer = Buffer.from(encryptedText, 'base64');
    const decrypted = crypto.privateDecrypt(privateKey, buffer);
    return decrypted.toString('utf8');
}

module.exports = { encryptText, decryptText };
