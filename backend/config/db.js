const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the project root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = async () => {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        throw new Error('MONGO_URI is not defined in the environment variables.');
    }
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1); // Exit process if connection fails
    }
};

module.exports = connectDB;
