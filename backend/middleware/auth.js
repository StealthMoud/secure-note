const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate the user using JWT.
 * Expects an Authorization header in the format: "Bearer <token>"
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token with the secret key from the environment variables.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach user information to the request object.
        req.user = {
            id: decoded.id,
            role: decoded.role || 'user'
        };
        next(); // Proceed to the next middleware/route handler.
    } catch (err) {
        console.error('Authentication error:', err);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

/**
 * Middleware to authorize only admin users.
 * Should be used after the authenticate middleware.
 */
const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ error: 'Access forbidden: administrators only' });
};

module.exports = { authenticate, authorizeAdmin };
