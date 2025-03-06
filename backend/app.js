const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// -----------------------
// Security Middleware
// -----------------------

// Apply Helmet to secure HTTP headers.
app.use(helmet());

// Enable CORS for your front-end origin.
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

// Rate Limiter: Limit each IP to 100 requests per 15 minutes.
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window.
    message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

// Parse incoming JSON requests.
app.use(express.json());

// -----------------------
// Routes
// -----------------------
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const adminRoutes = require('./routes/admin');
const adminDashboardRoutes = require('./routes/adminDashboard');
const totpRoutes = require('./routes/totp');
const sharingRoutes = require('./routes/sharing');
const exportRoutes = require('./routes/export');
const passwordResetRoutes = require('./routes/passwordReset');

app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordResetRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-dashboard', adminDashboardRoutes);
app.use('/api/totp', totpRoutes);
app.use('/api/sharing', sharingRoutes);
app.use('/api/export', exportRoutes);

// -----------------------
// 404 Handler
// -----------------------
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

// -----------------------
// Centralized Error Handling Middleware
// -----------------------
app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
