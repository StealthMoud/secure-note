const crypto = require('crypto');

/**
 * Encrypts text using a provided RSA public key.
 * @param {string} text - The plain text to encrypt.
 * @param {string} publicKey - The RSA public key in PEM format.
 * @returns {string} - The encrypted text in base64 encoding.
 */
// encrypt text using rsa public key for secure note sharing
function encryptText(text, publicKey) {
    if (Buffer.byteLength(text, 'utf8') > 200) {
        // rsa has size limit so we check befor encrypting
        throw new Error('content too large for rsa encryption (max 200 bytes)');
    }
    try {
        const buffer = Buffer.from(text, 'utf8');
        const encrypted = crypto.publicEncrypt(publicKey, buffer);
        return encrypted.toString('base64');
    } catch (error) {
        throw new Error('encryption failed: ' + error.message);
    }
}

// generate a random symmetric key for hybrid encryption
function generateSymmetricKey() {
    return crypto.randomBytes(32).toString('hex'); // 256 bits
}

// encrypt data using aes-256-gcm (symmetric)
function encryptSymmetric(text, key) {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        // return iv + authTag + encrypted content as a single string
        return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    } catch (error) {
        throw new Error('symmetric encryption failed');
    }
}

/**
 * Decrypts text using a provided RSA private key.
 * @param {string} encryptedText - The encrypted text in base64 encoding.
 * @param {string} privateKey - The RSA private key in PEM format.
 * @returns {string} - The decrypted plain text.
 */
// decrypt text using rsa private key to read encrypted notes
function decryptText(encryptedText, privateKey) {
    try {
        const buffer = Buffer.from(encryptedText, 'base64');
        const decrypted = crypto.privateDecrypt(privateKey, buffer);
        return decrypted.toString('utf8');
    } catch (error) {
        throw new Error('decryption failed: ' + error.message);
    }
}

// decrypt data using aes-256-gcm (symmetric)
function decryptSymmetric(encryptedData, key) {
    try {
        const [ivHex, authTagHex, contentHex] = encryptedData.split(':');
        if (!ivHex || !authTagHex || !contentHex) throw new Error('invalid encrypted data format');

        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), Buffer.from(ivHex, 'hex'));
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
        let decrypted = decipher.update(contentHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        throw new Error('symmetric decryption failed');
    }
}

module.exports = { encryptText, decryptText, generateSymmetricKey, encryptSymmetric, decryptSymmetric };