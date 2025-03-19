const crypto = require('crypto');

/**
 * Encrypts text using a provided RSA public key.
 * @param {string} text - The plain text to encrypt.
 * @param {string} publicKey - The RSA public key in PEM format.
 * @returns {string} - The encrypted text in base64 encoding.
 */
function encryptText(text, publicKey) {
    if (Buffer.byteLength(text, 'utf8') > 200) {
        throw new Error('Content too large for RSA encryption (max 200 bytes)');
    }
    try {
        const buffer = Buffer.from(text, 'utf8');
        const encrypted = crypto.publicEncrypt(publicKey, buffer);
        return encrypted.toString('base64');
    } catch (error) {
        console.error('Encryption error:', error.message, { text, publicKey });
        throw new Error('Encryption failed: ' + error.message);
    }
}

/**
 * Decrypts text using a provided RSA private key.
 * @param {string} encryptedText - The encrypted text in base64 encoding.
 * @param {string} privateKey - The RSA private key in PEM format.
 * @returns {string} - The decrypted plain text.
 */
function decryptText(encryptedText, privateKey) {
    try {
        const buffer = Buffer.from(encryptedText, 'base64');
        const decrypted = crypto.privateDecrypt(privateKey, buffer);
        return decrypted.toString('utf8');
    } catch (error) {
        console.error('Decryption error:', error.message, { encryptedText, privateKey });
        throw new Error('Decryption failed: ' + error.message);
    }
}

module.exports = { encryptText, decryptText };