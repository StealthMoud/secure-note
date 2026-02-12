const crypto = require('crypto');

// hybrid encryption system (lock and key):
// 1. aes (the key): used for content. fast, no size limit, but we need to hide the key.
// 2. rsa (the lock): used to encrypt the aes key. slow and limited size (200 bytes), but perfect for securing the key.
// result: long nots stay safe, and only the right user can unlock the key to read them.

// rsa (asymmetric): use this to "lock up" the symmetric key. 
// has a 200 byte limit, so dont use it for the actual notes!
function rsaEncrypt(text, publicKey) {
    if (Buffer.byteLength(text, 'utf8') > 200) {
        throw new Error('content too large for rsa encryption (max 200 bytes)');
    }
    try {
        const buffer = Buffer.from(text, 'utf8');
        const encrypted = crypto.publicEncrypt(publicKey, buffer);
        return encrypted.toString('base64');
    } catch (error) {
        throw new Error('rsa encryption failed: ' + error.message);
    }
}

// rsa (asymmetric): use your private key to "unlock" the symmetric key.
function rsaDecrypt(encryptedText, privateKey) {
    try {
        const buffer = Buffer.from(encryptedText, 'base64');
        const decrypted = crypto.privateDecrypt(privateKey, buffer);
        return decrypted.toString('utf8');
    } catch (error) {
        throw new Error('rsa decryption failed: ' + error.message);
    }
}

// aes (symmetric): make a new random key for every note.
function generateSymmetricKey() {
    return crypto.randomBytes(32).toString('hex'); // 256 bits
}

// aes-256-gcm (symmetric): use this for actual note content. no size limit.
function aesEncrypt(text, key) {
    try {
        // a random "Salt" (IV)
        const iv = crypto.randomBytes(16);
        // initialize the "Safe"
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
        // scramble the text
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        // create the "Safety Seal"
        const authTag = cipher.getAuthTag();
        // return iv:tag:content bundle
        return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    } catch (error) {
        throw new Error('aes encryption failed');
    }
}

// aes-256-gcm (symmetric): pull the bundle apart and decrypt the content.
function aesDecrypt(encryptedData, key) {
    try {
        const [ivHex, authTagHex, contentHex] = encryptedData.split(':');
        if (!ivHex || !authTagHex || !contentHex) throw new Error('invalid encrypted bundle format');

        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), Buffer.from(ivHex, 'hex'));
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
        let decrypted = decipher.update(contentHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        throw new Error('aes decryption failed');
    }
}

module.exports = { rsaEncrypt, rsaDecrypt, generateSymmetricKey, aesEncrypt, aesDecrypt };