const securityHeaders = (req, res, next) => {
    // prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // prevent mime type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // enable xss protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // strict transport security (https only)
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // permissions policy (restrict browser features)
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    next();
};

// cors configuration for zero trust
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ];

        // allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// helmet configuration with strict csp
const helmetConfig = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"], // needed for inline styles
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'blob:', process.env.FRONTEND_URL || 'http://localhost:3000'],
            connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
            fontSrc: ["'self'", 'data:'],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    hsts: process.env.NODE_ENV === 'production' ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    } : false,
    frameguard: {
        action: 'deny',
    },
    noSniff: true,
    xssFilter: true,
};

module.exports = {
    securityHeaders,
    corsOptions,
    helmetConfig,
};
