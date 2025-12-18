require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('./config/passport');
const path = require('path');

const app = express();

// Serve static files from uploads directory (before security middleware)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security Middleware with custom CSP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "http://localhost:5002", "http://localhost:3000"], // Allow images from backend and frontend
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            // we can add other directives as needed
        },
    },
}));
app.use(cors({ origin: [process.env.FRONTEND_URL, 'http://localhost:3000'], credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: "Too many requests..." }));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/totp', require('./routes/totp'));
app.use('/api/sharing', require('./routes/sharing'));
app.use('/api/export', require('./routes/export'));

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;