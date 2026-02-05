require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('./config/passport');
const path = require('path');

// import security middleware
const { securityHeaders, corsOptions, helmetConfig } = require('./middleware/security');
const { apiLimiter } = require('./middleware/rateLimiter');
const { sanitizeInputs } = require('./middleware/sanitization');

const app = express();

// serve static files before security middleware gets applied
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// apply security headers
app.use(helmet(helmetConfig));
app.use(securityHeaders);

// cors with strict origin checking
app.use(cors(corsOptions));

// global rate limiting
app.use(apiLimiter);

// request parsing
app.use(express.json({ limit: '10mb' })); // limit request body size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// input sanitization - must come after body parsing
app.use(sanitizeInputs);

// passport initialization
app.use(passport.initialize());

// health check endpoint (no auth required)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// mount all api routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/totp', require('./routes/totp'));
app.use('/api/sharing', require('./routes/sharing'));
app.use('/api/export', require('./routes/export'));

// catch undefined routes
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

// global error handler
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        console.error("DEBUG ERROR HANDLER:", err);
    }
    console.error("Server error:", err);

    // dont leak error details in production
    const errorResponse = {
        error: process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : err.message || 'Internal Server Error'
    };

    res.status(err.statusCode || 500).json(errorResponse);
});

module.exports = app;