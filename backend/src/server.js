const connectDB = require('./config/db');
const app = require('./app');

// connect to mongodb, then start the server.
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 5002;
        app.listen(PORT, () => {
            console.log(`server running on port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('failed to connect to the database:', err);
        process.exit(1);
    });
