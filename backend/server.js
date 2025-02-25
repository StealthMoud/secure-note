const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());            // JSON requests.
app.use(helmet());                  // Secure http headers.

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

// Import Routes
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const adminRoutes = require('./routes/admin');

// Setup Routes
app.use('/auth', authRoutes);      // Auth routes: /register, /login, /totp
app.use('/notes', noteRoutes);     // Notes routes: /create, /edit, /delete
app.use('/admin', adminRoutes);    // Admin routes: /users, /logs

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`✅ Server running on port: ${process.env.PORT}`);
    });
}).catch(err => console.error(err));