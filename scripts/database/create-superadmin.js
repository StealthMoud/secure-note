const mongoose = require('mongoose');
const User = require('../../backend/src/models/User');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const createSuperAdmin = async () => {
    const args = process.argv.slice(2);
    if (args.length !== 3) {
        console.log('Usage: node scripts/db/create-superadmin.js <username> <email> <password>');
        process.exit(1);
    }

    const [username, email, password] = args;

    try {
        let uri = process.env.MONGO_URI;
        if (!uri) {
            console.error('MONGO_URI not found in .env');
            process.exit(1);
        }
        // Replace 'mongodb' host with 'localhost' for local script execution
        uri = uri.replace('mongodb://mongodb:', 'mongodb://localhost:');

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // Check if user already exists
        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            console.error('Error: User with this email or username already exists.');
            process.exit(1);
        }

        // Generate RSA Key Pair for the new superadmin
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });

        const superAdmin = new User({
            username,
            email,
            password, // hashing is handled by the User model pre-save hook
            role: 'superadmin',
            verified: true,
            publicKey,
            privateKey
        });

        await superAdmin.save();
        console.log(`\nSuccessfully created Super Admin account:`);
        console.log(`Username: ${username}`);
        console.log(`Email:    ${email}`);
        console.log(`Role:     superadmin`);

    } catch (err) {
        console.error('Error creating Super Admin:', err);
    } finally {
        await mongoose.disconnect();
    }
};

createSuperAdmin();
