const mongoose = require('mongoose');
const User = require('../../backend/src/models/User');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const setRole = async () => {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.log('Usage: node scripts/db/set-role.js <email> <role>');
        console.log('Roles: superadmin, admin, moderator, user');
        process.exit(1);
    }

    const [email, role] = args;
    const VALID_ROLES = ['superadmin', 'admin', 'user'];

    if (!VALID_ROLES.includes(role)) {
        console.error(`Invalid role. Allowed: ${VALID_ROLES.join(', ')}`);
        process.exit(1);
    }

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

        const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
        if (!user) {
            console.error('User not found');
            process.exit(1);
        }

        user.role = role;
        await user.save();
        console.log(`Successfully updated user ${email} to role ${role}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

setRole();
