require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('./config/passport');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({origin: process.env.FRONTEND_URL, credentials: true}));
app.use(rateLimit({windowMs: 15 * 60 * 1000, max: 500, message: "Too many requests..."}));
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
    res.status(404).json({error: 'Not Found'});
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(err.statusCode || 500).json({error: err.message || 'Internal Server Error'});
});

module.exports = app;