const jwt = require('jsonwebtoken');

// Check JWT_SECRET at startup
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined in environment variables');
}

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            role: decoded.role || 'user',
        };
        next();
    } catch (err) {
        console.error('Authentication error:', err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired, please log in again' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ error: 'Access forbidden: administrators only' });
};

module.exports = { authenticate, authorizeAdmin };