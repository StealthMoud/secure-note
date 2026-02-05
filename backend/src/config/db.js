const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the project root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = async () => {
    let MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        throw new Error('MONGO_URI is not defined in the environment variables.');
    }

    // Isolate test database to prevent data loss in dev/prod
    if (process.env.NODE_ENV === 'test') {
        // use localhost instead of mongodb host when running tests on host machine
        MONGO_URI = MONGO_URI.replace('mongodb://mongodb:', 'mongodb://localhost:');

        if (MONGO_URI.includes('?')) {
            const [base, query] = MONGO_URI.split('?');
            MONGO_URI = `${base}-test?${query}`;
        } else {
            MONGO_URI = `${MONGO_URI}-test`;
        }
        console.log('Connecting to TEST database:', MONGO_URI);
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log(`MongoDB connected successfully to ${process.env.NODE_ENV === 'test' ? 'TEST' : 'PRODUCTION/DEV'} env`);
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process if connection fails
    }
};

module.exports = connectDB;
