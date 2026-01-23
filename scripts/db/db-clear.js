const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const clearDatabase = async () => {
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

        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            console.log(`Clearing collection: ${collection.collectionName}`);
            await collection.deleteMany({});
        }

        console.log('Database cleared successfully');
    } catch (err) {
        console.error('Error clearing database:', err);
    } finally {
        await mongoose.disconnect();
    }
};

clearDatabase();
