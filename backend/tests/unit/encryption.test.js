const { rsaEncrypt, rsaDecrypt, generateSymmetricKey, aesEncrypt, aesDecrypt } = require('../../src/utils/encryption');
const crypto = require('crypto');

describe('Encryption Unit Tests', () => {
    let publicKey;
    let privateKey;

    beforeAll(() => {
        const { publicKey: pub, privateKey: priv } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        publicKey = pub;
        privateKey = priv;
    });

    describe('RSA Encryption', () => {
        test('should encrypt and decrypt text correctly', () => {
            const originalText = 'Hello World';
            const encrypted = rsaEncrypt(originalText, publicKey);
            const decrypted = rsaDecrypt(encrypted, privateKey);
            expect(decrypted).toBe(originalText);
        });

        test('should throw error for content > 200 bytes', () => {
            const largeText = 'a'.repeat(201);
            expect(() => rsaEncrypt(largeText, publicKey)).toThrow('content too large');
        });
    });

    describe('Symmetric Encryption (AES-GCM)', () => {
        test('should encrypt and decrypt symmetrically', () => {
            const key = generateSymmetricKey();
            const text = 'Secret message';
            const encrypted = aesEncrypt(text, key);
            const decrypted = aesDecrypt(encrypted, key);
            expect(decrypted).toBe(text);
        });

        test('should fail with incorrect key', () => {
            const key1 = generateSymmetricKey();
            const key2 = generateSymmetricKey();
            const text = 'Secret message';
            const encrypted = aesEncrypt(text, key1);
            expect(() => aesDecrypt(encrypted, key2)).toThrow();
        });
    });
});
