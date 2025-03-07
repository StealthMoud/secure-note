// server.js
const connectDB = require('./config/db');
const app = require('./app');

// Connect to MongoDB, then start the server.
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 5002;
        app.listen(PORT, () => {
            console.log(`✅ Server running on port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to the database:', err);
        process.exit(1);
    });
