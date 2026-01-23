const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const generateKeys = () => {
    console.log('Generating RSA-2048 Key Pair...');

    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    console.log('\n--- RSA_PRIVATE_KEY ---');
    console.log(privateKey.replace(/\n/g, '\\n'));

    console.log('\n--- RSA_PUBLIC_KEY ---');
    console.log(publicKey.replace(/\n/g, '\\n'));

    console.log('\nTip: Copy the strings above into your .env file.');
};

generateKeys();
